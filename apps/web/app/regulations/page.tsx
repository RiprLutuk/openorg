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
import { useEffect, useState } from "react";

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

const tabs = [
  { key: "all", label: "Semua Dokumen" },
  { key: "ad_art", label: "AD / ART" },
  { key: "se_organisasi", label: "Surat Edaran (SE)" },
  { key: "regulasi_pemerintah", label: "Regulasi Pemerintah" },
  { key: "posisi_kebijakan", label: "Naskah Kebijakan" },
];

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
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
            <span>REPOSITORY HUKUM & ADVOKASI</span>
          </div>

          <h1 className="reg-hero-title">
            Regulasi, Naskah AD/ART &{" "}
            <span className="text-gradient">Kebijakan Resmi</span>
          </h1>

          <p className="reg-hero-lead">
            Pusat repositori resmi Anggaran Dasar & Rumah Tangga (AD/ART), Surat
            Edaran Dewan Pimpinan Pusat, Peraturan Pemerintah sektor pendingin &
            K3, serta Naskah Posisi Kebijakan Nasional.
          </p>

          {/* Impact Metrics Bar */}
          <div className="reg-hero-metrics">
            <div className="reg-metric-box">
              <div className="reg-metric-icon">
                <FileText size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>{regulations.length || 18} Dokumen Terbit</strong>
                <small>Legalitas & Advokasi</small>
              </div>
            </div>
            <div className="reg-metric-box">
              <div className="reg-metric-icon">
                <Scale size={22} color="#34d399" />
              </div>
              <div>
                <strong>{adartCount || 4} Naskah AD/ART</strong>
                <small>Pedoman & Kode Etik</small>
              </div>
            </div>
            <div className="reg-metric-box">
              <div className="reg-metric-icon">
                <FileCheck2 size={22} color="#818cf8" />
              </div>
              <div>
                <strong>{seCount || 8} Surat Edaran</strong>
                <small>Instruksi Resmi DPP</small>
              </div>
            </div>
            <div className="reg-metric-box">
              <div className="reg-metric-icon">
                <Download size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>
                  {totalDownloads > 0
                    ? totalDownloads.toLocaleString()
                    : "1.450+"}{" "}
                  Unduhan
                </strong>
                <small>Akses Publik Terbuka</small>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                  onClick={() => setActiveTab(tab.key)}
                  className={`reg-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="reg-search-box">
              <Search size={17} className="search-icon" />
              <input
                type="text"
                placeholder="Cari judul regulasi, nomor surat, kata kunci..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch("")}
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
                      setActiveTab("all");
                      setSearch("");
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

      {/* 3. Bottom Conversion CTA */}
      <section className="reg-bottom-cta">
        <div className="wrap">
          <div className="reg-cta-shell">
            <div className="reg-cta-content">
              <h2>Butuh Bantuan Konsultasi Hukum & Regulasi?</h2>
              <p>
                Sekretariat DPP siap membantu mediasi sengketa etik, konsultasi
                standar kerja K3, serta advokasi kebijakan industri pendingin.
              </p>
            </div>
            <div className="reg-cta-actions">
              <Link href="/complaints" className="button primary btn-cta-main">
                <span>Posko Pengaduan JENDELA</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/structure" className="button secondary btn-cta-sec">
                <span>Kontak Pengurus</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
