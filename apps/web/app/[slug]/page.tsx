import type { Metadata } from "next";
import { ogFor } from "@/lib/og";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { getArticles, getRootArticle } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

// Flat article URLs (/<slug>). Static routes such as /about or /faq take precedence over
// this dynamic segment, and only registered article slugs are generated.
export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles().filter((a) => a.section !== "wallets").map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const mod = getRootArticle(slug);
  if (!mod) return {};
  const path = `/${slug}`;
  return {
    title: mod.meta.seoTitle ?? mod.meta.title,
    description: mod.meta.summary,
    alternates: { canonical: path },
    openGraph: ogFor({ type: "article", title: mod.meta.title, description: mod.meta.summary, path: path }),
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getRootArticle(slug);
  if (!mod) notFound();
  return <ArticleLayout module={mod} />;
}
