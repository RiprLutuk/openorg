import type { PageSection, PublicSite } from "@openorg/contracts";
import { headers } from "next/headers";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export type PublicPage = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  sections: PageSection[];
  seo: Record<string, unknown>;
  updatedAt: string;
};
export type PublicPageSummary = Pick<
  PublicPage,
  "title" | "slug" | "excerpt" | "seo" | "updatedAt"
> & { isHomepage: boolean };
export type ContentItem = {
  id: string;
  title: string;
  slug: string;
  type: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  authorName: string | null;
  sourceUrl: string | null;
  seo: Record<string, unknown>;
  publishedAt: string | null;
  updatedAt: string;
};
export type EventItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  locationName: string | null;
  address: string | null;
  meetingUrl: string | null;
  registrationUrl: string | null;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  capacity: number | null;
  publishedAt: string | null;
  updatedAt: string;
};
export type PublicStructure = {
  units: Array<{
    id: string;
    parentId: string | null;
    name: string;
    type: string;
    description: string | null;
    sortOrder: number;
  }>;
  positions: Array<{
    id: string;
    unitId: string | null;
    parentId: string | null;
    title: string;
    description: string | null;
    sortOrder: number;
  }>;
  assignments: Array<{
    assignment: {
      id: string;
      positionId: string;
      startsAt: string | null;
      endsAt: string | null;
      isPrimary: boolean;
    };
    member: {
      id: string;
      name: string;
      avatarUrl: string | null;
      memberNumber: string;
    };
  }>;
};

async function tenant() {
  const incoming = await headers();
  const hostname = incoming.get("host")?.split(":")[0] ?? "localhost";
  return hostname === "localhost" || hostname === "127.0.0.1"
    ? (process.env.DEFAULT_ORGANIZATION_SLUG ?? "demo")
    : hostname;
}

export async function publicApi<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const organization = await tenant();
  const response = await fetch(`${API_URL}/v1/public${path}`, {
    ...options,
    headers: { "X-Organization": organization, ...options?.headers },
    next: { revalidate: 60, tags: [`organization:${organization}`] },
  });
  if (!response.ok)
    throw new Error(`Public API request failed (${response.status})`);
  const envelope = await response.json();
  return envelope.data as T;
}

export const getSite = () => publicApi<PublicSite>("/site");
export const getHomepage = () => publicApi<PublicPage>("/pages/home");
export const getPages = () => publicApi<PublicPageSummary[]>("/pages");
export const getPage = (slug: string) =>
  publicApi<PublicPage>(`/pages/${encodeURIComponent(slug)}`);
export const getContents = (type = "post", limit = 6) =>
  publicApi<ContentItem[]>(`/contents?type=${type}&limit=${limit}`);
export const getContent = (slug: string) =>
  publicApi<ContentItem>(`/contents/${encodeURIComponent(slug)}`);
export const getEvents = (limit = 6, upcoming = true) =>
  publicApi<EventItem[]>(`/events?limit=${limit}&upcoming=${upcoming}`);
export const getEvent = (slug: string) =>
  publicApi<EventItem>(`/events/${encodeURIComponent(slug)}`);
export const getStructure = () => publicApi<PublicStructure>("/structure");
