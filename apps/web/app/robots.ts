import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", // /wallet and /pay stay crawlable so crawlers can see their noindex; a blocked page can still be
    // indexed as a bare URL from links.
    disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
