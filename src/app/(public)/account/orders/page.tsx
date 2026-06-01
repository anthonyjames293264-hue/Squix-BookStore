"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SquirrelLoader } from "@/components/animations/squirrel-loader";

interface OrderRow {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: Array<{
    quantity: number;
    unit_price: number;
    format: string;
    books: { title: string; cover_image: string };
  }>;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  paid: { icon: CheckCircle, color: "text-green-500", label: "Paid" },
  shipped: { icon: Truck, color: "text-blue-500", label: "Shipped" },
  delivered: { icon: Package, color: "text-green-500", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-500", label: "Cancelled" },
  refunded: { icon: XCircle, color: "text-fg-3", label: "Refunded" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
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
        .from("orders")
        .select("id, status, total, created_at, order_items(quantity, unit_price, format, books(title, cover_image))")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false });

      setOrders((data as unknown as OrderRow[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <SquirrelLoader text="Loading orders..." />;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-xl border border-edge bg-surface/60"
        >
          <ShoppingBag className="h-12 w-12 text-fg-3 mx-auto mb-4" />
          <p className="text-fg-2 text-lg">No orders yet</p>
          <p className="text-fg-3 text-sm mt-1">
            Your order history will appear here after your first purchase.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-edge bg-surface/60 p-6 transition-colors hover:border-edge"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-fg-3 font-mono">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-fg-3 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge className={`border-0 bg-surface ${config.color} gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {order.order_items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-12 w-9 rounded bg-surface overflow-hidden flex-shrink-0">
                        {item.books?.cover_image && (
                          <img
                            src={item.books.cover_image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.books?.title || "Book"}
                        </p>
                        <p className="text-xs text-fg-3">
                          {item.format === "digital" ? "E-Book" : "Hardcover"} &times; {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm text-fg-2">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-edge mt-4 pt-4 flex justify-between items-center">
                  <span className="text-sm text-fg-3">Total</span>
                  <span className="font-serif text-lg font-bold text-amber-500">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
