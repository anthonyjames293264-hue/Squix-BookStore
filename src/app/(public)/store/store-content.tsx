"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Book } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface StoreContentProps {
  books: Book[];
  categories: string[];
  currentCategory: string;
  currentSearch: string;
  currentPage: number;
  totalPages: number;
}

/* -------------------------------------------------------------------------- */
/*  Format label helpers                                                      */
/* -------------------------------------------------------------------------- */

function formatLabel(format: string) {
  const labels: Record<string, string> = {
    physical: "Hardcover",
    digital: "E-Book",
    both: "Hardcover & E-Book",
  };
  return labels[format] || format;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function StoreContent({
  books,
  categories,
  currentCategory,
  currentSearch,
  currentPage,
  totalPages,
}: StoreContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch);

  /* ---- Navigate with updated query params ---- */
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change (unless updating page itself)
      if (!("page" in updates)) {
        params.delete("page");
      }

      router.push(`/store?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchValue });
  };

  const clearSearch = () => {
    setSearchValue("");
    updateParams({ search: "" });
  };

  const handleCategoryClick = (cat: string) => {
    updateParams({ category: cat === currentCategory ? "" : cat });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
  };

  return (
    <div className="bg-page text-fg">
      {/* ================================================================ */}
      {/*  HERO / HEADER                                                   */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden px-6 pb-12 pt-16 text-center sm:pb-16 sm:pt-24 aurora-bg">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-500/[0.04] rounded-full blur-[120px] animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-amber-600/[0.03] rounded-full blur-[100px] animate-float-delayed" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

        <motion.div
          className="relative z-10 mx-auto max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="mx-auto mb-6 h-px w-24 bg-amber-500"
          />
          <motion.p
            variants={fadeUp}
            custom={0.05}
            className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-amber-500"
          >
            The Collection
          </motion.p>
          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Book<span className="gradient-text text-glow">store</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-4 max-w-xl text-lg text-fg-2"
          >
            Browse the complete catalogue of novels, poetry, and more.
            Available in physical and digital formats.
          </motion.p>
        </motion.div>
      </section>

      {/* ================================================================ */}
      {/*  FILTERS                                                         */}
      {/* ================================================================ */}
      <section className="border-t border-edge-2 bg-panel backdrop-blur-sm px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
              <Input
                type="text"
                placeholder="Search books by title or description..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-11 border-edge-2 bg-inset pl-10 text-fg placeholder:text-fg-3 focus-visible:ring-amber-500 backdrop-blur-sm"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 transition-colors hover:text-fg"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="gold" className="h-11">
              Search
            </Button>
          </form>

          {/* Category pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleCategoryClick("")}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
                !currentCategory
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                  : "border-edge-2 text-fg-2 hover:border-amber-500/20 hover:text-fg"
              )}
            >
              All Books
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  currentCategory === cat
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                    : "border-edge-2 text-fg-2 hover:border-amber-500/20 hover:text-fg"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active filters summary */}
          {(currentSearch || currentCategory) && (
            <div className="flex items-center justify-center gap-2 text-sm text-fg-3">
              <span>Showing results</span>
              {currentSearch && (
                <span>
                  for &ldquo;
                  <span className="text-amber-500">{currentSearch}</span>
                  &rdquo;
                </span>
              )}
              {currentCategory && (
                <span>
                  in{" "}
                  <span className="text-amber-500">{currentCategory}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/*  BOOK GRID                                                       */}
      {/* ================================================================ */}
      <section className="border-t border-edge-2 bg-page px-6 py-16 sm:py-20 noise-overlay relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/[0.02] rounded-full blur-[150px]" />
        </div>
        <div className="mx-auto max-w-7xl relative z-10">
          {books.length === 0 ? (
            /* ---------- Empty state ---------- */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-edge-2 bg-inset">
                <BookOpen className="h-8 w-8 text-fg-3" />
              </div>
              <h3 className="mt-6 font-serif text-2xl font-bold">
                No Books Found
              </h3>
              <p className="mt-2 max-w-md text-fg-3">
                We couldn&apos;t find any books matching your criteria. Try
                adjusting your search or clearing the filters.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-edge-2 text-fg hover:bg-hover-fill"
                onClick={() => {
                  setSearchValue("");
                  router.push("/store");
                }}
              >
                Clear All Filters
              </Button>
            </motion.div>
          ) : (
            /* ---------- Grid ---------- */
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid gap-4 grid-cols-2 lg:grid-cols-3"
            >
              {books.map((book) => (
                <motion.div
                  key={book.id}
                  variants={cardVariant}
                  whileHover={{ y: -10, transition: { duration: 0.35, ease: "easeOut" } }}
                >
                  <Link
                    href={`/store/${book.slug}`}
                    className="group relative block overflow-hidden rounded-xl sm:rounded-2xl border border-edge-2 bg-surface/40 backdrop-blur-sm transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.15)]"
                  >
                    {/* Cover image */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {book.cover_image ? (
                        <Image
                          src={book.cover_image}
                          alt={book.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-surface to-inset p-6 text-center">
                          <motion.span className="text-5xl mb-4">🐿️</motion.span>
                          <p className="font-serif text-xs font-medium uppercase tracking-[0.25em] text-amber-500">
                            {book.category}
                          </p>
                          <h3 className="mt-2 font-serif text-xl font-bold leading-tight text-fg">
                            {book.title}
                          </h3>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-page via-page/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

                      {/* Top badges */}
                      <div className="absolute left-3 top-3 flex gap-2">
                        <span className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/10">
                          {formatLabel(book.format)}
                        </span>
                      </div>

                      {book.compare_at_price && book.compare_at_price > book.price && (
                        <div className="absolute right-3 top-3">
                          <span className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg shadow-red-500/30">
                            SALE
                          </span>
                        </div>
                      )}

                      {/* Bottom info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                        <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.15em] text-amber-400/80 mb-1 hidden sm:block">
                          {book.category}
                        </p>
                        <h3 className="font-serif text-sm sm:text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
                          {book.title}
                        </h3>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-lg sm:text-2xl font-bold text-amber-500 drop-shadow-lg">
                              {formatPrice(book.price)}
                            </span>
                            {book.compare_at_price && book.compare_at_price > book.price && (
                              <span className="text-sm text-fg-2 line-through">
                                {formatPrice(book.compare_at_price)}
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-sm transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 group-hover:shadow-lg group-hover:shadow-amber-500/25">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            View
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ============================================================ */}
          {/*  PAGINATION                                                   */}
          {/* ============================================================ */}
          {totalPages > 1 && (
            <nav className="mt-16 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="border-edge-2 text-fg hover:bg-hover-fill hover:text-fg disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first, last, current, and neighbors
                  const show =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;

                  // Show ellipsis marker
                  const showEllipsisBefore =
                    page === currentPage - 1 &&
                    currentPage > 3 &&
                    page !== 1;
                  const showEllipsisAfter =
                    page === currentPage + 1 &&
                    currentPage < totalPages - 2 &&
                    page !== totalPages;

                  if (!show) return null;

                  return (
                    <span key={page} className="flex items-center gap-2">
                      {showEllipsisBefore && (
                        <span className="px-1 text-fg-3">...</span>
                      )}
                      <Button
                        variant={
                          page === currentPage ? "gold" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "min-w-[2.25rem]",
                          page !== currentPage &&
                            "border-edge-2 text-fg hover:bg-hover-fill hover:text-fg"
                        )}
                      >
                        {page}
                      </Button>
                      {showEllipsisAfter && (
                        <span className="px-1 text-fg-3">...</span>
                      )}
                    </span>
                  );
                }
              )}

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="border-edge-2 text-fg hover:bg-hover-fill hover:text-fg disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
