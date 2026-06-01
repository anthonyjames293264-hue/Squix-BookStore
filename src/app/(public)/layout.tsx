"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/animations/page-transition";
import { CursorGlow } from "@/components/animations/cursor-glow";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className="min-h-screen pt-16 md:pt-20">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
