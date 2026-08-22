import type { PageSection, PublicSite } from "@openorg/contracts";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000";

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

const DEFAULT_SITE: PublicSite = {
  organization: {
    id: "default",
    name: "OpenOrg Association",
    slug: "openorg",
    kind: "association",
    tagline: "Platform Resmi Organisasi",
    description:
      "Platform terpadu keanggotaan, tata kelola organisasi, kredit akademi SKP/CPD, dan verifikasi kredensial.",
    logoUrl: null,
    faviconUrl: null,
    locale: "id-ID",
    theme: {
      colors: {
        primary: "#182230",
        secondary: "#344054",
        accent: "#f97066",
        surface: "#f8fafc",
        foreground: "#101828",
      },
      radius: "medium",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
  },
  navigation: [
    { id: "events", label: "Agenda", href: "/events", children: [] },
    { id: "structure", label: "Struktur", href: "/structure", children: [] },
    {
      id: "verify",
      label: "Verifikasi Kredensial",
      href: "/verify",
      children: [],
    },
  ],
  footer: { links: [] },
  announcement: null,
  quickContact: null,
};

export async function publicApi<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}/v1/public${path}`, {
      ...options,
      headers: { ...options?.headers },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 60 },
    });
    if (!response.ok)
      throw new Error(`Public API request failed (${response.status})`);
    const envelope = await response.json();
    return envelope.data as T;
  } catch (error) {
    if (path === "/site") return DEFAULT_SITE as T;
    if (path === "/pages/home")
      return {
        id: "home",
        title: "OpenOrg Association",
        slug: "home",
        excerpt: "Platform Resmi Organisasi",
        sections: [],
        seo: {},
        updatedAt: new Date().toISOString(),
      } as T;
    if (path.startsWith("/pages")) return [] as T;
    if (path.startsWith("/contents")) return [] as T;
    if (path.startsWith("/events")) return [] as T;
    if (path === "/structure")
      return { units: [], positions: [], assignments: [] } as T;
    throw error;
  }
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
