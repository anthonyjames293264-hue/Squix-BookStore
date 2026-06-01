"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Book } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const supabase = createClient();
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    setBooks(data ?? []);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteBook) return;
    if (books.length <= 1) {
      setDeleteBook(null);
      return;
    }
    setDeleting(true);

    const supabase = createClient();
    await supabase.from("book_images").delete().eq("book_id", deleteBook.id);
    await supabase.from("books").delete().eq("id", deleteBook.id);

    setBooks(books.filter((b) => b.id !== deleteBook.id));
    setDeleteBook(null);
    setDeleting(false);
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-fg-3" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-fg">
            Books
          </h2>
          <p className="text-fg-3 mt-1">
            Manage your book inventory ({books.length} total)
          </p>
        </div>
        <Link href="/admin/books/new">
          <Button variant="gold">
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" />
              <Input
                placeholder="Search books by title or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBooks.length === 0 ? (
            <p className="text-fg-3 text-sm text-center py-8">
              No books found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-edge">
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Book
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden md:table-cell">
                      Category
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden lg:table-cell">
                      Format
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Price
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden md:table-cell">
                      Stock
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Status
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-fg-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr
                      key={book.id}
                      className="border-b border-edge hover:bg-hover-fill"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded overflow-hidden bg-page flex-shrink-0 relative">
                            {book.cover_image ? (
                              <Image
                                src={book.cover_image}
                                alt={book.title}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full bg-surface" />
                            )}
                          </div>
                          <span className="font-medium text-fg line-clamp-1">
                            {book.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell capitalize text-fg-2">
                        {book.category}
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell capitalize text-fg-2">
                        {book.format}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {formatPrice(book.price)}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell text-fg-2">
                        {book.stock}
                      </td>
                      <td className="py-3 px-2">
                        {book.is_published ? (
                          <Badge variant="success">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/books/${book.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteBook(book)}
                            disabled={books.length <= 1}
                            title={books.length <= 1 ? "Cannot delete the last book" : "Delete book"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteBook} onOpenChange={() => setDeleteBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteBook?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBook(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
