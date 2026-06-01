"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, User, LogOut, Shield, ChevronDown, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/store", label: "Store" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const { theme, toggleTheme } = useTheme();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
    if (latest > 300 && latest > lastY) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastY(latest);
  });

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .single();
        setUser({ email: authUser.email || "", role: profile?.role || "user" });
      } else {
        setUser(null);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: hidden ? -100 : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Gradient line at top */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div
        className={cn(
          "transition-all duration-500",
          "transition-all duration-500 bg-page/80 backdrop-blur-2xl border-b border-edge-2",
          scrolled && "shadow-[0_8px_32px_var(--shadow-c)]"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
              <img
  src="/images/logo.png"
  alt="Squix Book Store"
  className="h-14 md:h-16 w-auto"
/>
              </motion.div>
            </Link>

            {/* Desktop nav — floating pill */}
            <div className="hidden md:flex items-center">
              <div className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-500",
                scrolled
                  ? "bg-inset border border-edge-2"
                  : "bg-inset"
              )}>
                {navLinks.map((link, idx) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx, duration: 0.4 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "relative px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 rounded-full",
                          isActive
                            ? "text-amber-500"
                            : "text-fg-2 hover:text-fg"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="nav-pill"
                            className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/20"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme toggle */}
              <motion.button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-edge-2 bg-inset text-fg-2 transition-colors hover:text-amber-500 hover:border-amber-500/30"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {user ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-sm text-fg-2 hover:text-fg transition-colors rounded-full px-3 py-2 hover:bg-hover-fill"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      userMenuOpen && "rotate-180"
                    )} />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-surface/95 backdrop-blur-xl border border-edge-2 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-edge-2">
                          <p className="text-[11px] text-fg-3 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          {user.role !== "admin" && (
                          <Link
                            href="/account"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg-2 hover:bg-hover-fill hover:text-fg transition-colors"
                          >
                            <User className="h-4 w-4 text-fg-3" />
                            My Account
                          </Link>
                          )}
                          {user.role === "admin" && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg-2 hover:bg-hover-fill hover:text-fg transition-colors"
                            >
                              <Shield className="h-4 w-4 text-fg-3" />
                              Admin Dashboard
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg-2 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
                          >
                            <LogOut className="h-4 w-4 text-fg-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/auth"
                    className="group relative px-5 py-2 text-sm font-medium text-white rounded-full overflow-hidden transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Sign In</span>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-fg p-2 rounded-lg hover:bg-hover-fill transition-colors"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-page/95 backdrop-blur-2xl border-b border-edge-2 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block py-3 px-4 text-base font-medium transition-all rounded-xl",
                      pathname === link.href
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-fg-2 hover:text-fg hover:bg-hover-fill"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile theme toggle */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * navLinks.length }}
              >
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full py-3 px-4 text-base font-medium text-fg-2 hover:text-fg hover:bg-hover-fill rounded-xl transition-all"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              </motion.div>

              {user ? (
                <>
                  <div className="h-px bg-edge-2 my-2" />
                  {user.role !== "admin" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Link
                      href="/account"
                      onClick={() => setIsOpen(false)}
                      className="block py-3 px-4 text-base font-medium text-fg-2 hover:text-fg hover:bg-hover-fill rounded-xl"
                    >
                      My Account
                    </Link>
                  </motion.div>
                  )}
                  {user.role === "admin" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block py-3 px-4 text-base font-medium text-fg-2 hover:text-fg hover:bg-hover-fill rounded-xl"
                      >
                        Admin Dashboard
                      </Link>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="block w-full text-left py-3 px-4 text-base font-medium text-red-400 hover:bg-red-500/10 rounded-xl"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2"
                >
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all"
                  >
                    Sign In
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
