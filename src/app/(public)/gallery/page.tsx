"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Camera,
  Film,
  Heart,
  Share2,
  Play,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { InstagramIcon, XTwitterIcon, FacebookIcon, YouTubeIcon } from "@/components/icons/social-icons";

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
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const, delay },
  }),
};

type TabKey = "images" | "videos";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "images", label: "Photos", icon: Camera },
  { key: "videos", label: "Videos", icon: Film },
];

interface MediaFile {
  name: string;
  url: string;
  mimetype?: string;
}

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("images");
  const [images, setImages] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    async function loadMedia() {
      setLoading(true);
      const supabase = createClient();

      const [imgRes, vidRes] = await Promise.all([
        supabase.storage.from("gallery").list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        }),
        supabase.storage.from("videos").list("", {
          limit: 50,
          sortBy: { column: "created_at", order: "desc" },
        }),
      ]);

      if (imgRes.data) {
        const imgs = imgRes.data
          .filter((f) => f.name !== ".emptyFolderPlaceholder")
          .map((f) => {
            const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(f.name);
            return { name: f.name, url: publicUrl, mimetype: (f.metadata as { mimetype?: string })?.mimetype };
          });
        setImages(imgs);
      }

      if (vidRes.data) {
        const vids = vidRes.data
          .filter((f) => f.name !== ".emptyFolderPlaceholder")
          .map((f) => {
            const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(f.name);
            return { name: f.name, url: publicUrl, mimetype: (f.metadata as { mimetype?: string })?.mimetype };
          });
        setVideos(vids);
      }

      setLoading(false);
    }
    loadMedia();
  }, []);

  const activeMedia = activeTab === "images" ? images : videos;

  return (
    <div className="bg-page text-fg">
      {/* Hero */}
      <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12)_0%,_transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          className="relative z-10 max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="mx-auto mb-8 h-px w-24 bg-amber-500"
          />
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-amber-500"
          >
            Photos & Videos
          </motion.p>
          <motion.h1
            variants={fadeUp}
            custom={0.2}
            className="font-serif text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl"
          >
            Media <span className="text-amber-500">Gallery</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={0.4}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-2 sm:text-xl"
          >
            A collection of photos and videos from Squix's journey, the rescue,
            and the Squixers community.
          </motion.p>
        </motion.div>
      </section>

      {/* Tabs + Content */}
      <section className="border-t border-edge bg-surface">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-center border-b border-edge">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "relative flex items-center gap-2 px-6 py-5 text-sm font-medium transition-colors duration-200 cursor-pointer",
                    isActive
                      ? "text-amber-500"
                      : "text-fg-3 hover:text-fg-2"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="galleryTab"
                      className="absolute bottom-0 left-0 h-0.5 w-full bg-amber-500"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="py-16 sm:py-20">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
                <p className="text-fg-3">Loading media...</p>
              </div>
            ) : activeMedia.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-edge bg-surface mb-6">
                  {activeTab === "images" ? (
                    <Camera className="h-8 w-8 text-fg-3" />
                  ) : (
                    <Film className="h-8 w-8 text-fg-3" />
                  )}
                </div>
                <h3 className="font-serif text-2xl font-bold">
                  No {activeTab === "images" ? "Photos" : "Videos"} Yet
                </h3>
                <p className="mt-2 max-w-md text-fg-3">
                  {activeTab === "images"
                    ? "Photos will appear here once they're uploaded to the gallery."
                    : "Videos will appear here once they're uploaded."}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "images" ? (
                  <motion.div
                    key="images"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                      {images.map((img, idx) => (
                        <motion.div
                          key={img.name}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-40px" }}
                          variants={scaleIn}
                          custom={idx * 0.05}
                          className="mb-4 break-inside-avoid"
                        >
                          <div
                            className="group relative overflow-hidden rounded-xl border border-edge bg-surface cursor-pointer"
                            onClick={() => setLightbox(img.url)}
                          >
                            <div className="relative aspect-square">
                              <Image
                                src={img.url}
                                alt={img.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            </div>
                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <p className="text-sm font-medium text-white truncate">
                                {img.name.replace(/^\d+-/, "").replace(/\.[^.]+$/, "").replace(/-/g, " ")}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="videos"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      {videos.map((video, idx) => (
                        <motion.div
                          key={video.name}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-40px" }}
                          variants={fadeUp}
                          custom={idx * 0.1}
                          className="group overflow-hidden rounded-xl border border-edge bg-page/60 transition-colors duration-300 hover:border-amber-500/30"
                        >
                          {playingVideo === video.url ? (
                            <div className="relative aspect-video bg-black">
                              <video
                                src={video.url}
                                controls
                                autoPlay
                                className="h-full w-full"
                              />
                              <button
                                onClick={() => setPlayingVideo(null)}
                                className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full hover:bg-black/80 transition-colors"
                              >
                                <X className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className="relative aspect-video bg-surface cursor-pointer overflow-hidden"
                              onClick={() => setPlayingVideo(video.url)}
                            >
                              <video
                                src={video.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                muted
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500/50 bg-amber-500/10 backdrop-blur-sm transition-all duration-300 group-hover:border-amber-500 group-hover:bg-amber-500/20"
                                >
                                  <Play className="h-7 w-7 text-amber-500 ml-1" />
                                </motion.div>
                              </div>
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="font-serif text-lg font-bold text-fg truncate">
                              {video.name.replace(/^\d+-/, "").replace(/\.[^.]+$/, "").replace(/-/g, " ")}
                            </h3>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* Social CTA */}
      <section className="border-t border-edge bg-page py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-7xl px-6 text-center"
        >
          <motion.p variants={fadeUp} className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500">
            Stay Connected
          </motion.p>
          <motion.h2 variants={fadeUp} custom={0.1} className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
            Follow Squix on Social Media
          </motion.h2>
          <motion.div variants={fadeUp} custom={0.2} className="mt-8 flex items-center justify-center gap-5">
            {[
              { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
              { icon: XTwitterIcon, label: "X / Twitter", href: "https://x.com" },
              { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
              { icon: YouTubeIcon, label: "YouTube", href: "https://youtube.com" },
            ].map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-edge bg-inset text-fg-2 transition-all hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-500"
              >
                <s.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <img
                src={lightbox}
                alt=""
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
