"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowLeft, Loader2, Save, Package, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import type { Order, OrderItem, Customer, Book } from "@/lib/types";

type OrderDetail = Order & {
  customers: Customer;
  order_items: (OrderItem & { books: Book })[];
};

const statusOptions = [
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

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Order["status"]>("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*, customers(*), order_items(*, books(*))")
        .eq("id", orderId)
        .single();

      if (data) {
        const orderData = data as OrderDetail;
        setOrder(orderData);
        setStatus(orderData.status);
        setTrackingNumber(orderData.tracking_number ?? "");
        setNotes(orderData.notes ?? "");
      }

      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        tracking_number: trackingNumber || null,
        notes: notes || null,
      })
      .eq("id", orderId);

    if (!error && order) {
      setOrder({
        ...order,
        status,
        tracking_number: trackingNumber || null,
        notes: notes || null,
      });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-fg-2" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-fg-3">Order not found.</p>
        <Link
          href="/admin/orders"
          className="text-amber-600 hover:text-amber-700 text-sm mt-2 inline-block"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-serif font-bold text-fg">
            Order Details
          </h2>
          <p className="text-fg-3 mt-1 font-mono text-sm">
            {order.id}
          </p>
        </div>
        <Badge
          className={statusColors[order.status] ?? statusColors.pending}
        >
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-edge-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-fg">
                        {item.books?.title ?? "Unknown Book"}
                      </p>
                      <p className="text-sm text-fg-3">
                        Qty: {item.quantity} x {formatPrice(item.unit_price)} | Format: {item.format}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-fg-3">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-fg-3">Shipping</span>
                  <span>{formatPrice(order.shipping_cost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_name ? (
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shipping_name}</p>
                  <p className="text-fg-2">{order.shipping_address}</p>
                  <p className="text-fg-2">
                    {order.shipping_city}, {order.shipping_state}{" "}
                    {order.shipping_zip}
                  </p>
                  <p className="text-fg-2">{order.shipping_country}</p>
                </div>
              ) : (
                <p className="text-fg-3 text-sm">
                  No shipping information provided.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">
                {order.customers?.full_name ?? "Unknown"}
              </p>
              <p className="text-fg-3">
                {order.customers?.email ?? "N/A"}
              </p>
              {order.customers?.phone && (
                <p className="text-fg-3">{order.customers.phone}</p>
              )}
              <p className="text-fg-2 text-xs">
                Ordered on {formatDate(order.created_at)}
              </p>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as Order["status"])
                  }
                  className="flex h-10 w-full rounded-md border border-edge bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes about this order"
                  rows={4}
                />
              </div>

              <Button
                variant="gold"
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
