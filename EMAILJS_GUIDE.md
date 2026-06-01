# EmailJS Setup Guide — Author Bookstore

This guide explains how to set up **EmailJS** to handle both the **Contact Form** and **Physical Book Order Inquiries** on your website.

---

## 1. Create an EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com/) and sign up for a free account.
2. Once logged in, go to the **Email Services** tab.
3. Click **Add New Service** and connect your email provider (e.g., Gmail, Outlook, etc.).
4. Copy your **Service ID** (e.g., `service_xxxxxxx`). You'll add this to your environment variables.

---

## 2. Get Your Public Key

1. Go to the **Account** or **API Keys** section (usually under the gear icon or user menu).
2. Copy your **Public Key** (e.g., `user_xxxxxxxxxxxxxxxx` or a random string).

---

## 3. Create the Email Template

Since both the contact form and the physical book inquiry form use the same structure, you only need **one template** in EmailJS to handle both.

1. Go to the **Email Templates** tab.
2. Click **Create New Template**.
3. Click the **Edit HTML** or **Source Code** button `<>` in the editor, delete the default content, and paste the premium template below:

### HTML Template Content:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Website Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0a0a0a;
      color: #e5e5e5;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #0a0a0a;
      padding: 30px 15px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #171717;
      border: 1px solid #262626;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .header {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .content {
      padding: 40px;
    }
    .meta-box {
      background-color: #262626;
      border: 1px solid #404040;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .meta-row {
      display: flex;
      margin-bottom: 12px;
      border-bottom: 1px solid #404040;
      padding-bottom: 8px;
    }
    .meta-row:last-child {
      margin-bottom: 0;
      border-bottom: none;
      padding-bottom: 0;
    }
    .meta-label {
      width: 120px;
      font-weight: 600;
      color: #fbbf24;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.1em;
    }
    .meta-value {
      flex: 1;
      font-size: 14px;
      color: #ffffff;
    }
    .message-title {
      font-size: 16px;
      font-weight: 600;
      color: #fbbf24;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #d97706;
      padding-bottom: 5px;
    }
    .message-body {
      font-size: 15px;
      line-height: 1.6;
      color: #d4d4d4;
      white-space: pre-wrap;
      background-color: #0a0a0a;
      border: 1px solid #262626;
      padding: 20px;
      border-radius: 8px;
    }
    .footer {
      background-color: #0a0a0a;
      padding: 20px 40px;
      text-align: center;
      border-top: 1px solid #262626;
      font-size: 12px;
      color: #737373;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>New Website Notification</h1>
      </div>
      <div class="content">
        <div class="meta-box">
          <div class="meta-row">
            <div class="meta-label">From:</div>
            <div class="meta-value">{{from_name}} ({{from_email}})</div>
          </div>
          <div class="meta-row">
            <div class="meta-label">Subject:</div>
            <div class="meta-value">{{subject}}</div>
          </div>
        </div>
        
        <div class="message-title">Message Details</div>
        <div class="message-body">{{message}}</div>
      </div>
      <div class="footer">
        This notification was sent automatically from your Bookstore Website portfolio.
      </div>
    </div>
  </div>
</body>
</html>
```

4. Set the **To Email** field in the template settings to your own personal email (where you want to receive these notifications).
5. Set the **Subject** field in EmailJS settings to: `[Bookstore] {{subject}}`
6. Click **Save** in the top right.
7. Copy the **Template ID** (e.g., `template_xxxxxxx`).

---

## 4. Add to Environment Variables

Open your `.env.local` file (and add these to Vercel production Environment Variables too):

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

Save and restart your Next.js server. Your contact form and physical book orders will now send high-quality, formatted HTML emails directly to your inbox!
