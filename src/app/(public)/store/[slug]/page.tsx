import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import BookDetail from "./book-detail";

export const revalidate = 30;

/* -------------------------------------------------------------------------- */
/*  generateStaticParams                                                      */
/* -------------------------------------------------------------------------- */

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createAdminClient();
    const { data: books } = await supabase
      .from("books")
      .select("slug")
      .eq("is_published", true);

    return (books ?? []).map((book) => ({ slug: book.slug }));
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*  generateMetadata                                                          */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("title, description, cover_image")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!book) {
    return { title: "Book Not Found" };
  }

  return {
    title: `${book.title} | Bookstore`,
    description: book.description,
    openGraph: {
      title: book.title,
      description: book.description,
      images: book.cover_image ? [{ url: book.cover_image }] : [],
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  /* ---- Fetch book with images and approved reviews ---- */
  const { data: book } = await supabase
    .from("books")
    .select(
      `
      *,
      book_images ( id, book_id, image_url, alt_text, sort_order ),
      reviews ( id, book_id, customer_name, rating, comment, is_approved, created_at )
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("reviews.is_approved", true)
    .order("sort_order", {
      referencedTable: "book_images",
      ascending: true,
    })
    .order("created_at", {
      referencedTable: "reviews",
      ascending: false,
    })
    .single();

  if (!book) {
    notFound();
  }

  /* ---- Fetch a few related books (same category, excluding this one) ---- */
  const { data: relatedBooks } = await supabase
    .from("books")
    .select("id, title, slug, cover_image, price, category, format")
    .eq("is_published", true)
    .eq("category", book.category)
    .neq("id", book.id)
    .limit(3);

  return <BookDetail book={book} relatedBooks={relatedBooks ?? []} />;
}
