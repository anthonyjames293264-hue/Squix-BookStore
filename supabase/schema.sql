-- ============================================
-- Author Bookstore - Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_email on public.profiles(email);
create index idx_profiles_role on public.profiles(role);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admin full access to profiles"
  on public.profiles for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- BOOKS TABLE
-- ============================================
create table public.books (
  id uuid not null default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  description text not null,
  long_description text,
  price integer not null,
  compare_at_price integer,
  category text not null default 'fiction',
  format text not null default 'physical' check (format in ('physical', 'digital', 'both')),
  isbn text,
  pages integer,
  publisher text,
  publish_date date,
  language text not null default 'English',
  cover_image text not null,
  file_url text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  stock integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_books_slug on public.books(slug);
create index idx_books_category on public.books(category);
create index idx_books_is_published on public.books(is_published);
create index idx_books_is_featured on public.books(is_featured);
create index idx_books_created_at on public.books(created_at desc);

alter table public.books enable row level security;

create policy "Published books are viewable by everyone"
  on public.books for select using (is_published = true);

create policy "Admin full access to books"
  on public.books for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- BOOK IMAGES TABLE
-- ============================================
create table public.book_images (
  id uuid not null default uuid_generate_v4() primary key,
  book_id uuid not null references public.books(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_book_images_book_id on public.book_images(book_id);

alter table public.book_images enable row level security;

create policy "Book images are viewable by everyone"
  on public.book_images for select using (true);

create policy "Admin full access to book images"
  on public.book_images for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
create table public.customers (
  id uuid not null default uuid_generate_v4() primary key,
  email text not null unique,
  full_name text not null,
  phone text,
  stripe_customer_id text unique,
  total_orders integer not null default 0,
  total_spent integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_email on public.customers(email);
create index idx_customers_stripe_id on public.customers(stripe_customer_id);

alter table public.customers enable row level security;

create policy "Admin full access to customers"
  on public.customers for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Service role full access to customers"
  on public.customers for all using (true) with check (true);

-- ============================================
-- ORDERS TABLE
-- ============================================
create table public.orders (
  id uuid not null default uuid_generate_v4() primary key,
  customer_id uuid not null references public.customers(id),
  stripe_session_id text unique,
  stripe_payment_intent text,
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')
  ),
  subtotal integer not null,
  shipping_cost integer not null default 0,
  total integer not null,
  shipping_name text,
  shipping_address text,
  shipping_city text,
  shipping_state text,
  shipping_zip text,
  shipping_country text,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_customer_id on public.orders(customer_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_stripe_session on public.orders(stripe_session_id);
create index idx_orders_created_at on public.orders(created_at desc);

alter table public.orders enable row level security;

create policy "Admin full access to orders"
  on public.orders for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Service role full access to orders"
  on public.orders for all using (true) with check (true);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
create table public.order_items (
  id uuid not null default uuid_generate_v4() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id uuid not null references public.books(id),
  quantity integer not null default 1,
  unit_price integer not null,
  format text not null default 'physical' check (format in ('physical', 'digital')),
  created_at timestamptz not null default now()
);

create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_book_id on public.order_items(book_id);

alter table public.order_items enable row level security;

create policy "Admin full access to order items"
  on public.order_items for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Service role full access to order items"
  on public.order_items for all using (true) with check (true);

-- ============================================
-- DOWNLOADS TABLE
-- ============================================
create table public.downloads (
  id uuid not null default uuid_generate_v4() primary key,
  order_id uuid not null references public.orders(id),
  book_id uuid not null references public.books(id),
  customer_id uuid not null references public.customers(id),
  download_token text not null unique,
  download_count integer not null default 0,
  max_downloads integer not null default 5,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index idx_downloads_token on public.downloads(download_token);
create index idx_downloads_customer_id on public.downloads(customer_id);
create index idx_downloads_order_id on public.downloads(order_id);

alter table public.downloads enable row level security;

create policy "Admin full access to downloads"
  on public.downloads for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Service role full access to downloads"
  on public.downloads for all using (true) with check (true);

-- ============================================
-- REVIEWS TABLE
-- ============================================
create table public.reviews (
  id uuid not null default uuid_generate_v4() primary key,
  book_id uuid not null references public.books(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_reviews_book_id on public.reviews(book_id);
create index idx_reviews_is_approved on public.reviews(is_approved);

alter table public.reviews enable row level security;

create policy "Approved reviews are viewable by everyone"
  on public.reviews for select using (is_approved = true);

create policy "Anyone can insert reviews"
  on public.reviews for insert with check (true);

create policy "Admin full access to reviews"
  on public.reviews for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
create table public.newsletter_subscribers (
  id uuid not null default uuid_generate_v4() primary key,
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_newsletter_email on public.newsletter_subscribers(email);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert with check (true);

create policy "Admin full access to newsletter"
  on public.newsletter_subscribers for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
create table public.contact_messages (
  id uuid not null default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_contact_messages_is_read on public.contact_messages(is_read);
create index idx_contact_messages_created_at on public.contact_messages(created_at desc);

alter table public.contact_messages enable row level security;

create policy "Anyone can submit contact messages"
  on public.contact_messages for insert with check (true);

create policy "Admin full access to contact messages"
  on public.contact_messages for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.books
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.customers
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public) values ('book-covers', 'book-covers', true);
insert into storage.buckets (id, name, public) values ('book-files', 'book-files', false);
insert into storage.buckets (id, name, public) values ('videos', 'videos', true);
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true);
insert into storage.buckets (id, name, public) values ('author-media', 'author-media', true);

-- Storage policies
create policy "Public read access for book covers"
  on storage.objects for select using (bucket_id = 'book-covers');

create policy "Admin upload book covers"
  on storage.objects for insert with check (
    bucket_id = 'book-covers' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin delete book covers"
  on storage.objects for delete using (
    bucket_id = 'book-covers' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin upload book files"
  on storage.objects for insert with check (
    bucket_id = 'book-files' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin read book files"
  on storage.objects for select using (
    bucket_id = 'book-files' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Public read access for videos"
  on storage.objects for select using (bucket_id = 'videos');

create policy "Admin upload videos"
  on storage.objects for insert with check (
    bucket_id = 'videos' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Public read access for gallery"
  on storage.objects for select using (bucket_id = 'gallery');

create policy "Admin upload gallery"
  on storage.objects for insert with check (
    bucket_id = 'gallery' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Public read access for author media"
  on storage.objects for select using (bucket_id = 'author-media');

create policy "Admin upload author media"
  on storage.objects for insert with check (
    bucket_id = 'author-media' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
