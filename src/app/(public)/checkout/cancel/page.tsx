import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Order Cancelled",
};

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-page">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-fg mb-4">
          Order Cancelled
        </h1>

        <p className="text-fg-2 mb-8">
          Your order has been cancelled. No payment was processed.
          If you have any questions, please don&apos;t hesitate to contact us.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="gold" size="lg">
            <Link href="/store">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
