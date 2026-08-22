import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Toaster } from "sonner";
import { CampaignAnnouncement } from "@/components/campaign-announcement";
import { Footer, Header } from "@/components/site-chrome";
import { getSite } from "@/lib/api";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: {
      default: site.organization.name,
      template: `%s · ${site.organization.name}`,
    },
    description:
      site.organization.description ?? site.organization.tagline ?? undefined,
    icons: site.organization.faviconUrl
      ? { icon: site.organization.faviconUrl }
      : undefined,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    openGraph: {
      type: "website",
      siteName: site.organization.name,
      title: site.organization.name,
      description: site.organization.description ?? undefined,
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const site = await getSite();
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: site.organization.theme.colors.primary,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const site = await getSite();
  const isPill = site.organization.theme.radius === "pill";
  const isNone = site.organization.theme.radius === "none";
  const baseRadius = isPill
    ? "9999px"
    : site.organization.theme.radius === "large"
      ? "18px"
      : site.organization.theme.radius === "medium"
        ? "12px"
        : site.organization.theme.radius === "small"
          ? "6px"
          : "0px";

  const variables = {
    "--color-primary": site.organization.theme.colors.primary,
    "--color-secondary": site.organization.theme.colors.secondary,
    "--color-accent": site.organization.theme.colors.accent,
    "--color-surface": site.organization.theme.colors.surface,
    "--color-foreground": site.organization.theme.colors.foreground,
    "--font-heading": site.organization.theme.fontHeading,
    "--font-body": site.organization.theme.fontBody,
    "--radius": baseRadius,
    "--radius-sm": isNone ? "0px" : isPill ? "9999px" : "6px",
    "--radius-md": isNone ? "0px" : isPill ? "9999px" : "10px",
    "--radius-lg": isNone ? "0px" : isPill ? "9999px" : "16px",
  } as CSSProperties;
  return (
    <html lang={site.organization.locale.split("-")[0]}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Roboto:wght@400;500;700&display=swap"
        />
      </head>
      <body style={variables}>
        <Toaster richColors position="top-right" closeButton />
        <a className="skip-link" href="#main">
          Langsung ke konten
        </a>
        <Header site={site} />
        <CampaignAnnouncement
          organizationId={site.organization.id}
          announcement={site.announcement}
        />
        <main id="main">{children}</main>
        <Footer site={site} />
      </body>
    </html>
  );
}
