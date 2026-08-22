"use client";

import html2canvas from "html2canvas";
import {
  CheckCircle2,
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
    theme?:
      | {
          colors?: {
            primary?: string;
            secondary?: string;
            accent?: string;
          };
        }
      | null
      | undefined;
    primaryColor?: string | null | undefined;
    secondaryColor?: string | null | undefined;
    accentColor?: string | null | undefined;
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

  const rawPrimary =
    organization.theme?.colors?.primary ||
    organization.primaryColor ||
    "#8b5cf6";
  const rawSecondary =
    organization.theme?.colors?.secondary ||
    organization.secondaryColor ||
    "#06b6d4";
  const rawAccent =
    organization.theme?.colors?.accent || organization.accentColor || "#f59e0b";

  const primaryColor =
    rawPrimary.startsWith("#") || rawPrimary.startsWith("rgb")
      ? rawPrimary
      : "#8b5cf6";
  const secondaryColor =
    rawSecondary.startsWith("#") || rawSecondary.startsWith("rgb")
      ? rawSecondary
      : "#06b6d4";
  const accentColor =
    rawAccent.startsWith("#") || rawAccent.startsWith("rgb")
      ? rawAccent
      : "#f59e0b";

  const cardCustomStyles = {
    "--kta-primary": primaryColor,
    "--kta-secondary": secondaryColor,
    "--kta-accent": accentColor,
  } as React.CSSProperties;

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
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
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
      {/* 1. Next-Gen Modern ID Card (Target for Download & Print) */}
      <div
        id="modern-id-card"
        ref={cardRef}
        className="genz-cyber-card"
        style={{
          ...cardCustomStyles,
          width: "350px",
          height: "580px",
          background: "linear-gradient(180deg, #111726 0%, #080c14 100%)",
          borderRadius: "20px",
          position: "relative",
          overflow: "hidden",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12)",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          color: "#ffffff",
          margin: "0 auto",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px 22px 16px",
        }}
      >
        {/* Top Ambient Highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "280px",
            height: "140px",
            background:
              "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Flat Top Micro-Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 10,
            width: "100%",
            paddingBottom: "2px",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 800,
              letterSpacing: "1.5px",
              color: "#94a3b8",
              textTransform: "uppercase",
              lineHeight: "1",
            }}
          >
            KTA DIGITAL
          </span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "9px",
              fontWeight: 800,
              letterSpacing: "1.2px",
              color: "#34d399",
              textTransform: "uppercase",
              lineHeight: "1",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#34d399",
                boxShadow: "0 0 8px #34d399",
                display: "inline-block",
              }}
            />
            <span>AKTIF</span>
          </div>
        </div>

        {/* Organization Brand Header (Centered Symmetry) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
            margin: "0",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              padding: "3px",
              flexShrink: 0,
              marginBottom: "6px",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="cyber-brand-logo"
                crossOrigin="anonymous"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#ffffff",
                }}
              >
                {organization.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: "13.5px",
              fontWeight: 800,
              letterSpacing: "0.6px",
              color: "#ffffff",
              textTransform: "uppercase",
              lineHeight: "1.3",
              margin: 0,
            }}
          >
            {organization.name}
          </div>
          <div
            style={{
              fontSize: "8px",
              color: "#94a3b8",
              fontWeight: 600,
              letterSpacing: "0.8px",
              lineHeight: "1.2",
              marginTop: "2px",
              textTransform: "uppercase",
            }}
          >
            Official Accredited Membership
          </div>
        </div>

        {/* Concentric Avatar Visual */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
            zIndex: 10,
            margin: "0",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "104px",
              height: "104px",
            }}
          >
            {/* Outer Ring */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "104px",
                height: "104px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              }}
            />
            {/* Dark Gap Bezel */}
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: "3px",
                width: "98px",
                height: "98px",
                borderRadius: "50%",
                background: "#080c14",
              }}
            />
            {/* Avatar Image / Placeholder */}
            <div
              style={{
                position: "absolute",
                top: "6px",
                left: "6px",
                width: "92px",
                height: "92px",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="cyber-avatar-img"
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    background: "#1e293b",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    color: "#ffffff",
                    fontSize: "30px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                  }}
                >
                  {initials}
                </div>
              )}
            </div>
            {/* Verified Check Badge */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "#0284c7",
                color: "#ffffff",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "grid",
                placeItems: "center",
                border: "2px solid #080c14",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.5)",
                zIndex: 5,
              }}
            >
              <CheckCircle2 size={13} />
            </div>
          </div>
        </div>

        {/* Member Identity & Flat Serial */}
        <div
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 10,
            margin: "0",
          }}
        >
          <div
            style={{
              fontSize: "15.5px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              lineHeight: "1.3",
              padding: "0 4px",
              margin: 0,
            }}
          >
            {member.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
              marginTop: "4px",
              lineHeight: "1",
              color: "#cbd5e1",
            }}
          >
            <span style={{ color: "#64748b", fontWeight: 800 }}>NO.</span>
            <span style={{ color: "#38bdf8" }}>
              {member.memberNumber || card.code}
            </span>
          </div>
        </div>

        {/* Clean Info & QR Spec Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "10px 12px",
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "7.5px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  color: "#64748b",
                  textTransform: "uppercase",
                  marginBottom: "1px",
                }}
              >
                UNIT / WILAYAH
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  lineHeight: "1.25",
                  color: "#f1f5f9",
                }}
              >
                {dpdText}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "7.5px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  color: "#64748b",
                  textTransform: "uppercase",
                  marginBottom: "1px",
                }}
              >
                STATUS & KREDENSIAL
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  lineHeight: "1.25",
                  color: "#34d399",
                }}
              >
                {positionText}
              </span>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div>
                <span
                  style={{
                    fontSize: "7.5px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    color: "#64748b",
                    textTransform: "uppercase",
                  }}
                >
                  TERBIT
                </span>
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "#cbd5e1",
                  }}
                >
                  {formattedIssueDate}
                </div>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "7.5px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    color: "#64748b",
                    textTransform: "uppercase",
                  }}
                >
                  VERSI
                </span>
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "#cbd5e1",
                  }}
                >
                  v{card.version ?? 1}.0
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "3px",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="QR Verifikasi KTA"
                  style={{
                    width: "54px",
                    height: "54px",
                    display: "block",
                  }}
                />
              ) : (
                <QrCode size={54} color="#090d16" />
              )}
            </div>
            <span
              style={{
                fontSize: "7px",
                fontWeight: 800,
                letterSpacing: "0.8px",
                color: "#64748b",
                marginTop: "3px",
                lineHeight: "1",
                textTransform: "uppercase",
              }}
            >
              PINDAI VALIDASI
            </span>
          </div>
        </div>

        {/* Bottom Security Micro-Decal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "8px",
            fontWeight: 700,
            letterSpacing: "1.2px",
            color: "#64748b",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
            position: "relative",
            zIndex: 10,
            whiteSpace: "nowrap",
            lineHeight: "1",
            textTransform: "uppercase",
          }}
        >
          <span>KARTU TANDA ANGGOTA DIGITAL RESMI</span>
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
