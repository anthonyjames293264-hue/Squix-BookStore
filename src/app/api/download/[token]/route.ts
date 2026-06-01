import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createAdminClient();

    const { data: download, error } = await supabase
      .from("downloads")
      .select("*, books(*)")
      .eq("download_token", token)
      .single();

    if (error || !download) {
      return NextResponse.json(
        { error: "Invalid download link" },
        { status: 404 }
      );
    }

    if (new Date(download.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This download link has expired" },
        { status: 410 }
      );
    }

    if (download.download_count >= download.max_downloads) {
      return NextResponse.json(
        { error: "Maximum download limit reached" },
        { status: 429 }
      );
    }

    const book = download.books;
    if (!book?.file_url) {
      return NextResponse.json(
        { error: "No downloadable file has been uploaded for this book yet. Please contact support." },
        { status: 404 }
      );
    }

    let filePath = book.file_url;
    if (filePath.includes("/book-files/")) {
      filePath = filePath.split("/book-files/").pop()!;
    }
    if (filePath.startsWith("/")) {
      filePath = filePath.slice(1);
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from("book-files")
      .createSignedUrl(filePath, 300);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signedUrlError);
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 }
      );
    }

    await supabase
      .from("downloads")
      .update({ download_count: download.download_count + 1 })
      .eq("id", download.id);

    return NextResponse.redirect(signedUrlData.signedUrl);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
