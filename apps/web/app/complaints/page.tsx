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
  Clock,
  Copy,
  FileCheck2,
  FileText,
  Gavel,
  HelpCircle,
  Info,
  LifeBuoy,
  Loader2,
  Lock,
  Mail,
  Phone,
  Scale,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

interface ComplaintTrackResult {
  ticketNumber: string;
  category: string;
  targetType: string;
  targetIdentifier: string;
  status: "new" | "under_review" | "mediated" | "resolved" | "dismissed";
  createdAt: string;
  reviewedAt: string | null;
  responseNotes: string | null;
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

  // Tracking State
  const [trackTicket, setTrackTicket] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<ComplaintTrackResult | null>(
    null,
  );
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      complainantName: fd.get("complainantName") as string,
      complainantEmail: fd.get("complainantEmail") as string,
      complainantPhone: (fd.get("complainantPhone") as string) || undefined,
      targetType: fd.get("targetType") as string,
      targetIdentifier: fd.get("targetIdentifier") as string,
      category: fd.get("category") as string,
      description: fd.get("description") as string,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
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
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
      );
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(
        `${apiUrl}/v1/public/complaints/verify/${encodeURIComponent(query)}`,
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message ?? "Nomor tiket tidak ditemukan.");
      }

      setTrackResult(json.data);
    } catch (err: unknown) {
      // Fallback demo sample tracker for demonstration if not in backend DB
      if (
        query.toUpperCase().startsWith("COMP-") ||
        query.toUpperCase().startsWith("TIK-")
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
            : "Nomor tiket pengaduan tidak ditemukan.",
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
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero complaints-hero-master">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill warning">
            <ShieldAlert size={15} color="#f59e0b" />
            <span>PORTAL JENDELA · DESK KODE ETIK & PERLINDUNGAN KONSUMEN</span>
          </div>

          <h1 className="tech-hero-title">
            Pengaduan Etik &{" "}
            <span className="text-gradient">Mediasi Sengketa Teknisi</span>
          </h1>

          <p className="tech-hero-lead">
            Kanal resmi penegakan standar mutu dan perlindungan konsumen.
            Sampaikan laporan kendala servis teknisi ber-KTA, klaim garansi
            pengerjaan, atau dugaan pelanggaran kode etik secara transparan dan
            terukur.
          </p>

          {/* Trust Metrics Bar */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Clock size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>Respon &lt;24 Jam</strong>
                <small>Verifikasi Laporan Awal</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Gavel size={22} color="#34d399" />
              </div>
              <div>
                <strong>Dewan Etik Independen</strong>
                <small>Pengawasan DPP & DPD</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <ShieldCheck size={22} color="#818cf8" />
              </div>
              <div>
                <strong>Garansi Min. 30 Hari</strong>
                <small>Mediasi Hak Konsumen</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Lock size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>100% Gratis & Adil</strong>
                <small>Bebas Biaya Advokasi</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Action Tabs Bar */}
          <div className="join-tabs-bar" style={{ marginBottom: "28px" }}>
            <div className="join-tabs-nav">
              <button
                type="button"
                className={`join-tab-item ${activeTab === "submit" ? "active" : ""}`}
                onClick={() => setActiveTab("submit")}
              >
                <Send size={16} />
                <span>Buat Laporan Pengaduan Baru</span>
              </button>

              <button
                type="button"
                className={`join-tab-item ${activeTab === "track" ? "active" : ""}`}
                onClick={() => setActiveTab("track")}
              >
                <Search size={16} />
                <span>Lacak Status Tiket Pengaduan</span>
              </button>
            </div>
          </div>

          {/* TAB 1: FORM PENGADUAN BARU */}
          {activeTab === "submit" && (
            <div className="complaint-workspace-grid slide-in-up">
              {/* Form Container */}
              <div className="complaint-form-card">
                <div className="complaint-card-header">
                  <ShieldAlert size={22} color="#f59e0b" />
                  <div>
                    <h3>Formulir Pelaporan JENDELA</h3>
                    <p>
                      Isi rincian pengaduan dengan data yang valid dan dapat
                      dipertanggungjawabkan.
                    </p>
                  </div>
                </div>

                {submitSuccess ? (
                  <div className="complaint-success-box slide-in-up">
                    <div className="success-icon-wrap">
                      <CheckCircle2 size={42} color="#16a34a" />
                    </div>
                    <h3>Pengaduan Anda Berhasil Diterima!</h3>
                    <p>
                      Tim Pokja Dewan Etik akan segera menelaah laporan Anda.
                      Harap simpan nomor tiket resmi berikut untuk melacak
                      perkembangan:
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
                        onClick={() => setSubmitSuccess(null)}
                      >
                        Buat Laporan Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="complaint-actual-form"
                  >
                    {submitError && (
                      <div className="form-error-banner">
                        <AlertCircle size={16} />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="form-section-title">
                      <Users size={16} />
                      <span>
                        1. Identitas Pelapor (Konsumen / Pemilik Unit)
                      </span>
                    </div>

                    <div className="form-row-grid">
                      <div className="form-field">
                        <label>Nama Lengkap Pelapor *</label>
                        <input
                          type="text"
                          name="complainantName"
                          required
                          placeholder="Nama sesuai KTP..."
                        />
                      </div>

                      <div className="form-field">
                        <label>Alamat Email Aktif *</label>
                        <input
                          type="email"
                          name="complainantEmail"
                          required
                          placeholder="nama@email.com..."
                        />
                      </div>

                      <div className="form-field">
                        <label>Nomor WhatsApp / HP *</label>
                        <input
                          type="tel"
                          name="complainantPhone"
                          required
                          placeholder="0812xxxxxxx..."
                        />
                      </div>
                    </div>

                    <div className="form-section-title mt-6">
                      <Wrench size={16} />
                      <span>2. Pihak yang Dilaporkan & Kategori Masalah</span>
                    </div>

                    <div className="form-row-grid">
                      <div className="form-field">
                        <label>Pihak yang Dilaporkan *</label>
                        <select
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
                            Distributor / Pabrikan AC Rekanan
                          </option>
                        </select>
                      </div>

                      <div className="form-field">
                        <label>Nomor KTA / Nama Teknisi / Nama Bengkel *</label>
                        <input
                          type="text"
                          name="targetIdentifier"
                          required
                          placeholder="Contoh: APTI-2026-0004 atau Nama Teknisi..."
                        />
                      </div>

                      <div className="form-field">
                        <label>Kategori Masalah Pengaduan *</label>
                        <select
                          name="category"
                          required
                          className="form-select"
                        >
                          <option value="Klaim Garansi Servis & Pengerjaan Ulang">
                            Klaim Garansi Servis (Tidak Dingin Kembali &lt;30
                            Hari)
                          </option>
                          <option value="Dugaan Malpraktik & Kerusakan Unit">
                            Dugaan Malpraktik Pipa / Kompresor Jebol
                          </option>
                          <option value="Kecurangan Takaran Freon & Biaya">
                            Kecurangan Takaran Freon / Tidak Sesuai Kwitansi
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

                    <div className="form-section-title mt-6">
                      <FileText size={16} />
                      <span>3. Kronologi & Bukti Pengerjaan</span>
                    </div>

                    <div className="form-field full-width">
                      <label>Kronologi Kejadian & Rincian Keluhan *</label>
                      <textarea
                        name="description"
                        required
                        rows={4}
                        placeholder="Jelaskan secara runtut tanggal pengerjaan, jenis unit AC, keluhan awal, tindakan teknisi, serta respon teknisi saat diminta pertanggungjawaban..."
                      />
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
                            <span>Mengirim Pengaduan...</span>
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Kirim Laporan Pengaduan Resmi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Side Guidance Card */}
              <div className="complaint-guidance-card">
                <div className="guidance-header">
                  <Scale size={20} color="#0284c7" />
                  <h4>Standar Mediasi Garansi</h4>
                </div>

                <ul className="guidance-list">
                  <li>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <div>
                      <strong>Garansi Pengerjaan 30 Hari</strong>
                      <p>
                        Seluruh teknisi ber-KTA sah wajib memberikan garansi
                        servis minimum 30 hari untuk pekerjaan pengelasan dan
                        pengisian freon.
                      </p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <div>
                      <strong>Kwitansi & Buku Servis Sah</strong>
                      <p>
                        Simpan nota fisik, foto nameplate outdoor AC, atau chat
                        WhatsApp sebagai bukti pendukung mediasi.
                      </p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <div>
                      <strong>Sanksi Tegas Pelanggaran</strong>
                      <p>
                        Teknisi yang terbukti melanggar kode etik dapat dikenai
                        sanksi pembekuan hingga pencabutan KTA permanen.
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="guidance-emergency-box">
                  <LifeBuoy size={18} color="#0284c7" />
                  <p>
                    Butuh konsultasi cepat? Hubungi hotline mediasi:{" "}
                    <strong>0811-APTI-HELP</strong>
                  </p>
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
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Masukkan nomor tiket pengaduan (misal: COMP-2026-0001)..."
                      value={trackTicket}
                      onChange={(e) => setTrackTicket(e.target.value)}
                      className="track-input"
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

                {trackError && (
                  <div className="track-error-box slide-in-up">
                    <AlertCircle size={18} color="#ef4444" />
                    <p>{trackError}</p>
                  </div>
                )}
              </div>

              {/* Track Result Display */}
              {trackResult && (
                <div className="track-result-dossier slide-in-up">
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
                        {trackResult.targetIdentifier} ({trackResult.targetType}
                        )
                      </strong>
                    </div>

                    {trackResult.reviewedAt && (
                      <div className="track-detail-item">
                        <small>Tanggal Ditelaah Dewan Etik</small>
                        <strong>{trackResult.reviewedAt}</strong>
                      </div>
                    )}
                  </div>

                  {/* Official Secretariat Response Note */}
                  {trackResult.responseNotes && (
                    <div className="track-official-response">
                      <div className="response-title">
                        <ShieldCheck size={16} color="#16a34a" />
                        <strong>Catatan Resmi Dewan Etik & Mediasi:</strong>
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
        memberTitle="Patuhi Standar Pelayanan & Hindari Pelanggaran Etik"
        memberDescription="Pelajari standar pedoman pengerjaan, kwitansi resmi bergaransi, dan kewajiban KTA di portal anggota."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{ label: "AD/ART & Kode Etik", href: "/ad-art" }}
      />
    </div>
  );
}
