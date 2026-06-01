import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendOrderConfirmation,
  sendDownloadLink,
  sendAdminOrderNotification,
} from "@/lib/resend";
import crypto from "crypto";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutCompleted(session);
    } catch (error) {
      console.error("Error handling checkout.session.completed:", error);
      // Return 200 to prevent Stripe from retrying, but log the error
      return NextResponse.json(
        { error: "Webhook handler failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();

  const metadata = session.metadata!;
  const orderId = metadata.orderId;
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
  const subtotal = total;

  const sessionAny = session as unknown as Record<string, unknown>;
  const collectedShipping = sessionAny.collected_information
    ? (sessionAny.collected_information as { shipping_details?: { name?: string; address?: { line1?: string; city?: string; state?: string; postal_code?: string; country?: string } } })?.shipping_details
    : null;

  // Create order
  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    customer_id: customerId,
    stripe_session_id: session.id,
    stripe_payment_intent:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null,
    status: "paid",
    subtotal,
    shipping_cost: 0,
    total,
    shipping_name: shippingAddress
      ? customerName
      : collectedShipping?.name || null,
    shipping_address: shippingAddress
      ? shippingAddress.line1
      : collectedShipping?.address?.line1 || null,
    shipping_city: shippingAddress
      ? shippingAddress.city
      : collectedShipping?.address?.city || null,
    shipping_state: shippingAddress
      ? shippingAddress.state
      : collectedShipping?.address?.state || null,
    shipping_zip: shippingAddress
      ? shippingAddress.postal_code
      : collectedShipping?.address?.postal_code || null,
    shipping_country: shippingAddress
      ? shippingAddress.country
      : collectedShipping?.address?.country || null,
  });

  if (orderError) {
    console.error("Failed to create order:", orderError);
    throw new Error("Failed to create order");
  }

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: orderId,
    book_id: item.bookId,
    quantity: item.quantity,
    unit_price: item.price,
    format: item.format,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Failed to create order items:", itemsError);
    throw new Error("Failed to create order items");
  }

  // Update customer totals
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

  // Handle digital items - create download records
  const digitalItems = items.filter((item) => item.format === "digital");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

  for (const item of digitalItems) {
    const downloadToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const { error: downloadError } = await supabase.from("downloads").insert({
      order_id: orderId,
      book_id: item.bookId,
      customer_id: customerId,
      download_token: downloadToken,
      download_count: 0,
      max_downloads: 5,
      expires_at: expiresAt,
    });

    if (downloadError) {
      console.error("Failed to create download record:", downloadError);
      // Don't throw - continue with other items
    }

    // Send download link email
    try {
      await sendDownloadLink({
        customerEmail,
        customerName,
        bookTitle: item.title,
        downloadUrl: `${baseUrl}/api/download/${downloadToken}`,
      });
    } catch (emailError) {
      console.error("Failed to send download link email:", emailError);
    }
  }

  // Send order confirmation email
  try {
    await sendOrderConfirmation({
      customerEmail,
      customerName,
      orderId,
      items: items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      shippingAddress: shippingAddress
        ? `${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}`
        : collectedShipping?.address
          ? `${collectedShipping.address.line1}, ${collectedShipping.address.city}, ${collectedShipping.address.state} ${collectedShipping.address.postal_code}`
          : undefined,
    });
  } catch (emailError) {
    console.error("Failed to send order confirmation email:", emailError);
  }

  // Send admin notification
  try {
    await sendAdminOrderNotification({
      orderId,
      customerName,
      customerEmail,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (emailError) {
    console.error("Failed to send admin notification email:", emailError);
  }
}
