"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Upload,
  Trash2,
  Image as ImageIcon,
  Video,
  FileIcon,
  Download,
  ExternalLink,
  Play,
} from "lucide-react";
import Image from "next/image";

interface StorageFile {
  name: string;
  id: string;
  bucket: string;
  url: string;
  created_at: string;
  metadata: {
    mimetype?: string;
    size?: number;
  } | null;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");
  const [deleteFile, setDeleteFile] = useState<StorageFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchFiles = useCallback(async () => {
    const supabase = createClient();
    const bucket = activeTab === "images" ? "gallery" : "videos";

    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (data && !error) {
      const filesWithUrls: StorageFile[] = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => {
          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(f.name);

          return {
            name: f.name,
            id: f.id ?? f.name,
            bucket,
            url: publicUrl,
            created_at: f.created_at ?? "",
            metadata: f.metadata as StorageFile["metadata"],
          };
        });

      setFiles(filesWithUrls);
    } else {
      setFiles([]);
    }

    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchFiles();
  }, [fetchFiles]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploadError("");
    setUploading(true);
    const supabase = createClient();
    const bucket = activeTab === "images" ? "gallery" : "videos";

    // Validate file types before uploading
    const validFiles: File[] = [];
    let skipped = 0;

    for (const file of selectedFiles) {
      if (activeTab === "images" && !file.type.startsWith("image/")) {
        skipped++;
        continue;
      }
      if (activeTab === "videos" && !file.type.startsWith("video/")) {
        skipped++;
        continue;
      }
      validFiles.push(file);
    }

    if (skipped > 0) {
      const allowed = activeTab === "images" ? "images" : "videos";
      setUploadError(
        `${skipped} file${skipped > 1 ? "s were" : " was"} skipped — only ${allowed} are allowed in the ${activeTab === "images" ? "Images" : "Videos"} tab.`
      );
    }

    for (const file of validFiles) {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${timestamp}-${safeName}`;

      await supabase.storage.from(bucket).upload(path, file);
    }

    await fetchFiles();
    setUploading(false);

    // Reset the input
    e.target.value = "";
  }

  async function handleDelete() {
    if (!deleteFile) return;
    setDeleting(true);
    setDeleteError("");

    const supabase = createClient();
    const { error } = await supabase.storage
      .from(deleteFile.bucket)
      .remove([deleteFile.name]);

    if (error) {
      setDeleteError(
        `Failed to delete: ${error.message}. You may need to add a storage delete policy in Supabase.`
      );
      setDeleting(false);
      return;
    }

    setFiles((prev) => prev.filter((f) => f.id !== deleteFile.id));
    setDeleteFile(null);
    setDeleting(false);
  }

  function formatFileSize(bytes?: number) {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function isImage(file: StorageFile) {
    if (file.metadata?.mimetype) {
      return file.metadata.mimetype.startsWith("image/");
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext);
  }

  function isVideo(file: StorageFile) {
    if (file.metadata?.mimetype) {
      return file.metadata.mimetype.startsWith("video/");
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    return ["mp4", "webm", "mov", "avi", "mkv"].includes(ext);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-fg">
            Media
          </h2>
          <p className="text-fg-3 mt-1">
            Manage your images and videos
          </p>
        </div>
        <label>
          <Button variant="gold" disabled={uploading} asChild>
            <span className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </>
              )}
            </span>
          </Button>
          <input
            type="file"
            multiple
            accept={
              activeTab === "images" ? "image/*" : "video/*"
            }
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {uploadError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {uploadError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setActiveTab("images");
            setUploadError("");
          }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "images"
              ? "bg-surface text-fg"
              : "bg-inset text-fg-2 hover:bg-inset"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Images
        </button>
        <button
          onClick={() => {
            setActiveTab("videos");
            setUploadError("");
          }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "videos"
              ? "bg-surface text-fg"
              : "bg-inset text-fg-2 hover:bg-inset"
          }`}
        >
          <Video className="w-4 h-4" />
          Videos
        </button>
      </div>

      {/* Media Grid */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-fg-2" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-inset mb-4">
                {activeTab === "images" ? (
                  <ImageIcon className="w-8 h-8 text-fg-2" />
                ) : (
                  <Video className="w-8 h-8 text-fg-2" />
                )}
              </div>
              <p className="text-fg-3 text-sm">
                No {activeTab} uploaded yet.
              </p>
              <p className="text-fg-2 text-xs mt-1">
                Upload files to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative rounded-lg border border-edge-2 overflow-hidden bg-inset"
                >
                  {isImage(file) ? (
                    <div className="aspect-square relative">
                      <Image
                        src={file.url}
                        alt={file.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    </div>
                  ) : isVideo(file) ? (
                    <div className="aspect-square relative bg-surface flex items-center justify-center">
                      <video
                        src={file.url}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-inset">
                      <FileIcon className="w-8 h-8 text-fg-2" />
                    </div>
                  )}

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                    <a
                      href={file.url}
                      download={file.name}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setDeleteError("");
                        setDeleteFile(file);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* File info */}
                  <div className="p-2">
                    <p className="text-xs text-fg-2 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-fg-2">
                      {formatFileSize(file.metadata?.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteFile?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFile(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
