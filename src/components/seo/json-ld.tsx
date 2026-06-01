export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Squix Book Store",
    description:
      "Discover the heartwarming, true journey of Squix, a very special special-needs squirrel who defied all odds.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com",
    author: {
      "@type": "Person",
      name: "Trichia Raj & Amir",
      description: "Caregivers, Rescuers, and Authors of Squix The Brave Little Squirrel",
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"}/about`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"}/store?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BookJsonLd({
  title,
  description,
  isbn,
  image,
  price,
  author = "Trichia Raj & Amir",
  url,
}: {
  title: string;
  description: string;
  isbn?: string | null;
  image?: string;
  price: number;
  author?: string;
  url: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: title,
    description,
    author: {
      "@type": "Person",
      name: author,
    },
    ...(isbn && { isbn }),
    ...(image && { image }),
    url,
    offers: {
      "@type": "Offer",
      price: (price / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
