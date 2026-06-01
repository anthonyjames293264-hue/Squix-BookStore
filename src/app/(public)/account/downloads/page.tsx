"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Download, BookOpen, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SquirrelLoader } from "@/components/animations/squirrel-loader";

interface DownloadRow {
  id: string;
  download_token: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  books: { title: string; cover_image: string };
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", user.email)
        .single();

      if (!customer) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("downloads")
        .select("id, download_token, download_count, max_downloads, expires_at, books(title, cover_image)")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false });

      setDownloads((data as unknown as DownloadRow[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <SquirrelLoader text="Loading downloads..." />;

  const now = new Date();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">My Downloads</h1>

      {downloads.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-xl border border-edge bg-surface/60"
        >
          <BookOpen className="h-12 w-12 text-fg-3 mx-auto mb-4" />
          <p className="text-fg-2 text-lg">No downloads yet</p>
          <p className="text-fg-3 text-sm mt-1">
            Purchase an e-book and it will appear here for download.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {downloads.map((dl, idx) => {
            const expired = new Date(dl.expires_at) < now;
            const maxedOut = dl.download_count >= dl.max_downloads;
            const canDownload = !expired && !maxedOut;

            return (
              <motion.div
                key={dl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-edge bg-surface/60 p-6 flex items-center gap-4 transition-colors hover:border-edge"
              >
                <div className="h-16 w-12 rounded bg-surface overflow-hidden flex-shrink-0">
                  {dl.books?.cover_image && (
                    <img
                      src={dl.books.cover_image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{dl.books?.title || "E-Book"}</p>
                  <p className="text-xs text-fg-3 mt-1">
                    Downloaded {dl.download_count} / {dl.max_downloads} times
                  </p>
                  {expired && (
                    <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      Download link expired
                    </p>
                  )}
                </div>

                {canDownload ? (
                  <Button
                    asChild
                    variant="gold"
                    size="sm"
                  >
                    <a href={`/api/download/${dl.download_token}`} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled className="border-edge text-fg-3">
                    {expired ? "Expired" : "Limit reached"}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
