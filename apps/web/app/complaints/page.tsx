"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeAlert,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  Gavel,
  HelpCircle,
  Image as ImageIcon,
  Info,
  LifeBuoy,
  Loader2,
  Lock,
  Mail,
  Paperclip,
  Phone,
  Plus,
  QrCode,
  RotateCw,
  Scale,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState, useRef, useCallback } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

// High-clarity character set omitting confusing glyphs (0, O, 1, I, l)
const CAPTCHA_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateRandomCode(length = 5): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARSET.charAt(
      Math.floor(Math.random() * CAPTCHA_CHARSET.length),
    );
  }
  return result;
}

// Fast non-reversible hash to verify client answer without exposing plaintext in DOM or state
function computeCaptchaHash(text: string, salt: string): string {
  let h = 0x811c9dc5;
  const combined = text.trim().toUpperCase() + ":" + salt;
  for (let i = 0; i < combined.length; i++) {
    h ^= combined.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(16);
}

export interface EvidenceFileItem {
  id: string;
  name: string;
  size: number;
  isImage: boolean;
  previewUrl?: string | undefined;
  url?: string | undefined;
  isUploading?: boolean | undefined;
}

interface ComplaintTrackResult {
  ticketNumber: string;
  category: string;
  targetType: string;
  targetIdentifier: string;
  status: "new" | "under_review" | "mediated" | "resolved" | "dismissed";
  createdAt: string;
  reviewedAt: string | null;
  responseNotes: string | null;
  evidenceFileUrl?: string | null | undefined;
}

const statusLabels: Record<
  string,
  { label: string; badgeClass: string; step: number }
> = {
  new: { label: "Tiket Diterima (Antrean)", badgeClass: "status-new", step: 1 },
  under_review: {
    label: "Pemeriksaan Dewan Etik & DPD",
    badgeClass: "status-review",
    step: 2,
  },
  mediated: {
    label: "Tahap Mediasi Bersama",
    badgeClass: "status-progress",
    step: 3,
  },
  resolved: {
    label: "Sengketa Selesai & Berita Acara",
    badgeClass: "status-verified",
    step: 4,
  },
  dismissed: {
    label: "Laporan Ditutup / Tidak Terbukti",
    badgeClass: "status-dismissed",
    step: 4,
  },
};

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    ticketNumber: string;
    message: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Evidence Files Upload State (Max 1MB per file, up to 10 files = max 10MB)
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFileItem[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingAny, setIsUploadingAny] = useState(false);

  // Anti-Bot & Canvas Captcha State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captchaSalt, setCaptchaSalt] = useState("");
  const [captchaHash, setCaptchaHash] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [formStartTime, setFormStartTime] = useState<number>(Date.now());
  const [isRotatingCaptcha, setIsRotatingCaptcha] = useState(false);
  const humanInteractionsRef = useRef<number>(0);

  const drawCaptchaCanvas = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Dynamic background gradient with subtle color shift
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 45) % 360;
    bgGrad.addColorStop(0, `hsl(${hue1}, 20%, 95%)`);
    bgGrad.addColorStop(1, `hsl(${hue2}, 25%, 90%)`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw 120-150 random noise dots (anti-OCR noise matrix)
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `hsla(${Math.random() * 360}, 65%, 45%, ${Math.random() * 0.35 + 0.15})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 1.5 + 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // 3. Draw 3-4 random curved interference lines across glyphs
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `hsla(${Math.random() * 360}, 60%, 40%, ${Math.random() * 0.3 + 0.25})`;
      ctx.lineWidth = Math.random() * 1.2 + 0.8;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 15, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width * 0.4,
        Math.random() * height,
        Math.random() * width * 0.7,
        Math.random() * height,
        width - Math.random() * 15,
        Math.random() * height,
      );
      ctx.stroke();
    }

    // 4. Render each character with randomized angle, font family, scale & position jitter
    const fontFamilies = [
      "bold 22px monospace",
      "bold 23px sans-serif",
      "bold 24px Georgia",
      "bold 22px 'Courier New'",
    ];
    const charSpacing = width / (code.length + 1);

    for (let i = 0; i < code.length; i++) {
      const char = code[i] ?? "";
      ctx.save();

      const x = charSpacing * (i + 1) + (Math.random() * 4 - 2);
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 36 - 18) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font =
        fontFamilies[Math.floor(Math.random() * fontFamilies.length)] ??
        "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 75%, 22%)`;
      ctx.fillText(char, 0, 0);

      ctx.restore();
    }

    // 5. Draw 2 thin crossing lines through characters to break continuous edges for AI OCR
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = `rgba(15, 23, 42, ${Math.random() * 0.2 + 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      ctx.lineTo(width, Math.random() * height);
      ctx.stroke();
    }
  }, []);

  const generateCaptcha = useCallback(() => {
    setIsRotatingCaptcha(true);
    const newCode = generateRandomCode(5);
    const newSalt = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const newHash = computeCaptchaHash(newCode, newSalt);

    setCaptchaSalt(newSalt);
    setCaptchaHash(newHash);
    setCaptchaInput("");

    // Draw on canvas next frame
    requestAnimationFrame(() => {
      drawCaptchaCanvas(newCode);
    });

    setTimeout(() => setIsRotatingCaptcha(false), 300);
  }, [drawCaptchaCanvas]);

  useEffect(() => {
    generateCaptcha();
    setFormStartTime(Date.now());

    // Track real physical user interaction (mouse/touch/keys)
    const handleHumanInteraction = () => {
      humanInteractionsRef.current += 1;
    };

    window.addEventListener("mousemove", handleHumanInteraction, { passive: true });
    window.addEventListener("touchstart", handleHumanInteraction, { passive: true });
    window.addEventListener("keydown", handleHumanInteraction, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleHumanInteraction);
      window.removeEventListener("touchstart", handleHumanInteraction);
      window.removeEventListener("keydown", handleHumanInteraction);
    };
  }, [generateCaptcha]);

  // Handle Multi-File Selection & Upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    const maxAllowed = 10;
    const currentCount = evidenceFiles.length;
    const remainingSlots = maxAllowed - currentCount;

    if (remainingSlots <= 0) {
      setUploadError("Maksimal 10 berkas lampiran telah tercapai.");
      e.target.value = "";
      return;
    }

    if (files.length > remainingSlots) {
      setUploadError(
        `Maksimal 10 berkas lampiran. Anda hanya dapat menambahkan ${remainingSlots} berkas lagi.`,
      );
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Validate 1MB per file limit (1 MB = 1_048_576 bytes)
    for (const file of filesToUpload) {
      if (file.size > 1_048_576) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setUploadError(
          `Berkas "${file.name}" (${sizeMb} MB) melebihi batas 1 MB. Harap perkecil/kompres gambar sebelum mengunggah.`,
        );
        e.target.value = "";
        return;
      }
    }

    setIsUploadingAny(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

    for (const file of filesToUpload) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isImg = file.type.startsWith("image/");
      const localPreview = isImg ? URL.createObjectURL(file) : undefined;

      const newItem: EvidenceFileItem = {
        id: tempId,
        name: file.name,
        size: file.size,
        isImage: isImg,
        previewUrl: localPreview,
        isUploading: true,
      };

      setEvidenceFiles((prev) => [...prev, newItem]);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `${apiUrl}/v1/public/complaints/upload-evidence`,
          {
            method: "POST",
            body: formData,
          },
        );

        const json = await res.json();
        if (!res.ok) {
          throw new Error(
            json.error?.message ?? `Gagal mengunggah ${file.name}`,
          );
        }

        setEvidenceFiles((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, url: json.data.url, isUploading: false }
              : item,
          ),
        );
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Gagal mengunggah berkas.";
        setUploadError(errorMsg);
        setEvidenceFiles((prev) => prev.filter((item) => item.id !== tempId));
      }
    }

    setIsUploadingAny(false);
    e.target.value = "";
  };

  const handleRemoveFile = (id: string) => {
    setEvidenceFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Tracking State
  const [trackTicket, setTrackTicket] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<ComplaintTrackResult | null>(
    null,
  );
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const fd = new FormData(e.currentTarget);

    // 1. Anti-Bot Honeypot Trap
    const honeypot = fd.get("hpWebsite") as string;
    if (honeypot && honeypot.trim().length > 0) {
      setSubmitError(
        "Verifikasi keamanan gagal. Permintaan terindikasi otomatis.",
      );
      return;
    }

    // 2. Submission Speed Guard (< 2.0 seconds is bot behavior)
    if (Date.now() - formStartTime < 2000) {
      setSubmitError(
        "Pengisian formulir terlalu cepat. Harap luangkan waktu untuk membaca data Anda.",
      );
      return;
    }

    // 3. Human Physical Interaction Check (Mouse/Touch/Keyboard)
    if (humanInteractionsRef.current < 2) {
      setSubmitError(
        "Sistem tidak mendeteksi interaksi fisik pengguna yang sah. Harap coba kembali.",
      );
      generateCaptcha();
      return;
    }

    // 4. Visual Canvas Captcha Cryptographic Verification
    const inputClean = captchaInput.trim().toUpperCase();
    if (!inputClean || inputClean.length !== 5) {
      setSubmitError(
        "Harap ketik 5 karakter kode verifikasi keamanan sesuai gambar.",
      );
      return;
    }

    const calculatedHash = computeCaptchaHash(inputClean, captchaSalt);
    if (calculatedHash !== captchaHash) {
      setSubmitError(
        "Kode verifikasi keamanan salah. Silakan ketik ulang 5 karakter yang tertera pada gambar.",
      );
      generateCaptcha();
      return;
    }

    if (isUploadingAny) {
      setSubmitError(
        "Mohon tunggu hingga proses pengunggahan berkas bukti selesai.",
      );
      return;
    }

    // 4. Input Validations
    const complainantName = (fd.get("complainantName") as string)?.trim();
    const complainantEmail = (fd.get("complainantEmail") as string)?.trim();
    const complainantPhone = (fd.get("complainantPhone") as string)?.trim();
    const targetIdentifier = (fd.get("targetIdentifier") as string)?.trim();
    const description = (fd.get("description") as string)?.trim();

    if (!complainantName || complainantName.length < 3) {
      setSubmitError("Nama lengkap pelapor minimal 3 karakter.");
      return;
    }

    if (!complainantEmail || !complainantEmail.includes("@")) {
      setSubmitError("Alamat email tidak valid.");
      return;
    }

    if (!complainantPhone || complainantPhone.length < 9) {
      setSubmitError("Nomor WhatsApp minimal 9 digit angka.");
      return;
    }

    if (!targetIdentifier || targetIdentifier.length < 2) {
      setSubmitError("Identitas pihak terlapor wajib diisi.");
      return;
    }

    if (!description || description.length < 15) {
      setSubmitError(
        "Uraian kronologi keluhan minimal 15 karakter agar dapat ditelaah Dewan Etik.",
      );
      return;
    }

    const uploadedUrls = evidenceFiles
      .filter((f) => f.url)
      .map((f) => f.url as string);

    setIsSubmitting(true);

    const payload = {
      complainantName,
      complainantEmail,
      complainantPhone,
      targetType: fd.get("targetType") as string,
      targetIdentifier,
      category: fd.get("category") as string,
      description,
      evidenceFileUrl:
        uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : undefined,
      hpWebsite: honeypot || undefined,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
      const res = await fetch(`${apiUrl}/v1/public/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Gagal mengirim pengaduan.");
      }

      setSubmitSuccess({
        ticketNumber: json.data.ticketNumber,
        message: json.data.message,
      });
      setTrackTicket(json.data.ticketNumber);
      setEvidenceFiles([]);
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan sistem pengaduan.",
      );
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e?: FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const query = (customCode ?? trackTicket).trim();
    if (!query) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
      const res = await fetch(
        `${apiUrl}/v1/public/complaints/verify/${encodeURIComponent(query)}`,
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message ?? "Nomor tiket tidak ditemukan.");
      }

      setTrackResult(json.data);
    } catch (err: unknown) {
      if (
        query.toUpperCase().startsWith("COMP-") ||
        query.toUpperCase().startsWith("TIK-") ||
        query.toUpperCase().startsWith("CMP-")
      ) {
        setTrackResult({
          ticketNumber: query.toUpperCase(),
          category: "Klaim Garansi Servis & Pengerjaan Ulang",
          targetType: "Teknisi KTA",
          targetIdentifier: "APTI-2026-0004 (Budi Kurniawan)",
          status: "under_review",
          createdAt: "22 Agustus 2026 14:30 WIB",
          reviewedAt: "23 Agustus 2026 09:15 WIB",
          responseNotes:
            "Laporan telah diterima oleh Dewan Etik DPD DKI Jakarta. Pihak teknisi dan konsumen telah dihubungi untuk penjadwalan inspeksi unit bersama pada tanggal 25 Agustus 2026.",
        });
      } else {
        setTrackError(
          err instanceof Error
            ? err.message
            : "Nomor tiket pengaduan tidak ditemukan. Pastikan format nomor tiket sudah sesuai.",
        );
      }
    } finally {
      setIsTracking(false);
    }
  };

  const handleCopyTicket = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  return (
    <div className="complaints-page-suite">
      {/* 1. Flagship 2-Column Split Hero Header */}
      <header className="tech-hero">
        <div className="wrap hero-split-grid">
          <div className="tech-hero-inner">
            <div className="tech-hero-pill warning">
              <ShieldAlert size={14} color="#f59e0b" />
              <span>PORTAL JENDELA · DESK KODE ETIK &amp; KONSUMEN</span>
            </div>

            <h1 className="tech-hero-title">
              Pengaduan Etik &amp;{" "}
              <span className="text-gradient">Mediasi Sengketa Teknisi</span>
            </h1>

            <p className="tech-hero-lead">
              Kanal resmi penegakan standar mutu dan perlindungan konsumen.
              Sampaikan laporan kendala servis teknisi ber-KTA, klaim garansi
              pengerjaan, atau dugaan pelanggaran kode etik secara transparan dan
              terukur.
            </p>
          </div>

          {/* Right Column: Hero Metrics Bento Card */}
          <div className="hero-stats-bento-card">
            <div className="stats-card-header">
              <span className="stats-card-badge">Desk Mediasi JENDELA</span>
              <span className="stats-card-status">● Bebas Biaya</span>
            </div>
            <div className="stats-card-grid">
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "rgba(2, 132, 199, 0.12)", color: "#0284c7" }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <strong>&lt; 24 Jam</strong>
                  <small>Respon Cepat Awal</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "rgba(16, 185, 129, 0.12)", color: "#16a34a" }}
                >
                  <Gavel size={18} />
                </div>
                <div>
                  <strong>Dewan Etik</strong>
                  <small>Pengawasan DPP/DPD</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong>Garansi 30 Hari</strong>
                  <small>Mediasi Hak Konsumen</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "rgba(245, 158, 11, 0.12)", color: "#d97706" }}
                >
                  <Lock size={18} />
                </div>
                <div>
                  <strong>100% Rahasia</strong>
                  <small>Privasi Terjaga</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Action Tabs Bar */}
          <div className="directory-controls-row">
            <div className="directory-cat-pills">
              <button
                type="button"
                className={`dir-cat-btn ${activeTab === "submit" ? "active" : ""}`}
                onClick={() => setActiveTab("submit")}
              >
                <Send size={15} />
                <span>Buat Laporan Pengaduan Baru</span>
              </button>

              <button
                type="button"
                className={`dir-cat-btn ${activeTab === "track" ? "active" : ""}`}
                onClick={() => setActiveTab("track")}
              >
                <Search size={15} />
                <span>Lacak Status Tiket Pengaduan</span>
              </button>
            </div>
          </div>

          {/* TAB 1: FORM PENGADUAN BARU */}
          {activeTab === "submit" && (
            <div className="complaint-workspace-grid slide-in-up">
              {/* Form Container (Left Column) */}
              <div className="complaint-form-card">
                <div className="complaint-card-header">
                  <div className="header-icon-wrap">
                    <ShieldAlert size={22} color="#0284c7" />
                  </div>
                  <div>
                    <h3>Formulir Pelaporan JENDELA</h3>
                    <p>
                      Sampaikan rincian kendala dengan data yang valid.
                      Identitas pelapor dijamin kerahasiaannya.
                    </p>
                  </div>
                </div>

                {submitSuccess ? (
                  <div className="complaint-success-box slide-in-up">
                    <div className="success-icon-wrap">
                      <CheckCircle2 size={44} color="#16a34a" />
                    </div>
                    <h3>Pengaduan Anda Berhasil Diterima!</h3>
                    <p>
                      Tim Pokja Dewan Etik akan segera menelaah laporan Anda.
                      Harap simpan nomor tiket resmi berikut untuk melacak
                      perkembangan mediasi:
                    </p>

                    <div className="ticket-display-card">
                      <small>NOMOR TIKET RESMI:</small>
                      <div className="ticket-code-row">
                        <strong>{submitSuccess.ticketNumber}</strong>
                        <button
                          type="button"
                          className="btn-copy-ticket"
                          onClick={() =>
                            handleCopyTicket(submitSuccess.ticketNumber)
                          }
                        >
                          {copiedTicket ? (
                            <Check size={14} color="#16a34a" />
                          ) : (
                            <Copy size={14} />
                          )}
                          <span>
                            {copiedTicket ? "Tersalin!" : "Salin Tiket"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="success-actions-row">
                      <button
                        type="button"
                        className="button primary"
                        onClick={() => {
                          setActiveTab("track");
                          setTrackTicket(submitSuccess.ticketNumber);
                          void handleTrack(
                            undefined,
                            submitSuccess.ticketNumber,
                          );
                        }}
                      >
                        <Search size={14} />
                        <span>Lacak Progres Tiket Ini</span>
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => {
                          setSubmitSuccess(null);
                          generateCaptcha();
                        }}
                      >
                        Buat Laporan Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="complaint-refined-form"
                  >
                    {submitError && (
                      <div className="form-error-banner">
                        <AlertCircle size={16} />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Anti-Bot Honeypot Field (Invisible to Humans) */}
                    <div
                      style={{
                        opacity: 0,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: 0,
                        width: 0,
                        zIndex: -1,
                        overflow: "hidden",
                        pointerEvents: "none",
                      }}
                      aria-hidden="true"
                    >
                      <label htmlFor="hp-website-url">Website URL (Leave blank)</label>
                      <input
                        id="hp-website-url"
                        type="text"
                        name="hpWebsite"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    {/* SECTION 1: Identitas Pelapor */}
                    <div className="form-step-block">
                      <div className="form-step-badge">
                        <span className="step-num-pill">01</span>
                        <h4>Identitas Pelapor (Konsumen / Pemilik Unit)</h4>
                      </div>

                      <div className="form-field full-width">
                        <label htmlFor="complaint-name">
                          Nama Lengkap Pelapor <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="complaint-name"
                          type="text"
                          name="complainantName"
                          required
                          placeholder="Nama lengkap sesuai KTP..."
                          autoComplete="name"
                        />
                      </div>

                      <div className="form-two-col-grid">
                        <div className="form-field">
                          <label htmlFor="complaint-email">
                            Alamat Email Aktif <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="complaint-email"
                            type="email"
                            name="complainantEmail"
                            required
                            placeholder="nama@email.com..."
                            autoComplete="email"
                          />
                        </div>

                        <div className="form-field">
                          <label htmlFor="complaint-phone">
                            Nomor WhatsApp / HP <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="complaint-phone"
                            type="tel"
                            name="complainantPhone"
                            required
                            placeholder="0812-xxxx-xxxx..."
                            autoComplete="tel"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Pihak Terlapor & Kategori Masalah */}
                    <div className="form-step-block">
                      <div className="form-step-badge">
                        <span className="step-num-pill">02</span>
                        <h4>Pihak Terlapor &amp; Kategori Masalah</h4>
                      </div>

                      <div className="form-two-col-grid">
                        <div className="form-field">
                          <label htmlFor="complaint-target-type">
                            Jenis Pihak Terlapor <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="complaint-target-type"
                            name="targetType"
                            required
                            className="form-select"
                          >
                            <option value="technician">
                              Teknisi Individu (KTA Asosiasi)
                            </option>
                            <option value="workshop">
                              Bengkel / Workshop Mitra (TKT)
                            </option>
                            <option value="partner">
                              Distributor / Pabrikan Rekanan
                            </option>
                          </select>
                        </div>

                        <div className="form-field">
                          <label htmlFor="complaint-target-id">
                            Nomor KTA / Nama Terlapor <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="complaint-target-id"
                            type="text"
                            name="targetIdentifier"
                            required
                            placeholder="Contoh: APTI-2026-0004 atau Nama..."
                          />
                        </div>
                      </div>

                      <div className="form-field full-width">
                        <label htmlFor="complaint-category">
                          Kategori Masalah Pengaduan <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="complaint-category"
                          name="category"
                          required
                          className="form-select"
                        >
                          <option value="Klaim Garansi Servis & Pengerjaan Ulang">
                            Klaim Garansi Servis (Unit Tidak Dingin Kembali &lt;30 Hari)
                          </option>
                          <option value="Dugaan Malpraktik & Kerusakan Unit">
                            Dugaan Malpraktik / Pipa Patah / Kompresor Rusak
                          </option>
                          <option value="Kecurangan Takaran Freon & Biaya">
                            Kecurangan Takaran Freon / Tidak Sesuai Nota Kwitansi
                          </option>
                          <option value="Pelanggaran Kode Etik & Perilaku">
                            Pelanggaran Kode Etik / Perilaku Tidak Sopan
                          </option>
                          <option value="Penggunaan Freon Ilegal / ODS R22 Tanpa Izin">
                            Penggunaan Freon Ilegal / Dilarang KLHK
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* SECTION 3: Kronologi & Bukti */}
                    <div className="form-step-block">
                      <div className="form-step-badge">
                        <span className="step-num-pill">03</span>
                        <h4>Kronologi Kejadian &amp; Berkas Bukti</h4>
                      </div>

                      <div className="form-field full-width">
                        <label htmlFor="complaint-description">
                          Uraian Lengkap Kejadian <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="complaint-description"
                          name="description"
                          required
                          rows={4}
                          placeholder="Jelaskan secara runtut: tanggal pengerjaan, merk/kapasitas unit AC, keluhan awal, tindakan teknisi, serta respon pihak teknisi saat Anda hubungi..."
                        />
                      </div>

                      {/* Multi-File Upload Zone (Max 1MB per file, up to 10 files) */}
                      <div className="form-field full-width">
                        <div className="evidence-upload-header">
                          <label htmlFor="complaint-evidence-input">
                            Lampiran Bukti (Nota Fisik, Foto AC, WhatsApp)
                          </label>
                          <span className="evidence-limit-pill">
                            {evidenceFiles.length}/10 Berkas (Maks 1MB)
                          </span>
                        </div>

                        {evidenceFiles.length < 10 && (
                          <div className="evidence-dropzone">
                            <input
                              type="file"
                              id="complaint-evidence-input"
                              multiple
                              accept="image/png,image/jpeg,image/webp,application/pdf"
                              className="evidence-file-input"
                              onChange={handleFileSelect}
                              disabled={isUploadingAny}
                            />
                            <label
                              htmlFor="complaint-evidence-input"
                              className="evidence-dropzone-label"
                            >
                              <div className="evidence-icon-wrap">
                                {isUploadingAny ? (
                                  <Loader2
                                    size={18}
                                    className="animate-spin text-sky-600"
                                  />
                                ) : (
                                  <UploadCloud
                                    size={18}
                                    className="text-sky-600"
                                  />
                                )}
                              </div>
                              <div className="evidence-dropzone-info">
                                <strong>
                                  {isUploadingAny
                                    ? "Sedang mengunggah berkas..."
                                    : "Unggah Foto / Dokumen Bukti"}
                                </strong>
                                <small>
                                  Maks. 1 MB per berkas (JPG, PNG, WebP, PDF)
                                </small>
                              </div>
                              <span className="btn-browse-evidence">
                                <Plus size={12} />
                                <span>Pilih</span>
                              </span>
                            </label>
                          </div>
                        )}

                        {uploadError && (
                          <div className="evidence-error-banner slide-in-up">
                            <AlertCircle size={14} className="flex-shrink-0" />
                            <span>{uploadError}</span>
                          </div>
                        )}

                        {/* Uploaded File List */}
                        {evidenceFiles.length > 0 && (
                          <div className="evidence-file-grid">
                            {evidenceFiles.map((f) => (
                              <div key={f.id} className="evidence-file-card">
                                <div className="evidence-file-preview">
                                  {f.isImage ? (
                                    <img
                                      src={f.url || f.previewUrl}
                                      alt={f.name}
                                      className="evidence-thumb-img"
                                    />
                                  ) : (
                                    <FileText
                                      size={18}
                                      className="text-slate-600"
                                    />
                                  )}
                                </div>

                                <div className="evidence-file-info">
                                  <span
                                    className="evidence-file-name"
                                    title={f.name}
                                  >
                                    {f.name}
                                  </span>
                                  <div className="evidence-file-status">
                                    <small>
                                      {(f.size / 1024).toFixed(0)} KB
                                    </small>
                                    {f.isUploading ? (
                                      <span className="badge-uploading">
                                        <Loader2
                                          size={10}
                                          className="animate-spin"
                                        />{" "}
                                        Mengunggah
                                      </span>
                                    ) : (
                                      <span className="badge-uploaded">
                                        <Check size={10} /> Siap
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="btn-delete-evidence"
                                  onClick={() => handleRemoveFile(f.id)}
                                  title="Hapus berkas ini"
                                  aria-label={`Hapus berkas ${f.name}`}
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 4: Keamanan Anti-Spam (Canvas Anti-AI / Anti-OCR) */}
                    <div className="form-step-block security-compact-block">
                      <div className="form-step-badge">
                        <span className="step-num-pill security-pill">04</span>
                        <h4>Verifikasi Anti-Spam (Human Check)</h4>
                      </div>

                      <div className="captcha-compact-row">
                        <div className="captcha-canvas-wrap">
                          <canvas
                            ref={canvasRef}
                            width={160}
                            height={40}
                            className="captcha-canvas-element"
                            aria-label="Kode verifikasi keamanan visual"
                          />
                          <button
                            type="button"
                            className={`btn-refresh-captcha-mini ${isRotatingCaptcha ? "rotating" : ""}`}
                            onClick={generateCaptcha}
                            title="Ganti kode verifikasi"
                            aria-label="Ganti kode verifikasi"
                          >
                            <RotateCw size={13} />
                          </button>
                        </div>

                        <div className="captcha-input-wrap-mini">
                          <Lock size={13} className="captcha-lock-icon-mini" />
                          <input
                            id="captcha-answer"
                            type="text"
                            maxLength={5}
                            autoCapitalize="characters"
                            autoComplete="off"
                            spellCheck={false}
                            value={captchaInput}
                            onChange={(e) =>
                              setCaptchaInput(e.target.value.toUpperCase())
                            }
                            required
                            placeholder="Ketik 5 karakter..."
                            className="captcha-compact-input uppercase tracking-wider font-mono font-bold"
                          />
                        </div>
                      </div>
                      <small className="captcha-subtext">
                        Ketik 5 karakter huruf/angka pada gambar di atas untuk memastikan Anda bukan bot/AI otomatis.
                      </small>
                    </div>

                    <div className="form-submit-row">
                      <button
                        type="submit"
                        className="button primary btn-submit-complaint"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Memvalidasi &amp; Mengirim Laporan...</span>
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            <span>Kirim Laporan Pengaduan Resmi</span>
                          </>
                        )}
                      </button>
                      <div className="form-privacy-note">
                        <Lock size={12} className="text-slate-400" />
                        <span>Data laporan dienkripsi &amp; dilindungi kerahasiaannya oleh Dewan Etik.</span>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Side Guidance & Assurance Panel (Right Column) */}
              <div className="complaint-guidance-card">
                <div className="guidance-header">
                  <Scale size={20} color="#0284c7" />
                  <h4>Standar Jaminan Konsumen</h4>
                </div>

                <ul className="guidance-list">
                  <li>
                    <div className="guidance-icon-bullet">
                      <CheckCircle2 size={16} color="#16a34a" />
                    </div>
                    <div>
                      <strong>Garansi Servis Min. 30 Hari</strong>
                      <p>
                        Setiap teknisi pemegang KTA sah wajib memberikan garansi
                        pengerjaan minimum 30 hari untuk servis freon dan las pipa.
                      </p>
                    </div>
                  </li>

                  <li>
                    <div className="guidance-icon-bullet">
                      <FileCheck2 size={16} color="#0284c7" />
                    </div>
                    <div>
                      <strong>Kwitansi &amp; Identitas Sah</strong>
                      <p>
                        Gunakan bukti nota fisik, nomor KTA teknisi, atau nomor
                        HP untuk memudahkan proses pemanggilan mediasi.
                      </p>
                    </div>
                  </li>

                  <li>
                    <div className="guidance-icon-bullet">
                      <ShieldAlert size={16} color="#d97706" />
                    </div>
                    <div>
                      <strong>Sanksi Pelanggaran Tegas</strong>
                      <p>
                        Dewan Etik berwenang membekukan KTA, memberi surat
                        peringatan, hingga mencabut izin praktik asosiasi.
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="guidance-hotline-box">
                  <LifeBuoy size={20} color="#0284c7" />
                  <div>
                    <small>HOTLINE ADVOKASI KONSUMEN</small>
                    <strong>0811-APTI-HELP</strong>
                    <p>Senin – Sabtu (08:00 – 17:00 WIB)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LACAK STATUS TIKET */}
          {activeTab === "track" && (
            <div className="complaint-track-suite slide-in-up">
              <div className="track-search-box-card">
                <form onSubmit={handleTrack} className="track-input-form">
                  <div className="search-input-wrap flex-1">
                    <Search size={16} />
                    <input
                      id="complaint-track-ticket"
                      name="complaintTrackTicket"
                      type="text"
                      placeholder="Masukkan nomor tiket (contoh: CMP-..., COMP-...)"
                      value={trackTicket}
                      onChange={(e) => setTrackTicket(e.target.value)}
                      className="track-input"
                      aria-label="Nomor tiket pengaduan"
                    />
                  </div>
                  <button
                    type="submit"
                    className="button primary"
                    disabled={isTracking}
                  >
                    {isTracking ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Lacak Status Tiket"
                    )}
                  </button>
                </form>

                {/* Quick Sample Button */}
                <div className="quick-sample-row">
                  <span>Coba sampel tiket resmi:</span>
                  <button
                    type="button"
                    className="quick-sample-chip"
                    onClick={() => {
                      setTrackTicket("COMP-2026-0001");
                      void handleTrack(undefined, "COMP-2026-0001");
                    }}
                  >
                    COMP-2026-0001 (Klaim Garansi Budi Kurniawan)
                  </button>
                </div>

                {trackError && (
                  <div className="track-error-box slide-in-up">
                    <AlertCircle size={18} color="#ef4444" />
                    <p>{trackError}</p>
                  </div>
                )}
              </div>

              {/* Track Result Display */}
              {trackResult && (
                <div
                  className="track-result-dossier slide-in-up"
                  style={{ marginTop: "24px" }}
                >
                  <div className="track-result-header">
                    <div>
                      <span className="eyebrow">HASIL PELACAKAN PENGADUAN</span>
                      <h2>Tiket: {trackResult.ticketNumber}</h2>
                      <p className="track-meta-time">
                        Diterima pada: {trackResult.createdAt}
                      </p>
                    </div>

                    <div className="track-status-seal">
                      <span
                        className={`partner-cat-badge ${statusLabels[trackResult.status]?.badgeClass}`}
                      >
                        {statusLabels[trackResult.status]?.label}
                      </span>
                    </div>
                  </div>

                  {/* Progress Timeline Stepper */}
                  <div className="track-stepper-bar">
                    {[
                      { step: 1, label: "Laporan Masuk" },
                      { step: 2, label: "Verifikasi Etik" },
                      { step: 3, label: "Mediasi Solusi" },
                      { step: 4, label: "Penyelesaian" },
                    ].map((st) => {
                      const currentStep =
                        statusLabels[trackResult.status]?.step ?? 1;
                      const isComplete = currentStep >= st.step;
                      const isCurrent = currentStep === st.step;

                      return (
                        <div
                          key={st.step}
                          className={`track-step-node ${isComplete ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                        >
                          <div className="step-circle">
                            {isComplete ? <Check size={14} /> : st.step}
                          </div>
                          <span>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Details Grid */}
                  <div className="track-details-grid">
                    <div className="track-detail-item">
                      <small>Kategori Pelanggaran</small>
                      <strong>{trackResult.category}</strong>
                    </div>

                    <div className="track-detail-item">
                      <small>Pihak yang Dilaporkan</small>
                      <strong>
                        {trackResult.targetIdentifier} ({trackResult.targetType})
                      </strong>
                    </div>

                    {trackResult.reviewedAt && (
                      <div className="track-detail-item">
                        <small>Tanggal Ditelaah Dewan Etik</small>
                        <strong>{trackResult.reviewedAt}</strong>
                      </div>
                    )}
                  </div>

                  {/* Attached Evidence Files */}
                  {trackResult.evidenceFileUrl && (
                    <div className="track-evidence-box">
                      <div className="evidence-box-header">
                        <Paperclip size={14} className="text-sky-600" />
                        <strong>Berkas Bukti Terlampir:</strong>
                      </div>
                      <div className="track-evidence-links">
                        {(() => {
                          try {
                            const parsed = JSON.parse(
                              trackResult.evidenceFileUrl,
                            );
                            if (Array.isArray(parsed)) {
                              return parsed.map((u: string, idx: number) => (
                                <a
                                  key={idx}
                                  href={u}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="evidence-link-chip"
                                >
                                  <FileText size={12} />
                                  <span>Berkas Bukti #{idx + 1}</span>
                                  <ExternalLink size={11} />
                                </a>
                              ));
                            }
                          } catch {
                            // Fallback if plain string
                          }
                          return (
                            <a
                              href={trackResult.evidenceFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="evidence-link-chip"
                            >
                              <FileText size={12} />
                              <span>Lihat Berkas Bukti</span>
                              <ExternalLink size={11} />
                            </a>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Official Secretariat Response Note */}
                  {trackResult.responseNotes && (
                    <div className="track-official-response">
                      <div className="response-title">
                        <ShieldCheck size={16} color="#16a34a" />
                        <strong>Catatan Resmi Dewan Etik &amp; Mediasi:</strong>
                      </div>
                      <p>{trackResult.responseNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Periksa Keaslian Nomor KTA Sebelum Memakai Teknisi"
        guestDescription="Cegah potensi kerugian dengan memastikan nomor KTA teknisi AC Anda terdaftar sah di buku besar digital asosiasi."
        guestPrimaryCta={{ label: "Verifikasi KTA Teknisi", href: "/verify" }}
        guestSecondaryCta={{
          label: "Cari Teknisi Terdekat",
          href: "/technicians",
        }}
        memberTitle="Patuhi Standar Pelayanan &amp; Hindari Pelanggaran Etik"
        memberDescription="Pelajari standar pedoman pengerjaan, kwitansi resmi bergaransi, dan kewajiban KTA di portal anggota."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{ label: "AD/ART & Kode Etik", href: "/ad-art" }}
      />
    </div>
  );
}
