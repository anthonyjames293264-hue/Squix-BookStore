import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "anthonyjames293264@gmail.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "anthonyjames293264@gmail.com";

export async function sendOrderConfirmation(order: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  total: number;
  shippingAddress?: string;
}) {
  const itemsList = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.title}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee">$${(item.price / 100).toFixed(2)}</td></tr>`
    )
    .join("");

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: `Order Confirmation - #${order.orderId}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <div style="text-align:center;padding:40px 0;background:#0a0a0a;color:#d4af37">
          <h1 style="font-size:28px;margin:0">Order Confirmed</h1>
        </div>
        <div style="padding:30px">
          <p>Dear ${order.customerName},</p>
          <p>Thank you for your order. Here are your order details:</p>
          <p><strong>Order ID:</strong> #${order.orderId}</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Item</th>
                <th style="padding:8px;text-align:left">Qty</th>
                <th style="padding:8px;text-align:left">Price</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>
          <p style="font-size:18px"><strong>Total: $${(order.total / 100).toFixed(2)}</strong></p>
          ${order.shippingAddress ? `<p><strong>Shipping to:</strong><br/>${order.shippingAddress}</p>` : ""}
          <p>If you have any questions, simply reply to this email.</p>
          <p style="color:#666;font-size:14px;margin-top:40px">Thank you for your support!</p>
        </div>
      </div>
    `,
  });
}

export async function sendDownloadLink(params: {
  customerEmail: string;
  customerName: string;
  bookTitle: string;
  downloadUrl: string;
}) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.customerEmail,
    subject: `Your Download - ${params.bookTitle}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <div style="text-align:center;padding:40px 0;background:#0a0a0a;color:#d4af37">
          <h1 style="font-size:28px;margin:0">Your Book is Ready</h1>
        </div>
        <div style="padding:30px">
          <p>Dear ${params.customerName},</p>
          <p>Your digital copy of <strong>${params.bookTitle}</strong> is ready for download.</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${params.downloadUrl}" style="display:inline-block;padding:16px 40px;background:#d4af37;color:#0a0a0a;text-decoration:none;font-weight:bold;font-size:16px">
              Download Your Book
            </a>
          </div>
          <p style="color:#666;font-size:14px">This link will expire in 24 hours. If you need a new link, please contact us.</p>
        </div>
      </div>
    `,
  });
}

export async function sendContactNotification(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Contact: ${params.subject}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${params.name} (${params.email})</p>
        <p><strong>Subject:</strong> ${params.subject}</p>
        <div style="padding:20px;background:#f5f5f5;border-left:4px solid #d4af37;margin:20px 0">
          <p>${params.message}</p>
        </div>
      </div>
    `,
  });
}

export async function sendAdminOrderNotification(order: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
}) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Order #${order.orderId}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> #${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</p>
        <p><strong>Items:</strong> ${order.itemCount}</p>
        <p><strong>Total:</strong> $${(order.total / 100).toFixed(2)}</p>
      </div>
    `,
  });
}
