import type { Metadata } from "next";
import { ogFor } from "@/lib/og";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { getArticle, getArticles } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles().filter((a) => a.section === "wallets").map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const mod = getArticle("wallets", slug);
  if (!mod) return {};
  const path = `/monero-wallets/${slug}`;
  return {
    title: mod.meta.seoTitle ?? mod.meta.title,
    description: mod.meta.summary,
    alternates: { canonical: path },
    openGraph: ogFor({ type: "article", title: mod.meta.title, description: mod.meta.summary, path: path }),
  };
}

export default async function WalletReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getArticle("wallets", slug);
  if (!mod) notFound();
  return <ArticleLayout module={mod} />;
}
