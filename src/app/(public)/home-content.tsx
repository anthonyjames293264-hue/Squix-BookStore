"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Star,
  ArrowRight,
  BookOpen,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/animations/floating-particles";
import { RevealOnScroll, ParallaxSection, TextReveal } from "@/components/animations/scroll-effects";
import { ScrollingMarquee } from "@/components/animations/scrolling-marquee";
import { InstagramIcon, XTwitterIcon, FacebookIcon, YouTubeIcon } from "@/components/icons/social-icons";

interface FeaturedBook {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  price: number;
  category: string;
  format: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const, delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" as const, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" as const, delay },
  }),
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" as const, delay },
  }),
};

const testimonials = [
  {
    name: "Trish S.",
    title: "Squixer Community Member",
    quote:
      "Squix's daily adventures bring so much joy to my feed! Her resilience is a beautiful reminder that no obstacle is too big when you have enough patience and love.",
    rating: 5,
  },
  {
    name: "David H.",
    title: "Wildlife Advocate",
    quote:
      "Caring for a special needs squirrel requires infinite commitment. Trichia and Amir's story is a masterclass in compassion and the beautiful bond between humans and wildlife.",
    rating: 5,
  },
  {
    name: "Sarah M.",
    title: "Animal Rescue Coordinator",
    quote:
      "This story is heartwarming, honest, and absolutely beautiful. It highlights the critical importance of wildlife rehabilitation and animal awareness in our communities.",
    rating: 5,
  },
];

const socialLinks = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { icon: XTwitterIcon, label: "Twitter / X", href: "https://x.com" },
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
  { icon: YouTubeIcon, label: "YouTube", href: "https://youtube.com" },
];

const marqueeItems = [
  "Squix The Brave",
  "A Story of Hope",
  "Special Needs Wildlife",
  "#Squixers",
  "Resilience",
  "Unconditional Love",
  "First Edition",
  "Pre-Order Now",
  "Wildlife Rescue",
  "Compassion",
];

function RunningSquirrel() {
  return (
    <div className="relative w-full overflow-hidden h-10 my-6">
      <motion.div
        animate={{ x: ["calc(-10vw)", "calc(110vw)"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
        className="absolute top-0 text-3xl"
        style={{ scaleX: -1 }}
      >
        <motion.span
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="inline-block"
        >
          🐿️
        </motion.span>
        {[1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute text-xs opacity-30"
            style={{ left: -15 * i, top: 12 }}
            animate={{ opacity: [0.3, 0] }}
            transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
          >
            🐾
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

export default function HomePage({ featuredBooks = [] }: { featuredBooks?: FeaturedBook[] }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 50]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setRotateX(-y / 15);
    setRotateY(x / 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="bg-page text-fg">
      {/* ================================================================== */}
      {/*  HERO                                                              */}
      {/* ================================================================== */}
      <section className="relative flex min-h-[70vh] md:min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 sm:px-6 py-12 aurora-bg">
        <FloatingParticles count={10} speed={0.4} />

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/[0.04] rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-600/[0.03] rounded-full blur-[80px] animate-float-delayed" />
        </div>

        {/* Dot grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

        <motion.div
          className="relative z-10 w-full max-w-5xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            {/* Left — Text + CTAs */}
            <div className="text-center lg:text-left">
              <motion.div
                variants={fadeIn}
                custom={0}
                className="mx-auto lg:mx-0 mb-4 h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
              />

              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="mb-3 text-[11px] sm:text-xs font-medium uppercase tracking-[0.3em] text-amber-500"
              >
                A Heartwarming Story of Hope & Resilience
              </motion.p>

              <motion.h1
                variants={fadeUp}
                custom={0.2}
                className="font-serif text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.5rem]"
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Squix The Brave
                </motion.span>
                <motion.span
                  className="block gradient-text text-glow"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Little Squirrel
                </motion.span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.4}
                className="mt-3 sm:mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-fg-2 mx-auto lg:mx-0"
              >
                Discover the true journey of a very special needs little squirrel who beat all odds to become an inspiration to thousands worldwide.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={0.6}
                className="mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
                    <Link href="/store">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse the Bookstore
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-edge text-fg hover:bg-hover-fill hover:text-fg hover:border-amber-500/30"
                  >
                    <Link href="/store">
                      Get Your Copy
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Right — Book visual (hidden on mobile) */}
            <motion.div
              variants={scaleIn}
              custom={0.2}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <motion.div
                  aria-hidden
                  animate={{
                    boxShadow: [
                      "0 0 40px rgba(245,158,11,0.06), 0 0 80px rgba(245,158,11,0.03)",
                      "0 0 60px rgba(245,158,11,0.12), 0 0 120px rgba(245,158,11,0.05)",
                      "0 0 40px rgba(245,158,11,0.06), 0 0 80px rgba(245,158,11,0.03)",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-4 rounded-2xl"
                />

                <motion.div
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                  whileHover={{ scale: 1.03 }}
                  className="relative aspect-[2/3] w-48 xl:w-56 overflow-hidden rounded-xl bg-surface shadow-2xl ring-1 ring-white/10 cursor-pointer transition-all duration-300"
                >
                  <img
                    src="/images/image.jpeg"
                    alt="Squix The Brave Little Squirrel Book Cover"
                    className="h-full w-full object-cover rounded-xl"
                  />
                  <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"
                    initial={{ x: "-100%", y: "-100%" }}
                    whileHover={{ x: "100%", y: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.div>

                {/* Small squirrel accent */}
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -right-5 text-3xl"
                >
                  🐿️
                </motion.div>

                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-3 -left-4 text-lg opacity-30"
                >
                  🌰
                </motion.span>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </section>

      {/* ================================================================== */}
      {/*  SCROLLING MARQUEE                                                 */}
      {/* ================================================================== */}
      <div className="relative border-y border-edge-2 bg-panel py-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-page via-transparent to-page z-10 pointer-events-none" />
        <ScrollingMarquee
          items={marqueeItems}
          speed={25}
          className="text-sm font-medium uppercase tracking-[0.25em] text-fg-3"
          separator="🐿️"
        />
      </div>

      <RunningSquirrel />

      {/* ================================================================== */}
      {/*  FEATURED BOOKS (from database)                                  */}
      {/* ================================================================== */}
      {featuredBooks.length > 0 && (
        <section className="relative border-t border-edge-2 py-16 sm:py-24 overflow-hidden mesh-gradient noise-overlay">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <RevealOnScroll>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-500">
                  Our Collection
                </p>
              </RevealOnScroll>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                <TextReveal text="Featured Books" delay={0.1} />
              </h2>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className={featuredBooks.length === 1
                ? "grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
                : "grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3"
              }
            >
              {featuredBooks.length === 1 ? (
                <>
                  {/* Single featured book — large layout */}
                  <motion.div variants={slideInLeft} custom={0} className="flex justify-center lg:justify-end">
                    <ParallaxSection speed={0.15}>
                      <Link href={`/store/${featuredBooks[0].slug}`} className="group relative block">
                        <motion.div
                          aria-hidden
                          animate={{
                            boxShadow: [
                              "0 0 40px rgba(245,158,11,0.1), 0 0 80px rgba(245,158,11,0.05)",
                              "0 0 60px rgba(245,158,11,0.2), 0 0 120px rgba(245,158,11,0.08)",
                              "0 0 40px rgba(245,158,11,0.1), 0 0 80px rgba(245,158,11,0.05)",
                            ]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute -inset-4 rounded-2xl"
                        />
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="relative aspect-[2/3] w-48 sm:w-56 md:w-64 overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-white/10 cursor-pointer transition-all duration-300"
                        >
                          {featuredBooks[0].cover_image ? (
                            <img
                              src={featuredBooks[0].cover_image}
                              alt={featuredBooks[0].title}
                              className="h-full w-full object-cover rounded-2xl"
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center p-6">
                              <span className="text-5xl mb-4">🐿️</span>
                              <p className="font-serif text-xl font-bold text-center">{featuredBooks[0].title}</p>
                            </div>
                          )}
                          <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                        </motion.div>
                      </Link>
                    </ParallaxSection>
                  </motion.div>

                  <motion.div variants={slideInRight} custom={0.2}>
                    <RevealOnScroll>
                      <span className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-500 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-500/30">
                        ★ Featured
                      </span>
                    </RevealOnScroll>

                    <h3 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                      <TextReveal text={featuredBooks[0].title} />
                    </h3>

                    <RevealOnScroll delay={0.2}>
                      <p className="mt-6 text-lg leading-relaxed text-fg-2">
                        {featuredBooks[0].description}
                      </p>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.3}>
                      <p className="mt-4 font-serif text-2xl font-bold text-amber-500">
                        ${(featuredBooks[0].price / 100).toFixed(2)}
                      </p>
                    </RevealOnScroll>

                    <RevealOnScroll delay={0.4}>
                      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button asChild variant="gold" size="lg">
                            <Link href={`/store/${featuredBooks[0].slug}`}>
                              <ShoppingCart className="mr-2 h-5 w-5" />
                              View Book
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-edge text-fg hover:bg-hover-fill hover:text-fg hover:border-amber-500/30"
                          >
                            <Link href="/store">Browse All</Link>
                          </Button>
                        </motion.div>
                      </div>
                    </RevealOnScroll>
                  </motion.div>
                </>
              ) : (
                /* Multiple featured books — card grid */
                featuredBooks.map((book, idx) => (
                  <motion.div
                    key={book.id}
                    variants={scaleIn}
                    custom={idx * 0.15}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  >
                    <Link
                      href={`/store/${book.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-edge-2 bg-panel transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.15)]"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center bg-surface p-6">
                            <span className="text-4xl mb-3">🐿️</span>
                            <p className="font-serif text-lg font-bold text-center">{book.title}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <span className="inline-block rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">
                            Featured
                          </span>
                          <h3 className="font-serif text-sm sm:text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
                            {book.title}
                          </h3>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-serif text-xl font-bold text-amber-500">
                              ${(book.price / 100).toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all">
                              <ShoppingCart className="h-3.5 w-3.5" />
                              View
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Glowing divider */}
      <div className="section-glow-divider" />

      {/* ================================================================== */}
      {/*  ABOUT AUTHOR TEASER                                               */}
      {/* ================================================================== */}
      <section className="relative bg-page py-16 sm:py-24 overflow-hidden">
        {/* Background accent */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/[0.02] rounded-full blur-[150px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
          >
            {/* Text */}
            <motion.div variants={slideInLeft} custom={0} className="order-2 lg:order-1">
              <RevealOnScroll>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-500">
                  The Caregivers
                </p>
              </RevealOnScroll>

              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                <TextReveal text="A Journey Opened by Compassion" delay={0.1} />
              </h2>

              <RevealOnScroll delay={0.2}>
                <p className="mt-6 text-lg leading-relaxed text-fg-2">
                  Trichia Raj and Amir took in the trio of baby squirrels after tree climber Kyle Sales rescued them. While Dax and Rola grew to be released into the wild, Trichia and Amir dedicated themselves round-the-clock to caring for Squix's special neurological needs, opening their hearts to a tiny creature who would soon inspire thousands.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={0.3}>
                <div className="mt-6 rounded-xl border border-edge-2 bg-inset p-5 backdrop-blur-sm">
                  <p className="text-lg italic leading-relaxed text-fg font-serif">
                    &ldquo;We wanted to give her a chance to live, and in return, Squix showed us the true meaning of patience, resilience, and unconditional love.&rdquo;
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-500/60">
                    — Trichia Raj
                  </p>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={0.4}>
                <motion.div whileHover={{ x: 5 }} className="mt-6">
                  <Button
                    asChild
                    variant="link"
                    className="px-0 text-amber-500 hover:text-amber-400"
                  >
                    <Link href="/about">
                      Read the Full Journey
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </RevealOnScroll>
            </motion.div>

            {/* Photo placeholder with animated squirrel */}
            <motion.div
              variants={slideInRight}
              custom={0.2}
              className="order-1 flex justify-center lg:order-2 lg:justify-start"
            >
              <ParallaxSection speed={0.2}>
                <motion.div
                  whileHover={{ scale: 1.02, rotate: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-[3/4] w-64 overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-white/10 sm:w-72 md:w-80"
                >
                  <div className="flex h-full flex-col items-center justify-center">
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 3, -3, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-500/30 bg-surface pulse-ring"
                    >
                      <span className="text-4xl">🐿️</span>
                    </motion.div>
                    <p className="mt-4 text-sm text-fg-2 font-medium">Trichia Raj, Amir & Squix</p>

                    {["🌰", "🥜", "🍂"].map((emoji, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-lg opacity-20"
                        style={{
                          top: `${20 + i * 25}%`,
                          left: `${10 + i * 30}%`,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 180, 360],
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 4 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </div>
                  <motion.div
                    aria-hidden
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-0 right-0 h-20 w-20 border-b-2 border-r-2 border-amber-500/30"
                  />
                </motion.div>
              </ParallaxSection>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Glowing divider */}
      <div className="section-glow-divider" />

      {/* ================================================================== */}
      {/*  TESTIMONIALS                                                      */}
      {/* ================================================================== */}
      <section className="relative border-t border-edge-2 bg-surface py-16 sm:py-24 overflow-hidden noise-overlay">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[150px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <RevealOnScroll>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-500">
                #Squixers
              </p>
            </RevealOnScroll>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              <TextReveal text="Praise from the Community" delay={0.1} />
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mt-16 grid gap-8 md:grid-cols-3"
          >
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                variants={scaleIn}
                custom={idx * 0.15}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3 },
                }}
                className="group rounded-2xl border border-edge-2 bg-panel p-8 backdrop-blur-sm transition-all duration-500 hover:border-amber-500/20 hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.1)]"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15 + i * 0.05 }}
                    >
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    </motion.div>
                  ))}
                </div>

                <blockquote className="mt-6 text-base leading-relaxed text-fg">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="mt-6 border-t border-edge-2 pt-6">
                  <p className="font-serif text-sm font-semibold text-fg">
                    {t.name}
                  </p>
                  <p className="mt-1 text-xs text-fg-3">{t.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <RunningSquirrel />

      {/* ================================================================== */}
      {/*  STATS / NUMBERS                                                   */}
      {/* ================================================================== */}
      <section className="relative border-t border-edge-2 bg-page py-20 overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {[
              { number: "1,200+", label: "Squixers" },
              { number: "24/7", label: "Care & Love" },
              { number: "3", label: "Siblings Rescued" },
              { number: "1st", label: "Edition Out Now" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                custom={idx * 0.1}
                className="text-center"
              >
                <motion.p
                  className="font-serif text-4xl font-bold gradient-text sm:text-5xl"
                  whileInView={{ scale: [0.5, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  {stat.number}
                </motion.p>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-fg-3">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  SOCIAL MEDIA LINKS                                                */}
      {/* ================================================================== */}
      <section className="relative border-t border-edge-2 bg-surface py-16 sm:py-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8 relative z-10">
          <RevealOnScroll>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-500">
              Stay Connected
            </p>
          </RevealOnScroll>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            <TextReveal text="Follow Squix's Journey" delay={0.1} />
          </h2>

          <div className="mt-10 flex items-center justify-center gap-6">
            {socialLinks.map((link, idx) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.2, y: -4, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-edge-2 bg-inset transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
              >
                <link.icon className="h-5 w-5 text-fg-2 transition-colors duration-300 group-hover:text-amber-500" />
              </motion.a>
            ))}
          </div>

          <RevealOnScroll delay={0.3}>
            <p className="mt-8 text-sm text-fg-3">
              Join thousands of followers across all social media platforms!
            </p>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
