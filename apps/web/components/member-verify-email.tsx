"use client";

import {
  ArrowRight,
  CheckCircle2,
  Mail,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { memberApi } from "@/lib/member-client";

export function MemberVerifyEmail() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [loading, setLoading] = useState(Boolean(tokenFromUrl));
  const [success, setSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [error, setError] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

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
    try {
      const res = await memberApi<{
        data: { message: string; alreadyVerified?: boolean };
      }>("/v1/public/membership/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
      });
      setResendMessage(
        res.data.message ||
          "Tautan verifikasi baru telah dikirimkan ke email/WhatsApp Anda.",
      );
    } catch (err) {
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
    <div className="member-verify-container">
      {loading && (
        <div className="member-success-card">
          <span className="verify-icon-loading">
            <RefreshCw className="spin-icon" size={36} />
          </span>
          <p className="eyebrow">Validasi Keanggotaan</p>
          <h2>Memverifikasi Email Anda…</h2>
          <p>
            Mohon tunggu sebentar selagi sistem mencocokkan token keamanan akun
            Anda.
          </p>
        </div>
      )}

      {!loading && success && (
        <div className="member-success-card">
          <span className="verify-icon-success">
            <CheckCircle2 size={40} color="#16a34a" />
          </span>
          <p className="eyebrow">Email Terverifikasi</p>
          <h2>Verifikasi Berhasil!</h2>
          <p>
            Alamat email <strong>{verifiedEmail}</strong> telah berhasil
            divalidasi. Akun Anda kini aktif dan siap digunakan untuk masuk ke
            portal anggota resmi.
          </p>
          <div className="gate-action-buttons">
            <Link className="button primary" href="/member/login">
              Masuk ke Portal Anggota <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      )}

      {!loading && !success && (
        <div className="member-success-card">
          <span className="verify-icon-alert">
            {error ? (
              <XCircle size={40} color="#dc2626" />
            ) : (
              <Mail size={40} color="#0284c7" />
            )}
          </span>
          <p className="eyebrow">Verifikasi Akun Anggota</p>
          <h2>
            {error ? "Tautan Tidak Valid" : "Verifikasi Email Pendaftaran"}
          </h2>
          <p>
            {error ||
              "Untuk mencegah spam dan mengamankan akun KTA Digital Anda, silakan lakukan verifikasi melalui email atau WhatsApp yang Anda daftarkan."}
          </p>

          <form className="resend-verification-form" onSubmit={handleResend}>
            <label>
              Kirim Ulang Tautan Verifikasi
              <input
                type="email"
                required
                placeholder="Masukkan alamat email Anda"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="button secondary"
              disabled={resendPending}
            >
              {resendPending ? "Mengirimkan…" : "Kirim Ulang Verifikasi"}
            </button>
          </form>

          {resendMessage && (
            <p className="form-info-banner mt-3">{resendMessage}</p>
          )}

          <div className="gate-action-buttons mt-4">
            <Link className="button ghost" href="/member/login">
              Sudah Pernah Verifikasi? Masuk Saja
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
