import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeScript } from "@/components/theme-script";
import { ThemeProvider } from "@/components/theme-provider";
import JsonLd from "@/components/seo/json-ld";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Squix Book Store — Squix The Brave Little Squirrel",
    template: "%s | Squix Book Store",
  },
  description:
    "Discover the heartwarming, true journey of Squix, a very special special-needs squirrel who defied all odds to become an inspiration to thousands. Purchase her story on Squix Book Store.",
  keywords: [
    "Squix",
    "Squixers",
    "Squix Book Store",
    "squirrel book",
    "special needs squirrel",
    "animal rescue",
    "wildlife rehabilitation",
    "Trichia Raj",
    "Amir",
    "Kyle Sales",
    "buy books",
    "ebooks",
  ],
  authors: [{ name: "Trichia Raj & Amir" }],
  creator: "Trichia Raj & Amir",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Squix Book Store",
    title: "Squix Book Store — Squix The Brave Little Squirrel",
    description:
      "Discover the heartwarming, true journey of a very special little squirrel who beat all odds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Squix Book Store — Squix The Brave Little Squirrel",
    description:
      "Discover the heartwarming, true journey of a very special little squirrel who beat all odds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-page text-fg font-sans antialiased">
        <JsonLd />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
