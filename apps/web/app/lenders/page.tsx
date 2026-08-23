"use client";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Lender {
  id: string;
  brandName: string;
  companyName: string;
  licenseNumber: string;
  sectorType: string;
  ojkStatus: string;
  websiteUrl: string | null;
  isAfpiMember: boolean;
}

export default function LendersPage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [copiedLicense, setCopiedLicense] = useState<string | null>(null);
  const [activeLenderModal, setActiveLenderModal] = useState<Lender | null>(
    null,
  );

  useEffect(() => {
    const fetchLenders = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiUrl}/v1/public/lenders`);
        if (!res.ok) throw new Error("Failed to load lenders");
        const json = await res.json();
        setLenders(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchLenders();
  }, []);

  const sectors = Array.from(
    new Set(lenders.map((l) => l.sectorType).filter(Boolean)),
  );

  const handleCopyLicense = (e: React.MouseEvent, lic: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(lic);
    setCopiedLicense(lic);
    setTimeout(() => setCopiedLicense(null), 2000);
  };

  const filtered = lenders.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      item.brandName.toLowerCase().includes(q) ||
      item.companyName.toLowerCase().includes(q) ||
      item.licenseNumber.toLowerCase().includes(q) ||
      item.sectorType.toLowerCase().includes(q);

    const matchSector =
      selectedSector === "all" || item.sectorType === selectedSector;

    return matchSearch && matchSector;
  });

  return (
    <div className="lenders-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero lenders-hero-refined">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <ShieldCheck size={15} color="#38bdf8" />
            <span>PORTAL PROTEKSI KONSUMEN & FINTECH BERIZIN</span>
          </div>

          <h1 className="tech-hero-title">
            Direktori Pembiayaan & Fintech{" "}
            <span className="text-gradient">Resmi Berizin OJK</span>
          </h1>

          <p className="tech-hero-lead">
            Pastikan mitra pembiayaan modal kerja, pengadaan alat, dan suku
            cadang bengkel Anda telah memiliki izin resmi Otoritas Jasa Keuangan
            (OJK) serta patuh pada standar kode etik asosiasi.
          </p>

          {/* Impact Metrics Bar */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <ShieldCheck size={22} color="#34d399" />
              </div>
              <div>
                <strong>100% Berizin OJK</strong>
                <small>Legalitas Terverifikasi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Building2 size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>{lenders.length || 10}+ Platform Mitra</strong>
                <small>Modal Kerja & Alat</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <BadgeCheck size={22} color="#818cf8" />
              </div>
              <div>
                <strong>Anggota AFPI Resmi</strong>
                <small>Bunga Transparan</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <ShieldAlert size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>Zero Pinjol Ilegal</strong>
                <small>Proteksi Anggota</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Directory Body & Interactive Controls */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Controls Bar */}
          <div className="tech-controls-bar">
            {/* Search Input */}
            <div className="tech-search-box">
              <Search size={17} className="search-icon" />
              <input
                type="text"
                placeholder="Cari nama platform, nama PT, atau nomor izin OJK..."
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
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sector Filter */}
            {sectors.length > 0 && (
              <div className="tech-filters-group">
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="tech-select-input"
                >
                  <option value="all">Semua Sektor Pembiayaan</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="tech-loading-state">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p>Memuat direktori lembaga pembiayaan terverifikasi...</p>
            </div>
          ) : (
            <div className="tech-cards-grid">
              {filtered.length > 0 ? (
                filtered.map((lender) => (
                  <article
                    className="tech-card-modern lender-card"
                    key={lender.id}
                  >
                    {/* Top Bar: OJK Badge & Sector */}
                    <div className="tech-card-top">
                      <span className="lender-ojk-badge">
                        <ShieldCheck size={12} color="#16a34a" />
                        <span>Izin OJK Sah</span>
                      </span>

                      <span className="tech-skill-badge">
                        <span>{lender.sectorType || "Fintech Lending"}</span>
                      </span>
                    </div>

                    {/* Profile Header Button */}
                    <button
                      type="button"
                      className="tech-profile-btn"
                      onClick={() => setActiveLenderModal(lender)}
                    >
                      <div className="tech-avatar-frame lender-avatar">
                        <Building2 size={24} color="#0284c7" />
                      </div>

                      <div className="tech-profile-copy">
                        <h4>{lender.brandName}</h4>
                        <p className="tech-workshop-text">
                          {lender.companyName}
                        </p>
                      </div>
                    </button>

                    {/* License Badge */}
                    <div className="lender-license-row">
                      <small>No. Keputusan OJK:</small>
                      <strong>{lender.licenseNumber}</strong>
                    </div>

                    {/* Footer Row: Actions */}
                    <div className="tech-card-footer">
                      <button
                        type="button"
                        className="tech-kta-btn"
                        onClick={(e) =>
                          handleCopyLicense(e, lender.licenseNumber)
                        }
                        title="Klik untuk menyalin nomor izin OJK"
                      >
                        <Copy size={12} />
                        <span>
                          {copiedLicense === lender.licenseNumber
                            ? "Izin Tersalin!"
                            : "Salin Izin"}
                        </span>
                      </button>

                      <div className="tech-actions-quick">
                        {lender.websiteUrl && (
                          <a
                            href={lender.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-quick-wa"
                            title="Buka Website Resmi"
                          >
                            <ExternalLink size={13} />
                            <span>Website</span>
                          </a>
                        )}
                        <button
                          type="button"
                          className="tech-detail-btn"
                          onClick={() => setActiveLenderModal(lender)}
                        >
                          <span>Detail</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="tech-empty-state">
                  <ShieldCheck size={44} color="#94a3b8" />
                  <h3>Platform Tidak Ditemukan</h3>
                  <p>
                    Periksa kembali ejaan nama platform atau nomor izin OJK yang
                    Anda cari.
                  </p>
                  <button
                    type="button"
                    className="button secondary btn-reset-tech"
                    onClick={() => {
                      setSearch("");
                      setSelectedSector("all");
                    }}
                  >
                    Reset Filter Pencarian
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Bottom Consumer Warning & Protection Banner */}
      <section className="tech-bottom-cta">
        <div className="wrap">
          <div className="tech-cta-shell">
            <div className="tech-cta-content">
              <h2>Waspada Penipuan Pinjaman Online Ilegal!</h2>
              <p>
                Asosiasi mengimbau seluruh anggota untuk tidak menggunakan jasa
                keuangan yang tidak terdaftar di OJK. Hubungi layanan pengaduan
                konsumen jika menemukan indikasi pelanggaran.
              </p>
            </div>
            <div className="tech-cta-actions">
              <Link href="/complaints" className="button primary btn-cta-main">
                <span>Lapor Entitas Ilegal</span>
                <ArrowRight size={17} />
              </Link>
              <Link
                href="/regulations"
                className="button secondary btn-cta-sec"
              >
                <span>Pedoman Etik Keuangan</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Detail Modal */}
      {activeLenderModal && (
        <div
          className="leader-modal-overlay"
          onClick={() => setActiveLenderModal(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveLenderModal(null);
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div className="leader-modal-card" role="document">
            <div className="leader-modal-header">
              <div className="modal-title-wrap">
                <ShieldCheck size={20} color="#38bdf8" />
                <h3>Kredensial Legalitas Lembaga Pembiayaan</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveLenderModal(null)}
                aria-label="Tutup detail modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="leader-modal-body">
              <div className="modal-profile-hero">
                <div className="modal-avatar-frame lender-modal-avatar">
                  <Building2 size={28} color="#0284c7" />
                </div>

                <div className="modal-profile-copy">
                  <span className="modal-tier-badge">
                    {activeLenderModal.sectorType || "Fintech Lending"}
                  </span>
                  <h4>{activeLenderModal.brandName}</h4>
                  <p className="modal-role">
                    Badan Hukum: {activeLenderModal.companyName}
                  </p>
                </div>
              </div>

              <div className="modal-data-grid">
                <div className="modal-data-item">
                  <small>Nomor Izin OJK Resmi</small>
                  <strong>{activeLenderModal.licenseNumber}</strong>
                </div>
                <div className="modal-data-item">
                  <small>Status Pengawasan</small>
                  <span className="modal-status-pill">
                    <CheckCircle2 size={12} /> Terdaftar & Berizin OJK
                  </span>
                </div>
                <div className="modal-data-item">
                  <small>Keanggotaan Asosiasi</small>
                  <strong>
                    {activeLenderModal.isAfpiMember
                      ? "Anggota Resmi AFPI"
                      : "Dalam Proses Asosiasi"}
                  </strong>
                </div>
                <div className="modal-data-item">
                  <small>Peruntukan Pembiayaan</small>
                  <strong style={{ color: "#0284c7" }}>
                    Modal Kerja & Pengadaan Alat Bengkel
                  </strong>
                </div>
              </div>

              <div className="modal-actions-row">
                {activeLenderModal.websiteUrl && (
                  <a
                    href={activeLenderModal.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button primary btn-modal-action"
                  >
                    <ExternalLink size={15} />
                    <span>Kunjungi Portal Resmi</span>
                  </a>
                )}
                <button
                  type="button"
                  className="button secondary btn-modal-copy"
                  onClick={(e) =>
                    handleCopyLicense(e, activeLenderModal.licenseNumber)
                  }
                >
                  <Copy size={15} />
                  <span>
                    {copiedLicense === activeLenderModal.licenseNumber
                      ? "Izin Tersalin!"
                      : "Salin No. Izin"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
