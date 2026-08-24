"use client";

import type { PublicSite } from "@openorg/contracts";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Flame,
  Globe,
  Mail,
  Newspaper,
  Radio,
  Search,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import type { ContentItem } from "@/lib/api";

interface Props {
  items: ContentItem[];
  site: PublicSite;
}

const CATEGORIES = [
  { id: "all", label: "Semua Warta" },
  { id: "news", label: "Siaran Pers & Warta" },
  { id: "post", label: "Edukasi & SOP Teknis" },
  { id: "regional", label: "Kabar Daerah (DPD)" },
  { id: "campaign", label: "Kampanye & K3" },
];

const POPULAR_STORIES = [
  {
    title:
      "Standard Operating Procedure (SOP) Vakum & Recovery Freon R32 / R410A Bebas Emisi",
    slug: "sop-vacuuming-recovery-freon-r32",
    category: "Edukasi Teknis",
    reads: "2.840",
  },
  {
    title:
      "Waspada Kebiasaan Fatal: Mengapa Uji Tekanan Sistem AC Dilarang Keras Memakai Gas Oksigen",
    slug: "larangan-uji-tekanan-sistem-ac-menggunakan-oksigen",
    category: "Keselamatan K3",
    reads: "3.420",
  },
  {
    title:
      "Mengenal Refrigeran Alami R290 (Propana): Karakteristik & Standar K3",
    slug: "mengenal-refrigeran-ramah-lingkungan-r290-propana",
    category: "Regulasi Hijau",
    reads: "1.950",
  },
  {
    title:
      "APTI Indonesia Resmikan Program Akselerasi 10.000 Teknisi AC Tersertifikasi BNSP 2026",
    slug: "apti-indonesia-target-10000-teknisi-bnsp",
    category: "Siaran Pers",
    reads: "4.120",
  },
];

export function StoriesDirectoryClient({ items, site }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featuredStory = useMemo(() => {
    return (
      items.find(
        (i) => i.slug === "apti-indonesia-target-10000-teknisi-bnsp",
      ) ?? items[0]
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory === "news" && item.type !== "news") return false;
      if (selectedCategory === "post" && item.type !== "post") return false;
      if (selectedCategory === "campaign" && item.type !== "campaign")
        return false;
      if (
        selectedCategory === "regional" &&
        !item.title.toLowerCase().includes("dpd") &&
        !item.title.toLowerCase().includes("daerah")
      )
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchExcerpt = item.excerpt?.toLowerCase().includes(q);
        const matchAuthor = item.authorName?.toLowerCase().includes(q);
        return matchTitle || matchExcerpt || matchAuthor;
      }

      return true;
    });
  }, [items, selectedCategory, searchQuery]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <div className="stories-master-suite">
      {/* 1. Master Flagship Dark Hero Banner */}
      <header className="stories-master-hero">
        <div className="wrap">
          {/* Breadcrumbs */}
          <nav className="event-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Warta & Publikasi</span>
          </nav>

          <div className="stories-hero-pill-row">
            <div className="hero-trust-pill blue">
              <Newspaper size={14} />
              <span>PUSAT INFORMASI & SIARAN PERS RESMI</span>
            </div>
            <div className="hero-trust-pill emerald">
              <Sparkles size={14} />
              <span>UPDATE REAL-TIME 2026</span>
            </div>
          </div>

          <h1 className="stories-hero-title">
            Warta Organisasi, Riset Teknis & Kebijakan Industri
          </h1>

          <p className="stories-hero-lead">
            Kanal resmi informasi Dewan Pengurus Pusat, pengumuman regulasi
            pemerintah, liputan kegiatan kepengurusan 38 provinsi, dan modul
            panduan praktis bagi teknisi tata udara di seluruh Indonesia.
          </p>

          {/* 4-Column Metric Bar */}
          <div className="stories-stats-bar">
            <div className="stat-card-clean">
              <div className="stat-clean-icon blue">
                <FileText size={18} />
              </div>
              <div>
                <strong>{items.length || 7}+ Publikasi</strong>
                <small>Artikel & Siaran Pers</small>
              </div>
            </div>

            <div className="stat-card-clean">
              <div className="stat-clean-icon emerald">
                <Globe size={18} />
              </div>
              <div>
                <strong>38 DPD Provinsi</strong>
                <small>Liputan Cabang Daerah</small>
              </div>
            </div>

            <div className="stat-card-clean">
              <div className="stat-clean-icon amber">
                <Users size={18} />
              </div>
              <div>
                <strong>12.500+ Pembaca</strong>
                <small>Teknisi & Industri HVAC</small>
              </div>
            </div>

            <div className="stat-card-clean">
              <div className="stat-clean-icon purple">
                <TrendingUp size={18} />
              </div>
              <div>
                <strong>Riset & SOP</strong>
                <small>Standar K3 & SKKNI BNSP</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Featured Headline Banner (Pilihan Redaksi) */}
      {featuredStory && (
        <section className="featured-story-section section-space-sm">
          <div className="wrap">
            <div className="featured-headline-card">
              <div className="featured-cover-box">
                <img
                  src={
                    featuredStory.coverUrl ??
                    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={featuredStory.title}
                  className="featured-img"
                />
                <div className="featured-overlay-badge">
                  <Flame size={14} color="#f59e0b" />
                  <span>PILIHAN REDAKSI</span>
                </div>
              </div>

              <div className="featured-details-box">
                <div className="featured-meta-row">
                  <span className="story-category-tag">
                    {featuredStory.type === "news"
                      ? "Siaran Pers"
                      : "Edukasi Teknis"}
                  </span>
                  <span className="story-read-time">
                    <Clock size={13} />
                    <span>5 Menit Baca</span>
                  </span>
                  <span className="story-date-text">
                    <Calendar size={13} />
                    <span>
                      {new Date(
                        featuredStory.publishedAt ?? featuredStory.updatedAt,
                      ).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                </div>

                <h2 className="featured-title">
                  <Link href={`/stories/${featuredStory.slug}`}>
                    {featuredStory.title}
                  </Link>
                </h2>

                <p className="featured-excerpt">{featuredStory.excerpt}</p>

                <div className="featured-footer-row">
                  <div className="featured-author-info">
                    <div className="author-avatar-sm">
                      <User size={14} />
                    </div>
                    <span>
                      {featuredStory.authorName ?? "Dewan Redaksi DPP APTI"}
                    </span>
                  </div>

                  <Link
                    href={`/stories/${featuredStory.slug}`}
                    className="button primary btn-read-featured"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Main Body & Two-Column Grid */}
      <section className="stories-main-feed section-space">
        <div className="wrap stories-layout-grid">
          {/* Left Column: Toolbar Filter & Article Cards (68%) */}
          <div className="stories-feed-col">
            {/* Filter Toolbar (Swiss Design) */}
            <div className="stories-toolbar-card">
              <div className="stories-filter-pills">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`filter-pill-btn ${selectedCategory === cat.id ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="stories-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Cari warta, topik K3, atau penulis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Articles Grid */}
            {filteredItems.length > 0 ? (
              <div className="stories-cards-flow">
                {filteredItems.map((item) => (
                  <article key={item.id} className="story-modern-card">
                    <Link
                      href={`/stories/${item.slug}`}
                      className="story-card-cover-link"
                    >
                      <img
                        src={
                          item.coverUrl ??
                          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={item.title}
                        className="story-thumb-img"
                      />
                      <span className="story-thumb-badge">
                        {item.type === "news"
                          ? "Berita"
                          : item.type === "post"
                            ? "Artikel Teknis"
                            : "Siaran Pers"}
                      </span>
                    </Link>

                    <div className="story-card-content">
                      <div className="story-card-meta">
                        <span className="meta-date">
                          {new Date(
                            item.publishedAt ?? item.updatedAt,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="meta-sep">•</span>
                        <span className="meta-author">
                          {item.authorName ?? "Redaksi APTI"}
                        </span>
                      </div>

                      <h3 className="story-card-title">
                        <Link href={`/stories/${item.slug}`}>{item.title}</Link>
                      </h3>

                      <p className="story-card-excerpt">{item.excerpt}</p>

                      <div className="story-card-footer">
                        <Link
                          href={`/stories/${item.slug}`}
                          className="story-inline-link"
                        >
                          <span>Baca Artikel</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="stories-empty-box">
                <Newspaper size={44} color="#94a3b8" />
                <h3>Tidak ada artikel yang cocok</h3>
                <p>
                  Coba gunakan kata kunci pencarian lain atau pilih kategori
                  Semua Warta.
                </p>
                <button
                  type="button"
                  className="button secondary mt-4"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Rail (32%) */}
          <aside className="stories-sidebar-col">
            {/* 1. Trending Articles Card */}
            <div className="sidebar-widget-card">
              <div className="widget-header-row">
                <TrendingUp size={16} color="#0284c7" />
                <h3>Topik Hangat & Populer</h3>
              </div>
              <div className="popular-list">
                {POPULAR_STORIES.map((pop, idx) => (
                  <Link
                    key={pop.slug}
                    href={`/stories/${pop.slug}`}
                    className="popular-item-link"
                  >
                    <span className="pop-rank-num">0{idx + 1}</span>
                    <div className="pop-body">
                      <span className="pop-category">{pop.category}</span>
                      <h4>{pop.title}</h4>
                      <small>
                        <Eye size={11} /> {pop.reads} pembaca
                      </small>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 2. Newsletter Subscription Card */}
            <div className="sidebar-widget-card newsletter-gradient-card">
              <div className="widget-header-row">
                <Mail size={16} color="#0284c7" />
                <h3>Buletin Warta Mingguan</h3>
              </div>
              <p className="widget-desc">
                Dapatkan rangkuman regulasi freon, info uji kompetensi BNSP, dan
                tips servis AC langsung ke email Anda setiap hari Senin.
              </p>

              {subscribed ? (
                <div className="newsletter-success-alert">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>
                    Terima kasih! Anda telah terdaftar di buletin warta.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Masukkan alamat email Anda..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="button primary btn-subscribe"
                  >
                    <Send size={14} />
                    <span>Langganan Gratis</span>
                  </button>
                </form>
              )}
            </div>

            {/* 3. Media Center & Press Kit */}
            <div className="sidebar-widget-card">
              <div className="widget-header-row">
                <BookOpen size={16} color="#16a34a" />
                <h3>Kontak Redaksi & Media Kit</h3>
              </div>
              <p className="widget-desc">
                Informasi bagi jurnalis, prinsipal mitra, dan perwakilan DPD
                yang ingin mengirimkan rilis warta atau undangan liputan.
              </p>
              <div className="press-links-stack">
                <a
                  href="mailto:redaksi@apti.or.id"
                  className="press-action-link"
                >
                  <Mail size={14} />
                  <span>Kirim Siaran Pers (redaksi@apti.or.id)</span>
                </a>
                <button
                  type="button"
                  className="press-action-link"
                  onClick={() =>
                    alert("Mengunduh Paket Brand Guidelines & Logo Resmi...")
                  }
                >
                  <Download size={14} />
                  <span>Unduh Media Kit & Logo Resmi (ZIP)</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 4. Bottom Dynamic CTA */}
      <DynamicBottomCta
        organizationName={site.organization.name}
        guestTitle="Ingin Publikasi Kegiatan DPD / Klub AC Anda?"
        guestDescription="Kirimkan liputan kegiatan musda, baksos, dan pelatihan sertifikasi cabang Anda untuk dipublikasikan di kanal warta nasional."
        guestPrimaryCta={{ label: "Kirim Warta Kegiatan", href: "/join" }}
        guestSecondaryCta={{
          label: "Lihat Jadwal Agenda",
          href: "/events",
        }}
        memberTitle="Akses Seluruh Modul Teknis & Arsip Surat Edaran"
        memberDescription="Sebagai anggota terdaftar KTA, Anda memiliki akses penuh ke dokumen internal dan bank pengetahuan asosiasi."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{
          label: "Lihat Regulasi Resmi",
          href: "/regulations",
        }}
      />
    </div>
  );
}
