"use client";

import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { memberApi } from "@/lib/member-client";

export function MemberVerifyEmail({
  organizationName = "APTI Indonesia",
}: {
  organizationName?: string;
}) {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [loading, setLoading] = useState(Boolean(tokenFromUrl));
  const [success, setSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [error, setError] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const verifyToken = useCallback(async (token: string) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await memberApi<{
        data: { email: string; verified: boolean };
      }>("/v1/public/membership/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setSuccess(true);
      setVerifiedEmail(res.data.email);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Tautan verifikasi tidak valid atau sudah kedaluwarsa.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tokenFromUrl) {
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl, verifyToken]);

  const handleResend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendPending(true);
    setResendMessage("");
    setResendSuccess(false);
    try {
      const res = await memberApi<{
        data: { message: string; alreadyVerified?: boolean };
      }>("/v1/public/membership/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
      });
      setResendSuccess(true);
      setResendMessage(
        res.data.message ||
          "Tautan verifikasi baru telah berhasil dikirimkan ke alamat email / WhatsApp Anda.",
      );
    } catch (err) {
      setResendSuccess(false);
      setResendMessage(
        err instanceof Error
          ? err.message
          : "Gagal mengirim ulang tautan verifikasi.",
      );
    } finally {
      setResendPending(false);
    }
  };

  return (
    <div className="modern-login-split-card">
      {/* Left Column: Brand & Security Guarantee */}
      <div className="login-privilege-side">
        <div className="login-brand-pill">
          <ShieldCheck size={14} color="#38bdf8" />
          <span>ComplyFlow · Validasi Keanggotaan</span>
        </div>

        <h3>Verifikasi Email & Keamanan Akun</h3>
        <p className="login-side-lead">
          Proses verifikasi resmi memastikan keabsahan data permohonan anggota,
          mencegah penyalahgunaan identitas digital, dan mengaktifkan akses penuh
          ke ekosistem {organizationName}.
        </p>

        <div className="login-features-list">
          <div className="login-feature-item">
            <div className="feature-icon-box blue">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Proteksi KTA Anti-Pemalsuan</strong>
              <small>Nomor registrasi unik terikat resmi dengan akun Anda.</small>
            </div>
          </div>

          <div className="login-feature-item">
            <div className="feature-icon-box green">
              <GraduationCap size={18} />
            </div>
            <div>
              <strong>Aktivasi Instan Logbook SKP</strong>
              <small>Pencatatan kredit kompetensi dan pelatihan BNSP.</small>
            </div>
          </div>

          <div className="login-feature-item">
            <div className="feature-icon-box purple">
              <Lock size={18} />
            </div>
            <div>
              <strong>Standar Keamanan Zero-Trust</strong>
              <small>Enkripsi token 256-bit dengan proteksi 24 jam.</small>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          <Lock size={13} color="#10b981" />
          <span>Enkripsi TLS 1.3 · Validasi Token Terproteksi</span>
        </div>
      </div>

      {/* Right Column: Dynamic Form / Results Panel */}
      <div
        className="modern-login-form"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "440px",
        }}
      >
        {/* 1. Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#f0f9ff",
                color: "#0284c7",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <RefreshCw
                className="spin-icon"
                size={28}
                style={{ animation: "spin 1s linear infinite" }}
              />
            </div>
            <p className="eyebrow" style={{ color: "#0284c7" }}>
              Memproses Autentikasi
            </p>
            <h2 style={{ fontSize: "1.35rem", margin: "0.25rem 0 0.5rem" }}>
              Memvalidasi Token Keamanan…
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#64748b", maxWidth: "340px", margin: "0 auto" }}>
              Mohon tunggu beberapa detik selagi sistem memverifikasi keabsahan
              token akun Anda.
            </p>
          </div>
        )}

        {/* 2. Success State */}
        {!loading && success && (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#f0fdf4",
                border: "2px solid #bbf7d0",
                color: "#16a34a",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <CheckCircle2 size={36} color="#16a34a" />
            </div>
            <p className="eyebrow" style={{ color: "#16a34a", fontWeight: 700 }}>
              Verifikasi Selesai
            </p>
            <h2 style={{ fontSize: "1.45rem", margin: "0.25rem 0 0.5rem", color: "#0f172a" }}>
              Email Berhasil Diverifikasi! 🎉
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "0 0 1rem" }}>
              Alamat email <strong style={{ color: "#0f172a" }}>{verifiedEmail}</strong> telah aktif. Akun Anda kini siap digunakan untuk masuk ke portal resmi.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
              <Link
                className="button primary"
                href="/member/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: 650,
                  borderRadius: "10px",
                  textDecoration: "none",
                }}
              >
                <span>Masuk ke Portal Anggota</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/"
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  textDecoration: "none",
                  fontWeight: 600,
                  marginTop: "4px",
                }}
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}

        {/* 3. Standby / Resend Verification Form */}
        {!loading && !success && (
          <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="member-form-heading" style={{ marginBottom: "0.25rem" }}>
              <span className="member-form-icon" style={{ background: "#f0f9ff", color: "#0284c7" }}>
                <Mail size={22} />
              </span>
              <div>
                <p className="eyebrow">Validasi Email Pendaftaran</p>
                <h2 style={{ fontSize: "1.35rem", margin: "0" }}>
                  {error ? "Tautan Tidak Valid" : "Aktivasi Akun Anggota"}
                </h2>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.5, margin: "0" }}>
              {error ? (
                <span style={{ color: "#b91c1c", fontWeight: 500 }}>
                  {error} Silakan masukkan email Anda di bawah untuk mendapatkan tautan baru.
                </span>
              ) : (
                "Masukkan alamat email yang Anda gunakan saat mendaftar untuk menerima tautan verifikasi baru."
              )}
            </p>

            {resendMessage && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: resendSuccess ? "#f0fdf4" : "#fef2f2",
                  border: resendSuccess ? "1px solid #bbf7d0" : "1px solid #fecaca",
                  color: resendSuccess ? "#166534" : "#b91c1c",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {resendSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{resendMessage}</span>
              </div>
            )}

            <label htmlFor="resend-email" className="login-field-label" style={{ marginTop: "0.25rem" }}>
              <span>Alamat Email Terdaftar</span>
              <input
                id="resend-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="nama@email.com"
                className="login-field-input"
              />
            </label>

            <button
              className="button primary btn-login-submit"
              type="submit"
              disabled={resendPending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                height: "44px",
                fontSize: "14px",
                fontWeight: 650,
                borderRadius: "10px",
                cursor: resendPending ? "not-allowed" : "pointer",
                marginTop: "0.25rem",
              }}
            >
              {resendPending ? (
                <>
                  <RefreshCw className="spin-icon" size={16} />
                  <span>Mengirimkan Tautan…</span>
                </>
              ) : (
                <>
                  <RotateCcw size={15} />
                  <span>Kirim Ulang Tautan Verifikasi</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "0.75rem",
                borderTop: "1px solid #f1f5f9",
                fontSize: "13px",
                marginTop: "0.5rem",
              }}
            >
              <Link
                href="/member/login"
                style={{
                  color: "#0284c7",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sudah Verifikasi? Masuk Saja
              </Link>
              <Link
                href="/join"
                style={{
                  color: "#64748b",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Daftar Anggota Baru
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
