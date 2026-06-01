import { CheckCircle, ArrowRight, Download, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export const metadata = {
  title: "Order Confirmed",
};

async function fulfillOrder(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" || !session.metadata?.orderId) {
      return null;
    }

    const supabase = createAdminClient();
    const metadata = session.metadata;
    const orderId = metadata.orderId;

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .single();

    if (existingOrder) {
      return orderId;
    }

    const customerId = metadata.customerId;
    const customerName = metadata.customerName;
    const customerEmail = metadata.customerEmail;
    const items = JSON.parse(metadata.items) as Array<{
      bookId: string;
      quantity: number;
      format: "physical" | "digital";
      title: string;
      price: number;
    }>;
    const shippingAddress = metadata.shippingAddress
      ? JSON.parse(metadata.shippingAddress)
      : null;

    const total = session.amount_total || 0;

    await supabase.from("orders").insert({
      id: orderId,
      customer_id: customerId,
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      status: "paid",
      subtotal: total,
      shipping_cost: 0,
      total,
      shipping_name: shippingAddress ? customerName : null,
      shipping_address: shippingAddress?.line1 || null,
      shipping_city: shippingAddress?.city || null,
      shipping_state: shippingAddress?.state || null,
      shipping_zip: shippingAddress?.postal_code || null,
      shipping_country: shippingAddress?.country || null,
    });

    const orderItems = items.map((item) => ({
      order_id: orderId,
      book_id: item.bookId,
      quantity: item.quantity,
      unit_price: item.price,
      format: item.format,
    }));

    await supabase.from("order_items").insert(orderItems);

    const { data: currentCustomer } = await supabase
      .from("customers")
      .select("total_orders, total_spent")
      .eq("id", customerId)
      .single();

    if (currentCustomer) {
      await supabase
        .from("customers")
        .update({
          total_orders: currentCustomer.total_orders + 1,
          total_spent: currentCustomer.total_spent + total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId);
    }

    const digitalItems = items.filter((item) => item.format === "digital");
    for (const item of digitalItems) {
      const downloadToken = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      await supabase.from("downloads").insert({
        order_id: orderId,
        book_id: item.bookId,
        customer_id: customerId,
        download_token: downloadToken,
        download_count: 0,
        max_downloads: 5,
        expires_at: expiresAt,
      });
    }

    return orderId;
  } catch (error) {
    console.error("Failed to fulfill order on success page:", error);
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let orderId: string | null = null;
  if (session_id) {
    orderId = await fulfillOrder(session_id);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-page">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-fg mb-4">
          Order Confirmed!
        </h1>

        <p className="text-fg-2 mb-8">
          Thank you for your purchase! Your order has been processed successfully.
        </p>

        <div className="bg-panel rounded-lg border border-edge-2 p-6 mb-8 text-left">
          <h2 className="font-semibold text-fg mb-3">What happens next?</h2>
          <ul className="space-y-3 text-sm text-fg-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-amber-500/15 rounded-full flex items-center justify-center text-amber-500 text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              Your e-books are available to download right now in your account
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-amber-500/15 rounded-full flex items-center justify-center text-amber-500 text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              Physical books will be shipped within 2-3 business days
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-amber-500/15 rounded-full flex items-center justify-center text-amber-500 text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              You can view all your orders and downloads in My Account
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="gold" size="lg">
            <Link href="/account/downloads">
              <Download className="mr-2 h-4 w-4" />
              Go to My Downloads
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/account">
              <User className="mr-2 h-4 w-4" />
              My Account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
