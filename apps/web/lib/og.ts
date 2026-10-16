import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/** The default share image (app/opengraph-image.tsx). */
const DEFAULT_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "MonkStash: a private Monero web wallet" };

/**
 * Open Graph for one page. A page's own openGraph replaces the layout's instead of merging
 * with it, so every page sets the full set here: its own URL, the site name, locale and image.
 */
export function ogFor(p: { path: string; title: string; description: string; type?: "website" | "article" }): OpenGraph {
  return {
    type: p.type ?? "website",
    title: p.title,
    description: p.description,
    url: absoluteUrl(p.path),
    siteName: site.name,
    locale: "en_US",
    images: [DEFAULT_IMAGE],
  };
}

/** Twitter card to match (X reads og: tags too, but an explicit image avoids a blank card). */
export const twitterCard: NonNullable<Metadata["twitter"]> = { card: "summary_large_image", images: [DEFAULT_IMAGE.url] };
