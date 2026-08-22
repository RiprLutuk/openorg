"use client";

import type { PublicSite } from "@openorg/contracts";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Props = {
  site: PublicSite;
  unitCount: number;
  eventCount: number;
};

export function HomeHeroInteractive({ site, unitCount, eventCount }: Props) {
  const [activeCardTab, setActiveCardTab] = useState<"kta" | "verify">("kta");
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    status: "idle" | "valid" | "searching";
    name?: string;
    role?: string;
    number?: string;
    expiry?: string;
    unit?: string;
  }>({ status: "idle" });

  const handleSimulateVerify = (codeToTest?: string) => {
    const target = codeToTest ?? verifyInput;
    if (!target.trim()) return;
    setVerifyResult({ status: "searching" });
    setTimeout(() => {
      setVerifyResult({
        status: "valid",
        name: "Ir. Hendra Gunawan, M.T.",
        role: "Teknisi Utama & Pengurus DPP",
        number: target.trim().toUpperCase().startsWith("KTA-")
          ? target.trim().toUpperCase()
          : `KTA-${target.trim().toUpperCase()}`,
        expiry: "31 Des 2027 · Valid",
        unit: "Dewan Pimpinan Pusat (DPP)",
      });
    }, 450);
  };

  return (
    <section className="home-hero-refined">
      <div className="hero-mesh-background" />
      <div className="wrap home-hero-grid">
        {/* Left Column: Authoritative Copy & CTAs */}
        <div className="hero-copy-column">
          <div className="hero-live-pill">
            <span className="live-pulse-dot" />
            <span className="pill-text">
              Platform Registri & Verifikasi Resmi
            </span>
            <span className="pill-badge">v2.4</span>
          </div>

          <h1 className="hero-main-title">
            Tata Kelola Organisasi Mandiri, Transparan, &{" "}
            <span className="title-gradient">Terverifikasi.</span>
          </h1>

          <p className="hero-main-description">
            Pusat layanan keanggotaan mandiri, penerbitan KTA digital ber-QR,
            kredit kompetensi SKP, dan audit kredensial publik instan.
          </p>

          <div className="hero-cta-group">
            <Link href="/join" className="btn-hero-primary">
              <UserPlus size={17} />
              <span>Daftar Anggota</span>
              <ArrowRight size={15} className="btn-arrow" />
            </Link>

            <div className="hero-cta-secondary-row">
              <Link href="/member/login" className="btn-hero-secondary">
                <CreditCard size={16} />
                <span>Portal Anggota</span>
              </Link>

              <Link href="/verify" className="btn-hero-ghost">
                <BadgeCheck size={16} />
                <span>Cek KTA</span>
              </Link>
            </div>
          </div>

          {/* Key Metrics / Live Counters */}
          <div className="hero-metrics-row">
            <div className="metric-box">
              <div className="metric-icon-wrap">
                <Building2 size={18} />
              </div>
              <div className="metric-copy">
                <strong>{unitCount || "14+"}</strong>
                <span>Pengurus Wilayah</span>
              </div>
            </div>

            <div className="metric-separator" />

            <div className="metric-box">
              <div className="metric-icon-wrap">
                <GraduationCap size={18} />
              </div>
              <div className="metric-copy">
                <strong>{eventCount || "8+"}</strong>
                <span>Agenda & SKP</span>
              </div>
            </div>

            <div className="metric-separator" />

            <div className="metric-box">
              <div className="metric-icon-wrap">
                <ShieldCheck size={18} />
              </div>
              <div className="metric-copy">
                <strong>100%</strong>
                <span>Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Digital KTA & Realtime Verification Simulator */}
        <div className="hero-card-column">
          <div className="interactive-card-wrapper">
            {/* Card Floating Tabs */}
            <div className="card-floating-tabs">
              <button
                type="button"
                className={`card-tab-btn ${
                  activeCardTab === "kta" ? "active" : ""
                }`}
                onClick={() => setActiveCardTab("kta")}
              >
                <CreditCard size={15} />
                <span>KTA Digital</span>
              </button>
              <button
                type="button"
                className={`card-tab-btn ${
                  activeCardTab === "verify" ? "active" : ""
                }`}
                onClick={() => setActiveCardTab("verify")}
              >
                <Zap size={15} />
                <span>Simulasi Verifikasi</span>
              </button>
            </div>

            {/* TAB 1: Digital KTA Holographic Card */}
            {activeCardTab === "kta" && (
              <div className="digital-kta-card">
                <div className="kta-card-glow" />
                <div className="kta-card-sheen" />

                <div className="kta-card-header">
                  <div className="kta-org-brand">
                    {site.organization.logoUrl ? (
                      <img
                        src={site.organization.logoUrl}
                        alt=""
                        className="kta-org-logo"
                      />
                    ) : (
                      <span className="kta-org-logo-placeholder">
                        {site.organization.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <strong className="kta-org-name">
                        {site.organization.name}
                      </strong>
                      <small className="kta-card-type">
                        KARTU TANDA ANGGOTA RESMI
                      </small>
                    </div>
                  </div>
                  <div className="kta-security-chip">
                    <span className="chip-gold-lines" />
                  </div>
                </div>

                <div className="kta-card-body">
                  <div className="kta-member-photo-frame">
                    <div className="kta-photo-inner">
                      <span>HG</span>
                    </div>
                    <span
                      className="kta-verified-badge"
                      title="Terverifikasi DPP"
                    >
                      <CheckCircle2 size={13} />
                    </span>
                  </div>

                  <div className="kta-member-details">
                    <h3 className="kta-member-name">
                      Ir. Hendra Gunawan, M.T.
                    </h3>
                    <p className="kta-member-title">
                      Teknisi Utama HVAC/R · Sertifikasi BNSP
                    </p>
                    <div className="kta-member-meta-grid">
                      <div>
                        <small>NO. ANGGOTA (KTA)</small>
                        <strong>KTA-2026-08892</strong>
                      </div>
                      <div>
                        <small>STATUS / WILAYAH</small>
                        <span className="kta-status-pill">
                          ● AKTIF · DPP PUSAT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="kta-card-footer">
                  <div className="kta-qr-wrap">
                    <div className="kta-qr-code">
                      <QrCode size={38} />
                    </div>
                    <div className="kta-qr-text">
                      <small>PINDAI UNTUK AUDIT KEABSAHAN</small>
                      <strong>openorg.id/verify/KTA-2026-08892</strong>
                    </div>
                  </div>
                  <span className="kta-official-seal">
                    <ShieldCheck size={20} />
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: Instant Verification Simulator Desk */}
            {activeCardTab === "verify" && (
              <div className="verification-simulator-card">
                <div className="sim-header">
                  <div className="sim-badge">
                    <Sparkles size={14} />
                    <span>Mesin Verifikasi ComplyFlow</span>
                  </div>
                  <h3>Uji Keaslian KTA & Kredensial</h3>
                  <p>
                    Ketik nomor KTA atau pilih sampel di bawah untuk menguji
                    sistem validasi real-time.
                  </p>
                </div>

                <div className="sim-input-row">
                  <div className="sim-input-wrap">
                    <Search size={16} className="sim-search-icon" />
                    <input
                      type="text"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      placeholder="Contoh: KTA-2026-08892"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSimulateVerify();
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-sim-verify"
                    onClick={() => handleSimulateVerify()}
                    disabled={verifyResult.status === "searching"}
                  >
                    {verifyResult.status === "searching"
                      ? "Mengecek…"
                      : "Verifikasi"}
                  </button>
                </div>

                {/* Sample quick-fill chips */}
                <div className="sim-sample-chips">
                  <small>Coba nomor sampel:</small>
                  <button
                    type="button"
                    className="sample-chip"
                    onClick={() => {
                      setVerifyInput("KTA-2026-08892");
                      handleSimulateVerify("KTA-2026-08892");
                    }}
                  >
                    KTA-2026-08892
                  </button>
                  <button
                    type="button"
                    className="sample-chip"
                    onClick={() => {
                      setVerifyInput("SKP-2026-0104");
                      handleSimulateVerify("SKP-2026-0104");
                    }}
                  >
                    SKP-2026-0104
                  </button>
                </div>

                {/* Result Card Preview */}
                {verifyResult.status === "valid" && (
                  <div className="sim-result-box valid-enter">
                    <div className="sim-result-top">
                      <span className="valid-pill">
                        <CheckCircle2 size={14} /> Keabsahan Terkonfirmasi
                      </span>
                      <small className="timestamp">Real-time Validated</small>
                    </div>
                    <div className="sim-result-body">
                      <h4>{verifyResult.name}</h4>
                      <p>{verifyResult.role}</p>
                      <div className="sim-result-tags">
                        <span>No: {verifyResult.number}</span>
                        <span>Masa Berlaku: {verifyResult.expiry}</span>
                        <span>Unit: {verifyResult.unit}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom floating hint */}
            <div className="card-footnote">
              <ShieldCheck size={14} />
              <span>Sistem Kredensial Terenkripsi & Anti-Pemalsuan BNSP</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
