import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import StoreContent from "./store-content";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Bookstore | Browse the Collection",
  description:
    "Explore the complete collection of novels, poetry, and more. Available in physical and digital formats.",
};

const BOOKS_PER_PAGE = 9;

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = params.category || "";
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const supabase = await createClient();

  /* ---- Fetch distinct categories ---- */
  const { data: categoryRows } = await supabase
    .from("books")
    .select("category")
    .eq("is_published", true)
    .order("category");

  const categories = Array.from(
    new Set((categoryRows ?? []).map((r) => r.category))
  );

  /* ---- Build the books query ---- */
  let query = supabase
    .from("books")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  /* ---- Pagination ---- */
  const from = (page - 1) * BOOKS_PER_PAGE;
  const to = from + BOOKS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data: books, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / BOOKS_PER_PAGE);

  return (
    <StoreContent
      books={books ?? []}
      categories={categories}
      currentCategory={category}
      currentSearch={search}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}
