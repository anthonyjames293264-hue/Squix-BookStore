"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
  Loader2,
  Mail,
  MailOpen,
  Trash2,
  Eye,
} from "lucide-react";
import type { ContactMessage } from "@/lib/types";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<ContactMessage | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    const supabase = createClient();
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    setMessages(data ?? []);
    setLoading(false);
  }

  async function markAsRead(messageId: string) {
    const supabase = createClient();
    await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", messageId);

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, is_read: true } : m))
    );
  }

  async function viewMessage(message: ContactMessage) {
    setSelectedMessage(message);
    if (!message.is_read) {
      await markAsRead(message.id);
    }
  }

  async function handleDelete() {
    if (!deleteMessage) return;
    setDeleting(true);

    const supabase = createClient();
    await supabase
      .from("contact_messages")
      .delete()
      .eq("id", deleteMessage.id);

    setMessages((prev) => prev.filter((m) => m.id !== deleteMessage.id));
    setDeleteMessage(null);
    setDeleting(false);
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-fg-3" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-fg">
          Messages
        </h2>
        <p className="text-fg-3 mt-1">
          Contact form messages ({messages.length} total
          {unreadCount > 0 && `, ${unreadCount} unread`})
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {messages.length === 0 ? (
            <p className="text-fg-3 text-sm text-center py-8">
              No messages yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-edge">
                    <th className="text-left py-3 px-2 font-medium text-fg-3 w-8">
                      &nbsp;
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Name
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Subject
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden lg:table-cell">
                      Date
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Status
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-fg-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr
                      key={message.id}
                      className={`border-b border-edge-2 hover:bg-hover-fill cursor-pointer ${
                        !message.is_read ? "bg-amber-50/50" : ""
                      }`}
                      onClick={() => viewMessage(message)}
                    >
                      <td className="py-3 px-2">
                        {message.is_read ? (
                          <MailOpen className="w-4 h-4 text-fg-2" />
                        ) : (
                          <Mail className="w-4 h-4 text-amber-600" />
                        )}
                      </td>
                      <td
                        className={`py-3 px-2 ${
                          !message.is_read ? "font-semibold" : ""
                        } text-fg`}
                      >
                        {message.name}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell text-fg-2">
                        {message.email}
                      </td>
                      <td
                        className={`py-3 px-2 max-w-[200px] truncate ${
                          !message.is_read
                            ? "font-semibold text-fg"
                            : "text-fg-2"
                        }`}
                      >
                        {message.subject}
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell text-fg-3">
                        {formatDate(message.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        {message.is_read ? (
                          <Badge variant="secondary">Read</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800">
                            New
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => viewMessage(message)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteMessage(message)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From {selectedMessage?.name} ({selectedMessage?.email}) on{" "}
              {selectedMessage ? formatDate(selectedMessage.created_at) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-fg-2 whitespace-pre-wrap leading-relaxed">
              {selectedMessage?.message}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedMessage(null)}
            >
              Close
            </Button>
            {selectedMessage && (
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
              >
                <Button variant="gold">Reply via Email</Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteMessage}
        onOpenChange={() => setDeleteMessage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the message from &quot;
              {deleteMessage?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMessage(null)}>
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
