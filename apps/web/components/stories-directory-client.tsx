"use client";

import type { PublicSite } from "@openorg/contracts";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
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
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { SmartImage } from "@/components/smart-image";
import type { ContentItem } from "@/lib/api";

interface Props {
  items: ContentItem[];
  site: PublicSite;
}

const ITEMS_PER_PAGE = 6;

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
  const [currentPage, setCurrentPage] = useState(1);
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

  // Determine whether the large featured banner is currently active at top
  const isFeaturedBannerVisible =
    !searchQuery.trim() &&
    selectedCategory === "all" &&
    currentPage === 1 &&
    Boolean(featuredStory);

  // Exclude the featured story from the catalog grid to prevent duplicate content
  const catalogItems = useMemo(() => {
    if (isFeaturedBannerVisible && featuredStory) {
      return filteredItems.filter(
        (i) => i.id !== featuredStory.id && i.slug !== featuredStory.slug,
      );
    }
    return filteredItems;
  }, [filteredItems, isFeaturedBannerVisible, featuredStory]);

  const totalPages = Math.ceil(catalogItems.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, catalogItems.length);
  const paginatedItems = catalogItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const feedElement = document.getElementById("stories-feed-anchor");
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <div className="stories-page-suite">
      {/* 1. Flagship 2-Column Split Hero Header */}
      <header className="tech-hero">
        <div className="wrap hero-split-grid">
          <div className="tech-hero-inner">
            <div className="tech-hero-pill">
              <Newspaper size={14} />
              <span>PUSAT WARTA & PUBLIKASI RESMI</span>
            </div>

            <h1 className="tech-hero-title">
              Warta Organisasi, Riset Teknis &{" "}
              <span className="text-gradient">Kebijakan Industri</span>
            </h1>

            <p className="tech-hero-lead">
              Kanal resmi informasi Dewan Pengurus Pusat, pengumuman regulasi
              pemerintah, liputan kegiatan kepengurusan 38 provinsi, dan modul
              panduan praktis bagi teknisi tata udara di seluruh Indonesia.
            </p>
          </div>

          {/* Right Column: Hero Metrics Bento Card */}
          <div className="hero-stats-bento-card">
            <div className="stats-card-header">
              <span className="stats-card-badge">Pusat Publikasi & Riset</span>
              <span className="stats-card-status">● Realtime Update</span>
            </div>
            <div className="stats-card-grid">
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#f0f9ff", color: "#0284c7" }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <strong>{items.length || 7}+ Publikasi</strong>
                  <small>Siaran Pers & Warta</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#ecfdf5", color: "#10b981" }}
                >
                  <Globe size={20} />
                </div>
                <div>
                  <strong>38 Provinsi</strong>
                  <small>Kabar DPD Daerah</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#fffbeb", color: "#f59e0b" }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <strong>12.500+ Pembaca</strong>
                  <small>Praktisi & Industri</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#eef2ff", color: "#6366f1" }}
                >
                  <TrendingUp size={20} />
                </div>
                <div>
                  <strong>Standar K3</strong>
                  <small>Modul BNSP</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="tech-body section-space">
        <div className="wrap">
          <div id="stories-feed-anchor" className="directory-controls-row">
            <div className="directory-cat-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`dir-cat-btn ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="dir-search-wrap">
              <Search size={16} />
              <input
                id="stories-search-query"
                name="storiesSearchQuery"
                type="text"
                placeholder="Cari warta, topik K3, atau penulis..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Cari warta dan publikasi"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => handleSearchChange("")}
                  aria-label="Bersihkan pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {isFeaturedBannerVisible && featuredStory && (
            <div className="featured-headline-card">
              <div className="featured-cover-box">
                <SmartImage
                  src={featuredStory.coverUrl}
                  alt={featuredStory.title}
                  className="featured-img"
                  fallbackType={featuredStory.type === "post" ? "tech" : "news"}
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
          )}

          {paginatedItems.length > 0 ? (
            <>
              <div className="stories-catalog-grid">
                {paginatedItems.map((item) => (
                  <article key={item.id} className="story-modern-card">
                    <Link
                      href={`/stories/${item.slug}`}
                      className="story-card-cover-link"
                    >
                      <SmartImage
                        src={item.coverUrl}
                        alt={item.title}
                        className="story-thumb-img"
                        fallbackType={item.type === "post" ? "tech" : "news"}
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

              {/* Numbered Pagination Toolbar */}
              {totalPages > 1 && (
                <div className="stories-pagination-bar">
                  <div className="pagination-info">
                    <span>
                      Menampilkan{" "}
                      <strong>
                        {startIndex + 1} - {endIndex}
                      </strong>{" "}
                      dari <strong>{catalogItems.length}</strong> Warta Resmi
                    </span>
                  </div>
                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="page-nav-btn"
                      disabled={safeCurrentPage === 1}
                      onClick={() => handlePageChange(safeCurrentPage - 1)}
                    >
                      <ChevronLeft size={14} />
                      <span>Sebelumnya</span>
                    </button>

                    <div className="page-numbers-group">
                      {Array.from(
                        { length: totalPages },
                        (_, idx) => idx + 1,
                      ).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          className={`page-num-btn ${
                            pageNum === safeCurrentPage ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="page-nav-btn"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => handlePageChange(safeCurrentPage + 1)}
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="stories-empty-box">
              <Newspaper size={44} color="#94a3b8" />
              <h3>Tidak ada artikel yang cocok</h3>
              <p>
                Coba gunakan kata kunci pencarian lain atau pilih kategori Semua
                Warta.
              </p>
              <button
                type="button"
                className="button secondary mt-4"
                onClick={() => {
                  handleCategorySelect("all");
                  handleSearchChange("");
                }}
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Popular Topics Bottom Panel */}
          <div className="stories-popular-panel mt-12">
            <div className="widget-header-row mb-4">
              <TrendingUp size={16} color="#0284c7" />
              <h3>Topik Hangat & Riset Populer</h3>
            </div>
            <div className="popular-grid-3col">
              {POPULAR_STORIES.map((pop, idx) => (
                <Link
                  key={pop.slug}
                  href={`/stories/${pop.slug}`}
                  className="popular-grid-item"
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
        </div>
      </section>

      {/* Dynamic CTA */}
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
