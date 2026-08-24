import type { Metadata } from "next";
import { StoriesDirectoryClient } from "@/components/stories-directory-client";
import { getContents, getPublicSite } from "@/lib/api";

export const metadata: Metadata = {
  title: "Warta, Berita & Publikasi Teknis · APTI Indonesia",
  description:
    "Kabar resmi, siaran pers, artikel riset tata udara, standar K3, dan warta kegiatan kepengurusan asosiasi di seluruh Indonesia.",
};

export default async function StoriesPage() {
  const [site, items] = await Promise.all([
    getPublicSite(),
    getContents(undefined, 100).catch(() => []),
  ]);

  const sortedItems = [...items].sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.updatedAt).getTime() -
      new Date(a.publishedAt ?? a.updatedAt).getTime(),
  );

  return <StoriesDirectoryClient items={sortedItems} site={site} />;
}
