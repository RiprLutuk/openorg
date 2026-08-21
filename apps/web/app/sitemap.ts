import type { MetadataRoute } from "next";
import { getContents, getEvents, getPages } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  const [pages, posts, news, campaigns, events] = await Promise.all([
    getPages(),
    getContents("post", 100),
    getContents("news", 100),
    getContents("campaign", 100),
    getEvents(100, false),
  ]);
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/stories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/events`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/join`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/structure`, changeFrequency: "monthly", priority: 0.6 },
    ...pages
      .filter((page) => !page.isHomepage && !page.seo.noIndex)
      .map((page) => ({
        url: `${base}/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ...[...posts, ...news, ...campaigns]
      .filter((item) => !item.seo.noIndex)
      .map((item) => ({
        url: `${base}/stories/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ...events.map((event) => ({
      url: `${base}/events/${event.slug}`,
      lastModified: event.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
