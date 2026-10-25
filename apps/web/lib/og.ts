import type { Metadata } from "next";
import { absoluteUrl, site, xHandle } from "./site";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/** The default share image (app/opengraph-image.tsx). */
const DEFAULT_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "MonkStash: a private Monero web wallet" };

/**
 * Open Graph for one page. A page's own openGraph replaces the layout's instead of merging
 * with it, so every page sets the full set here: its own URL, the site name, locale and image.
 */
export function ogFor(p: { path: string; title: string; description: string; type?: "website" | "article"; image?: string }): OpenGraph {
  return {
    type: p.type ?? "website",
    title: p.title,
    description: p.description,
    url: absoluteUrl(p.path),
    siteName: site.name,
    locale: "en_US",
    images: [p.image ? { url: p.image, width: 1200, height: 630, alt: p.title } : DEFAULT_IMAGE],
  };
}

/** An article's own share image (its opengraph-image route), for og: and twitter: tags. */
export function articleShare(p: { path: string; title: string; description: string }): Pick<Metadata, "openGraph" | "twitter"> {
  const image = `${p.path}/opengraph-image`;
  return { openGraph: ogFor({ ...p, type: "article", image }), twitter: { ...twitterCard, images: [image] } };
}

/** Twitter card to match (X reads og: tags too, but an explicit image avoids a blank card). */
export const twitterCard: NonNullable<Metadata["twitter"]> = { card: "summary_large_image", site: `@${xHandle}`, images: [DEFAULT_IMAGE.url] };
