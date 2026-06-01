"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  Star,
  ShoppingCart,
  BookOpen,
  Download,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Send,
  Phone,
  MapPin,
  Loader2,
  X as XIcon,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { BookWithImages, Book } from "@/lib/types";

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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type RelatedBook = Pick<
  Book,
  "id" | "title" | "slug" | "cover_image" | "price" | "category" | "format"
>;

interface BookDetailProps {
  book: BookWithImages;
  relatedBooks: RelatedBook[];
}

/* -------------------------------------------------------------------------- */
/*  Star rating component                                                     */
/* -------------------------------------------------------------------------- */

function StarRating({
  rating,
  interactive = false,
  onChange,
  size = "sm",
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(
            interactive && "cursor-pointer transition-transform hover:scale-110",
            !interactive && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClass,
              star <= rating
                ? "fill-amber-500 text-amber-500"
                : "fill-transparent text-fg-3"
            )}
          />
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function BookDetail({ book, relatedBooks }: BookDetailProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<"physical" | "digital">(
    book.format === "digital" ? "digital" : "physical"
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  /* ---- Already purchased state ---- */
  const [existingDownload, setExistingDownload] = useState<{
    token: string;
    count: number;
    max: number;
    expired: boolean;
  } | null>(null);

  /* ---- Physical inquiry modal state ---- */
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryAddress, setInquiryAddress] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  /* ---- Checkout loading ---- */
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  /* ---- Review form state ---- */
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  /* ---- Computed values ---- */
  const images = book.book_images ?? [];
  const reviews = book.reviews ?? [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const allImages = [
    { image_url: book.cover_image, alt_text: book.title },
    ...images,
  ];

  const formatOptions =
    book.format === "both"
      ? (["physical", "digital"] as const)
      : ([book.format] as const);

  /* ---- Check auth state ---- */
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();
        setUserName(profile?.full_name || user.email || "");
        if (profile?.role === "admin") {
          setIsAdmin(true);
        }

        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", user.email)
          .single();

        if (customer) {
          const { data: dl } = await supabase
            .from("downloads")
            .select("download_token, download_count, max_downloads, expires_at")
            .eq("customer_id", customer.id)
            .eq("book_id", book.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (dl) {
            setExistingDownload({
              token: dl.download_token,
              count: dl.download_count,
              max: dl.max_downloads,
              expired: new Date(dl.expires_at) < new Date(),
            });
          }
        }
      }
    }
    checkAuth();
  }, []);

  /* ---- Handlers ---- */
  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      router.push(`/auth?returnTo=/store/${book.slug}`);
      return;
    }

    if (selectedFormat === "physical") {
      setShowInquiry(true);
      return;
    }

    // Digital purchase - Stripe checkout
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ bookId: book.id, quantity: 1, format: "digital" }],
          customerEmail: userEmail,
          customerName: userName,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || "Could not start checkout. Please try again.");
        setCheckoutLoading(false);
      }
    } catch {
      setCheckoutError("Network error. Please check your connection and try again.");
      setCheckoutLoading(false);
    }
  };

  const handlePhysicalInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryStatus("loading");

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_PHYSICAL_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        console.error("EmailJS env vars missing:", { serviceId, templateId, publicKey });
        setInquiryStatus("error");
        return;
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: userName,
          from_email: userEmail,
          to_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
          book_title: book.title,
          book_price: formatPrice(book.price),
          book_link: typeof window !== "undefined" ? window.location.href : "",
          customer_name: userName,
          customer_email: userEmail,
          customer_phone: inquiryPhone,
          shipping_address: inquiryAddress,
        },
        publicKey
      );
      setInquiryStatus("success");
    } catch (err) {
      console.error("EmailJS error:", err);
      setInquiryStatus("error");
    }
  };
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          customerName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        setReviewSubmitted(true);
        setReviewName("");
        setReviewRating(5);
        setReviewComment("");
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="bg-page text-fg">
      {/* ================================================================ */}
      {/*  BREADCRUMB                                                      */}
      {/* ================================================================ */}
      <div className="border-b border-edge bg-surface/60 px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-fg-3">
          <Link
            href="/store"
            className="flex items-center gap-1 transition-colors hover:text-amber-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Bookstore
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-fg-2">{book.title}</span>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  HERO SECTION                                                    */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden px-6 py-16 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(217,119,6,0.08)_0%,_transparent_60%)]"
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20"
          >
            {/* ---- Image gallery ---- */}
            <motion.div variants={fadeUp} custom={0} className="space-y-4">
              {/* Main image */}
              <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-edge bg-surface shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full"
                  >
                    {allImages[selectedImage]?.image_url ? (
                      <Image
                        src={allImages[selectedImage].image_url}
                        alt={
                          allImages[selectedImage].alt_text || book.title
                        }
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                        <div className="mb-4 h-px w-16 bg-amber-500" />
                        <p className="font-serif text-xs font-medium uppercase tracking-[0.25em] text-amber-500">
                          {book.category}
                        </p>
                        <h3 className="mt-3 font-serif text-3xl font-bold leading-tight text-fg">
                          {book.title}
                        </h3>
                        <div className="mt-4 h-px w-16 bg-amber-500" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Sale badge */}
                {book.compare_at_price &&
                  book.compare_at_price > book.price && (
                    <div className="absolute right-4 top-4">
                      <Badge className="border-0 bg-red-600 px-3 py-1 text-sm text-white">
                        Sale
                      </Badge>
                    </div>
                  )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200",
                        selectedImage === idx
                          ? "border-amber-500 ring-2 ring-amber-500/30"
                          : "border-edge opacity-60 hover:opacity-100"
                      )}
                    >
                      {img.image_url ? (
                        <Image
                          src={img.image_url}
                          alt={img.alt_text || `Image ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-surface">
                          <BookOpen className="h-4 w-4 text-fg-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ---- Book info ---- */}
            <motion.div variants={fadeUp} custom={0.15} className="space-y-6">
              {/* Category + Format badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className="border-0 bg-surface text-fg-2">
                  {book.category}
                </Badge>
                <Badge className="border-0 bg-amber-600/20 text-amber-500">
                  {book.format === "both"
                    ? "Hardcover & E-Book"
                    : book.format === "digital"
                      ? "E-Book"
                      : "Hardcover"}
                </Badge>
                {book.is_featured && (
                  <Badge className="border-0 bg-amber-500 text-white">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                {book.title}
              </h1>

              {/* Rating summary */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3">
                  <StarRating rating={Math.round(averageRating)} size="md" />
                  <span className="text-sm text-fg-2">
                    {averageRating.toFixed(1)} / 5 &mdash; {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-amber-500">
                  {formatPrice(book.price)}
                </span>
                {book.compare_at_price &&
                  book.compare_at_price > book.price && (
                    <span className="text-lg text-fg-3 line-through">
                      {formatPrice(book.compare_at_price)}
                    </span>
                  )}
              </div>

              {/* Description */}
              <p className="text-lg leading-relaxed text-fg-2">
                {book.description}
              </p>

              {/* Long description */}
              {book.long_description && (
                <div className="border-t border-edge pt-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-fg-3">
                    {book.long_description}
                  </p>
                </div>
              )}

              {/* Book details grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-edge bg-surface/40 p-5">
                {book.isbn && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-fg-3">
                      ISBN
                    </p>
                    <p className="mt-1 text-sm text-fg-2">{book.isbn}</p>
                  </div>
                )}
                {book.pages && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-fg-3">
                      Pages
                    </p>
                    <p className="mt-1 text-sm text-fg-2">
                      {book.pages}
                    </p>
                  </div>
                )}
                {book.publisher && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-fg-3">
                      Publisher
                    </p>
                    <p className="mt-1 text-sm text-fg-2">
                      {book.publisher}
                    </p>
                  </div>
                )}
                {book.publish_date && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-fg-3">
                      Published
                    </p>
                    <p className="mt-1 text-sm text-fg-2">
                      {formatDate(book.publish_date)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-fg-3">
                    Language
                  </p>
                  <p className="mt-1 text-sm text-fg-2">
                    {book.language}
                  </p>
                </div>
              </div>

              {/* Purchase section — hidden for admin */}
              {!isAdmin && (
                <>
                  {existingDownload && selectedFormat === "digital" ? (
                    /* Already purchased — show download */
                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 space-y-3">
                      <p className="text-sm font-medium text-green-500">
                        You already own this e-book!
                      </p>
                      <p className="text-xs text-fg-3">
                        Downloads used: {existingDownload.count} / {existingDownload.max}
                      </p>
                      {existingDownload.expired ? (
                        <p className="text-xs text-red-400">
                          Your download link has expired. Please contact support for a new link.
                        </p>
                      ) : existingDownload.count >= existingDownload.max ? (
                        <p className="text-xs text-red-400">
                          You have reached the maximum number of downloads. Please contact support if you need access again.
                        </p>
                      ) : (
                        <Button asChild variant="gold" size="lg" className="w-full">
                          <a href={`/api/download/${existingDownload.token}`} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-5 w-5" />
                            Download E-Book ({existingDownload.max - existingDownload.count} remaining)
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm" className="w-full border-edge text-fg-2">
                        <Link href="/account/downloads">
                          View All Downloads
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Format selection */}
                      {formatOptions.length > 1 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-fg-2">
                            Select Format
                          </p>
                          <div className="flex gap-3">
                            {formatOptions.map((fmt) => (
                              <button
                                key={fmt}
                                onClick={() => setSelectedFormat(fmt)}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-all duration-200",
                                  selectedFormat === fmt
                                    ? "border-amber-500 bg-amber-500/10 text-amber-500"
                                    : "border-edge text-fg-2 hover:border-fg-3 hover:text-fg"
                                )}
                              >
                                {fmt === "physical" ? (
                                  <BookOpen className="h-4 w-4" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                                {fmt === "physical" ? "Hardcover" : "E-Book"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Purchase buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="gold"
                          size="lg"
                          className="flex-1"
                          onClick={handleBuyNow}
                          disabled={checkoutLoading || (selectedFormat === "physical" && book.stock <= 0)}
                        >
                          {checkoutLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : selectedFormat === "physical" ? (
                            <>
                              <ShoppingCart className="mr-2 h-5 w-5" />
                              {book.stock > 0 ? "Order Physical Copy" : "Out of Stock"}
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-5 w-5" />
                              Buy E-Book Now
                            </>
                          )}
                        </Button>
                      </div>

                      {!isLoggedIn && (
                        <p className="text-xs text-fg-3 text-center">
                          You need to{" "}
                          <Link href={`/auth?returnTo=/store/${book.slug}`} className="text-amber-500 hover:text-amber-400">
                            sign in
                          </Link>{" "}
                          to purchase.
                        </p>
                      )}

                  {checkoutError && (
                    <p className="text-xs text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      {checkoutError}
                    </p>
                  )}
                    </>
                  )}
                </>
              )}

              {/* Physical book inquiry modal */}
              <AnimatePresence>
                {showInquiry && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => inquiryStatus !== "loading" && setShowInquiry(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-md bg-surface border border-edge rounded-xl p-6 space-y-5"
                    >
                      {inquiryStatus === "success" ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="font-serif text-xl font-bold">Thank You!</h3>
                          <p className="text-fg-2 mt-2 text-sm">
                            Your order request has been received. A member of our team will contact you shortly to finalize shipping and payment details.
                          </p>
                          <Button
                            variant="gold"
                            className="mt-6"
                            onClick={() => { setShowInquiry(false); setInquiryStatus("idle"); }}
                          >
                            Close
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif text-xl font-bold">Order Physical Copy</h3>
                            <button
                              onClick={() => setShowInquiry(false)}
                              className="text-fg-3 hover:text-fg"
                            >
                              <XIcon className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/60 border border-edge">
                            <div className="h-12 w-9 rounded bg-inset overflow-hidden flex-shrink-0">
                              {book.cover_image && (
                                <img src={book.cover_image} alt="" className="h-full w-full object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{book.title}</p>
                              <p className="text-xs text-amber-500">{formatPrice(book.price)}</p>
                            </div>
                          </div>

                          <p className="text-sm text-fg-2">
                            Please provide your details below. Our team will contact you to arrange shipping and payment.
                          </p>

                          <form onSubmit={handlePhysicalInquiry} className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-fg-2 text-sm">Phone Number</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-3" />
                                <Input
                                  type="tel"
                                  required
                                  value={inquiryPhone}
                                  onChange={(e) => setInquiryPhone(e.target.value)}
                                  placeholder="+1 (555) 000-0000"
                                  className="pl-10 bg-inset border-edge text-fg placeholder:text-fg-3 focus-visible:ring-amber-500"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-fg-2 text-sm">Shipping Address</Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-fg-3" />
                                <Textarea
                                  required
                                  value={inquiryAddress}
                                  onChange={(e) => setInquiryAddress(e.target.value)}
                                  placeholder="Full shipping address including city, state, zip, country"
                                  rows={3}
                                  className="pl-10 bg-inset border-edge text-fg placeholder:text-fg-3 focus-visible:ring-amber-500"
                                />
                              </div>
                            </div>

                            {inquiryStatus === "error" && (
                              <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
                            )}

                            <Button
                              type="submit"
                              variant="gold"
                              size="lg"
                              className="w-full"
                              disabled={inquiryStatus === "loading"}
                            >
                              {inquiryStatus === "loading" ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Submit Order Request
                                </>
                              )}
                            </Button>
                          </form>
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Share */}
              <div className="flex items-center gap-3 border-t border-edge pt-4">
                <span className="text-sm text-fg-3">Share:</span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs text-fg-2 transition-all duration-200 hover:border-fg-3 hover:text-fg"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(`Check out "${book.title}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs text-fg-2 transition-all duration-200 hover:border-fg-3 hover:text-fg"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Twitter
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  REVIEWS                                                         */}
      {/* ================================================================ */}
      <section className="border-t border-edge bg-surface px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0} className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500">
                Reader Feedback
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Reviews
              </h2>
              {reviews.length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <StarRating rating={Math.round(averageRating)} size="md" />
                  <span className="text-fg-2">
                    {averageRating.toFixed(1)} out of 5 ({reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </motion.div>

            {/* Review list */}
            {reviews.length > 0 ? (
              <motion.div
                variants={fadeUp}
                custom={0.15}
                className="mt-12 space-y-6"
              >
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-edge bg-page/60 p-6 transition-colors duration-300 hover:border-edge"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-serif font-semibold text-fg">
                          {review.customer_name}
                        </p>
                        <p className="mt-0.5 text-xs text-fg-3">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="mt-4 leading-relaxed text-fg-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.p
                variants={fadeIn}
                custom={0.15}
                className="mt-8 text-center text-fg-3"
              >
                No reviews yet. Be the first to share your thoughts!
              </motion.p>
            )}

            {/* Review submission form — only for signed-in non-admin users */}
            {!isAdmin && (
            <motion.div
              variants={fadeUp}
              custom={0.25}
              className="mx-auto mt-12 max-w-2xl rounded-xl border border-edge bg-page/60 p-8"
            >
              {!isLoggedIn ? (
                <div className="text-center py-4">
                  <h3 className="font-serif text-xl font-bold text-fg">
                    Write a Review
                  </h3>
                  <p className="mt-3 text-sm text-fg-3">
                    You need to be signed in to leave a review.
                  </p>
                  <Button asChild variant="gold" size="sm" className="mt-4">
                    <Link href={`/auth?returnTo=/store/${book.slug}`}>
                      Sign In to Review
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
              <h3 className="font-serif text-xl font-bold text-fg">
                Write a Review
              </h3>

              {reviewSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-lg border border-green-800 bg-green-900/20 p-4 text-center"
                >
                  <Check className="mx-auto h-8 w-8 text-green-500" />
                  <p className="mt-2 font-medium text-green-400">
                    Thank you for your review!
                  </p>
                  <p className="mt-1 text-sm text-green-500/70">
                    It will appear after moderation.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="mt-6 space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fg-2">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Jane Doe"
                      className="border-edge bg-inset text-fg placeholder:text-fg-3 focus-visible:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fg-2">
                      Rating
                    </label>
                    <StarRating
                      rating={reviewRating}
                      interactive
                      onChange={setReviewRating}
                      size="md"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fg-2">
                      Your Review
                    </label>
                    <Textarea
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about this book..."
                      rows={4}
                      className="border-edge bg-inset text-fg placeholder:text-fg-3 focus-visible:ring-amber-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={reviewSubmitting}
                    className="w-full"
                  >
                    {reviewSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </form>
              )}
                </>
              )}
            </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  RELATED BOOKS                                                   */}
      {/* ================================================================ */}
      {relatedBooks.length > 0 && (
        <section className="border-t border-edge bg-page px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="text-center"
              >
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500">
                  You May Also Like
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  Related Books
                </h2>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={0.15}
                className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {relatedBooks.map((related) => (
                  <Link
                    key={related.id}
                    href={`/store/${related.slug}`}
                    className="group overflow-hidden rounded-xl border border-edge bg-surface/60 transition-all duration-300 hover:border-amber-500/30"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                      {related.cover_image ? (
                        <Image
                          src={related.cover_image}
                          alt={related.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                          <div className="mb-3 h-px w-12 bg-amber-500" />
                          <p className="font-serif text-xs font-medium uppercase tracking-[0.25em] text-amber-500">
                            {related.category}
                          </p>
                          <h3 className="mt-2 font-serif text-xl font-bold leading-tight text-white">
                            {related.title}
                          </h3>
                          <div className="mt-3 h-px w-12 bg-amber-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-bold text-fg transition-colors group-hover:text-amber-500">
                        {related.title}
                      </h3>
                      <p className="mt-2 font-serif text-lg font-bold text-amber-500">
                        {formatPrice(related.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={0.25}
                className="mt-10 text-center"
              >
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-edge text-fg hover:bg-surface hover:text-fg"
                >
                  <Link href="/store">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Bookstore
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
