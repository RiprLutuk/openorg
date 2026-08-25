"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useCallback, useState } from "react";
import { memberApi } from "@/lib/member-client";

export function MemberVerifyEmail({
  organizationName = "APTI Indonesia",
}: {
  organizationName?: string;
}) {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [mode, setMode] = useState<"token" | "resend">(
    tokenFromUrl ? "token" : "token",
  );
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
      setError("Silakan masukkan kode / token verifikasi yang valid.");
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
          : "Tautan atau kode verifikasi tidak valid / sudah kedaluwarsa. Silakan minta tautan baru.",
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
      <div className="login-privilege-side" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
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

      {/* Right Column: Clean Interactive Form */}
      <div className="modern-login-form" style={{ padding: "clamp(24px, 3.5vw, 36px)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "100%" }}>
        {/* 1. Success State */}
        {success ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0", margin: "auto 0" }}>
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
            <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "0 0 1.5rem" }}>
              Alamat email <strong style={{ color: "#0f172a" }}>{verifiedEmail}</strong> telah aktif. Akun Anda kini siap digunakan untuk masuk ke portal resmi.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
        ) : (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", gap: "1rem" }}>
            {/* Top: Segmented Mode Selector */}
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px",
                  background: "#f1f5f9",
                  padding: "4px",
                  borderRadius: "10px",
                  marginBottom: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMode("token");
                    setError("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "7px 10px",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: mode === "token" ? "#ffffff" : "transparent",
                    color: mode === "token" ? "#0284c7" : "#64748b",
                    boxShadow: mode === "token" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <KeyRound size={13} />
                  <span>Verifikasi Token</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("resend");
                    setError("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "7px 10px",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: mode === "resend" ? "#ffffff" : "transparent",
                    color: mode === "resend" ? "#0284c7" : "#64748b",
                    boxShadow: mode === "resend" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Mail size={13} />
                  <span>Kirim Ulang Email</span>
                </button>
              </div>

              {/* Mode A: Token Verification Form */}
              {mode === "token" && (
                <form onSubmit={handleManualVerifySubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div className="member-form-heading" style={{ marginBottom: "0" }}>
                    <span className="member-form-icon" style={{ background: "#f0f9ff", color: "#0284c7" }}>
                      <ShieldCheck size={20} />
                    </span>
                    <div>
                      <p className="eyebrow">Autentikasi Akun Anggota</p>
                      <h2 style={{ fontSize: "1.25rem", margin: "0" }}>
                        Konfirmasi Verifikasi Email
                      </h2>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.825rem", color: "#64748b", lineHeight: 1.45, margin: "0" }}>
                    {tokenFromUrl
                      ? "Tautan otentikasi dari email Anda telah terdeteksi. Silakan klik tombol di bawah untuk mengaktifkan akun."
                      : "Masukkan token / kode verifikasi yang Anda terima pada pesan email pendaftaran resmi Anda."}
                  </p>

                  {error && (
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#b91c1c",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  <label htmlFor="verify-token-input" className="login-field-label">
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
                      style={{ fontFamily: "monospace", fontSize: "12.5px" }}
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
                      height: "42px",
                      fontSize: "13.5px",
                      fontWeight: 650,
                      borderRadius: "10px",
                      cursor: verifying || !inputToken.trim() ? "not-allowed" : "pointer",
                      marginTop: "0.15rem",
                    }}
                  >
                    {verifying ? (
                      <>
                        <RefreshCw className="spin-icon" size={15} />
                        <span>Memverifikasi Akun…</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={15} />
                        <span>Konfirmasi & Verifikasi Akun</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Mode B: Resend Verification Email Form */}
              {mode === "resend" && (
                <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div className="member-form-heading" style={{ marginBottom: "0" }}>
                    <span className="member-form-icon" style={{ background: "#f0f9ff", color: "#0284c7" }}>
                      <Mail size={20} />
                    </span>
                    <div>
                      <p className="eyebrow">Kirim Ulang Tautan</p>
                      <h2 style={{ fontSize: "1.25rem", margin: "0" }}>
                        Minta Tautan Baru
                      </h2>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.825rem", color: "#64748b", lineHeight: 1.45, margin: "0" }}>
                    Masukkan alamat email terdaftar Anda untuk mengirimkan ulang tautan verifikasi baru ke kotak masuk Anda.
                  </p>

                  {resendMessage && (
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        background: resendSuccess ? "#f0fdf4" : "#fef2f2",
                        border: resendSuccess ? "1px solid #bbf7d0" : "1px solid #fecaca",
                        color: resendSuccess ? "#166534" : "#b91c1c",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {resendSuccess ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      <span>{resendMessage}</span>
                    </div>
                  )}

                  <label htmlFor="resend-email" className="login-field-label">
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
                    disabled={resendPending || !resendEmail.trim()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      height: "42px",
                      fontSize: "13.5px",
                      fontWeight: 650,
                      borderRadius: "10px",
                      cursor: resendPending || !resendEmail.trim() ? "not-allowed" : "pointer",
                      marginTop: "0.15rem",
                    }}
                  >
                    {resendPending ? (
                      <>
                        <RefreshCw className="spin-icon" size={15} />
                        <span>Mengirimkan Email…</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw size={15} />
                        <span>Kirim Tautan Verifikasi Baru</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Footer Navigation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "1rem",
                borderTop: "1px solid #f1f5f9",
                fontSize: "12.5px",
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
          </div>
        )}
      </div>
    </div>
  );
}
