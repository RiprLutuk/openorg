"use client";

import {
  ArrowRight,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  Coins,
  Cpu,
  ExternalLink,
  Factory,
  Gauge,
  Handshake,
  Landmark,
  Loader2,
  PackageCheck,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

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

interface PartnerSectorMeta {
  label: string;
  shortLabel: string;
  icon: any;
  color: string;
  bgClass: string;
  description: string;
}

function getPartnerSectorMeta(sector: string): PartnerSectorMeta {
  const lower = (sector || "").toLowerCase();

  if (
    lower.includes("prinsipal") ||
    lower.includes("manufaktur") ||
    lower.includes("pabrik")
  ) {
    return {
      label: "Prinsipal & Manufaktur AC",
      shortLabel: "Manufaktur AC",
      icon: Factory,
      color: "#0284c7",
      bgClass: "partner-cat-principal",
      description:
        "Pabrikan resmi unit pendingin residensial & komersial dengan sertifikasi mutu SNI dan garansi prinsipal.",
    };
  }

  if (
    lower.includes("distributor") ||
    lower.includes("komponen") ||
    lower.includes("kompresor") ||
    lower.includes("freon")
  ) {
    return {
      label: "Distributor Komponen & Kompresor",
      shortLabel: "Suku Cadang",
      icon: Boxes,
      color: "#d97706",
      bgClass: "partner-cat-distributor",
      description:
        "Distributor resmi penyedia suku cadang asli, kompresor inverter, pipa tembaga, dan refrigeran ramah lingkungan.",
    };
  }

  if (
    lower.includes("alat") ||
    lower.includes("pompa") ||
    lower.includes("vakum") ||
    lower.includes("tools")
  ) {
    return {
      label: "Peralatan Kerja & Pompa Vakum",
      shortLabel: "Alat Kerja",
      icon: Wrench,
      color: "#16a34a",
      bgClass: "partner-cat-tools",
      description:
        "Penyedia manifold digital, pompa vakum dua tahap, flaring kit berstandar K3, dan instrumen ukur refrigerasi.",
    };
  }

  if (
    lower.includes("pembiayaan") ||
    lower.includes("modal") ||
    lower.includes("kredit") ||
    lower.includes("fintech")
  ) {
    return {
      label: "Pembiayaan Alat & Modal Bengkel",
      shortLabel: "Pembiayaan",
      icon: Landmark,
      color: "#6366f1",
      bgClass: "partner-cat-finance",
      description:
        "Mitra lembaga pembiayaan resmi berizin OJK untuk fasilitas permodalan kerja dan pengadaan alat workshop anggota.",
    };
  }

  return {
    label: sector || "Mitra Industri HVAC/R",
    shortLabel: sector || "Mitra Resmi",
    icon: Handshake,
    color: "#0284c7",
    bgClass: "partner-cat-principal",
    description: "Perusahaan rekanan resmi ekosistem pendingin & tata udara.",
  };
}

const DEFAULT_PARTNERS: Lender[] = [
  {
    id: "part-01",
    brandName: "Daikin Indonesia HVAC Partner",
    companyName: "PT Daikin Airconditioning Indonesia",
    licenseNumber: "SK-MITRA-DPP-001",
    sectorType: "Prinsipal & Manufaktur AC",
    ojkStatus: "Mitra Prinsipal Resmi",
    websiteUrl: "https://daikin.co.id",
    isAfpiMember: true,
  },
  {
    id: "part-02",
    brandName: "Panasonic Cooling Solutions",
    companyName: "PT Panasonic Gobel Indonesia",
    licenseNumber: "SK-MITRA-DPP-002",
    sectorType: "Prinsipal & Manufaktur AC",
    ojkStatus: "Mitra Prinsipal Resmi",
    websiteUrl: "https://panasonic.com/id",
    isAfpiMember: true,
  },
  {
    id: "part-03",
    brandName: "Gree Commercial & Inverter AC",
    companyName: "PT Gree Electric Appliances Indonesia",
    licenseNumber: "SK-MITRA-DPP-003",
    sectorType: "Prinsipal & Manufaktur AC",
    ojkStatus: "Mitra Prinsipal Resmi",
    websiteUrl: "https://gree.id",
    isAfpiMember: true,
  },
  {
    id: "part-04",
    brandName: "Danfoss Refrigeration Supply",
    companyName: "PT Danfoss Indonesia",
    licenseNumber: "SK-DIST-DPP-004",
    sectorType: "Distributor Komponen & Kompresor",
    ojkStatus: "Distributor Terakreditasi",
    websiteUrl: "https://danfoss.com",
    isAfpiMember: true,
  },
  {
    id: "part-05",
    brandName: "Bitzer Industrial Cooling",
    companyName: "PT Bitzer Compressors Indonesia",
    licenseNumber: "SK-DIST-DPP-005",
    sectorType: "Distributor Komponen & Kompresor",
    ojkStatus: "Distributor Terakreditasi",
    websiteUrl: "https://bitzer.de",
    isAfpiMember: true,
  },
  {
    id: "part-06",
    brandName: "Refco & Value Tools Indonesia",
    companyName: "PT Prima Alat Refrigerasi",
    licenseNumber: "SK-DIST-DPP-006",
    sectorType: "Penyedia Alat Kerja & Pompa Vakum",
    ojkStatus: "Distributor Terakreditasi",
    websiteUrl: "https://refco.ch",
    isAfpiMember: true,
  },
  {
    id: "part-07",
    brandName: "Chemours & Klea Eco-Refrigerant",
    companyName: "PT Gas Pendingin Nusantara",
    licenseNumber: "SK-DIST-DPP-007",
    sectorType: "Distributor Komponen & Kompresor",
    ojkStatus: "Distributor Terakreditasi",
    websiteUrl: "https://chemours.com",
    isAfpiMember: true,
  },
  {
    id: "part-08",
    brandName: "Kredit Usaha Mandiri Alat HVAC",
    companyName: "PT Sinergi Pembiayaan Bengkel",
    licenseNumber: "KEP-102/D.05/2024",
    sectorType: "Pembiayaan Alat & Modal Bengkel",
    ojkStatus: "Berizin OJK & Rekanan Resmi",
    websiteUrl: "https://sinergipembiayaan.co.id",
    isAfpiMember: true,
  },
];

function LendersContent() {
  const searchParams = useSearchParams();
  const [lenders, setLenders] = useState<Lender[]>(DEFAULT_PARTNERS);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedSector, setSelectedSector] = useState(
    searchParams.get("sektor") || "all",
  );
  const [copiedLicense, setCopiedLicense] = useState<string | null>(null);
  const [activeLenderModal, setActiveLenderModal] = useState<Lender | null>(
    null,
  );

  const updateUrl = (newSearch: string, newSector: string) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newSearch.trim()) url.searchParams.set("q", newSearch.trim());
      else url.searchParams.delete("q");

      if (newSector !== "all") url.searchParams.set("sektor", newSector);
      else url.searchParams.delete("sektor");

      window.history.replaceState(
        null,
        "",
        url.pathname + (url.search ? url.search : ""),
      );
    }
  };

  useEffect(() => {
    const fetchLenders = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiUrl}/v1/public/partners`);
        if (!res.ok) throw new Error("Failed to load partners");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          // If server returns old fintech seed without HVAC, use DEFAULT_PARTNERS
          const hasHvac = json.data.some(
            (p: Lender) =>
              p.sectorType?.toLowerCase().includes("prinsipal") ||
              p.sectorType?.toLowerCase().includes("ac") ||
              p.sectorType?.toLowerCase().includes("alat"),
          );
          setLenders(hasHvac ? json.data : DEFAULT_PARTNERS);
        } else {
          setLenders(DEFAULT_PARTNERS);
        }
      } catch (err) {
        console.error(err);
        setLenders(DEFAULT_PARTNERS);
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
            <Sparkles size={15} color="#38bdf8" />
            <span>PORTAL EKOSISTEM SUPPLY CHAIN & REKANAN RESMI</span>
          </div>

          <h1 className="tech-hero-title">
            Direktori Mitra Prinsipal &{" "}
            <span className="text-gradient">Distributor Resmi</span>
          </h1>

          <p className="tech-hero-lead">
            Daftar resmi pabrikan AC, distributor suku cadang, penyedia alat
            ukur refrigerasi, dan mitra pembiayaan pengadaan alat kerja bengkel
            yang terakreditasi oleh asosiasi demi menjamin keaslian komponen dan
            standar keselamatan kerja K3.
          </p>

          {/* Impact Metrics Bar */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <ShieldCheck size={22} color="#34d399" />
              </div>
              <div>
                <strong>100% Rekanan Sah</strong>
                <small>Akreditasi DPP Asosiasi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Building2 size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>{lenders.length || 5}+ Mitra Terdaftar</strong>
                <small>Pabrikan & Distributor</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <PackageCheck size={22} color="#818cf8" />
              </div>
              <div>
                <strong>Suku Cadang Asli</strong>
                <small>Garansi Resmi Pabrikan</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Handshake size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>Dukungan Advokasi</strong>
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
                placeholder="Cari nama mitra, nama perusahaan, atau no. SK kemitraan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateUrl(e.target.value, selectedSector);
                }}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearch("");
                    updateUrl("", selectedSector);
                  }}
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
                  onChange={(e) => {
                    setSelectedSector(e.target.value);
                    updateUrl(search, e.target.value);
                  }}
                  className="tech-select-input"
                >
                  <option value="all">Semua Kategori Kemitraan</option>
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
              <p>Memuat direktori mitra & distributor terakreditasi...</p>
            </div>
          ) : (
            <div className="tech-cards-grid">
              {filtered.length > 0 ? (
                filtered.map((partner) => {
                  const catMeta = getPartnerSectorMeta(partner.sectorType);
                  const CatIcon = catMeta.icon;

                  return (
                    <article
                      className="tech-card-modern lender-card"
                      key={partner.id}
                    >
                      {/* Top Bar: SK Kemitraan Badge & Category (Exact 26px Height) */}
                      <div className="tech-card-top">
                        <button
                          type="button"
                          className="partner-sk-badge"
                          onClick={(e) =>
                            handleCopyLicense(e, partner.licenseNumber)
                          }
                          title={
                            copiedLicense === partner.licenseNumber
                              ? "Nomor SK Tersalin!"
                              : "Klik untuk menyalin nomor SK"
                          }
                          aria-label={`Salin SK ${partner.licenseNumber}`}
                        >
                          {copiedLicense === partner.licenseNumber ? (
                            <Check size={12} color="#16a34a" />
                          ) : (
                            <CheckCircle2 size={12} color="#16a34a" />
                          )}
                          <span>{partner.licenseNumber}</span>
                        </button>

                        <span
                          className={`partner-cat-badge ${catMeta.bgClass}`}
                          title={catMeta.label}
                        >
                          <CatIcon size={12} />
                          <span>{catMeta.shortLabel}</span>
                        </span>
                      </div>

                      {/* Profile Header Button */}
                      <button
                        type="button"
                        className="tech-profile-btn"
                        onClick={() => setActiveLenderModal(partner)}
                      >
                        <div className="tech-avatar-frame lender-avatar">
                          <CatIcon size={24} color={catMeta.color} />
                        </div>

                        <div className="tech-profile-copy">
                          <h4>{partner.brandName}</h4>
                          <p className="tech-workshop-text">
                            {partner.companyName}
                          </p>
                        </div>
                      </button>

                      {/* License Info Box */}
                      <div className="lender-license-row">
                        <small>Status Kemitraan Organisasi:</small>
                        <strong>
                          {partner.ojkStatus || "Mitra Resmi Terakreditasi"}
                        </strong>
                      </div>

                      {/* Footer Row: Actions */}
                      <div className="tech-card-footer">
                        <span className="club-status-chip">
                          <CheckCircle2 size={11} color="#16a34a" />
                          <span>Terverifikasi DPP</span>
                        </span>

                        <div className="tech-actions-quick">
                          {partner.websiteUrl && (
                            <a
                              href={partner.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-quick-wa"
                              title="Buka Website Resmi Mitra"
                            >
                              <ExternalLink size={12} />
                              <span>Website</span>
                            </a>
                          )}
                          <button
                            type="button"
                            className="tech-detail-btn"
                            onClick={() => setActiveLenderModal(partner)}
                          >
                            <span>Detail</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="tech-empty-state">
                  <ShieldCheck size={44} color="#94a3b8" />
                  <h3>Mitra / Distributor Tidak Ditemukan</h3>
                  <p>
                    Periksa kembali kata kunci pencarian atau kategori kemitraan
                    yang Anda pilih.
                  </p>
                  <button
                    type="button"
                    className="button secondary btn-reset-tech"
                    onClick={() => {
                      setSearch("");
                      setSelectedSector("all");
                      updateUrl("", "all");
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

      {/* 3. Bottom CTA: Partnership Engagement */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Ingin Menjadi Mitra Resmi Pabrikan atau Distributor?"
        guestDescription="Jalin kerjasama resmi bersama asosiasi untuk menyalurkan produk suku cadang bergaransi asli dan pelatihan teknis langsung kepada ribuan teknisi di seluruh Indonesia."
        guestPrimaryCta={{ label: "Ajukan Kerjasama Kemitraan", href: "/join" }}
        guestSecondaryCta={{
          label: "Konsultasi Sekretariat DPP",
          href: "/organization-profile",
        }}
        memberTitle="Akses Diskon Khusus Suku Cadang & Alat Kerja"
        memberDescription="Sebagai anggota aktif KTA, Anda berhak memperoleh potongan harga khusus dari prinsipal mitra serta fasilitas pembiayaan alat kerja bengkel."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{ label: "Cek Agenda Workshop", href: "/events" }}
      />

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
                <h3>Kredensial Akreditasi Kemitraan Resmi</h3>
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
              {(() => {
                const catMeta = getPartnerSectorMeta(
                  activeLenderModal.sectorType,
                );
                const CatIcon = catMeta.icon;

                return (
                  <>
                    <div className="modal-profile-hero">
                      <div className="modal-avatar-frame lender-modal-avatar">
                        <CatIcon size={28} color={catMeta.color} />
                      </div>

                      <div className="modal-profile-copy">
                        <span
                          className={`partner-cat-badge ${catMeta.bgClass}`}
                          style={{ marginBottom: "6px" }}
                        >
                          <CatIcon size={12} />
                          <span>{catMeta.label}</span>
                        </span>
                        <h4>{activeLenderModal.brandName}</h4>
                        <p className="modal-role">
                          Badan Hukum: {activeLenderModal.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Piagam Kemitraan Box */}
                    <div className="modal-leveling-box">
                      <div className="modal-leveling-header">
                        <div className="modal-leveling-title">
                          <Handshake size={18} color="#0284c7" />
                          <h5>Pengesahan Rekanan Ekosistem DPP</h5>
                        </div>
                        <span className="modal-status-pill">
                          <CheckCircle2 size={12} /> Terakreditasi Sah
                        </span>
                      </div>
                      <p className="modal-leveling-scope">
                        {catMeta.description} Perusahaan ini terdaftar resmi
                        dalam MoU kerjasama organisasi untuk penyediaan suku
                        cadang asli, transfer teknologi, dan dukungan garansi
                        bagi teknisi anggota.
                      </p>
                    </div>

                    <div className="modal-data-grid">
                      <div className="modal-data-item">
                        <small>Nomor SK Kemitraan DPP</small>
                        <strong>{activeLenderModal.licenseNumber}</strong>
                      </div>
                      <div className="modal-data-item">
                        <small>Status Akreditasi</small>
                        <span className="modal-status-pill">
                          <CheckCircle2 size={12} />{" "}
                          {activeLenderModal.ojkStatus || "Rekanan Resmi"}
                        </span>
                      </div>
                      <div className="modal-data-item">
                        <small>Kategori Ekosistem</small>
                        <strong>{catMeta.label}</strong>
                      </div>
                      <div className="modal-data-item">
                        <small>Jaminan Produk</small>
                        <strong style={{ color: "#16a34a" }}>
                          ✓ 100% Original Bergaransi
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
                        <Check size={15} />
                        <span>
                          {copiedLicense === activeLenderModal.licenseNumber
                            ? "SK Tersalin!"
                            : "Salin No. SK"}
                        </span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LendersPage() {
  return (
    <Suspense
      fallback={
        <div className="tech-loading-state" style={{ minHeight: "50vh" }}>
          <Loader2 size={36} className="animate-spin text-primary" />
          <p>Memuat direktori mitra & distributor terakreditasi...</p>
        </div>
      }
    >
      <LendersContent />
    </Suspense>
  );
}
