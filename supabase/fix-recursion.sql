-- ============================================
-- SQL: Fix Profiles Table RLS recursion bug
-- Run this script in your Supabase SQL Editor
-- ============================================

-- 1. Create a security definer helper function for checking admin role.
-- Because it is defined as 'security definer', it runs with creator privileges, 
-- bypassing row-level security on profiles and avoiding infinite recursion.
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer set search_path = ''
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- 2. Drop the old recursive policy on the profiles table.
drop policy if exists "Admin full access to profiles" on public.profiles;

-- 3. Recreate it using the new is_admin() helper function.
create policy "Admin full access to profiles"
  on public.profiles for all using (public.is_admin());

-- 4. Update other tables' admin check policies for consistency and performance.
drop policy if exists "Admin full access to books" on public.books;
create policy "Admin full access to books"
  on public.books for all using (public.is_admin());

drop policy if exists "Admin full access to book images" on public.book_images;
create policy "Admin full access to book images"
  on public.book_images for all using (public.is_admin());

drop policy if exists "Admin full access to customers" on public.customers;
create policy "Admin full access to customers"
  on public.customers for all using (public.is_admin());

drop policy if exists "Admin full access to orders" on public.orders;
create policy "Admin full access to orders"
  on public.orders for all using (public.is_admin());

drop policy if exists "Admin full access to order items" on public.order_items;
create policy "Admin full access to order items"
  on public.order_items for all using (public.is_admin());

drop policy if exists "Admin full access to downloads" on public.downloads;
create policy "Admin full access to downloads"
  on public.downloads for all using (public.is_admin());

drop policy if exists "Admin full access to reviews" on public.reviews;
create policy "Admin full access to reviews"
  on public.reviews for all using (public.is_admin());

drop policy if exists "Admin full access to newsletter" on public.newsletter_subscribers;
create policy "Admin full access to newsletter"
  on public.newsletter_subscribers for all using (public.is_admin());

drop policy if exists "Admin full access to contact messages" on public.contact_messages;
create policy "Admin full access to contact messages"
  on public.contact_messages for all using (public.is_admin());
