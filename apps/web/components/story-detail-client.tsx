"use client";

import type { PublicSite } from "@openorg/contracts";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Mail,
  Newspaper,
  Share2,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { SmartImage } from "@/components/smart-image";
import type { ContentItem } from "@/lib/api";

interface Props {
  item: ContentItem;
  relatedItems: ContentItem[];
  site: PublicSite;
}

function SocialShareSuite({
  title,
  slug,
  variant = "hero",
}: {
  title: string;
  slug: string;
  variant?: "hero" | "article-footer";
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = (channelId: string) => {
    if (typeof window === "undefined") return;

    const shareUrl = `${window.location.origin}/stories/${slug}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const shareText = encodeURIComponent(
      `${title} — Baca warta resmi di: ${shareUrl}`,
    );

    let targetUrl = "";
    switch (channelId) {
      case "whatsapp":
        targetUrl = `https://api.whatsapp.com/send?text=${shareText}`;
        break;
      case "threads":
        targetUrl = `https://threads.net/intent/post?text=${shareText}`;
        break;
      case "twitter":
        targetUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case "telegram":
        targetUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "linkedin":
        targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "facebook":
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }

    if (targetUrl) {
      window.open(
        targetUrl,
        "_blank",
        "noopener,noreferrer,width=600,height=600",
      );
    }
  };

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/stories/${slug}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const channels = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      className: "share-btn-wa",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.13c-.24.67-1.39 1.28-1.92 1.36-.51.08-1.16.11-3.69-.93-2.9-1.2-4.78-4.14-4.93-4.33-.14-.2-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.19.01.44-.07.69.52.26.62.88 2.14.96 2.3.08.16.13.35.03.56-.11.2-.16.33-.32.52-.16.19-.34.42-.49.56-.16.16-.33.34-.14.66.19.33.86 1.42 1.84 2.3 1.27 1.13 2.34 1.48 2.67 1.65.33.16.52.14.71-.08.2-.22.84-.98 1.07-1.32.22-.33.45-.28.76-.16.31.11 1.97.93 2.31 1.1.34.16.57.24.65.38.08.14.08.82-.16 1.49z" />
        </svg>
      ),
    },
    {
      id: "threads",
      name: "Threads",
      className: "share-btn-threads",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.094 5.467 0 12.186 0c6.643 0 12.036 5.31 12.183 11.95v.065c-.01 2.213-.674 4.385-1.92 6.28-1.55 2.355-3.882 3.96-6.565 4.52-1.026.213-2.073.23-3.111.05-2.05-.357-3.765-1.564-4.831-3.4-.047-.08-.09-.163-.131-.247l2.253-1.458c.03.06.06.12.093.178.746 1.278 1.92 2.11 3.308 2.345.71.12 1.425.105 2.127-.042 1.91-.398 3.56-1.54 4.65-3.213.916-1.393 1.405-2.99 1.416-4.63-.122-4.996-4.225-9.014-9.33-9.014-5.187 0-9.406 4.22-9.406 9.406 0 5.188 4.22 9.407 9.406 9.407 2.45 0 4.79-.92 6.58-2.58l1.83 1.83C17.84 23.01 15.08 24 12.186 24zm2.846-9.155c-.053-.027-.105-.056-.157-.088-1.09-.672-1.782-1.84-1.85-3.12-.03-.54.06-1.08.27-1.58.37-.89 1.08-1.57 1.99-1.91.46-.17.95-.24 1.45-.2 1.15.08 2.18.72 2.76 1.71.5.86.68 1.86.52 2.85-.2 1.26-.95 2.34-2.06 2.95-.29.16-.6.28-.92.35v.028zm.052-4.305c-.32.02-.63.14-.88.35-.35.3-.54.74-.52 1.2.02.48.24.91.6 1.18.27.2.6.29.93.26.54-.05 1-.36 1.25-.85.16-.31.21-.67.15-1.02-.09-.59-.53-1.06-1.12-1.12h-.41z" />
        </svg>
      ),
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      className: "share-btn-x",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      id: "telegram",
      name: "Telegram",
      className: "share-btn-telegram",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
      ),
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      className: "share-btn-linkedin",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75a1.75 1.75 0 0 1 1.75 1.75c0 .97-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
        </svg>
      ),
    },
    {
      id: "facebook",
      name: "Facebook",
      className: "share-btn-fb",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`social-share-suite-wrap ${variant}`}>
      {variant === "hero" && (
        <span className="share-suite-label">
          <Share2 size={12} />
          <span>Bagikan:</span>
        </span>
      )}

      <div className="share-buttons-flow">
        {channels.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => handleShare(ch.id)}
            className={`share-icon-circle-btn ${ch.className}`}
            title={`Bagikan ke ${ch.name}`}
            aria-label={`Bagikan ke ${ch.name}`}
          >
            {ch.icon}
          </button>
        ))}

        <button
          type="button"
          onClick={handleCopy}
          className={`share-icon-circle-btn share-btn-copy ${copied ? "copied" : ""}`}
          title={copied ? "Tautan Berhasil Disalin!" : "Salin Tautan Artikel"}
          aria-label="Salin Tautan Artikel"
        >
          {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
        </button>

        {copied && <span className="copy-toast-inline">Tautan tersalin!</span>}
      </div>
    </div>
  );
}

export function StoryDetailClient({ item, relatedItems, site }: Props) {
  const publishedDate = new Date(item.publishedAt ?? item.updatedAt);
  const formattedDate = publishedDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="story-detail-page-suite">
      {/* 1. Article Hero Header */}
      <header className="story-detail-hero">
        <div className="wrap">
          {/* Breadcrumbs */}
          <nav className="event-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <span className="crumb-sep">/</span>
            <Link href="/stories">Warta & Publikasi</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{item.title}</span>
          </nav>

          <div className="story-detail-badge-row">
            <span className="story-category-tag primary">
              {item.type === "news"
                ? "Siaran Pers Resmi"
                : item.type === "post"
                  ? "Edukasi & SOP Teknis"
                  : "Warta Organisasi"}
            </span>
            <div className="story-read-meta">
              <Clock size={13} />
              <span>4 Menit Waktu Baca</span>
            </div>
            <div className="story-read-meta">
              <Eye size={13} />
              <span>1.420 Pembaca</span>
            </div>
          </div>

          <h1 className="story-detail-title">{item.title}</h1>

          {item.excerpt && <p className="story-detail-lead">{item.excerpt}</p>}

          {/* Author Byline & Social Share Row */}
          <div className="story-author-share-bar">
            <div className="story-author-meta">
              <div className="author-circle-avatar">
                <User size={18} />
              </div>
              <div className="author-names">
                <strong>{item.authorName ?? "Dewan Redaksi DPP APTI"}</strong>
                <small>Dipublikasikan pada {formattedDate}</small>
              </div>
            </div>

            <SocialShareSuite
              title={item.title}
              slug={item.slug}
              variant="hero"
            />
          </div>
        </div>
      </header>

      {/* 2. Main Article Body Section */}
      <section className="story-content-section section-space">
        <div className="wrap story-detail-two-col-grid">
          {/* Main Prose Column (70%) */}
          <div className="story-main-article-col">
            {/* Featured Image Cover */}
            <div className="story-featured-cover-wrap">
              <SmartImage
                src={item.coverUrl}
                alt={item.title}
                className="story-main-cover-img"
                fallbackType={item.type === "post" ? "tech" : "news"}
              />
              <div className="cover-caption-strip">
                <span>
                  Dokumentasi Resmi Publikasi Media & Humas APTI Indonesia
                </span>
              </div>
            </div>

            {/* Key Takeaways Callout Box */}
            <div className="story-takeaways-box">
              <div className="takeaways-header">
                <Sparkles size={16} color="#0284c7" />
                <strong>Poin Intisari Artikel</strong>
              </div>
              <ul>
                <li>
                  Standar kompetensi resmi berlandaskan SKKNI dan pengawasan
                  Badan Nasional Sertifikasi Profesi (BNSP).
                </li>
                <li>
                  Penggunaan toolkit bersertifikasi K3 (Manifold Digital, Pompa
                  Vakum 2-Stage & Gas Nitrogen Murni).
                </li>
                <li>
                  Perlindungan hak konsumen dan integritas teknisi melalui
                  verifikasi KTA Digital QR Code.
                </li>
              </ul>
            </div>

            {/* Full Body Content */}
            <div
              className="story-prose-content"
              dangerouslySetInnerHTML={{ __html: item.body }}
            />

            {item.sourceUrl && (
              <div className="story-source-card mt-6">
                <FileText size={18} color="#0284c7" />
                <div>
                  <strong>Sumber Referensi Eksternal:</strong>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="source-external-link"
                  >
                    <span>{item.sourceUrl}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            )}

            {/* Bottom Article Social Share Box */}
            <div className="story-bottom-share-box mt-6">
              <div className="bottom-share-header">
                <Share2 size={16} color="#0284c7" />
                <strong>
                  Bagikan Warta Ini ke Rekan Teknisi & Grup Komunitas
                </strong>
              </div>
              <p>
                Bantu sebarkan informasi regulasi, standar keselamatan K3, dan
                pengetahuan teknis ke jejaring profesional Anda.
              </p>
              <SocialShareSuite
                title={item.title}
                slug={item.slug}
                variant="article-footer"
              />
            </div>

            {/* Author Profile Card */}
            <div className="story-author-profile-card mt-6">
              <div className="author-card-avatar">
                <Users size={32} color="#0284c7" />
              </div>
              <div className="author-card-bio">
                <span className="bio-tag">Dewan Redaksi & Humas</span>
                <h3>
                  {item.authorName ?? "Biro Publikasi & Litbang DPP APTI"}
                </h3>
                <p>
                  Mengawal standarisasi industri tata udara dan refrigerasi
                  nasional, menyajikan riset terkini, panduan K3, serta regulasi
                  ramah lingkungan untuk memajukan ribuan teknisi di seluruh
                  pelosok Indonesia.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Column (30%) */}
          <aside className="story-detail-sidebar-col">
            {/* Related Articles Widget */}
            <div className="sidebar-widget-card">
              <div className="widget-header-row">
                <Newspaper size={16} color="#0284c7" />
                <h3>Warta Terkait Lainnya</h3>
              </div>
              <div className="related-stories-list">
                {relatedItems.slice(0, 4).map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/stories/${rel.slug}`}
                    className="related-story-mini-card"
                  >
                    <SmartImage
                      src={rel.coverUrl}
                      alt={rel.title}
                      className="rel-mini-thumb"
                      fallbackType={rel.type === "post" ? "tech" : "news"}
                      aspectRatio="1/1"
                    />
                    <div className="rel-mini-info">
                      <span className="rel-mini-date">
                        {new Date(
                          rel.publishedAt ?? rel.updatedAt,
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <h4>{rel.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Action: Join Member KTA */}
            <div className="sidebar-widget-card cta-accent-card">
              <div className="widget-header-row">
                <Sparkles size={16} color="#16a34a" />
                <h3>Gabung Teknisi Terverifikasi</h3>
              </div>
              <p className="widget-desc">
                Dapatkan akses gratis modul teknis, sertifikat BNSP, dan KTA
                Digital resmi dengan mendaftar sebagai anggota APTI.
              </p>
              <Link href="/join" className="button primary btn-full-width">
                <span>Daftar Anggota KTA</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* 3. Bottom Dynamic CTA */}
      <DynamicBottomCta
        organizationName={site.organization.name}
        guestTitle="Ingin Mengikuti Kabar & Pelatihan Teknisi Terbaru?"
        guestDescription="Bergabunglah bersama komunitas praktisi HVAC/R terbesar di Indonesia dan ikuti sertifikasi kompetensi resmi."
        guestPrimaryCta={{ label: "Lihat Semua Warta", href: "/stories" }}
        guestSecondaryCta={{
          label: "Daftar Anggota KTA",
          href: "/join",
        }}
        memberTitle="Poin SKP Terintegrasi dengan Akun KTA Anda"
        memberDescription="Setelah menyelesaikan workshop, poin SKP dan e-sertifikat akan otomatis masuk ke dalam riwayat kredensial Anda."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{ label: "Verifikasi Kredensial", href: "/verify" }}
      />
    </article>
  );
}
