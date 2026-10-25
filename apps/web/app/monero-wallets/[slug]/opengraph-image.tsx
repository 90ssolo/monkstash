import { brandedOgImage, ogContentType, ogSize } from "@/components/og/BrandedOgImage";
import { getArticle, getArticles } from "@/lib/content";

// Each article shares with its own title and summary instead of the site-wide image.
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "MonkStash Monero guide";

export function generateStaticParams() {
  return getArticles().filter((a) => a.section === "wallets").map((a) => ({ slug: a.slug }));
}

export default async function ArticleOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getArticle("wallets", slug)?.meta;
  return brandedOgImage({ headline: meta?.title ?? "MonkStash", sub: meta?.summary ?? "", kicker: meta?.kicker, footer: "Free Monero guides and wallet" });
}
