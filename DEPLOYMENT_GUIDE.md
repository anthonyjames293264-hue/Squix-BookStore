# Squix Book Store — Deployment & Client Handover Guide

This guide covers everything needed to deploy the Squix Book Store to production, connect a custom domain, accept real payments, and hand the project off to a client.

---

## Step 1: Deploy to Vercel

### 1.1 Push Code to GitHub
Create a **private** GitHub repository and push:
```bash
cd author-bookstore
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/squix-bookstore.git
git push -u origin main
```

### 1.2 Create Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → import your repository
3. Framework: **Next.js** (auto-detected)
4. Add **Environment Variables** (copy from your `.env.local`):

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys → Secret key (**LIVE** key for production) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → API Keys → Publishable key (**LIVE** key) |
| `STRIPE_WEBHOOK_SECRET` | Created in Step 3 below |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS dashboard |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS dashboard (contact form template) |
| `NEXT_PUBLIC_EMAILJS_PHYSICAL_TEMPLATE_ID` | EmailJS dashboard (physical book inquiry template) |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS dashboard |
| `NEXT_PUBLIC_ADMIN_EMAIL` | The owner's email address for receiving inquiries |
| `NEXT_PUBLIC_SITE_URL` | `https://squixbooks.com` |

5. Click **Deploy**

---

## Step 2: Connect Domain (squixbooks.com)

### 2.1 In Vercel
1. Project → **Settings → Domains**
2. Add `squixbooks.com` and `www.squixbooks.com`
3. Vercel shows you the DNS records to add

### 2.2 In Hostinger
1. Log into [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Go to **Domains → squixbooks.com → DNS / Nameservers**
3. **Recommended**: Change nameservers to Vercel's:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
4. **OR** add records manually:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
5. Wait 10-30 minutes for DNS propagation
6. Vercel auto-provisions SSL — no action needed

### 2.3 Update Site URL
In Vercel → Settings → Environment Variables, set:
- `NEXT_PUBLIC_SITE_URL` = `https://squixbooks.com`
Then redeploy.

---

## Step 3: Stripe — Accept Real Payments

### 3.1 What to Ask the Client
The client needs their own **Stripe account**:
1. Go to [stripe.com](https://stripe.com) → create account
2. Complete business verification (legal name, address, bank account for payouts)
3. This must be done before accepting real payments

### 3.2 Get Live API Keys
1. In Stripe Dashboard, switch from "Test" to **"Live"** mode
2. Go to **Developers → API Keys**
3. Copy:
   - **Publishable key** (`pk_live_...`)
   - **Secret key** (`sk_live_...`)
4. Update in Vercel:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = live publishable key
   - `STRIPE_SECRET_KEY` = live secret key

### 3.3 Create Webhook (CRITICAL)
Without this, orders won't be recorded after payment.

1. Stripe Dashboard → **Developers → Webhooks**
2. Click **"Add endpoint"**
3. URL: `https://squixbooks.com/api/webhooks/stripe`
4. Events: select **`checkout.session.completed`**
5. Click **"Add endpoint"**
6. Click the endpoint → **"Reveal signing secret"**
7. Copy the secret (`whsec_...`)
8. Update in Vercel: `STRIPE_WEBHOOK_SECRET` = this secret
9. **Redeploy** the app

### 3.4 Verify It Works
1. Make a small real purchase on the live site
2. Check Stripe Dashboard → Payments
3. Check admin dashboard → Orders
4. Refund the test payment via Stripe if needed

---

## Step 4: Supabase Production Checklist

### 4.1 Storage Buckets
Ensure these buckets exist (Storage → New Bucket):
| Bucket | Purpose | Public? |
|--------|---------|---------|
| `book-covers` | Book cover images | Yes |
| `book-files` | E-book PDF files | No (uses signed URLs) |
| `gallery` | Gallery photos | Yes |
| `videos` | Gallery videos | Yes |

### 4.2 Storage Policies
Run in **Supabase → SQL Editor**:
```sql
CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO public USING (true);
```

### 4.3 Auth Settings
1. **Authentication → URL Configuration**
   - Site URL: `https://squixbooks.com`
   - Redirect URLs: add `https://squixbooks.com/**`
2. **Authentication → Settings → Email**
   - "Confirm email": OFF is simpler (users sign in immediately)

### 4.4 Verify Admin
```sql
SELECT id, email, role FROM profiles WHERE role = 'admin';

-- Fix if needed:
UPDATE profiles SET role = 'admin' WHERE email = 'the-admin@email.com';
```

---

## Step 5: EmailJS

Already configured. Client needs to know:
- Dashboard: [emailjs.com](https://emailjs.com)
- Two templates: contact form + physical book inquiry
- Free tier: 200 emails/month
- The service is connected to the receiving email

---

## Step 6: Transfer to Client

### Accounts the Client Needs
| Service | Action |
|---------|--------|
| **GitHub** | Transfer repo ownership (Settings → Danger Zone → Transfer) |
| **Vercel** | Transfer project (Settings → General → Transfer Project) |
| **Supabase** | Add as org member (Settings → Members) |
| **Stripe** | Client should own this account directly |
| **EmailJS** | Share credentials or transfer |
| **Hostinger** | Client should own the domain directly |

---

## Admin Guide (For the Client)

### Adding a Book
1. Go to `squixbooks.com/admin` → **Books → Add New**
2. Fill in title, description, price, upload cover image
3. For e-books: upload the PDF file
4. Toggle **"Published"** to make visible on the store
5. Toggle **"Featured"** to show on the home page

### Managing Orders
- **Admin → Orders** — see all orders, click for details, update status

### Managing Gallery
- **Admin → Media** — Images tab for photos, Videos tab for videos

### Managing Reviews
- **Admin → Reviews** — approve or reject customer reviews

### Changing Prices
- **Admin → Books** → Edit → update the price field

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Orders not appearing after purchase | Check Stripe Webhooks for failed deliveries. Verify `STRIPE_WEBHOOK_SECRET` matches. |
| Downloads not working | Book needs a PDF uploaded via admin. `book-files` bucket must exist. |
| Can't log in as admin | Check `profiles` table has `role = 'admin'` for the user. |
| Storage upload/delete fails | Run the storage policies SQL from Step 4.2. |
| Emails not sending | Check EmailJS quota (200/month free). Verify env vars. |

---

## Monthly Costs

| Service | Cost |
|---------|------|
| Vercel Hobby (free) or Pro | $0 – $20/mo |
| Supabase Free or Pro | $0 – $25/mo |
| Stripe | 2.9% + 30¢ per transaction |
| EmailJS Free or Basic | $0 – $9/mo |
| Hostinger domain | ~$10-15/year |
| **Total** | **~$1 – $55/mo** |
