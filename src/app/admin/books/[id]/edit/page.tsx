"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Loader2, Upload, X, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Book, BookImage } from "@/lib/types";

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

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<BookImage[]>([]);
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
    cover_image: "",
    file_url: "",
  });

  useEffect(() => {
    async function fetchBook() {
      const supabase = createClient();

      const { data: book } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (!book) {
        router.push("/admin/books");
        return;
      }

      const { data: images } = await supabase
        .from("book_images")
        .select("*")
        .eq("book_id", bookId)
        .order("sort_order");

      setExistingImages(images ?? []);
      setCoverPreview(book.cover_image);

      setForm({
        title: book.title,
        slug: book.slug,
        description: book.description,
        long_description: book.long_description ?? "",
        price: (book.price / 100).toFixed(2),
        compare_at_price: book.compare_at_price
          ? (book.compare_at_price / 100).toFixed(2)
          : "",
        category: book.category,
        format: book.format,
        isbn: book.isbn ?? "",
        pages: book.pages?.toString() ?? "",
        publisher: book.publisher ?? "",
        publish_date: book.publish_date ?? "",
        language: book.language,
        stock: book.stock.toString(),
        is_featured: book.is_featured,
        is_published: book.is_published,
        cover_image: book.cover_image,
        file_url: book.file_url ?? "",
      });

      setLoading(false);
    }

    fetchBook();
  }, [bookId, router]);

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

  async function removeExistingImage(imageId: string) {
    const supabase = createClient();
    await supabase.from("book_images").delete().eq("id", imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const errors: Record<string, boolean> = {};
    if (!form.title.trim()) errors.title = true;
    if (!form.description.trim()) errors.description = true;
    if (!form.price || parseFloat(form.price) <= 0) errors.price = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill in all required fields highlighted below.");
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSaving(false);
      return;
    }
    setFieldErrors({});

    setSaving(true);

    try {
      const supabase = createClient();
      const timestamp = Date.now();
      let coverUrl = form.cover_image;
      let fileUrl: string | null = form.file_url || null;

      // Check slug uniqueness (excluding current book)
      const { data: existingSlug } = await supabase
        .from("books")
        .select("id")
        .eq("slug", form.slug)
        .neq("id", bookId)
        .single();

      if (existingSlug) {
        setError("A book with this URL slug already exists. Please use a different title or modify the slug.");
        setSaving(false);
        return;
      }

      // Upload new cover if provided
      if (coverFile) {
        const coverExt = coverFile.name.split(".").pop();
        const coverPath = `covers/${timestamp}-${form.slug}.${coverExt}`;
        const { error: coverError } = await supabase.storage
          .from("book-covers")
          .upload(coverPath, coverFile);

        if (coverError) {
          setError("Failed to upload cover image: " + coverError.message);
          setSaving(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("book-covers").getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      // Upload new ebook if provided
      if (ebookFile) {
        const ebookExt = ebookFile.name.split(".").pop();
        const ebookPath = `ebooks/${timestamp}-${form.slug}.${ebookExt}`;

        // Delete old file if it exists
        if (form.file_url) {
          const oldPath = form.file_url.includes("/book-files/")
            ? form.file_url.split("/book-files/").pop()!
            : form.file_url;
          await supabase.storage.from("book-files").remove([oldPath]);
        }

        const { error: ebookError } = await supabase.storage
          .from("book-files")
          .upload(ebookPath, ebookFile);

        if (ebookError) {
          setError("Failed to upload ebook file: " + ebookError.message);
          setSaving(false);
          return;
        }

        fileUrl = ebookPath;
      }

      const priceInCents = Math.round(parseFloat(form.price) * 100);
      const compareAtPriceInCents = form.compare_at_price
        ? Math.round(parseFloat(form.compare_at_price) * 100)
        : null;

      const { error: updateError } = await supabase
        .from("books")
        .update({
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
        .eq("id", bookId);

      if (updateError) {
        setError("Failed to update book: " + updateError.message);
        setSaving(false);
        return;
      }

      // Upload additional images
      if (additionalImages.length > 0) {
        const maxSort =
          existingImages.length > 0
            ? Math.max(...existingImages.map((img) => img.sort_order))
            : -1;

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
              book_id: bookId,
              image_url: imgUrl,
              sort_order: maxSort + 1 + i,
            });
          }
        }
      }

      router.push("/admin/books");
    } catch {
      setError("An unexpected error occurred.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-fg-2" />
      </div>
    );
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
            Edit Book
          </h2>
          <p className="text-fg-3 mt-1">
            Update the details for &quot;{form.title}&quot;.
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
              <Label>Cover Image</Label>
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
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-full max-w-xs h-32 border-2 border-dashed border-edge rounded-lg cursor-pointer hover:border-amber-500 transition-colors">
                  <Upload className="w-6 h-6 text-fg-2 mb-2" />
                  <span className="text-sm text-fg-3">
                    Upload new cover image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Ebook File */}
            <div className="space-y-2">
              <Label>Ebook / PDF File</Label>
              {form.file_url && (
                <p className="text-xs text-fg-3">
                  Current file attached. Upload a new one to replace.
                </p>
              )}
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

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Images</Label>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative w-20 h-20 rounded overflow-hidden border border-edge-2 group"
                    >
                      <Image
                        src={img.image_url}
                        alt={img.alt_text ?? "Book image"}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Images */}
            <div className="space-y-2">
              <Label>Add More Images</Label>
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
          <Button type="submit" variant="gold" size="lg" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
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
