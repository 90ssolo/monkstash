import { absoluteUrl } from "@/lib/site";
import type { PlatformData } from "./types";

export const MODIFIED = "2026-10-15";

/** Article + BreadcrumbList + FAQPage, built from the same data the page renders. */
export function platformJsonLd(d: PlatformData) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: d.article.headline,
      description: d.article.description,
      mainEntityOfPage: absoluteUrl(d.path),
      dateModified: MODIFIED,
      author: { "@type": "Organization", name: "MonkStash" }, publisher: { "@type": "Organization", name: "MonkStash" }, image: absoluteUrl("/opengraph-image"),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Monero wallets", item: absoluteUrl("/monero-wallets") },
        { "@type": "ListItem", position: 3, name: d.label, item: absoluteUrl(d.path) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: d.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
}
