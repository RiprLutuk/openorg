"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

interface Technician {
  id: string;
  name: string;
  ktaNumber: string;
  skillLevel: string;
  province: string;
  city: string;
  phone: string | null;
  workshopName: string | null;
  rating: string | null;
  certifiedBnsp: boolean;
  isAvailable: boolean;
}

interface SkillTierInfo {
  levelNumber: number;
  shortBadge: string;
  fullName: string;
  skkniLevel: string;
  scopeDescription: string;
  color: string;
  bgClass: string;
  icon: any;
}

function parseSkillLevel(rawLevel: string): SkillTierInfo {
  const lower = (rawLevel || "").toLowerCase();

  if (
    lower.includes("4") ||
    lower.includes("chiller") ||
    lower.includes("central") ||
    lower.includes("vrv") ||
    lower.includes("vrf") ||
    lower.includes("master") ||
    lower.includes("utama")
  ) {
    return {
      levelNumber: 4,
      shortBadge: "Level 4 · Master",
      fullName: "Teknisi Utama & Ahli Sentral (Level IV)",
      skkniLevel: "Kualifikasi Level IV SKKNI / BNSP",
      scopeDescription:
        "Sistem tata udara sentral, Chiller industri, VRV/VRF multi-inverter komersial, perancangan ducting, dan cold storage kapasitas besar.",
      color: "#d97706",
      bgClass: "tier-level-4",
      icon: Crown,
    };
  }

  if (
    lower.includes("3") ||
    lower.includes("madya") ||
    lower.includes("komersial") ||
    lower.includes("senior")
  ) {
    return {
      levelNumber: 3,
      shortBadge: "Level 3 · Madya",
      fullName: "Teknisi Madya / Senior HVAC (Level III)",
      skkniLevel: "Kualifikasi Level III SKKNI / BNSP",
      scopeDescription:
        "Instalasi dan perbaikan AC cassette, standing floor komersial, multi-split inverter, dan prosedur recovery refrigeran standar K3.",
      color: "#0284c7",
      bgClass: "tier-level-3",
      icon: ShieldCheck,
    };
  }

  if (
    lower.includes("2") ||
    lower.includes("pratama") ||
    lower.includes("residensial") ||
    lower.includes("split")
  ) {
    return {
      levelNumber: 2,
      shortBadge: "Level 2 · Pratama",
      fullName: "Teknisi Pratama Tata Udara (Level II)",
      skkniLevel: "Kualifikasi Level II SKKNI / BNSP",
      scopeDescription:
        "Pemasangan unit baru AC split residensial, cuci servis berkala, pengujian kebocoran tekanan pipa tembaga, dan proses vakum pompa.",
      color: "#16a34a",
      bgClass: "tier-level-2",
      icon: Wrench,
    };
  }

  return {
    levelNumber: 1,
    shortBadge: "Level 1 · Muda",
    fullName: "Teknisi Muda / Asisten Teknisi (Level I)",
    skkniLevel: "Kualifikasi Level I SKKNI / BNSP",
    scopeDescription:
      "Pemeliharaan preventif dasar, pembersihan filter indoor/outdoor unit, dan asisten teknisi pada instalasi lapangan.",
    color: "#6366f1",
    bgClass: "tier-level-1",
    icon: Sparkles,
  };
}

function TechniciansContent() {
  const searchParams = useSearchParams();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedProvince, setSelectedProvince] = useState(
    searchParams.get("provinsi") || "all",
  );
  const [selectedSkill, setSelectedSkill] = useState(
    searchParams.get("keahlian") || "all",
  );
  const [onlyBnsp, setOnlyBnsp] = useState(
    searchParams.get("bnsp") === "1" || searchParams.get("bnsp") === "true",
  );
  const [copiedKta, setCopiedKta] = useState<string | null>(null);
  const [activeTechModal, setActiveTechModal] = useState<Technician | null>(
    null,
  );

  const updateUrl = (
    newSearch: string,
    newProvince: string,
    newSkill: string,
    newBnsp: boolean,
  ) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newSearch.trim()) url.searchParams.set("q", newSearch.trim());
      else url.searchParams.delete("q");

      if (newProvince !== "all") url.searchParams.set("provinsi", newProvince);
      else url.searchParams.delete("provinsi");

      if (newSkill !== "all") url.searchParams.set("keahlian", newSkill);
      else url.searchParams.delete("keahlian");

      if (newBnsp) url.searchParams.set("bnsp", "1");
      else url.searchParams.delete("bnsp");

      window.history.replaceState(
        null,
        "",
        url.pathname + (url.search ? url.search : ""),
      );
    }
  };

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
        const res = await fetch(`${apiUrl}/v1/public/technicians`);
        if (!res.ok) throw new Error("Failed to load technicians");
        const json = await res.json();
        setTechnicians(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchTechs();
  }, []);

  const provinces = Array.from(
    new Set(technicians.map((t) => t.province).filter(Boolean)),
  );
  const skillLevels = Array.from(
    new Set(technicians.map((t) => t.skillLevel).filter(Boolean)),
  );

  const handleCopyKta = (e: React.MouseEvent, kta: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(kta);
    setCopiedKta(kta);
    setTimeout(() => setCopiedKta(null), 2000);
  };

  const filtered = technicians.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.ktaNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase()) ||
      t.workshopName?.toLowerCase().includes(search.toLowerCase());

    const matchProvince =
      selectedProvince === "all" || t.province === selectedProvince;

    const matchSkill =
      selectedSkill === "all" || t.skillLevel === selectedSkill;

    const matchBnsp = !onlyBnsp || t.certifiedBnsp;

    return matchSearch && matchProvince && matchSkill && matchBnsp;
  });

  return (
    <div className="technicians-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <Wrench size={15} color="#38bdf8" />
            <span>DIREKTORI NASIONAL RESMI</span>
          </div>

          <h1 className="tech-hero-title">
            Direktori Teknisi & Bengkel Pendingin{" "}
            <span className="text-gradient">Terverifikasi</span>
          </h1>

          <p className="tech-hero-lead">
            Temukan teknisi tata udara (HVAC/R) dan workshop berlisensi KTA
            resmi dengan sertifikasi kompetensi BNSP, jaminan standar K3, dan
            reputasi terpercaya di seluruh Indonesia.
          </p>

          {/* Impact Metrics Bar */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Users size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>{technicians.length || 120}+ Teknisi</strong>
                <small>38 DPD Provinsi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <ShieldCheck size={22} color="#34d399" />
              </div>
              <div>
                <strong>100% KTA Terakreditasi</strong>
                <small>Audit QR Real-Time</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Award size={22} color="#818cf8" />
              </div>
              <div>
                <strong>Standar SKKNI & BNSP</strong>
                <small>Uji Kompetensi Nasional</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Star size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>4.92 / 5.0 Rating</strong>
                <small>Kepuasan Pelanggan</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Directory Body & Interactive Search Controls */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Controls Bar */}
          <div className="tech-controls-bar">
            {/* Search Input */}
            <div className="tech-search-box">
              <Search size={17} className="search-icon" />
              <input
                id="technicians-search-input"
                name="techniciansSearch"
                type="text"
                placeholder="Cari nama teknisi, nomor KTA, kota, atau nama bengkel..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateUrl(
                    e.target.value,
                    selectedProvince,
                    selectedSkill,
                    onlyBnsp,
                  );
                }}
                aria-label="Cari nama teknisi, nomor KTA, kota, atau nama bengkel"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearch("");
                    updateUrl("", selectedProvince, selectedSkill, onlyBnsp);
                  }}
                  aria-label="Bersihkan pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="tech-filters-group">
              {/* Province Select */}
              {provinces.length > 0 && (
                <select
                  id="technicians-province-select"
                  name="techniciansProvince"
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    updateUrl(search, e.target.value, selectedSkill, onlyBnsp);
                  }}
                  className="tech-select-input"
                  aria-label="Filter berdasarkan provinsi teknisi"
                >
                  <option value="all">
                    Semua Provinsi ({provinces.length})
                  </option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}

              {/* Skill Level Select */}
              {skillLevels.length > 0 && (
                <select
                  id="technicians-skill-select"
                  name="techniciansSkill"
                  value={selectedSkill}
                  onChange={(e) => {
                    setSelectedSkill(e.target.value);
                    updateUrl(
                      search,
                      selectedProvince,
                      e.target.value,
                      onlyBnsp,
                    );
                  }}
                  className="tech-select-input"
                  aria-label="Filter berdasarkan tingkat keahlian SKKNI"
                >
                  <option value="all">Semua Jenjang Keahlian</option>
                  {skillLevels.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}

              {/* BNSP Toggle */}
              <button
                type="button"
                className={`tech-toggle-btn ${onlyBnsp ? "active" : ""}`}
                onClick={() => {
                  const nextBnsp = !onlyBnsp;
                  setOnlyBnsp(nextBnsp);
                  updateUrl(search, selectedProvince, selectedSkill, nextBnsp);
                }}
              >
                <Award size={14} />
                <span>Hanya BNSP Certified</span>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="tech-loading-state">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p>Memuat direktori teknisi resmi...</p>
            </div>
          ) : (
            <div className="tech-cards-grid">
              {filtered.length > 0 ? (
                filtered.map((tech) => (
                  <article className="tech-card-modern" key={tech.id}>
                    {/* Top Bar: Compact Skill Level Badge & BNSP/Rating */}
                    <div className="tech-card-top">
                      {(() => {
                        const tier = parseSkillLevel(tech.skillLevel);
                        const TierIcon = tier.icon;
                        return (
                          <span
                            className={`tech-level-badge-compact ${tier.bgClass}`}
                            title={`Jenjang: ${tier.fullName}`}
                          >
                            <TierIcon size={12} />
                            <span>{tier.shortBadge}</span>
                          </span>
                        );
                      })()}

                      {tech.certifiedBnsp && (
                        <span className="tech-bnsp-badge">
                          <Award size={11} />
                          <span>BNSP</span>
                        </span>
                      )}

                      {tech.rating && (
                        <span className="tech-rating-chip">
                          <Star size={11} color="#f59e0b" fill="#f59e0b" />
                          <span>{tech.rating}</span>
                        </span>
                      )}
                    </div>

                    {/* Profile Header Button */}
                    <button
                      type="button"
                      className="tech-profile-btn"
                      onClick={() => setActiveTechModal(tech)}
                    >
                      <div className="tech-avatar-frame">
                        <span className="tech-avatar-fallback">
                          {tech.name
                            .split(" ")
                            .map((n) => n[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "TK"}
                        </span>
                      </div>

                      <div className="tech-profile-copy">
                        <h4>{tech.name}</h4>
                        {tech.workshopName && (
                          <p className="tech-workshop-text">
                            {tech.workshopName}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Location Pin */}
                    <div className="tech-location-row">
                      <MapPin size={13} color="#64748b" />
                      <span>
                        {tech.city}, {tech.province}
                      </span>
                    </div>

                    {/* Footer Row: KTA Number + Actions */}
                    <div className="tech-card-footer">
                      <span className="tech-kta-chip">
                        <QrCode size={12} color="#0284c7" />
                        <span>{tech.ktaNumber}</span>
                      </span>

                      <div className="tech-actions-quick">
                        {tech.phone && (
                          <a
                            href={`https://wa.me/${tech.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-quick-wa"
                            title="Hubungi via WhatsApp"
                          >
                            <Phone size={13} />
                            <span>Kontak</span>
                          </a>
                        )}
                        <button
                          type="button"
                          className="tech-detail-btn"
                          onClick={() => setActiveTechModal(tech)}
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
                  <Wrench size={44} color="#94a3b8" />
                  <h3>Tidak Ada Teknisi yang Sesuai</h3>
                  <p>
                    Coba sesuaikan kata kunci nama, nomor KTA, atau ubah filter
                    wilayah dan jenjang keahlian.
                  </p>
                  <button
                    type="button"
                    className="button secondary btn-reset-tech"
                    onClick={() => {
                      setSearch("");
                      setSelectedProvince("all");
                      setSelectedSkill("all");
                      setOnlyBnsp(false);
                      updateUrl("", "all", "all", false);
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

      {/* 3. Smart Conversion CTA */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Anda Teknisi Pendingin dan Belum Memiliki KTA?"
        guestDescription="Daftarkan keahlian Anda sekarang untuk terdaftar di direktori resmi nasional, mendapatkan sertifikasi BNSP, dan kredit SKP profesi."
        guestPrimaryCta={{ label: "Daftar Keanggotaan", href: "/join" }}
        guestSecondaryCta={{ label: "Cek Validitas KTA", href: "/verify" }}
        memberTitle="Perbarui Portofolio & Keahlian Anda"
        memberDescription="Pastikan data bengkel dan nomor kontak WhatsApp Anda selalu mutakhir di direktori publik untuk kemudahan order pelanggan."
        memberPrimaryCta={{ label: "Buka Portal & KTA Saya", href: "/member" }}
        memberSecondaryCta={{ label: "Audit KTA Saya", href: "/whois" }}
      />

      {/* 4. Interactive Detail Modal */}
      {activeTechModal && (
        <div
          className="leader-modal-overlay"
          onClick={() => setActiveTechModal(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveTechModal(null);
          }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="leader-modal-card"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            tabIndex={0}
            role="document"
          >
            {/* Modal Header */}
            <div className="leader-modal-header">
              <div className="modal-title-wrap">
                <ShieldCheck size={20} color="#0284c7" />
                <h3>Kredensial & Profil Teknisi Resmi</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveTechModal(null)}
                aria-label="Tutup detail modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="leader-modal-body">
              {/* Profile Hero Header */}
              {(() => {
                const tier = parseSkillLevel(activeTechModal.skillLevel);
                const TierIcon = tier.icon;
                return (
                  <>
                    <div className="modal-profile-hero">
                      <div
                        className="tech-avatar-frame"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "16px",
                          fontSize: "18px",
                        }}
                      >
                        <span>
                          {activeTechModal.name
                            .split(" ")
                            .map((n) => n[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "TK"}
                        </span>
                      </div>

                      <div className="modal-profile-copy" style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className={`tech-level-badge-compact ${tier.bgClass}`}
                            style={{ fontSize: "11px" }}
                          >
                            <TierIcon size={12} />
                            <span>{tier.shortBadge}</span>
                          </span>

                          {activeTechModal.certifiedBnsp && (
                            <span className="tech-bnsp-badge">
                              <Award size={11} />
                              <span>BNSP Certified</span>
                            </span>
                          )}

                          {activeTechModal.rating && (
                            <span className="tech-rating-chip">
                              <Star size={11} color="#f59e0b" fill="#f59e0b" />
                              <span>{activeTechModal.rating}</span>
                            </span>
                          )}
                        </div>

                        <h4
                          style={{
                            fontSize: "18px",
                            fontWeight: 800,
                            margin: "0 0 3px",
                            color: "#0f172a",
                          }}
                        >
                          {activeTechModal.name}
                        </h4>
                        <p
                          className="modal-role"
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          {activeTechModal.workshopName ||
                            "Praktisi / Workshop Mandiri Terdaftar"}
                        </p>
                      </div>
                    </div>

                    {/* Competency Leveling Box */}
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${tier.color}0a 0%, #f8fafc 100%)`,
                        border: `1px solid ${tier.color}35`,
                        borderRadius: "16px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              background: `${tier.color}18`,
                              color: tier.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <TierIcon size={18} />
                          </div>
                          <div>
                            <strong
                              style={{
                                fontSize: "14.5px",
                                fontWeight: 800,
                                color: "#0f172a",
                                display: "block",
                              }}
                            >
                              {tier.fullName}
                            </strong>
                            <small
                              style={{
                                color: tier.color,
                                fontWeight: 700,
                                fontSize: "11px",
                                textTransform: "uppercase",
                                letterSpacing: "0.4px",
                              }}
                            >
                              {tier.skkniLevel}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #f1f5f9",
                          borderRadius: "10px",
                          padding: "10px 12px",
                        }}
                      >
                        <small
                          style={{
                            display: "block",
                            fontSize: "10.5px",
                            fontWeight: 800,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "4px",
                          }}
                        >
                          Ruang Lingkup Pengerjaan & Kapasitas Alat
                        </small>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12.5px",
                            lineHeight: "1.55",
                            color: "#334155",
                          }}
                        >
                          {tier.scopeDescription}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Data Grid */}
              <div className="modal-data-grid">
                <div className="modal-data-item">
                  <small>Nomor KTA Nasional</small>
                  <strong className="font-mono">
                    {activeTechModal.ktaNumber}
                  </strong>
                </div>
                <div className="modal-data-item">
                  <small>Wilayah Penugasan</small>
                  <strong>
                    {activeTechModal.city}, {activeTechModal.province}
                  </strong>
                </div>
                <div className="modal-data-item">
                  <small>Sertifikasi BNSP</small>
                  <span className="modal-status-pill">
                    <CheckCircle2 size={12} />
                    <span>
                      {activeTechModal.certifiedBnsp
                        ? "Terlisensi BNSP Sah"
                        : "Asesmen Kompetensi"}
                    </span>
                  </span>
                </div>
                <div className="modal-data-item">
                  <small>Status Ketersediaan</small>
                  <strong style={{ color: "#16a34a" }}>✓ Siap Melayani</strong>
                </div>
              </div>

              {/* Actions Row */}
              <div className="modal-actions-row">
                {activeTechModal.phone ? (
                  <a
                    href={`https://wa.me/${activeTechModal.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button primary btn-modal-action"
                  >
                    <MessageSquare size={15} />
                    <span>Hubungi via WhatsApp</span>
                  </a>
                ) : (
                  <Link
                    href={`/whois?q=${encodeURIComponent(activeTechModal.ktaNumber)}`}
                    className="button primary btn-modal-action"
                    onClick={() => setActiveTechModal(null)}
                  >
                    <ExternalLink size={15} />
                    <span>Audit di Registri Publik</span>
                  </Link>
                )}
                <button
                  type="button"
                  className="button secondary btn-modal-copy"
                  onClick={(e) => handleCopyKta(e, activeTechModal.ktaNumber)}
                >
                  <Copy size={15} />
                  <span>
                    {copiedKta === activeTechModal.ktaNumber
                      ? "KTA Tersalin!"
                      : "Salin No. KTA"}
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

export default function TechniciansPage() {
  return (
    <Suspense
      fallback={
        <div className="tech-loading-state" style={{ minHeight: "50vh" }}>
          <Loader2 size={36} className="animate-spin text-primary" />
          <p>Memuat direktori teknisi resmi...</p>
        </div>
      }
    >
      <TechniciansContent />
    </Suspense>
  );
}
