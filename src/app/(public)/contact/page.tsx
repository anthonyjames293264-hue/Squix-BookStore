"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { InstagramIcon, XTwitterIcon, FacebookIcon, YouTubeIcon } from "@/components/icons/social-icons";
import { RevealOnScroll, TextReveal } from "@/components/animations/scroll-effects";
import { FloatingParticles } from "@/components/animations/floating-particles";

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

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@Squixbookstore.com",
    href: "mailto:hello@Squixbookstore.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 000-Squix",
    href: "tel:+15550007784",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "New York, NY",
    href: null,
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 48 hours",
    href: null,
  },
];

const socialLinks = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { icon: XTwitterIcon, label: "Twitter / X", href: "https://x.com" },
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
  { icon: YouTubeIcon, label: "YouTube", href: "https://youtube.com" },
];

const faqs = [
  {
    question: "How can I request a book signing or speaking engagement?",
    answer:
      "Please use the contact form above and select 'Speaking & Events' as the subject. Include the event date, location, expected audience size, and any specific topics you would like covered. We aim to respond to all event enquiries within one week.",
  },
  {
    question: "Are you available for media interviews or podcast appearances?",
    answer:
      "Yes! Media enquiries are welcome. Please include the publication or show name, audience reach, proposed topic, and preferred timing. For urgent press requests, please note this in your message and we will prioritise accordingly.",
  },
  {
    question: "How do I report an issue with my book order?",
    answer:
      "For order-related issues such as shipping delays, damaged copies, or payment concerns, please email orders@Squixbookstore.com directly or use the contact form with 'Order Support' as the subject. Include your order number for the fastest resolution.",
  },
  {
    question: "Can I send fan mail or a manuscript for review?",
    answer:
      "Fan mail is deeply appreciated and read with gratitude. However, due to legal considerations, unsolicited manuscripts cannot be accepted or reviewed. Please direct manuscript submissions to literary agents who are currently open to queries.",
  },
];

const subjectOptions = [
  "General Enquiry",
  "Speaking & Events",
  "Media & Press",
  "Order Support",
  "Rights & Licensing",
  "Other",
];

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject) {
      newErrors.subject = "Please select a subject.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");
    setErrors({});

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  return (
    <div className="bg-page text-fg">
      {/* HERO */}
      <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden px-6 text-center aurora-bg">
        <FloatingParticles count={8} speed={0.3} />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-500/[0.04] rounded-full blur-[120px] animate-float-slow" />
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
            Let&apos;s Connect
          </motion.p>

          <motion.h1
            variants={fadeUp}
            custom={0.2}
            className="font-serif text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl"
          >
            Get in <span className="gradient-text text-glow">Touch</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={0.4}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-2 sm:text-xl"
          >
            Whether you have a question, a collaboration idea, or simply want
            to say hello &mdash; your message is always welcome.
          </motion.p>
        </motion.div>
      </section>

      {/* FORM + SIDEBAR */}
      <section className="border-t border-edge-2 bg-surface py-24 sm:py-32 noise-overlay relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/[0.02] rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-20">
            {/* Contact form */}
            <RevealOnScroll className="lg:col-span-2">
              <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                <TextReveal text="Send a Message" />
              </h2>
              <p className="mt-3 text-fg-2">
                Fill out the form below and we&apos;ll get back to you as soon
                as possible.
              </p>

              <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-fg"
                    >
                      Full Name <span className="text-amber-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className={cn(
                        "h-12 border-edge-2 bg-inset text-fg placeholder:text-fg-3 focus-visible:ring-amber-500 focus-visible:border-amber-500/30 backdrop-blur-sm",
                        errors.name && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-fg"
                    >
                      Email Address <span className="text-amber-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        "h-12 border-edge-2 bg-inset text-fg placeholder:text-fg-3 focus-visible:ring-amber-500 focus-visible:border-amber-500/30 backdrop-blur-sm",
                        errors.email && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="subject"
                    className="text-sm font-medium text-fg"
                  >
                    Subject <span className="text-amber-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={cn(
                        "flex h-12 w-full appearance-none rounded-md border border-edge-2 bg-inset px-3 py-2 text-sm text-fg ring-offset-white backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        !formData.subject && "text-fg-3",
                        errors.subject && "border-red-500 focus-visible:ring-red-500"
                      )}
                    >
                      <option value="" disabled>
                        Select a subject...
                      </option>
                      {subjectOptions.map((opt) => (
                        <option key={opt} value={opt} className="text-fg bg-surface">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
                  </div>
                  {errors.subject && (
                    <p className="text-xs text-red-400">{errors.subject}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-sm font-medium text-fg"
                  >
                    Message <span className="text-amber-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Write your message here..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className={cn(
                      "border-edge-2 bg-inset text-fg placeholder:text-fg-3 focus-visible:ring-amber-500 focus-visible:border-amber-500/30 backdrop-blur-sm",
                      errors.message && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-400">{errors.message}</p>
                  )}
                </div>

                <div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      disabled={status === "loading"}
                      className="w-full sm:w-auto"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 backdrop-blur-sm"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-400">
                        Message sent successfully!
                      </p>
                      <p className="mt-1 text-xs text-green-400/70">
                        Thank you for reaching out. We&apos;ll respond within 48
                        hours.
                      </p>
                    </div>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-sm"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-red-400">
                        Something went wrong.
                      </p>
                      <p className="mt-1 text-xs text-red-400/70">
                        Please try again later or email us directly at
                        hello@Squixbookstore.com.
                      </p>
                    </div>
                  </motion.div>
                )}
              </form>
            </RevealOnScroll>

            {/* Sidebar */}
            <RevealOnScroll direction="right" delay={0.2} className="space-y-8">
              <div>
                <h3 className="font-serif text-xl font-bold text-fg">
                  Contact Information
                </h3>
                <div className="mt-6 space-y-4">
                  {contactInfo.map((info, idx) => {
                    const Icon = info.icon;
                    const Wrapper = info.href ? "a" : "div";
                    const wrapperProps = info.href
                      ? { href: info.href }
                      : {};

                    return (
                      <motion.div
                        key={info.label}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{
                          x: 4,
                          borderColor: "rgba(245,158,11,0.3)",
                        }}
                      >
                        <Wrapper
                          {...wrapperProps}
                          className={cn(
                            "flex items-start gap-4 rounded-xl border border-edge-2 bg-inset p-4 backdrop-blur-sm transition-all duration-300",
                            info.href && "cursor-pointer"
                          )}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                            <Icon className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-fg-3">
                              {info.label}
                            </p>
                            <p className="mt-1 text-sm text-fg">
                              {info.value}
                            </p>
                          </div>
                        </Wrapper>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-fg">
                  Follow Along
                </h3>
                <div className="mt-4 flex items-center gap-3">
                  {socialLinks.map((link, idx) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      aria-label={link.label}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.15, y: -3 }}
                      whileTap={{ scale: 0.9 }}
                      className="group flex h-11 w-11 items-center justify-center rounded-full border border-edge-2 bg-inset transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                    >
                      <link.icon className="h-4 w-4 text-fg-2 transition-colors duration-300 group-hover:text-amber-500" />
                    </motion.a>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-fg">
                  Location
                </h3>
                <div className="mt-4 aspect-[4/3] overflow-hidden rounded-xl border border-edge-2 bg-surface backdrop-blur-sm">
                  <div className="flex h-full flex-col items-center justify-center">
                    <MapPin className="h-8 w-8 text-fg-3" />
                    <p className="mt-2 text-xs text-fg-3">
                      Map placeholder
                    </p>
                    <p className="mt-1 text-xs text-fg-3">
                      Embed Google Maps in production
                    </p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Glowing divider */}
      <div className="section-glow-divider" />

      {/* FAQ */}
      <section className="bg-page py-24 sm:py-32 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.02] rounded-full blur-[150px]" />
        </div>

        <div className="mx-auto max-w-3xl px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <RevealOnScroll>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-500">
                Common Questions
              </p>
            </RevealOnScroll>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              <TextReveal text="Frequently Asked" delay={0.1} />
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <RevealOnScroll key={idx} delay={idx * 0.05}>
                  <motion.div
                    whileHover={{
                      borderColor: "rgba(245,158,11,0.2)",
                    }}
                    className="rounded-xl border border-edge-2 bg-panel backdrop-blur-sm transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 p-6 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 shrink-0 text-amber-500" />
                        <span className="font-serif text-base font-semibold text-fg sm:text-lg">
                          {faq.question}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-5 w-5 shrink-0 text-fg-3" />
                      </motion.div>
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isOpen ? "auto" : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" as const }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-edge-2 px-6 pb-6 pt-4">
                        <p className="pl-8 text-sm leading-relaxed text-fg-2">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Glowing divider */}
      <div className="section-glow-divider" />

      {/* BOTTOM CTA */}
      <section className="relative bg-surface py-24 sm:py-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-amber-500/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center lg:px-8">
          <RevealOnScroll>
            <motion.div
              whileInView={{ scale: [0.8, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Mail className="mx-auto h-10 w-10 text-amber-500" />
            </motion.div>
          </RevealOnScroll>

          <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            <TextReveal text="Prefer Email?" delay={0.1} />
          </h2>

          <RevealOnScroll delay={0.2}>
            <p className="mt-4 text-lg leading-relaxed text-fg-2">
              You can always reach out directly at{" "}
              <a
                href="mailto:hello@Squixbookstore.com"
                className="text-amber-500 underline decoration-amber-500/30 underline-offset-4 transition-colors hover:text-amber-400"
              >
                hello@Squixbookstore.com
              </a>
              . We read every message and respond within 48 hours.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.3}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
              <Button
                asChild
                variant="gold"
                size="xl"
              >
                <a href="mailto:hello@Squixbookstore.com">
                  Send an Email
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </motion.div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
