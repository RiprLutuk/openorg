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
import type { ContentItem } from "@/lib/api";

interface Props {
  item: ContentItem;
  relatedItems: ContentItem[];
  site: PublicSite;
}

export function StoryDetailClient({ item, relatedItems, site }: Props) {
  const [copied, setCopied] = useState(false);

  const publishedDate = new Date(item.publishedAt ?? item.updatedAt);
  const formattedDate = publishedDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(
    `${item.title} - Baca warta resmi APTI: ${shareUrl}`,
  );

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

            <div className="story-share-buttons">
              <span className="share-label">Bagikan:</span>
              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-icon-btn whatsapp"
                aria-label="Bagikan ke WhatsApp"
              >
                <span>WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="share-icon-btn copy"
                aria-label="Salin Tautan"
              >
                {copied ? (
                  <>
                    <Check size={13} color="#16a34a" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Article Body Section */}
      <section className="story-content-section section-space">
        <div className="wrap story-detail-two-col-grid">
          {/* Main Prose Column (70%) */}
          <div className="story-main-article-col">
            {/* Featured Image Cover */}
            {item.coverUrl && (
              <div className="story-featured-cover-wrap">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="story-main-cover-img"
                />
                <div className="cover-caption-strip">
                  <span>
                    Dokumentasi Resmi Publikasi Media & Humas APTI Indonesia
                  </span>
                </div>
              </div>
            )}

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

            {/* Author Profile Card */}
            <div className="story-author-profile-card mt-8">
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
                    {rel.coverUrl && (
                      <img
                        src={rel.coverUrl}
                        alt={rel.title}
                        className="rel-mini-thumb"
                      />
                    )}
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
