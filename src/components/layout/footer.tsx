"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { InstagramIcon, XTwitterIcon, FacebookIcon, YouTubeIcon } from "@/components/icons/social-icons";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export function Footer() {
  return (
    <footer className="bg-page text-fg-2 border-t border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Link href="/" className="flex items-center mb-4 group">
              <img
                src="/images/logo.png"
                alt="Squix Book Store"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-fg-2 leading-relaxed">
              Celebrating resilience, hope, and unconditional love. Inspired by the true story of Squix, the brave little special-needs squirrel. #Squixers
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.1}>
            <h3 className="text-fg font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/store", label: "Book Store" },
                { href: "/gallery", label: "Gallery" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-2 hover:text-amber-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.2}>
            <h3 className="text-fg font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-fg-2">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                hello@Squixbookstore.com
              </li>
              <li className="flex items-center gap-2 text-sm text-fg-2">
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                +1 (555) 000-0000
              </li>
              <li className="flex items-start gap-2 text-sm text-fg-2">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                New York, NY, United States
              </li>
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.3}>
            <h3 className="text-fg font-semibold mb-4 text-sm uppercase tracking-wider">
              Follow Squix
            </h3>
            <p className="text-sm text-fg-2 mb-4">
              Follow Squix&apos;s journey and join thousands of #Squixers around the world.
            </p>
            <div className="flex items-center gap-3">
              {[
                { label: "Instagram", icon: InstagramIcon, href: "https://instagram.com" },
                { label: "Twitter / X", icon: XTwitterIcon, href: "https://x.com" },
                { label: "Facebook", icon: FacebookIcon, href: "https://facebook.com" },
                { label: "YouTube", icon: YouTubeIcon, href: "https://youtube.com" },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-inset transition-all duration-300 hover:border-amber-500 hover:bg-amber-500/10 text-fg-2 hover:text-amber-500"
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <Separator className="my-8 bg-edge" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-fg-3">
            &copy; {new Date().getFullYear()} Squix Book Store. All rights reserved. Designed by Rocket Design.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-fg-3 hover:text-fg-2 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-fg-3 hover:text-fg-2 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
