"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import {
  BookOpen,
  ShoppingCart,
  DollarSign,
  Users,
  Loader2,
  RefreshCw,
  Star,
  Mail,
} from "lucide-react";
import type { Order, Customer } from "@/lib/types";
import Link from "next/link";

interface Stats {
  totalBooks: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalReviews: number;
  pendingReviews: number;
  totalMessages: number;
  unreadMessages: number;
}

type RecentOrder = Order & { customers: Customer };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalReviews: 0,
    pendingReviews: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchData() {
    setRefreshing(true);
    const supabase = createClient();

    const [booksRes, ordersRes, customersRes, recentRes, reviewsRes, pendingReviewsRes, messagesRes, unreadMessagesRes] = await Promise.all([
      supabase.from("books").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, total", { count: "exact" }),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*, customers(*)")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]);

    const totalRevenue =
      ordersRes.data?.reduce((sum, order) => sum + order.total, 0) ?? 0;

    setStats({
      totalBooks: booksRes.count ?? 0,
      totalOrders: ordersRes.count ?? 0,
      totalRevenue,
      totalCustomers: customersRes.count ?? 0,
      totalReviews: reviewsRes.count ?? 0,
      pendingReviews: pendingReviewsRes.count ?? 0,
      totalMessages: messagesRes.count ?? 0,
      unreadMessages: unreadMessagesRes.count ?? 0,
    });

    setRecentOrders((recentRes.data as RecentOrder[]) ?? []);
    setLoading(false);
    setRefreshing(false);
    setLastUpdated(new Date());
  }

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes on orders, customers, reviews, messages
    const supabase = createClient();
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-fg-3" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks.toString(),
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Reviews",
      value: `${stats.totalReviews}`,
      subtitle: stats.pendingReviews > 0 ? `${stats.pendingReviews} pending` : undefined,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      href: "/admin/reviews",
    },
    {
      title: "Messages",
      value: `${stats.totalMessages}`,
      subtitle: stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : undefined,
      icon: Mail,
      color: "text-rose-600",
      bg: "bg-rose-50",
      href: "/admin/messages",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-neutral-100 text-neutral-800",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-fg">
            Dashboard
          </h2>
          <p className="text-fg-3 mt-1">
            Welcome back. Here&apos;s an overview of your bookstore.
          </p>
          {lastUpdated && (
            <p className="text-xs text-fg-3 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 text-fg-2"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-fg-3">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-fg mt-1">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          );
          return stat.href ? (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:border-edge transition-colors cursor-pointer">
                {content}
              </Card>
            </Link>
          ) : (
            <Card key={stat.title}>
              {content}
            </Card>
          );
        })}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Link
              href="/admin/orders"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-fg-3 text-sm text-center py-8">
              No orders yet.
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
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Total
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-fg-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-edge hover:bg-hover-fill"
                    >
                      <td className="py-3 px-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-amber-600 hover:text-amber-700 font-mono text-xs"
                        >
                          {order.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="py-3 px-2">
                        {order.customers?.full_name ?? "Unknown"}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          className={
                            statusColors[order.status] ?? statusColors.pending
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-fg-3">
                        {formatDate(order.created_at)}
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
