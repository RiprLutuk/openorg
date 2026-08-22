"use client";

import html2canvas from "html2canvas";
import {
  CheckCircle2,
  Cpu,
  Download,
  Printer,
  QrCode,
  RefreshCw,
  Zap,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export interface MemberPortraitCardProps {
  member: {
    name: string;
    memberNumber: string;
    avatarUrl?: string | null | undefined;
    unitName?: string | null | undefined;
    positionName?: string | null | undefined;
    status?: string | undefined;
  };
  card: {
    code: string;
    issuedAt: string;
    expiresAt?: string | null | undefined;
    version?: number | undefined;
  };
  organization: {
    name: string;
    logoUrl?: string | null | undefined;
  };
}

export function MemberPortraitCard({
  member,
  card,
  organization,
}: MemberPortraitCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify?code=${encodeURIComponent(card.code || member.memberNumber)}`
      : `/verify?code=${encodeURIComponent(card.code || member.memberNumber)}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 180,
      margin: 0,
      color: { dark: "#090d16", light: "#ffffff" },
    })
      .then(setQrUrl)
      .catch((err) => console.error("Failed to generate QR code", err));
  }, [verifyUrl]);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Ultra HD Retina 300 DPI
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeName = member.name.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `KTA_Digital_${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal mengunduh kartu:", err);
      alert("Gagal mengunduh kartu anggota. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  const dpdText = member.unitName || "DPP NASIONAL";
  const positionText = member.positionName || "CERTIFIED PRACTITIONER";
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedIssueDate = new Date(
    card.issuedAt || Date.now(),
  ).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="portrait-kta-container">
      {/* 1. Next-Gen Cyber-Energetic KTA Card (Target for Download & Print) */}
      <div id="modern-id-card" ref={cardRef} className="genz-cyber-card">
        {/* Holographic Refractive Aura Flairs */}
        <div className="cyber-flare-violet" />
        <div className="cyber-flare-cyan" />
        <div className="cyber-flare-amber" />
        <div className="cyber-grid-overlay" />

        {/* Top Micro-Header Bar */}
        <div className="cyber-top-bar">
          <div className="cyber-pass-tag">
            <Zap size={11} className="tag-icon text-amber" />
            <span>KTA DIGITAL {"//"} PASS 2026</span>
          </div>
          <div className="cyber-chip-badge">
            <Cpu size={14} className="chip-icon" />
            <span className="nfc-dot" />
          </div>
        </div>

        {/* Organization Brand Header */}
        <div className="cyber-brand-row">
          <div className="cyber-logo-wrapper">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="cyber-brand-logo"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="cyber-logo-fallback">
                {organization.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="cyber-brand-text">
            <div className="cyber-brand-name">{organization.name}</div>
            <div className="cyber-brand-tagline">
              Official Accredited Membership
            </div>
          </div>
          <div className="cyber-status-pill">
            <span className="pulse-green" /> ACTIVE
          </div>
        </div>

        {/* Futuristic Concentric Avatar Visual */}
        <div className="cyber-avatar-section">
          <div className="cyber-avatar-halo">
            <div className="cyber-avatar-ring">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="cyber-avatar-img"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="cyber-avatar-placeholder">
                  <span>{initials}</span>
                </div>
              )}
            </div>
            <div className="cyber-avatar-badge" title="Verified Member">
              <CheckCircle2 size={16} />
            </div>
          </div>
        </div>

        {/* Member Identity & Holographic Serial */}
        <div className="cyber-identity-section">
          <div className="cyber-member-name">{member.name}</div>
          <div className="cyber-serial-badge">
            <span className="serial-label">NO.</span>
            <span className="serial-value">
              {member.memberNumber || card.code}
            </span>
          </div>
        </div>

        {/* Cyber-HUD Bottom Glass Container */}
        <div className="cyber-hud-glass">
          <div className="hud-corner-tl" />
          <div className="hud-corner-br" />

          <div className="hud-info-col">
            <div className="hud-item">
              <span className="hud-label">UNIT / WILAYAH</span>
              <span className="hud-value hud-value-cyan">{dpdText}</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">STATUS & KREDENSIAL</span>
              <span className="hud-value hud-value-lime">{positionText}</span>
            </div>
            <div className="hud-item hud-meta-row">
              <div>
                <span className="hud-label">TERBIT</span>
                <span className="hud-subvalue">{formattedIssueDate}</span>
              </div>
              <div>
                <span className="hud-label">VERSI</span>
                <span className="hud-subvalue">v{card.version ?? 1}.0</span>
              </div>
            </div>
          </div>

          <div className="hud-qr-container">
            <div className="qr-reticle">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="QR Verifikasi KTA"
                  className="hud-qr-image"
                />
              ) : (
                <QrCode size={60} color="#090d16" />
              )}
            </div>
            <span className="qr-scan-hint">SCAN {"//"} AUTH</span>
          </div>
        </div>

        {/* Bottom Security Micro-Decal */}
        <div className="cyber-bottom-decal">
          <span>COMPLYFLOW SECURE CREDENTIAL</span>
          <span className="decal-divider">{"///"}</span>
          <span>ZERO-TRUST VERIFIED</span>
        </div>
      </div>

      {/* 2. Action Controls (Excluded from Download / Print) */}
      <div className="kta-action-controls no-print">
        <button
          type="button"
          onClick={downloadCard}
          disabled={isDownloading}
          className="button primary btn-download-kta"
        >
          {isDownloading ? (
            <>
              <RefreshCw size={17} className="spin" /> Memproses Kartu HD...
            </>
          ) : (
            <>
              <Download size={17} /> Download KTA (PNG HD)
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="button secondary btn-print-kta"
        >
          <Printer size={17} /> Cetak ID Card
        </button>
      </div>
    </div>
  );
}
