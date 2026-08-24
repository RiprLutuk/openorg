import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryDetailClient } from "@/components/story-detail-client";
import { getContent, getContents, getPublicSite } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContent(slug).catch(() => null);
  if (!item) return {};
  return {
    title: `${String(item.seo.title ?? item.title)} · Warta APTI Indonesia`,
    description: String(item.seo.description ?? item.excerpt ?? ""),
    robots: item.seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph:
      item.seo.image || item.coverUrl
        ? { images: [String(item.seo.image ?? item.coverUrl)] }
        : undefined,
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const [site, item, allItems] = await Promise.all([
    getPublicSite(),
    getContent(slug).catch(() => null),
    getContents(undefined, 20).catch(() => []),
  ]);

  if (!item) notFound();

  const relatedItems = allItems.filter((i) => i.slug !== slug);

  return (
    <StoryDetailClient item={item} relatedItems={relatedItems} site={site} />
  );
}
