"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  "fiction",
  "non-fiction",
  "poetry",
  "memoir",
  "self-help",
  "children",
  "young-adult",
  "mystery",
  "romance",
  "sci-fi",
  "fantasy",
  "biography",
  "history",
  "other",
];

const formats = [
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "both", label: "Both" },
];

export default function NewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    long_description: "",
    price: "",
    compare_at_price: "",
    category: "fiction",
    format: "physical" as "physical" | "digital" | "both",
    isbn: "",
    pages: "",
    publisher: "",
    publish_date: "",
    language: "English",
    stock: "0",
    is_featured: false,
    is_published: false,
  });

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title" && typeof value === "string") {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function handleEbookChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEbookFile(file);
  }

  function handleAdditionalImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setAdditionalImages((prev) => [...prev, ...files]);
    setAdditionalPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  }

  function removeAdditionalImage(index: number) {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const errors: Record<string, boolean> = {};
    if (!form.title.trim()) errors.title = true;
    if (!form.description.trim()) errors.description = true;
    if (!form.price || parseFloat(form.price) <= 0) errors.price = true;
    if (!coverFile) errors.cover = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill in all required fields highlighted below.");
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setLoading(false);
      return;
    }
    setFieldErrors({});

    setLoading(true);

    try {
      const supabase = createClient();
      const timestamp = Date.now();

      // Check slug uniqueness
      const { data: existingSlug } = await supabase
        .from("books")
        .select("id")
        .eq("slug", form.slug)
        .single();

      if (existingSlug) {
        setError("A book with this URL slug already exists. Please use a different title or modify the slug.");
        setLoading(false);
        return;
      }

      // Upload cover image
      const coverExt = coverFile!.name.split(".").pop();
      const coverPath = `covers/${timestamp}-${form.slug}.${coverExt}`;
      const { error: coverError } = await supabase.storage
        .from("book-covers")
        .upload(coverPath, coverFile!);

      if (coverError) {
        setError("Failed to upload cover image: " + coverError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl: coverUrl },
      } = supabase.storage.from("book-covers").getPublicUrl(coverPath);

      // Upload ebook file if provided
      let fileUrl: string | null = null;
      if (ebookFile) {
        const ebookExt = ebookFile.name.split(".").pop();
        const ebookPath = `ebooks/${timestamp}-${form.slug}.${ebookExt}`;
        const { error: ebookError } = await supabase.storage
          .from("book-files")
          .upload(ebookPath, ebookFile);

        if (ebookError) {
          setError("Failed to upload ebook file: " + ebookError.message);
          setLoading(false);
          return;
        }

        fileUrl = ebookPath;
      }

      // Insert book record
      const priceInCents = Math.round(parseFloat(form.price) * 100);
      const compareAtPriceInCents = form.compare_at_price
        ? Math.round(parseFloat(form.compare_at_price) * 100)
        : null;

      const { data: book, error: insertError } = await supabase
        .from("books")
        .insert({
          title: form.title,
          slug: form.slug,
          description: form.description,
          long_description: form.long_description || null,
          price: priceInCents,
          compare_at_price: compareAtPriceInCents,
          category: form.category,
          format: form.format,
          isbn: form.isbn || null,
          pages: form.pages ? parseInt(form.pages) : null,
          publisher: form.publisher || null,
          publish_date: form.publish_date || null,
          language: form.language,
          stock: parseInt(form.stock) || 0,
          cover_image: coverUrl,
          file_url: fileUrl,
          is_featured: form.is_featured,
          is_published: form.is_published,
        })
        .select()
        .single();

      if (insertError) {
        setError("Failed to create book: " + insertError.message);
        setLoading(false);
        return;
      }

      // Upload additional images
      if (additionalImages.length > 0 && book) {
        for (let i = 0; i < additionalImages.length; i++) {
          const img = additionalImages[i];
          const imgExt = img.name.split(".").pop();
          const imgPath = `gallery/${timestamp}-${form.slug}-${i}.${imgExt}`;

          const { error: imgError } = await supabase.storage
            .from("book-covers")
            .upload(imgPath, img);

          if (!imgError) {
            const {
              data: { publicUrl: imgUrl },
            } = supabase.storage.from("book-covers").getPublicUrl(imgPath);

            await supabase.from("book_images").insert({
              book_id: book.id,
              image_url: imgUrl,
              sort_order: i,
            });
          }
        }
      }

      router.push("/admin/books");
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/books">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-serif font-bold text-fg">
            Add New Book
          </h2>
          <p className="text-fg-3 mt-1">
            Fill in the details to add a new book to your store.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter book title"
                  required
                  data-error={fieldErrors.title ? "true" : undefined}
                  className={fieldErrors.title ? "border-red-500 ring-1 ring-red-500" : ""}
                />
                {fieldErrors.title && <p className="text-xs text-red-400 mt-1">Title is required</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="auto-generated-from-title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Brief description for listings"
                rows={3}
                required
                data-error={fieldErrors.description ? "true" : undefined}
                className={fieldErrors.description ? "border-red-500 ring-1 ring-red-500" : ""}
              />
              {fieldErrors.description && <p className="text-xs text-red-400 mt-1">Description is required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="long_description">Long Description</Label>
              <Textarea
                id="long_description"
                value={form.long_description}
                onChange={(e) =>
                  updateField("long_description", e.target.value)
                }
                placeholder="Detailed description for the book page"
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing &amp; Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="19.99"
                  required
                  data-error={fieldErrors.price ? "true" : undefined}
                  className={fieldErrors.price ? "border-red-500 ring-1 ring-red-500" : ""}
                />
                {fieldErrors.price && <p className="text-xs text-red-400 mt-1">Valid price is required</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="compare_at_price">Compare at Price</Label>
                <Input
                  id="compare_at_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.compare_at_price}
                  onChange={(e) =>
                    updateField("compare_at_price", e.target.value)
                  }
                  placeholder="29.99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Book Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-edge bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <select
                  id="format"
                  value={form.format}
                  onChange={(e) => updateField("format", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-edge bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                >
                  {formats.map((fmt) => (
                    <option key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={form.isbn}
                  onChange={(e) => updateField("isbn", e.target.value)}
                  placeholder="978-0-000-00000-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  min="0"
                  value={form.pages}
                  onChange={(e) => updateField("pages", e.target.value)}
                  placeholder="300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  value={form.publisher}
                  onChange={(e) => updateField("publisher", e.target.value)}
                  placeholder="Publisher name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publish_date">Publish Date</Label>
                <Input
                  id="publish_date"
                  type="date"
                  value={form.publish_date}
                  onChange={(e) => updateField("publish_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={form.language}
                  onChange={(e) => updateField("language", e.target.value)}
                  placeholder="English"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image *</Label>
              <div className="flex items-start gap-4">
                {coverPreview && (
                  <div className="relative w-24 h-32 rounded overflow-hidden border border-edge-2">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label
                  data-error={fieldErrors.cover ? "true" : undefined}
                  className={`flex flex-col items-center justify-center w-full max-w-xs h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-amber-500 transition-colors ${fieldErrors.cover ? "border-red-500 ring-1 ring-red-500" : "border-edge"}`}
                >
                  <Upload className="w-6 h-6 text-fg-2 mb-2" />
                  <span className="text-sm text-fg-3">
                    Upload cover image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              </div>
              {fieldErrors.cover && <p className="text-xs text-red-400 mt-1">Cover image is required</p>}
            </div>

            {/* Ebook File */}
            <div className="space-y-2">
              <Label>Ebook / PDF File</Label>
              <label className="flex items-center gap-3 w-full max-w-md p-3 border border-edge rounded-lg cursor-pointer hover:border-amber-500 transition-colors">
                <Upload className="w-5 h-5 text-fg-2" />
                <span className="text-sm text-fg-3">
                  {ebookFile ? ebookFile.name : "Upload PDF or ebook file"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.epub,.mobi"
                  onChange={handleEbookChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Additional Images */}
            <div className="space-y-2">
              <Label>Additional Images</Label>
              <div className="flex flex-wrap gap-3">
                {additionalPreviews.map((preview, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded overflow-hidden border border-edge-2"
                  >
                    <Image
                      src={preview}
                      alt={`Additional image ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-edge rounded-lg cursor-pointer hover:border-amber-500 transition-colors">
                  <Upload className="w-4 h-4 text-fg-2" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImages}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => updateField("is_published", e.target.checked)}
                className="w-4 h-4 rounded border-edge text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-fg-3">
                  Make this book visible on the storefront
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => updateField("is_featured", e.target.checked)}
                className="w-4 h-4 rounded border-edge text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className="text-xs text-fg-3">
                  Display this book in the featured section
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="gold" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Book...
              </>
            ) : (
              "Create Book"
            )}
          </Button>
          <Link href="/admin/books">
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
