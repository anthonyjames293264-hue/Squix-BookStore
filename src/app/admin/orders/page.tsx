"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDate, truncate } from "@/lib/utils";
import { Search, Loader2, Eye } from "lucide-react";
import type { Order, Customer } from "@/lib/types";
import Link from "next/link";

type OrderWithCustomer = Order & { customers: Customer };

const statusOptions = [
  "all",
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-neutral-100 text-neutral-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, customers(*), order_items(id)")
      .order("created_at", { ascending: false });

    setOrders((data as OrderWithCustomer[]) ?? []);
    setLoading(false);
  }

  async function updateStatus(
    orderId: string,
    newStatus: Order["status"]
  ) {
    setUpdatingOrder(orderId);
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setUpdatingOrder(null);
  }

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

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
          Orders
        </h2>
        <p className="text-fg-3 mt-1">
          Manage your orders ({orders.length} total)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${
                    statusFilter === status
                      ? "bg-neutral-900 text-white"
                      : "bg-surface text-fg-2 hover:bg-surface"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-fg-3 text-sm text-center py-8">
              No orders found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-edge">
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Order
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Customer
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden md:table-cell">
                      Items
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Total
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3 hidden lg:table-cell">
                      Date
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-fg-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-edge hover:bg-hover-fill"
                    >
                      <td className="py-3 px-2 font-mono text-xs">
                        {truncate(order.id, 8)}
                      </td>
                      <td className="py-3 px-2">
                        {order.customers?.full_name ?? "Unknown"}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell text-fg-2">
                        {(order as OrderWithCustomer & { order_items: { id: string }[] }).order_items?.length ?? 0}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(
                              order.id,
                              e.target.value as Order["status"]
                            )
                          }
                          disabled={updatingOrder === order.id}
                          className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer ${
                            statusColors[order.status]
                          }`}
                        >
                          {statusOptions
                            .filter((s) => s !== "all")
                            .map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell text-fg-3">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-xs font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
