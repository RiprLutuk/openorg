import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections";
import { getPage, getSite } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) return {};
  try {
    const page = await getPage(slug);
    return {
      title: String(page.seo.title ?? page.title),
      description: String(page.seo.description ?? page.excerpt ?? ""),
      robots: page.seo.noIndex ? { index: false, follow: false } : undefined,
      openGraph: page.seo.image
        ? { images: [String(page.seo.image)] }
        : undefined,
    };
  } catch {
    return {};
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) notFound();
  const [page, site] = await Promise.all([
    getPage(slug).catch(() => null),
    getSite(),
  ]);
  if (!page) notFound();
  return (
    <SectionRenderer
      sections={page.sections}
      organizationSlug={site.organization.slug}
    />
  );
}
