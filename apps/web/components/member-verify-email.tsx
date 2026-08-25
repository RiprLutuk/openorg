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

  const [inputToken, setInputToken] = useState(tokenFromUrl);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [error, setError] = useState("");

  const [resendEmail, setResendEmail] = useState("");
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const executeVerify = useCallback(async (tokenToVerify: string) => {
    const cleanToken = tokenToVerify.trim();
    if (!cleanToken) {
      setError("Silakan masukkan token / kode verifikasi yang valid.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const res = await memberApi<{
        data: { email: string; verified: boolean };
      }>("/v1/public/membership/verify-email", {
        method: "POST",
        body: JSON.stringify({ token: cleanToken }),
      });
      setSuccess(true);
      setVerifiedEmail(res.data.email);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Tautan atau kode verifikasi tidak valid / sudah kedaluwarsa. Silakan minta tautan baru di bawah.",
      );
    } finally {
      setVerifying(false);
    }
  }, []);

  const handleManualVerifySubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    executeVerify(inputToken);
  };

  const handleResend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendPending(true);
    setResendMessage("");
    setResendSuccess(false);
    try {
      const res = await memberApi<{
        data: {
          message: string;
          alreadyVerified?: boolean;
        };
      }>("/v1/public/membership/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
      });
      setResendSuccess(true);
      setResendMessage(
        res.data.message ||
          "Tautan verifikasi baru telah berhasil dikirimkan ke alamat email Anda.",
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

      {/* Right Column: Interactive Verification Box */}
      <div className="login-form-side">
        {/* 1. Success State */}
        {success && (
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

        {/* 2. Verification Form (Explicit POST Submission) */}
        {!success && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <form onSubmit={handleManualVerifySubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="member-form-heading" style={{ marginBottom: "0.25rem" }}>
                <span className="member-form-icon" style={{ background: "#f0f9ff", color: "#0284c7" }}>
                  <ShieldCheck size={22} />
                </span>
                <div>
                  <p className="eyebrow">Autentikasi Akun Anggota</p>
                  <h2 style={{ fontSize: "1.35rem", margin: "0" }}>
                    Konfirmasi Verifikasi Email
                  </h2>
                </div>
              </div>

              <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.5, margin: "0" }}>
                {tokenFromUrl
                  ? "Tautan otentikasi dari email Anda telah terdeteksi. Silakan klik tombol di bawah untuk mengaktifkan akun Anda secara aman melalui metode POST terproteksi."
                  : "Silakan masukkan token / kode verifikasi yang Anda terima di email resmi pendaftaran Anda."}
              </p>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <label htmlFor="verify-token-input" className="login-field-label" style={{ marginTop: "0.25rem" }}>
                <span>Kode Token Verifikasi (Dari Email)</span>
                <input
                  id="verify-token-input"
                  name="token"
                  type="text"
                  required
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Masukkan atau tempel token dari email..."
                  className="login-field-input"
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                />
              </label>

              <button
                className="button primary btn-login-submit"
                type="submit"
                disabled={verifying || !inputToken.trim()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  height: "44px",
                  fontSize: "14px",
                  fontWeight: 650,
                  borderRadius: "10px",
                  cursor: verifying || !inputToken.trim() ? "not-allowed" : "pointer",
                  marginTop: "0.25rem",
                }}
              >
                {verifying ? (
                  <>
                    <RefreshCw className="spin-icon" size={16} />
                    <span>Memverifikasi Akun…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Konfirmasi & Verifikasi Akun Saya</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={{ position: "relative", textAlign: "center", margin: "0.5rem 0" }}>
              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0" }} />
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "#ffffff",
                  padding: "0 12px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  fontWeight: 600,
                }}
              >
                ATAU MINTA EMAIL BARU
              </span>
            </div>

            {/* 3. Resend Form */}
            <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <strong style={{ fontSize: "13px", color: "#334155" }}>Belum menerima email verifikasi?</strong>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                  Masukkan email terdaftar Anda untuk mengirimkan ulang tautan verifikasi baru ke kotak masuk Anda.
                </p>
              </div>

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

              <div style={{ display: "flex", gap: "8px" }}>
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
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={resendPending || !resendEmail.trim()}
                  className="button secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "10px",
                    whiteSpace: "nowrap",
                    cursor: resendPending || !resendEmail.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {resendPending ? (
                    <RefreshCw className="spin-icon" size={14} />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                  <span>Kirim Ulang</span>
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: "13px",
                  marginTop: "0.25rem",
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
          </div>
        )}
      </div>
    </div>
  );
}
