import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

interface CheckoutItem {
  bookId: string;
  quantity: number;
  format: "physical" | "digital";
}

interface CheckoutBody {
  items: CheckoutItem[];
  customerEmail: string;
  customerName: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json();
    const { items, customerEmail, customerName, shippingAddress } = body;

    if (!items?.length || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Missing required fields: items, customerEmail, customerName" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch book details for all items
    const bookIds = items.map((item) => item.bookId);
    const { data: books, error: booksError } = await supabase
      .from("books")
      .select("*")
      .in("id", bookIds)
      .eq("is_published", true);

    if (booksError || !books?.length) {
      return NextResponse.json(
        { error: "One or more books not found" },
        { status: 404 }
      );
    }

    // Validate all requested books exist
    const bookMap = new Map(books.map((book) => [book.id, book]));
    for (const item of items) {
      const book = bookMap.get(item.bookId);
      if (!book) {
        return NextResponse.json(
          { error: `Book not found: ${item.bookId}` },
          { status: 404 }
        );
      }
      // Check stock for physical items
      if (item.format === "physical" && book.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${book.title}"` },
          { status: 400 }
        );
      }
    }

    // Create or find customer
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("*")
      .eq("email", customerEmail)
      .single();

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      if (existingCustomer.full_name !== customerName) {
        await supabase
          .from("customers")
          .update({
            full_name: customerName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customerId);
      }
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          email: customerEmail,
          full_name: customerName,
        })
        .select()
        .single();

      if (customerError || !newCustomer) {
        return NextResponse.json(
          { error: "Failed to create customer record" },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // Generate a temporary order ID for metadata
    const orderId = crypto.randomUUID();

    // Build Stripe line items
    const lineItems = items.map((item) => {
      const book = bookMap.get(item.bookId)!;
      const formatLabel = item.format === "digital" ? " (Digital)" : " (Physical)";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${book.title}${formatLabel}`,
            description: book.description.substring(0, 500),
            images: book.cover_image ? [book.cover_image] : [],
          },
          unit_amount: book.price, // price is already in cents
        },
        quantity: item.quantity,
      };
    });

    // Determine if shipping is needed
    const hasPhysicalItems = items.some((item) => item.format === "physical");

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: lineItems,
      metadata: {
        orderId,
        customerId,
        items: JSON.stringify(
          items.map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            format: item.format,
            title: bookMap.get(item.bookId)!.title,
            price: bookMap.get(item.bookId)!.price,
          }))
        ),
        customerName,
        customerEmail,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : "",
      },
      ...(hasPhysicalItems && {
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU"],
        },
      }),
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
