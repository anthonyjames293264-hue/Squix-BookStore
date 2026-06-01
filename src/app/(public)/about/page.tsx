"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Feather,
  Globe,
  Pen,
  Quote,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, ParallaxSection, TextReveal } from "@/components/animations/scroll-effects";
import { FloatingParticles } from "@/components/animations/floating-particles";

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const timeline = [
  {
    year: "Rescue Day",
    title: "A Lucky Fall",
    description:
      "Nestled high in a palm tree, baby squirrels Squix, Dax, and Rola were saved by tree climber Kyle Sales just before the tree was scheduled to be cut down.",
    icon: Pen,
    emoji: "🌴",
  },
  {
    year: "First Weeks",
    title: "Round-the-Clock Care",
    description:
      "Trichia Raj and Amir welcomed the tiny siblings into their home, nursing them with specialized formula and warm beds every few hours.",
    icon: BookOpen,
    emoji: "🍼",
  },
  {
    year: "Growth",
    title: "Returning to the Wild",
    description:
      "As they grew, Dax and Rola developed strong natural instincts and were successfully rehabilitated and released back into the palm canopy.",
    icon: Globe,
    emoji: "🌿",
  },
  {
    year: "Challenges",
    title: "Squix's Journey",
    description:
      "Born with severe neurological disabilities, Squix was unable to balance or climb like her siblings. She remained in the home under dedicated care.",
    icon: Award,
    emoji: "💪",
  },
  {
    year: "Milestones",
    title: "Learning and Thriving",
    description:
      "With patience, Squix learned to feed herself, hold nuts, drink water, and play, proving that special-needs wildlife can live full, happy lives.",
    icon: Star,
    emoji: "🌟",
  },
  {
    year: "Community",
    title: "The Squixers",
    description:
      "Squix's adventures on social media took off, attracting thousands of fans (the 'Squixers') who celebrate her daily milestones and spread joy.",
    icon: Feather,
    emoji: "🐿️",
  },
];

const awards = [
  {
    title: "Resilience & Hope",
    year: "100%",
    description: "Defied all neurological odds to thrive",
  },
  {
    title: "The Squixers Community",
    year: "Thousands+",
    description: "Global community of dedicated animal lovers",
  },
  {
    title: "Wildlife Education",
    year: "Awareness",
    description: "Advocating for special-needs wildlife rescue",
  },
  {
    title: "Loving Care",
    year: "24/7",
    description: "Dedicated rehabilitation and therapy support",
  },
  {
    title: "Favorite Treat",
    year: "Walnuts",
    description: "Her ultimate reward for exercising and playing",
  },
  {
    title: "Original Rescue",
    year: "Kyle Sales",
    description: "Tree climber who saved the siblings from the palm",
  },
];

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  return (
    <div className="bg-page text-fg">
      {/* ================================================================== */}
      {/*  HERO                                                              */}
      {/* ================================================================== */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-6 text-center aurora-bg">
        <FloatingParticles count={10} speed={0.3} />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-500/[0.04] rounded-full blur-[120px] animate-float-slow" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-amber-600/[0.03] rounded-full blur-[100px] animate-float-delayed" />
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

        <motion.div
          className="relative z-10 max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="mx-auto mb-8 h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
          />

          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-amber-500"
          >
            The Story Behind the Squeak
          </motion.p>

          <motion.h1
            variants={fadeUp}
            custom={0.2}
            className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
          >
            About <span className="gradient-text text-glow">Squix</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={0.4}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-2 sm:text-xl"
          >
            The story of a tiny squirrel with an enormous heart, and the caregivers who gave her a second chance.
          </motion.p>
        </motion.div>
      </section>

      {/* ================================================================== */}
      {/*  BIOGRAPHY                                                         */}
      {/* ================================================================== */}
      <section className="border-t border-edge-2 bg-surface py-24 sm:py-32 noise-overlay relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-amber-500/[0.02] rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Photo placeholder */}
            <RevealOnScroll direction="left">
              <div className="flex justify-center lg:justify-end">
                <ParallaxSection speed={0.15}>
                  <div className="group relative">
                    <motion.div
                      aria-hidden
                      animate={{
                        boxShadow: [
                          "0 0 30px rgba(245,158,11,0.05)",
                          "0 0 60px rgba(245,158,11,0.12)",
                          "0 0 30px rgba(245,158,11,0.05)",
                        ]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute -inset-4 rounded-2xl"
                    />
                    <div className="relative aspect-[3/4] w-64 overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-white/10 sm:w-72 md:w-80">
                      <div className="flex h-full flex-col items-center justify-center bg-surface">
                        <motion.div
                          animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-500/40 bg-surface pulse-ring"
                        >
                          <span className="text-4xl">🐿️</span>
                        </motion.div>
                        <p className="mt-4 text-sm text-fg-2 font-medium">
                          Squix at Home
                        </p>
                      </div>
                      <motion.div
                        aria-hidden
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute bottom-0 right-0 h-20 w-20 border-b-2 border-r-2 border-amber-500/30"
                      />
                    </div>
                  </div>
                </ParallaxSection>
              </div>
            </RevealOnScroll>

            {/* Bio text */}
            <div>
              <RevealOnScroll>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-500">
                  Biography
                </p>
              </RevealOnScroll>

              <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                <TextReveal text="Defying the Odds" delay={0.1} />
              </h2>

              <RevealOnScroll delay={0.2}>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-fg-2">
                  <p>
                    It all started with a palm tree that needed trimming. Tree climber Kyle Sales discovered a nest of three tiny, newly born baby squirrels. Knowing they wouldn't survive the cut, he carefully lowered them down. Trichia Raj and Amir opened their doors to the babies—Squix, Dax, and Rola—committing themselves to 24/7 care.
                  </p>
                  <p>
                    While Dax and Rola grew rapidly and were eventually returned to the wild, Squix faced a different path. Due to neurological challenges, she lacked coordination, could not climb, and had difficulty holding food. She remained under Trichia and Amir's care, undergoing gentle physical therapy and learning to navigate the world in her own way.
                  </p>
                  <p>
                    Today, Squix is a thriving, playful, and beloved family member. Her journey has touched thousands of animal lovers worldwide, known as the "Squixers." Through her book, we share her message of hope, resilience, and the deep, unconditional bond between humans and wildlife.
                  </p>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={0.3}>
                <div className="mt-8 rounded-xl border border-edge-2 bg-inset p-6 backdrop-blur-sm">
                  <Quote className="mb-3 h-6 w-6 text-amber-500/40" />
                  <p className="font-serif text-xl italic leading-relaxed text-fg">
                    &ldquo;Squix showed us that strength isn't about being perfect. It's about facing each day with curiosity, trust, and a brave little heart.&rdquo;
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-500/60">
                    — Trichia Raj
                  </p>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Glowing divider */}
      <div className="section-glow-divider" />

      {/* ================================================================== */}
      {/*  TIMELINE                                                          */}
      {/* ================================================================== */}
      <section className="bg-page py-24 sm:py-32 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/[0.02] rounded-full blur-[180px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <RevealOnScroll>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-500">
                The Rescue & Beyond
              </p>
            </RevealOnScroll>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              <TextReveal text="Key Milestones" delay={0.1} />
            </h2>
            <RevealOnScroll delay={0.2}>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-fg-2">
                From a rescue high in a palm tree to a thriving community—the moments that defined Squix's journey.
              </p>
            </RevealOnScroll>
          </div>

          {/* Timeline */}
          <div className="relative mt-20">
            {/* Vertical line with gradient */}
            <div
              aria-hidden
              className="absolute left-8 top-0 hidden h-full w-px md:left-1/2 md:block"
              style={{
                background: "linear-gradient(180deg, transparent, rgba(245,158,11,0.3), rgba(245,158,11,0.3), transparent)",
              }}
            />

            <div className="space-y-12 md:space-y-0">
              {timeline.map((item, idx) => {
                const isEven = idx % 2 === 0;
                const Icon = item.icon;

                return (
                  <RevealOnScroll
                    key={item.title}
                    direction={isEven ? "left" : "right"}
                    delay={idx * 0.05}
                  >
                    <div
                      className={cn(
                        "relative md:flex md:items-center md:py-8",
                        isEven ? "md:justify-start" : "md:justify-end"
                      )}
                    >
                      {/* Center dot (desktop) */}
                      <motion.div
                        aria-hidden
                        whileInView={{ scale: [0, 1.3, 1] }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="absolute left-8 top-6 hidden h-4 w-4 -translate-x-1/2 rounded-full border-2 border-amber-500 bg-page md:left-1/2 md:top-1/2 md:-translate-y-1/2 md:block shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                      />

                      <motion.div
                        whileHover={{
                          y: -4,
                          borderColor: "rgba(245,158,11,0.3)",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(245,158,11,0.05)",
                        }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "relative ml-16 rounded-2xl border border-edge-2 bg-panel p-6 backdrop-blur-sm transition-all duration-300 md:ml-0 md:w-[calc(50%-3rem)]",
                          isEven ? "md:mr-auto" : "md:ml-auto"
                        )}
                      >
                        {/* Mobile dot */}
                        <div
                          aria-hidden
                          className="absolute left-[-2.5rem] top-6 h-4 w-4 rounded-full border-2 border-amber-500 bg-page md:hidden shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                        />
                        {/* Mobile line */}
                        <div
                          aria-hidden
                          className="absolute left-[-2.03rem] top-0 h-full w-px bg-gradient-to-b from-amber-500/20 via-amber-500/20 to-transparent md:hidden"
                        />

                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                            <Icon className="h-5 w-5 text-amber-500" />
                          </div>
                          <span className="font-serif text-sm font-semibold text-amber-500">
                            {item.year}
                          </span>
                          <span className="text-xl ml-auto">{item.emoji}</span>
                        </div>

                        <h3 className="mt-3 font-serif text-xl font-bold text-fg">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-fg-2">
                          {item.description}
                        </p>
                      </motion.div>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Glowing divider */}
      <div className="section-glow-divider" />

      {/* ================================================================== */}
      {/*  AWARDS & ACHIEVEMENTS (BADGES)                                    */}
      {/* ================================================================== */}
      <section className="bg-surface py-24 sm:py-32 noise-overlay relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <RevealOnScroll>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-500">
                Attributes
              </p>
            </RevealOnScroll>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              <TextReveal text="Squix's Achievements & Stats" delay={0.1} />
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {awards.map((award, idx) => (
              <motion.div
                key={award.title}
                variants={scaleIn}
                custom={idx * 0.08}
                whileHover={{
                  y: -6,
                  borderColor: "rgba(245,158,11,0.25)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(245,158,11,0.05)",
                }}
                transition={{ duration: 0.3 }}
                className="group rounded-2xl border border-edge-2 bg-panel p-8 text-center backdrop-blur-sm transition-all duration-300"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 transition-all duration-300 group-hover:border-amber-500/40 group-hover:bg-amber-500/20 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="mt-5 font-serif text-lg font-bold text-fg">
                  {award.title}
                </h3>
                <p className="mt-1 text-sm font-medium gradient-text">
                  {award.year}
                </p>
                <p className="mt-2 text-sm text-fg-3">
                  {award.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Glowing divider */}
      <div className="section-glow-divider" />

      {/* ================================================================== */}
      {/*  CTA — VISIT THE BOOKSTORE                                         */}
      {/* ================================================================== */}
      <section className="relative bg-page py-24 sm:py-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/[0.05] rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center lg:px-8">
          <RevealOnScroll>
            <motion.div
              whileInView={{ scale: [0.8, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <BookOpen className="mx-auto h-10 w-10 text-amber-500" />
            </motion.div>
          </RevealOnScroll>

          <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            <TextReveal text="Support Wildlife Rescue" delay={0.1} />
          </h2>

          <RevealOnScroll delay={0.2}>
            <p className="mt-4 text-lg leading-relaxed text-fg-2">
              Pre-order the book to learn more about rehabilitation, get special tips, and support special-needs animal care.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.3}>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="gold" size="xl">
                  <Link href="/store">
                    Visit the Bookstore
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  variant="outline"
                  size="xl"
                  className="border-edge text-fg hover:bg-hover-fill hover:text-fg hover:border-amber-500/30"
                >
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </motion.div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
