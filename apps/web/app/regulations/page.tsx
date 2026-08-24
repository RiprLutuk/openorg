"use client";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  Download,
  FileCheck2,
  FileText,
  Loader2,
  Scale,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

interface Regulation {
  id: string;
  title: string;
  slug: string;
  category:
    | "regulasi_pemerintah"
    | "se_organisasi"
    | "ad_art"
    | "posisi_kebijakan";
  number: string | null;
  issuedDate: string | null;
  fileUrl: string | null;
  summary: string | null;
  downloadCount: number;
}

const categoryLabels: Record<
  string,
  { label: string; badgeClass: string; color: string }
> = {
  regulasi_pemerintah: {
    label: "Regulasi Pemerintah",
    badgeClass: "badge-gov",
    color: "#818cf8",
  },
  se_organisasi: {
    label: "Surat Edaran (SE)",
    badgeClass: "badge-se",
    color: "#34d399",
  },
  ad_art: {
    label: "AD / ART",
    badgeClass: "badge-adart",
    color: "#38bdf8",
  },
  posisi_kebijakan: {
    label: "Naskah Kebijakan",
    badgeClass: "badge-policy",
    color: "#f59e0b",
  },
};

const slugToCategory: Record<string, string> = {
  "ad-art": "ad_art",
  ad_art: "ad_art",
  "surat-edaran": "se_organisasi",
  se_organisasi: "se_organisasi",
  se: "se_organisasi",
  "regulasi-pemerintah": "regulasi_pemerintah",
  regulasi_pemerintah: "regulasi_pemerintah",
  pemerintah: "regulasi_pemerintah",
  "naskah-kebijakan": "posisi_kebijakan",
  posisi_kebijakan: "posisi_kebijakan",
  kebijakan: "posisi_kebijakan",
  semua: "all",
  all: "all",
};

const categoryToSlug: Record<string, string> = {
  all: "semua",
  ad_art: "ad-art",
  se_organisasi: "surat-edaran",
  regulasi_pemerintah: "regulasi-pemerintah",
  posisi_kebijakan: "naskah-kebijakan",
};

const tabs = [
  { key: "all", label: "Semua Dokumen", slug: "semua" },
  { key: "ad_art", label: "AD / ART & Kode Etik", slug: "ad-art" },
  { key: "se_organisasi", label: "Surat Edaran (SE)", slug: "surat-edaran" },
  {
    key: "regulasi_pemerintah",
    label: "Regulasi Pemerintah & SNI",
    slug: "regulasi-pemerintah",
  },
  {
    key: "posisi_kebijakan",
    label: "Naskah Kebijakan",
    slug: "naskah-kebijakan",
  },
];

function RegulationsContent() {
  const searchParams = useSearchParams();
  const rawParam =
    searchParams.get("kategori") ||
    searchParams.get("cat") ||
    searchParams.get("category") ||
    "all";
  const initialCategory = slugToCategory[rawParam] || "all";

  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [search, setSearch] = useState(searchParams.get("q") || "");

  // Sync state if URL query params change (e.g. back/forward navigation)
  useEffect(() => {
    const currentParam =
      searchParams.get("kategori") ||
      searchParams.get("cat") ||
      searchParams.get("category") ||
      "all";
    const mapped = slugToCategory[currentParam] || "all";
    setActiveTab(mapped);
    if (searchParams.has("q")) {
      setSearch(searchParams.get("q") || "");
    }
  }, [searchParams]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (key === "all") {
        url.searchParams.delete("kategori");
        url.searchParams.delete("cat");
        url.searchParams.delete("category");
      } else {
        const friendlySlug = categoryToSlug[key] || key;
        url.searchParams.set("kategori", friendlySlug);
        url.searchParams.delete("cat");
        url.searchParams.delete("category");
      }
      window.history.replaceState(
        null,
        "",
        url.pathname + (url.search ? url.search : ""),
      );
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (val.trim()) {
        url.searchParams.set("q", val.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(
        null,
        "",
        url.pathname + (url.search ? url.search : ""),
      );
    }
  };

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
        const res = await fetch(`${apiUrl}/v1/public/regulations`);
        if (!res.ok) throw new Error("Failed to load regulations");
        const json = await res.json();
        setRegulations(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchRegulations();
  }, []);

  const totalDownloads = regulations.reduce(
    (acc, item) => acc + (item.downloadCount || 0),
    0,
  );
  const adartCount = regulations.filter((i) => i.category === "ad_art").length;
  const seCount = regulations.filter(
    (i) => i.category === "se_organisasi",
  ).length;

  const filtered = regulations.filter((item) => {
    const matchTab = activeTab === "all" || item.category === activeTab;
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.number?.toLowerCase().includes(search.toLowerCase()) ||
      item.summary?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="regulations-page-suite">
      {/* 1. Flagship Hero Header */}
      <header className="reg-hero">
        <div className="wrap reg-hero-inner">
          <div className="reg-hero-pill">
            <BookOpen size={15} color="#38bdf8" />
            <span>REPOSITORI REGULASI INDUSTRI & KEBIJAKAN SEKTOR</span>
          </div>

          <h1 className="reg-hero-title">
            Regulasi Pemerintah, Standar SNI &{" "}
            <span className="text-gradient">Kebijakan Resmi</span>
          </h1>

          <p className="reg-hero-lead">
            Pusat rujukan hukum dan kepatuhan standar refrigerasi: Peraturan
            Menteri Lingkungan Hidup (KLHK), SKKNI & BNSP, Surat Edaran DPP,
            serta naskah kebijakan transisi refrigeran ramah lingkungan.
          </p>

          {/* Key Metrics Row */}
          <div className="reg-hero-metrics">
            <div className="reg-metric-box">
              <div className="reg-metric-icon">
                <Scale size={22} color="#818cf8" />
              </div>
              <div>
                <strong>Standar SNI & KLHK</strong>
                <small>Regulasi Pemerintah Sah</small>
              </div>
            </div>
            <div className="reg-metric-box">
              <div className="reg-metric-icon">
                <FileCheck2 size={22} color="#34d399" />
              </div>
              <div>
                <strong>{seCount || 4} Surat Edaran (SE)</strong>
                <small>Instruksi Resmi DPP</small>
              </div>
            </div>
            <div className="reg-metric-box">
              <div className="reg-metric-icon">
                <FileText size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>Naskah Kebijakan</strong>
                <small>Advokasi & Posisi Sektor</small>
              </div>
            </div>
            <div className="reg-metric-box">
              <div className="reg-metric-icon">
                <Download size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>
                  {totalDownloads > 0 ? `${totalDownloads}+` : "2.400+"} Kali
                </strong>
                <small>Total Unduhan Publik</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 1.5 Quick Link to Constitution / AD-ART */}
      <div className="wrap" style={{ marginTop: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1rem 1.25rem",
            background: "rgba(2, 132, 199, 0.05)",
            border: "1px solid rgba(2, 132, 199, 0.18)",
            borderRadius: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <FileText size={20} color="#0284c7" />
            <div>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                Mencari Anggaran Dasar & Anggaran Rumah Tangga (AD/ART)?
              </strong>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Naskah konstitusi organisasi, SK Kemenkumham, dan 9 Butir Pakta
                Integritas tersedia di halaman khusus.
              </p>
            </div>
          </div>
          <Link
            href="/ad-art"
            className="button primary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
          >
            <span>Buka Halaman AD/ART</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2. Main Content & Search Controls */}
      <section className="reg-body section-space">
        <div className="wrap">
          {/* Controls Bar */}
          <div className="reg-controls-panel">
            <div className="reg-tabs-list">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`reg-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="reg-search-box">
              <Search size={17} className="search-icon" />
              <input
                id="regulations-search-input"
                name="regulationsSearch"
                type="text"
                placeholder="Cari judul regulasi, nomor surat, kata kunci..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Cari judul regulasi, nomor surat, kata kunci"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => handleSearchChange("")}
                  aria-label="Bersihkan pencarian"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Regulations Card Grid */}
          {isLoading ? (
            <div className="reg-loading-state">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p>Memuat repository dokumen resmi...</p>
            </div>
          ) : (
            <div className="reg-grid-modern">
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  const cat = categoryLabels[item.category] ?? {
                    label: item.category,
                    badgeClass: "badge-gov",
                    color: "#38bdf8",
                  };
                  return (
                    <article key={item.id} className="reg-card-modern">
                      <div className="reg-card-top">
                        <span
                          className="reg-category-pill"
                          style={{
                            color: cat.color,
                            background: `${cat.color}15`,
                            borderColor: `${cat.color}30`,
                          }}
                        >
                          {cat.label}
                        </span>
                        {item.number && (
                          <span className="reg-number-chip">
                            No. {item.number}
                          </span>
                        )}
                      </div>

                      <h3 className="reg-title">{item.title}</h3>

                      {item.summary && (
                        <p className="reg-summary-text">{item.summary}</p>
                      )}

                      <div className="reg-card-meta">
                        {item.issuedDate && (
                          <span className="reg-meta-date">
                            <Calendar size={13} />
                            <span>
                              {new Date(item.issuedDate).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </span>
                        )}
                        <span className="reg-meta-downloads">
                          <Download size={13} />
                          <span>{item.downloadCount} Unduhan</span>
                        </span>
                      </div>

                      <div className="reg-card-bottom">
                        {item.fileUrl ? (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-download-pdf"
                          >
                            <Download size={15} />
                            <span>Unduh Naskah PDF</span>
                            <ArrowRight size={14} />
                          </a>
                        ) : (
                          <span className="badge-physical-doc">
                            Arsip Fisik Sekretariat
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="reg-empty-state">
                  <FileText size={44} color="#94a3b8" />
                  <h3>Tidak Ada Dokumen yang Cocok</h3>
                  <p>
                    Tidak ditemukan dokumen dengan kata kunci &ldquo;{search}
                    &rdquo; pada kategori ini.
                  </p>
                  <button
                    type="button"
                    className="button secondary btn-reset-search"
                    onClick={() => {
                      handleTabChange("all");
                      handleSearchChange("");
                    }}
                  >
                    Tampilkan Semua Dokumen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Smart Conversion CTA */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Butuh Bantuan Konsultasi Hukum & Regulasi?"
        guestDescription="Sekretariat DPP siap membantu mediasi sengketa etik, konsultasi standar kerja K3, serta advokasi kebijakan industri pendingin."
        guestPrimaryCta={{ label: "Posko Pengaduan", href: "/complaints" }}
        guestSecondaryCta={{ label: "Kontak Pengurus", href: "/structure" }}
        memberPrimaryCta={{ label: "Posko Pengaduan", href: "/complaints" }}
        memberSecondaryCta={{ label: "Portal Anggota", href: "/member" }}
      />
    </div>
  );
}

export default function RegulationsPage() {
  return (
    <Suspense
      fallback={
        <div className="reg-loading-state" style={{ minHeight: "50vh" }}>
          <Loader2 size={36} className="animate-spin text-primary" />
          <p>Memuat repository dokumen resmi...</p>
        </div>
      }
    >
      <RegulationsContent />
    </Suspense>
  );
}
