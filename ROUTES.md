# Application Routes — Author Bookstore

This document provides a quick overview of all available pages, protected routes, and API endpoints within the Next.js bookstore application.

---

## 🌍 Public Pages (Guest & User Accessible)

These pages are accessible to anyone visiting the site.

| Route | File Path | Description |
| :--- | :--- | :--- |
| **`/`** (Home) | `src/app/(public)/page.tsx` | Landing page featuring featured books, newsletter signup, and about snippets. |
| **`/about`** | `src/app/(public)/about/page.tsx` | Biography, photos, and professional timeline of the author. |
| **`/store`** | `src/app/(public)/store/page.tsx` | Complete catalog of books filterable by category. |
| **`/store/[slug]`** | `src/app/(public)/store/[slug]/page.tsx` | Individual book details, reviews, specifications, purchase options. |
| **`/gallery`** | `src/app/(public)/gallery/page.tsx` | Media gallery displaying upload pictures and video reels. |
| **`/contact`** | `src/app/(public)/contact/page.tsx` | General inquiry form (powered by EmailJS) and FAQ accordions. |
| **`/auth`** | `src/app/(public)/auth/page.tsx` | Unified login & sign-up portal (redirects appropriately by role). |

---

## 🔒 Customer Account Pages (Protected)

These routes require authentication. Standard users are redirected to `/auth` if they try to access them without logging in.

| Route | File Path | Description |
| :--- | :--- | :--- |
| **`/account`** | `src/app/(public)/account/page.tsx` | Main dashboard displaying quick stats and user profile details. |
| **`/account/orders`** | `src/app/(public)/account/orders/page.tsx` | Order history tracking paid/shipped statuses of purchases. |
| **`/account/downloads`** | `src/app/(public)/account/downloads/page.tsx` | Secure digital book downloads page (with expiration and click limits). |

---

## 🛒 Stripe Checkout Redirection Pages

Stripe redirects buyers to these pages upon finishing their transactions.

| Route | File Path | Description |
| :--- | :--- | :--- |
| **`/checkout/success`** | `src/app/(public)/checkout/success/page.tsx` | Success landing showing order details after payment verification. |
| **`/checkout/cancel`** | `src/app/(public)/checkout/cancel/page.tsx` | Cancel page shown if the user cancels or payment fails at Stripe checkout. |

---

## 🛡️ Admin Dashboard Pages (Protected)

Protected pages restricted to users with the role `admin`. Unauthorized users are redirected away by the middleware.

| Route | File Path | Description |
| :--- | :--- | :--- |
| **`/admin`** (Dashboard Overview) | `src/app/admin/page.tsx` | Dashboard displaying store metrics (revenue, orders, customers). |
| **`/admin/books`** | `src/app/admin/books/page.tsx` | Master list of all books in the database. |
| **`/admin/books/new`** | `src/app/admin/books/new/page.tsx` | Editor form for adding a new book (Hardcover/Digital). |
| **`/admin/books/[id]`** | `src/app/admin/books/[id]/page.tsx` | Editor form to update details/covers/files for an existing book. |
| **`/admin/orders`** | `src/app/admin/orders/page.tsx` | Order management dashboard (lists all orders and filter by status). |
| **`/admin/orders/[id]`** | `src/app/admin/orders/[id]/page.tsx` | View individual order details and update shipment status (Shipped, Paid, etc.). |
| **`/admin/customers`** | `src/app/admin/customers/page.tsx` | Directory of registered customers, purchase count, and total spend. |
| **`/admin/messages`** | `src/app/admin/messages/page.tsx` | Review contact form submissions. |
| **`/admin/reviews`** | `src/app/admin/reviews/page.tsx` | Moderate/approve reader feedback before they display on details page. |
| **`/admin/media`** | `src/app/admin/media/page.tsx` | Media files manager to upload images/videos for the gallery page. |
| **`/admin/login`** | `src/app/admin/login/page.tsx` | Redirects automatically to `/auth`. |

---

## ⚡ API Endpoints (Serverless Actions)

Internal server routes that process logic, stripe callbacks, and secure file storage downloads.

| Route | File Path | Description |
| :--- | :--- | :--- |
| **`POST /api/checkout`** | `src/app/api/checkout/route.ts` | Generates a Stripe Checkout session. Links matching user profiles. |
| **`POST /api/webhooks/stripe`** | `src/app/api/webhooks/stripe/route.ts` | Stripe Webhook. Confirms payment, saves orders, and issues e-book tokens. |
| **`POST /api/contact`** | `src/app/api/contact/route.ts` | Saves general contact messages inside the Supabase database. |
| **`POST /api/newsletter`** | `src/app/api/newsletter/route.ts` | Subscribes users to the bookstore newsletter list. |
| **`POST /api/reviews`** | `src/app/api/reviews/route.ts` | Submits reviews for approval moderation. |
| **`GET /api/download/[token]`** | `src/app/api/download/[token]/route.ts` | Securely retrieves and downloads private PDF/ebook files from storage. |
