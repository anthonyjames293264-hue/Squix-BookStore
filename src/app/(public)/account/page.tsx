"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag, Download, User, Loader2 } from "lucide-react";
import { SquirrelLoader } from "@/components/animations/squirrel-loader";

interface AccountData {
  name: string;
  email: string;
  orderCount: number;
  downloadCount: number;
}

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      const { data: customer } = await supabase
        .from("customers")
        .select("id, total_orders")
        .eq("email", user.email)
        .single();

      let downloadCount = 0;
      if (customer) {
        const { count } = await supabase
          .from("downloads")
          .select("id", { count: "exact", head: true })
          .eq("customer_id", customer.id);
        downloadCount = count || 0;
      }

      setData({
        name: profile?.full_name || user.email || "User",
        email: profile?.email || user.email || "",
        orderCount: customer?.total_orders || 0,
        downloadCount,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <SquirrelLoader text="Loading your account..." />;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-3xl font-bold">
          Welcome back, {data?.name?.split(" ")[0]}!
        </h1>
        <p className="text-fg-2 mt-1">{data?.email}</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href="/account/orders"
            className="block rounded-xl border border-edge bg-surface/60 p-6 transition-all hover:border-amber-500/30 hover:-translate-y-1"
          >
            <ShoppingBag className="h-8 w-8 text-amber-500 mb-3" />
            <p className="text-2xl font-bold">{data?.orderCount || 0}</p>
            <p className="text-sm text-fg-2">Total Orders</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/account/downloads"
            className="block rounded-xl border border-edge bg-surface/60 p-6 transition-all hover:border-amber-500/30 hover:-translate-y-1"
          >
            <Download className="h-8 w-8 text-amber-500 mb-3" />
            <p className="text-2xl font-bold">{data?.downloadCount || 0}</p>
            <p className="text-sm text-fg-2">Available Downloads</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="rounded-xl border border-edge bg-surface/60 p-6">
            <User className="h-8 w-8 text-amber-500 mb-3" />
            <p className="text-sm font-medium">{data?.name}</p>
            <p className="text-xs text-fg-3 mt-1">Member</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-edge bg-surface/60 p-6"
      >
        <h2 className="font-serif text-lg font-bold mb-2">Quick Links</h2>
        <div className="space-y-2">
          <Link href="/store" className="block text-sm text-amber-500 hover:text-amber-400 transition-colors">
            Browse the Bookstore &rarr;
          </Link>
          <Link href="/account/orders" className="block text-sm text-amber-500 hover:text-amber-400 transition-colors">
            View Order History &rarr;
          </Link>
          <Link href="/account/downloads" className="block text-sm text-amber-500 hover:text-amber-400 transition-colors">
            Download Your E-Books &rarr;
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
