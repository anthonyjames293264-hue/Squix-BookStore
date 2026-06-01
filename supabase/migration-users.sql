-- ============================================
-- Migration: Add user accounts support
-- Run this in Supabase SQL Editor
-- ============================================

-- Add user_id to customers table to link auth users to customer records
alter table public.customers
  add column if not exists user_id uuid references auth.users unique;

create index if not exists idx_customers_user_id on public.customers(user_id);

-- RLS: Let authenticated users read their own customer record
create policy "Users can view own customer record"
  on public.customers for select using (
    auth.uid() = user_id
  );

-- RLS: Let authenticated users view their own orders
create policy "Users can view own orders"
  on public.orders for select using (
    exists (
      select 1 from public.customers
      where customers.id = orders.customer_id
      and customers.user_id = auth.uid()
    )
  );

-- RLS: Let authenticated users view their own order items
create policy "Users can view own order items"
  on public.order_items for select using (
    exists (
      select 1 from public.orders
      join public.customers on customers.id = orders.customer_id
      where orders.id = order_items.order_id
      and customers.user_id = auth.uid()
    )
  );

-- RLS: Let authenticated users view their own downloads
create policy "Users can view own downloads"
  on public.downloads for select using (
    exists (
      select 1 from public.customers
      where customers.id = downloads.customer_id
      and customers.user_id = auth.uid()
    )
  );

-- Update handle_new_user trigger to also create a customer record
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

  insert into public.customers (email, full_name, user_id)
  values (
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.id
  )
  on conflict (email) do update set user_id = new.id;

  return new;
end;
$$;
