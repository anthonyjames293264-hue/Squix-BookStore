import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { bookId, customerName, rating, comment } = await request.json();

    if (!bookId || !customerName?.trim() || !rating) {
      return NextResponse.json(
        { error: "Book ID, name, and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("reviews").insert({
      book_id: bookId,
      customer_name: customerName.trim(),
      rating,
      comment: comment?.trim() || null,
      is_approved: false,
    });

    if (error) {
      console.error("Review submission error:", error);
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Review submitted. It will appear after approval.",
    });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
