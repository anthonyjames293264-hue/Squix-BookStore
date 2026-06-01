"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
  Loader2,
  Star,
  Check,
  X,
  Trash2,
} from "lucide-react";
import type { Review, Book } from "@/lib/types";

type ReviewWithBook = Review & { books: Pick<Book, "title"> };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [deleteReview, setDeleteReview] = useState<ReviewWithBook | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*, books(title)")
      .order("created_at", { ascending: false });

    setReviews((data as ReviewWithBook[]) ?? []);
    setLoading(false);
  }

  async function toggleApproval(reviewId: string, approved: boolean) {
    const supabase = createClient();
    await supabase
      .from("reviews")
      .update({ is_approved: approved })
      .eq("id", reviewId);

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, is_approved: approved } : r
      )
    );
  }

  async function handleDelete() {
    if (!deleteReview) return;
    setDeleting(true);

    const supabase = createClient();
    await supabase.from("reviews").delete().eq("id", deleteReview.id);

    setReviews((prev) => prev.filter((r) => r.id !== deleteReview.id));
    setDeleteReview(null);
    setDeleting(false);
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === "approved") return r.is_approved;
    if (filter === "pending") return !r.is_approved;
    return true;
  });

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "text-fg-2"
            }`}
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-fg-3" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-fg">
          Reviews
        </h2>
        <p className="text-fg-3 mt-1">
          Manage customer reviews ({reviews.length} total)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            {(["all", "approved", "pending"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${
                  filter === f
                    ? "bg-surface text-fg"
                    : "bg-surface text-fg-2 hover:bg-surface"
                }`}
              >
                {f}
                {f === "pending" && (
                  <span className="ml-1">
                    ({reviews.filter((r) => !r.is_approved).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <p className="text-fg-3 text-sm text-center py-8">
              No reviews found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-edge">
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Book
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Customer
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Rating
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden md:table-cell">
                      Comment
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden lg:table-cell">
                      Date
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-fg-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr
                      key={review.id}
                      className="border-b border-edge hover:bg-hover-fill"
                    >
                      <td className="py-3 px-2 font-medium text-fg max-w-[150px] truncate">
                        {review.books?.title ?? "Unknown"}
                      </td>
                      <td className="py-3 px-2 text-fg-2">
                        {review.customer_name}
                      </td>
                      <td className="py-3 px-2">
                        {renderStars(review.rating)}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell text-fg-2 max-w-[200px] truncate">
                        {review.comment ?? "-"}
                      </td>
                      <td className="py-3 px-2">
                        {review.is_approved ? (
                          <Badge variant="success">Approved</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell text-fg-3">
                        {formatDate(review.created_at)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {review.is_approved ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              onClick={() =>
                                toggleApproval(review.id, false)
                              }
                              title="Unapprove"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() =>
                                toggleApproval(review.id, true)
                              }
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteReview(review)}
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

      {/* Delete Confirmation */}
      <Dialog open={!!deleteReview} onOpenChange={() => setDeleteReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review by &quot;
              {deleteReview?.customer_name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteReview(null)}>
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
