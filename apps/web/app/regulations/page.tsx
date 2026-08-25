"use client";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Loader2,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { ServerPagination } from "@/components/server-pagination";

const ITEMS_PER_PAGE_REGULATIONS = 6;

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
    label: "Regulasi Pemerintah & SNI",
    badgeClass: "badge-gov",
    color: "#818cf8",
  },
  se_organisasi: {
    label: "Surat Edaran (SE)",
    badgeClass: "badge-se",
    color: "#34d399",
  },
  ad_art: {
    label: "AD / ART & Kode Etik",
    badgeClass: "badge-adart",
    color: "#38bdf8",
  },
  posisi_kebijakan: {
    label: "Naskah Kebijakan",
    badgeClass: "badge-policy",
    color: "#f59e0b",
  },
};

const CATEGORY_HEADER_INFO: Record<
  string,
  {
    badge: string;
    title: string;
    highlight: string;
    lead: string;
  }
> = {
  all: {
    badge: "REGULASI & KEBIJAKAN RESMI",
    title: "Regulasi Pemerintah, Standar SNI & ",
    highlight: "Kebijakan Resmi",
    lead: "Pusat rujukan hukum dan kepatuhan standar refrigerasi: Peraturan Menteri Lingkungan Hidup (KLHK), SKKNI & BNSP, Surat Edaran DPP, serta naskah kebijakan transisi refrigeran ramah lingkungan.",
  },
  regulasi_pemerintah: {
    badge: "REGULASI PEMERINTAH & STANDAR SNI",
    title: "Peraturan Kementerian, SKKNI & ",
    highlight: "Standar SNI Nasional",
    lead: "Kumpulan ketetapan hukum wajib sektor pendingin: Permen LHK No. 73/2024, Permen ESDM hemat energi, standar SKKNI BNSP, serta SNI 03-6390 konservasi energi gedung bertingkat.",
  },
  se_organisasi: {
    badge: "SURAT EDARAN (SE) RESMI DPP",
    title: "Pedoman Operasional, Standar Biaya & ",
    highlight: "Instruksi DPP",
    lead: "Instruksi resmi DPP APTI Indonesia bagi seluruh 38 DPD dan teknisi ber-KTA: standar keselamatan kerja K3, kewajiban vakum digital <500 micron, dan jaminan garansi servis konsumen.",
  },
  posisi_kebijakan: {
    badge: "NASKAH KEBIJAKAN & ADVOKASI",
    title: "Policy Paper, Roadmap Dekarbonisasi & ",
    highlight: "Kajian Advokasi",
    lead: "Kajian strategis dan rekomendasi resmi asosiasi kepada Kementerian Keuangan, Kemenperin, dan LKPP terkait insentif pajak AC ramah lingkungan R290 dan sertifikasi pengadaan pemerintah.",
  },
  ad_art: {
    badge: "KONSTITUSI ORGANISASI & KODE ETIK",
    title: "Anggaran Dasar, Anggaran Rumah Tangga & ",
    highlight: "Kode Etik Profesi",
    lead: "Landasan konstitusional APTI Indonesia, tata kelola kelembagaan, hak dan kewajiban anggota praktisi, serta 9 Butir Pakta Integritas teknisi pendingin nasional.",
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
  {
    key: "regulasi_pemerintah",
    label: "Regulasi Pemerintah & SNI",
    slug: "regulasi-pemerintah",
  },
  { key: "se_organisasi", label: "Surat Edaran (SE)", slug: "surat-edaran" },
  {
    key: "posisi_kebijakan",
    label: "Naskah Kebijakan",
    slug: "naskah-kebijakan",
  },
  { key: "ad_art", label: "AD / ART & Kode Etik", slug: "ad-art" },
];

function RegulationsContent() {
  const router = useRouter();
  const pathname = usePathname();
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

  const pageParam = searchParams.get("page");
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

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

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || (key === "page" && val === "1") || (key === "kategori" && val === "semua")) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // clean up aliases
    params.delete("cat");
    params.delete("category");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const friendlySlug = categoryToSlug[key] || key;
    updateUrl({ kategori: friendlySlug === "semua" ? null : friendlySlug, page: null });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrl({ q: val.trim() ? val.trim() : null, page: null });
  };

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
        const res = await fetch(`${apiUrl}/v1/public/regulations?limit=100`);
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
  const govCount = regulations.filter(
    (i) => i.category === "regulasi_pemerintah",
  ).length;
  const seCount = regulations.filter(
    (i) => i.category === "se_organisasi",
  ).length;
  const policyCount = regulations.filter(
    (i) => i.category === "posisi_kebijakan",
  ).length;
  const adartCount = regulations.filter((i) => i.category === "ad_art").length;

  const filtered = regulations.filter((item) => {
    const matchTab = activeTab === "all" || item.category === activeTab;
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.number?.toLowerCase().includes(search.toLowerCase()) ||
      item.summary?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE_REGULATIONS));
  const paginatedRows = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE_REGULATIONS,
    currentPage * ITEMS_PER_PAGE_REGULATIONS,
  );

  const headerInfo =
    CATEGORY_HEADER_INFO[activeTab] ??
    CATEGORY_HEADER_INFO.all ?? {
      badge: "REGULASI & KEBIJAKAN RESMI",
      title: "Regulasi Pemerintah, Standar SNI & ",
      highlight: "Kebijakan Resmi",
      lead: "Pusat rujukan hukum dan kepatuhan standar refrigerasi di Indonesia.",
    };

  return (
    <div className="regulations-page-suite">
      {/* 1. Flagship 2-Column Split Hero Header */}
      <header className="reg-hero">
        <div className="wrap">
          {/* Breadcrumb Navigation Strip */}
          <nav className="reg-breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: "1rem" }}>
            <Link href="/" className="crumb-link">
              Beranda
            </Link>
            <ChevronRight size={13} className="crumb-sep" />
            <Link
              href="/regulations"
              className={`crumb-link ${activeTab === "all" ? "active" : ""}`}
              onClick={(e) => {
                if (activeTab !== "all") {
                  e.preventDefault();
                  handleTabChange("all");
                }
              }}
            >
              Regulasi & Kebijakan
            </Link>
            {activeTab !== "all" && (
              <>
                <ChevronRight size={13} className="crumb-sep" />
                <span className="crumb-current">
                  {categoryLabels[activeTab]?.label || activeTab}
                </span>
              </>
            )}
          </nav>
        </div>

        <div className="wrap reg-hero-grid">
          <div className="reg-hero-inner">
            <div className="reg-hero-pill">
              <BookOpen size={14} />
              <span>{headerInfo.badge}</span>
            </div>

            <h1 className="reg-hero-title">
              {headerInfo.title}
              <span className="text-gradient">{headerInfo.highlight}</span>
            </h1>

            <p className="reg-hero-lead">{headerInfo.lead}</p>
          </div>

          {/* Right Column: Hero Metrics Bento Card */}
          <div className="hero-stats-bento-card">
            <div className="stats-card-header">
              <span className="stats-card-badge">Pusat Regulasi & Kebijakan</span>
              <span className="stats-card-status">● Arsip Terverifikasi</span>
            </div>
            <div className="stats-card-grid">
              <div
                className="stat-item"
                style={{
                  cursor: "pointer",
                  border:
                    activeTab === "regulasi_pemerintah"
                      ? "1.5px solid #6366f1"
                      : "1px solid transparent",
                  borderRadius: "8px",
                  padding: "4px",
                }}
                onClick={() => handleTabChange("regulasi_pemerintah")}
              >
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#eef2ff", color: "#6366f1" }}
                >
                  <Scale size={20} />
                </div>
                <div>
                  <strong>{govCount || 5} Regulasi SNI/KLHK</strong>
                  <small>Standar Wajib</small>
                </div>
              </div>

              <div
                className="stat-item"
                style={{
                  cursor: "pointer",
                  border:
                    activeTab === "se_organisasi"
                      ? "1.5px solid #10b981"
                      : "1px solid transparent",
                  borderRadius: "8px",
                  padding: "4px",
                }}
                onClick={() => handleTabChange("se_organisasi")}
              >
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#ecfdf5", color: "#10b981" }}
                >
                  <FileCheck2 size={20} />
                </div>
                <div>
                  <strong>{seCount || 5} Surat Edaran</strong>
                  <small>Instruksi DPP</small>
                </div>
              </div>

              <div
                className="stat-item"
                style={{
                  cursor: "pointer",
                  border:
                    activeTab === "posisi_kebijakan"
                      ? "1.5px solid #f59e0b"
                      : "1px solid transparent",
                  borderRadius: "8px",
                  padding: "4px",
                }}
                onClick={() => handleTabChange("posisi_kebijakan")}
              >
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#fffbeb", color: "#f59e0b" }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <strong>{policyCount || 4} Naskah Kebijakan</strong>
                  <small>Advokasi Sektor</small>
                </div>
              </div>

              <div
                className="stat-item"
                style={{
                  cursor: "pointer",
                  border:
                    activeTab === "ad_art"
                      ? "1.5px solid #0284c7"
                      : "1px solid transparent",
                  borderRadius: "8px",
                  padding: "4px",
                }}
                onClick={() => handleTabChange("ad_art")}
              >
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#f0f9ff", color: "#0284c7" }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>{adartCount || 4} AD/ART & Etik</strong>
                  <small>Konstitusi Sah</small>
                </div>
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

          {/* Active Filter Strip Counter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              padding: "0.5rem 0.25rem",
              fontSize: "0.875rem",
              color: "#64748b",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={14} color="#0284c7" />
              <span>
                Menampilkan{" "}
                <strong style={{ color: "#0f172a" }}>{filtered.length}</strong>{" "}
                dokumen{" "}
                {activeTab !== "all" ? (
                  <>
                    dalam kategori{" "}
                    <strong style={{ color: "#0284c7" }}>
                      &ldquo;{categoryLabels[activeTab]?.label || activeTab}&rdquo;
                    </strong>
                  </>
                ) : (
                  "terverifikasi"
                )}
                {search ? (
                  <>
                    {" "}
                    dengan kata kunci{" "}
                    <strong style={{ color: "#0f172a" }}>
                      &ldquo;{search}&rdquo;
                    </strong>
                  </>
                ) : null}
              </span>
            </div>

            {(activeTab !== "all" || search) && (
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#0284c7",
                  fontWeight: 600,
                  fontSize: "0.825rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                onClick={() => {
                  handleTabChange("all");
                  handleSearchChange("");
                }}
              >
                <span>Reset Filter</span>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Regulations Card Grid */}
          {isLoading ? (
            <div className="reg-loading-state">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p>Memuat repository dokumen resmi...</p>
            </div>
          ) : (
            <>
              <div className="reg-grid-modern">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((item) => {
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

              {/* Server-Side Pagination Bar */}
              <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={ITEMS_PER_PAGE_REGULATIONS}
                itemName="Dokumen Regulasi"
              />
            </>
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
