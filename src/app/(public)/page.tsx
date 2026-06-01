import { createClient } from "@/lib/supabase/server";
import HomePage from "./home-content";

export const revalidate = 60;

export default async function Page() {
  const supabase = await createClient();

  const { data: featuredBooks } = await supabase
    .from("books")
    .select("id, title, slug, description, cover_image, price, category, format")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return <HomePage featuredBooks={featuredBooks ?? []} />;
}
