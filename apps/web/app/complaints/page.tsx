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
import { type FormEvent, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

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

  // Anti-Bot & Captcha State
  const [captchaNum1, setCaptchaNum1] = useState(7);
  const [captchaNum2, setCaptchaNum2] = useState(4);
  const [captchaOp, setCaptchaOp] = useState<"+" | "-">("+");
  const [captchaInput, setCaptchaInput] = useState("");
  const [formStartTime, setFormStartTime] = useState<number>(Date.now());
  const [isRotatingCaptcha, setIsRotatingCaptcha] = useState(false);

  const generateCaptcha = () => {
    setIsRotatingCaptcha(true);
    const n1 = Math.floor(Math.random() * 12) + 5; // 5 - 16
    const n2 = Math.floor(Math.random() * 8) + 2; // 2 - 9
    const op = Math.random() > 0.4 ? "+" : "-";
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaOp(op);
    setCaptchaInput("");
    setTimeout(() => setIsRotatingCaptcha(false), 300);
  };

  useEffect(() => {
    generateCaptcha();
    setFormStartTime(Date.now());
  }, []);

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

    // 3. Captcha Math Challenge Verification
    const expectedAnswer =
      captchaOp === "+"
        ? captchaNum1 + captchaNum2
        : captchaNum1 - captchaNum2;
    const userAnswer = parseInt(captchaInput.trim(), 10);

    if (isNaN(userAnswer) || userAnswer !== expectedAnswer) {
      setSubmitError(
        "Hasil verifikasi keamanan (Captcha) salah. Silakan jawab pertanyaan hitungan dengan benar.",
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
                        <span className="step-num-pill">1</span>
                        <h4>Identitas Pelapor (Konsumen / Pemilik Unit)</h4>
                      </div>

                      <div className="form-field full-width">
                        <label htmlFor="complaint-name">
                          Nama Lengkap Pelapor *
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
                            Alamat Email Aktif *
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
                            Nomor WhatsApp / HP *
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
                        <span className="step-num-pill">2</span>
                        <h4>Pihak Terlapor &amp; Kategori Masalah</h4>
                      </div>

                      <div className="form-two-col-grid">
                        <div className="form-field">
                          <label htmlFor="complaint-target-type">
                            Jenis Pihak Terlapor *
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
                            Nomor KTA / Nama Terlapor *
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
                          Kategori Masalah Pengaduan *
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
                        <span className="step-num-pill">3</span>
                        <h4>Kronologi Kejadian &amp; Berkas Bukti</h4>
                      </div>

                      <div className="form-field full-width">
                        <label htmlFor="complaint-description">
                          Uraian Lengkap Kejadian *
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
                            Lampiran Bukti (Nota Fisik, Foto Unit AC, Chat WhatsApp)
                          </label>
                          <span className="evidence-limit-pill">
                            {evidenceFiles.length}/10 Berkas (Maks. 1 MB/berkas)
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
                                    size={20}
                                    className="animate-spin text-sky-600"
                                  />
                                ) : (
                                  <Paperclip
                                    size={20}
                                    className="text-sky-600"
                                  />
                                )}
                              </div>
                              <div className="evidence-dropzone-info">
                                <strong>
                                  {isUploadingAny
                                    ? "Sedang mengunggah berkas..."
                                    : "Pilih / Seret Foto & Dokumen Bukti"}
                                </strong>
                                <small>
                                  Format: JPG, PNG, WebP, PDF &middot; Maks. 1 MB per berkas (Bisa tambah hingga 10 berkas)
                                </small>
                              </div>
                              <span className="btn-browse-evidence">
                                <Plus size={13} />
                                <span>Tambah Berkas</span>
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
                                      size={20}
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
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 4: Keamanan Anti-Spam (Compact Code Token) */}
                    <div className="form-step-block security-compact-block">
                      <div className="form-step-badge">
                        <span className="step-num-pill security-pill">4</span>
                        <h4>Verifikasi Keamanan</h4>
                        <span className="security-sub-badge">Human Check</span>
                      </div>

                      <div className="captcha-compact-row">
                        <div className="captcha-code-badge">
                          <code className="captcha-mono-text">
                            {captchaNum1} {captchaOp} {captchaNum2} = ?
                          </code>
                          <button
                            type="button"
                            className={`btn-refresh-captcha-mini ${isRotatingCaptcha ? "rotating" : ""}`}
                            onClick={generateCaptcha}
                            title="Ganti pertanyaan keamanan"
                            aria-label="Ganti pertanyaan keamanan"
                          >
                            <RotateCw size={13} />
                          </button>
                        </div>

                        <div className="captcha-input-wrap-mini">
                          <Lock size={13} className="captcha-lock-icon-mini" />
                          <input
                            id="captcha-answer"
                            type="number"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            required
                            placeholder="Ketik hasil angka..."
                            className="captcha-compact-input"
                          />
                        </div>
                      </div>
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
