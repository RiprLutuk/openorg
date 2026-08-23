"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [onlyBnsp, setOnlyBnsp] = useState(false);
  const [copiedKta, setCopiedKta] = useState<string | null>(null);
  const [activeTechModal, setActiveTechModal] = useState<Technician | null>(
    null,
  );

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
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
                type="text"
                placeholder="Cari nama teknisi, nomor KTA, kota, atau nama bengkel..."
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

            {/* Filters Row */}
            <div className="tech-filters-group">
              {/* Province Select */}
              {provinces.length > 0 && (
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="tech-select-input"
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
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="tech-select-input"
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
                onClick={() => setOnlyBnsp(!onlyBnsp)}
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
                    {/* Top Bar: Skill Badge & Status */}
                    <div className="tech-card-top">
                      <span className="tech-skill-badge">
                        <Wrench size={12} />
                        <span>{tech.skillLevel || "Teknisi"}</span>
                      </span>

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
                      <button
                        type="button"
                        className="tech-kta-btn"
                        onClick={(e) => handleCopyKta(e, tech.ktaNumber)}
                        title="Klik untuk menyalin nomor KTA"
                      >
                        <QrCode size={12} />
                        <span>{tech.ktaNumber}</span>
                        {copiedKta === tech.ktaNumber ? (
                          <span className="copy-indicator success">
                            <Check size={11} /> Salin!
                          </span>
                        ) : (
                          <span className="copy-indicator">
                            <Copy size={11} />
                          </span>
                        )}
                      </button>

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

      {/* 3. Bottom Conversion CTA */}
      <section className="tech-bottom-cta">
        <div className="wrap">
          <div className="tech-cta-shell">
            <div className="tech-cta-content">
              <h2>Anda Teknisi Pendingin dan Belum Memiliki KTA?</h2>
              <p>
                Daftarkan keahlian Anda sekarang untuk terdaftar di direktori
                resmi nasional, mendapatkan sertifikasi BNSP, dan kredit SKP
                profesi.
              </p>
            </div>
            <div className="tech-cta-actions">
              <Link href="/join" className="button primary btn-cta-main">
                <span>Daftar Keanggotaan</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/verify" className="button secondary btn-cta-sec">
                <span>Cek Validitas KTA</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Detail Modal */}
      {activeTechModal && (
        <div
          className="leader-modal-overlay"
          onClick={() => setActiveTechModal(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveTechModal(null);
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div className="leader-modal-card" role="document">
            <div className="leader-modal-header">
              <div className="modal-title-wrap">
                <ShieldCheck size={20} color="#38bdf8" />
                <h3>Profil Teknisi & Workshop Resmi</h3>
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

            <div className="leader-modal-body">
              <div className="modal-profile-hero">
                <div className="modal-avatar-frame">
                  <span className="modal-avatar-fallback">
                    {activeTechModal.name
                      .split(" ")
                      .map((n) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "TK"}
                  </span>
                </div>

                <div className="modal-profile-copy">
                  <span className="modal-tier-badge">
                    {activeTechModal.skillLevel || "Teknisi Profesional"}
                  </span>
                  <h4>{activeTechModal.name}</h4>
                  {activeTechModal.workshopName && (
                    <p className="modal-role">{activeTechModal.workshopName}</p>
                  )}
                </div>
              </div>

              <div className="modal-data-grid">
                <div className="modal-data-item">
                  <small>Nomor KTA Digital</small>
                  <strong>{activeTechModal.ktaNumber}</strong>
                </div>
                <div className="modal-data-item">
                  <small>Sertifikasi BNSP</small>
                  <span className="modal-status-pill">
                    <CheckCircle2 size={12} />{" "}
                    {activeTechModal.certifiedBnsp
                      ? "Terakreditasi BNSP"
                      : "Dalam Proses"}
                  </span>
                </div>
                <div className="modal-data-item">
                  <small>Wilayah Layanan</small>
                  <strong>
                    {activeTechModal.city}, {activeTechModal.province}
                  </strong>
                </div>
                <div className="modal-data-item">
                  <small>Status Ketersediaan</small>
                  <strong style={{ color: "#16a34a" }}>Siap Melayani</strong>
                </div>
              </div>

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
