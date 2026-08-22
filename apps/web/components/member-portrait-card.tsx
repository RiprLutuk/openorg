"use client";

import html2canvas from "html2canvas";
import { Download, Printer, QrCode, RefreshCw } from "lucide-react";
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
      width: 160,
      margin: 0,
      color: { dark: "#0b192c", light: "#ffffff" },
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
      link.download = `Kartu_Anggota_${safeName}.png`;
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
  const korwilText = member.positionName || "ANGGOTA RESMI";
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="portrait-kta-container">
      {/* 1. Official ASISI Portrait ID Card (Target for Download & Print) */}
      <div id="modern-id-card" ref={cardRef} className="modern-id-card-element">
        {/* Abstract Glowing Auroras */}
        <div className="id-glow-top-right" />
        <div className="id-glow-bottom-left" />

        {/* Card Header */}
        <div className="id-header">
          {organization.logoUrl ? (
            <img
              src={organization.logoUrl}
              alt={organization.name}
              className="id-header-logo"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="id-header-logo-initial">
              {organization.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="id-header-text">
            <h3 className="id-header-title">{organization.name}</h3>
            <p className="id-header-sub">
              Asosiasi Praktisi Tata Udara
              <br />
              Dan Pendingin Indonesia
            </p>
          </div>
        </div>

        {/* Circular Profile Photo with Fiery Gradient Ring */}
        <div className="id-photo-container">
          <div className="id-photo-ring">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="id-photo"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="id-photo id-photo-placeholder">
                <span>{initials}</span>
              </div>
            )}
          </div>
        </div>

        {/* Member Name & Number */}
        <div className="id-info">
          <div className="id-name">{member.name}</div>
          <div className="id-number">{member.memberNumber || card.code}</div>
        </div>

        {/* Glassmorphism Bottom Details */}
        <div className="id-details-glass">
          <div className="id-regions">
            <div>
              <div className="id-region-label">DPD / UNIT</div>
              <div className="id-region-value">{dpdText}</div>
            </div>
            <div>
              <div className="id-region-label">STATUS JABATAN</div>
              <div className="id-region-value">{korwilText}</div>
            </div>
          </div>
          <div className="id-qr-box">
            {qrUrl ? (
              <img src={qrUrl} alt="QR Verifikasi KTA" className="id-qr-img" />
            ) : (
              <QrCode size={55} color="#0b192c" />
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Controls (Not Captured in Download/Print) */}
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
              <Download size={17} /> Download Kartu (PNG)
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
