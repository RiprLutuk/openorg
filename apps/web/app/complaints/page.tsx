"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, useState } from "react";

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

const statusLabels: Record<string, { label: string; badgeClass: string }> = {
  new: { label: "Tiket Baru Diterima", badgeClass: "status-new" },
  under_review: {
    label: "Dalam Investigasi Etik",
    badgeClass: "status-review",
  },
  mediated: { label: "Tahap Mediasi", badgeClass: "status-progress" },
  resolved: { label: "Pengaduan Selesai", badgeClass: "status-verified" },
  dismissed: {
    label: "Tidak Terbukti / Selesai",
    badgeClass: "status-dismissed",
  },
};

export default function ComplaintsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    ticketNumber: string;
    message: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Tracking state
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

  const handleTrack = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const query = trackTicket.trim();
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
      setTrackError(
        err instanceof Error ? err.message : "Nomor tiket tidak ditemukan.",
      );
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="complaints-hero">
        <div className="wrap">
          <div className="hero-pill warning">
            <ShieldAlert size={14} />
            <span>Desks Kode Etik & Perlindungan Konsumen</span>
          </div>
          <h1>Layanan Pengaduan Etik & Klaim Teknisi</h1>
          <p className="hero-lead">
            Sarana resmi bagi publik dan konsumen untuk melaporkan kendala
            pengerjaan teknisi bersertifikat KTA, dugaan pelanggaran kode etik,
            maupun permohonan mediasi garansi.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="complaints-body">
        <div className="wrap">
          <div className="complaints-grid">
            {/* Form Filing Panel */}
            <div className="complaint-form-panel">
              <div className="panel-header">
                <FileText size={20} />
                <h2>Formulir Pengaduan Resmi</h2>
              </div>

              {submitSuccess && (
                <div className="complaint-success-banner">
                  <ShieldCheck size={28} className="text-emerald-600" />
                  <div>
                    <h4>Pengaduan Berhasil Dikirim!</h4>
                    <p>{submitSuccess.message}</p>
                    <div className="ticket-display-box">
                      <span>Nomor Tiket Anda:</span>
                      <strong>{submitSuccess.ticketNumber}</strong>
                      <button
                        type="button"
                        className="btn-copy-ticket"
                        onClick={() => {
                          void navigator.clipboard.writeText(
                            submitSuccess.ticketNumber,
                          );
                        }}
                      >
                        <Copy size={13} /> Salin Tiket
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="complaint-error-banner">
                  <AlertTriangle size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              <form className="complaint-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="complainantName">
                      Nama Lengkap Pelapor *
                    </label>
                    <input
                      type="text"
                      id="complainantName"
                      name="complainantName"
                      placeholder="Masukkan nama sesuai KTP"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="complainantEmail">Email Pelapor *</label>
                    <input
                      type="email"
                      id="complainantEmail"
                      name="complainantEmail"
                      placeholder="nama@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="complainantPhone">
                      Nomor WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      id="complainantPhone"
                      name="complainantPhone"
                      placeholder="0812xxxxxxx"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="targetType">Subjek Terlaporkan *</label>
                    <select
                      id="targetType"
                      name="targetType"
                      required
                      defaultValue="technician"
                    >
                      <option value="technician">
                        Teknisi AC (Pemegang KTA)
                      </option>
                      <option value="member">
                        Perusahaan Anggota Asosiasi
                      </option>
                      <option value="lender">Mitra Penyedia Suku Cadang</option>
                      <option value="company">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="targetIdentifier">
                    Nama / Nomor KTA Terlaporkan *
                  </label>
                  <input
                    type="text"
                    id="targetIdentifier"
                    name="targetIdentifier"
                    placeholder="Contoh: Budi Kurniawan / APTI-2026-0004"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Kategori Pengaduan *</label>
                  <select
                    id="category"
                    name="category"
                    required
                    defaultValue="kode_etik"
                  >
                    <option value="kode_etik">
                      Pelanggaran Kode Etik Organisasi
                    </option>
                    <option value="layanan_teknisi">
                      Klaim Garansi & Hasil Kerja Teknisi
                    </option>
                    <option value="penagihan">
                      Penetapan Biaya Tidak Sesuai SOP
                    </option>
                    <option value="sengketa">Sengketa Garansi Produk</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    Detail Kronologi Pengaduan *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    placeholder="Jelaskan secara rinci waktu kejadian, lokasi, serta kendala yang dialami..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-submit-complaint"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Mengirim
                      Pengaduan...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Submit Pengaduan Resmi
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Track Ticket Panel */}
            <div className="complaint-track-panel">
              <div className="track-card">
                <h3>Cek Status Tiket Pengaduan</h3>
                <p>
                  Masukkan nomor tiket resmi (contoh: CMP-XXXX-YYY) untuk
                  memantau progres tindakan tim etik.
                </p>
                <form onSubmit={handleTrack} className="track-input-group">
                  <input
                    type="text"
                    placeholder="Masukkan Nomor Tiket..."
                    className="track-input"
                    value={trackTicket}
                    onChange={(e) => setTrackTicket(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn-track"
                    disabled={isTracking || !trackTicket.trim()}
                  >
                    {isTracking ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Search size={16} /> Cek Status
                      </>
                    )}
                  </button>
                </form>

                {trackError && (
                  <div className="track-error-box">
                    <AlertTriangle size={15} />
                    <span>{trackError}</span>
                  </div>
                )}

                {trackResult && (
                  <div className="track-result-box">
                    <div className="result-header">
                      <span className="result-ticket">
                        {trackResult.ticketNumber}
                      </span>
                      <span
                        className={`badge ${statusLabels[trackResult.status]?.badgeClass ?? ""}`}
                      >
                        {statusLabels[trackResult.status]?.label ??
                          trackResult.status}
                      </span>
                    </div>
                    <div className="result-body">
                      <p>
                        <strong>Subjek:</strong> {trackResult.targetIdentifier}{" "}
                        ({trackResult.targetType})
                      </p>
                      <p>
                        <strong>Kategori:</strong>{" "}
                        {trackResult.category.replace("_", " ")}
                      </p>
                      <p>
                        <strong>Dibuat Pada:</strong>{" "}
                        {new Date(trackResult.createdAt).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </p>
                      {trackResult.responseNotes && (
                        <div className="result-notes">
                          <strong>Tindak Lanjut Sekretariat:</strong>
                          <p>{trackResult.responseNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="ethics-guarantee-card">
                <AlertTriangle size={24} className="icon-warning" />
                <h4>Komitmen Etik & Proteksi Konsumen</h4>
                <ul>
                  <li>
                    <CheckCircle2 size={14} /> Setiap pengaduan diproses
                    maksimal 2x24 jam kerja.
                  </li>
                  <li>
                    <CheckCircle2 size={14} /> Kerahasiaan data pelapor dijamin
                    oleh Tim Etik DPP.
                  </li>
                  <li>
                    <CheckCircle2 size={14} /> Media mediasi resmi mempertemukan
                    konsumen & teknisi KTA.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
