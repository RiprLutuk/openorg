"use client";

import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { memberApi } from "@/lib/member-client";
import { useMemberAuth } from "@/lib/use-member-auth";

export function MemberLogin({
  organizationName = "APTI Indonesia",
}: {
  organizationName?: string;
}) {
  const { isLoggedIn, member } = useMemberAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isLoggedIn) {
    return (
      <div className="member-success-card login-success-panel">
        <span className="success-icon-badge">
          <UserCheck size={36} color="#34d399" />
        </span>
        <p className="eyebrow">Sesi Masuk Aktif</p>
        <h2>Anda Sudah Terhubung</h2>
        <p>
          Anda saat ini terhubung sebagai <strong>{member?.name}</strong>{" "}
          {member?.memberNumber ? `(No. KTA: ${member.memberNumber})` : ""}.
        </p>
        <div className="gate-action-buttons mt-4">
          <Link className="button primary" href="/member">
            Buka Portal & KTA Digital <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await memberApi("/v1/public/membership/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
      window.location.assign("/member");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Gagal masuk. Periksa kembali email dan kata sandi Anda.",
      );
      setPending(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="modern-login-split-card">
      {/* Left Column: Portal Brand & Privileges */}
      <div className="login-privilege-side">
        <div className="login-brand-pill">
          <ShieldCheck size={14} color="#38bdf8" />
          <span>ComplyFlow · Member Portal</span>
        </div>

        <h3>Akses Mandiri Layanan Keanggotaan</h3>
        <p className="login-side-lead">
          Pusat kendali KTA digital, akumulasi kredit kompetensi SKP, dan
          pelatihan terakreditasi resmi {organizationName}.
        </p>

        <div className="login-features-list">
          <div className="login-feature-item">
            <div className="feature-icon-box blue">
              <CreditCard size={18} />
            </div>
            <div>
              <strong>KTA Digital & Cetak Mandiri</strong>
              <small>QR code anti-pemalsuan dan audit publik.</small>
            </div>
          </div>

          <div className="login-feature-item">
            <div className="feature-icon-box green">
              <GraduationCap size={18} />
            </div>
            <div>
              <strong>Logbook Satuan Kredit Profesi (SKP)</strong>
              <small>Akumulasi poin CPD untuk resertifikasi.</small>
            </div>
          </div>

          <div className="login-feature-item">
            <div className="feature-icon-box purple">
              <Lock size={18} />
            </div>
            <div>
              <strong>Keamanan Otentikasi Zero-Trust</strong>
              <small>Data terenkripsi dan terlindungi penuh.</small>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Actual Form */}
      <form className="modern-login-form" onSubmit={submit}>
        <div className="member-form-heading">
          <div>
            <p className="eyebrow">Autentikasi Akun</p>
            <h2>Selamat Datang</h2>
          </div>
        </div>
        <p className="form-intro">
          Masukkan alamat email dan kata sandi yang telah terdaftar.
        </p>

        {error && <p className="form-error">{error}</p>}

        <label className="login-field-label">
          <span>Alamat Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="login-field-input"
          />
        </label>

        <label className="login-field-label">
          <span>Kata Sandi</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="login-field-input"
          />
        </label>

        <button
          className="button primary btn-login-submit"
          type="submit"
          disabled={pending}
        >
          {pending ? "Memverifikasi akun…" : "Masuk ke Portal"}
          {!pending && <ArrowRight size={17} />}
        </button>

        {/* Demo Fast Login Buttons */}
        <div className="demo-account-hint">
          <small className="demo-hint-title">💡 Akun Demo Siap Pakai:</small>
          <div className="demo-hint-buttons">
            <button
              type="button"
              className="demo-pill-button"
              onClick={() =>
                fillDemo("member@demo.openorg", "OpenOrg!2026Demo")
              }
            >
              Demo Member (Budi Pratama)
            </button>
            <button
              type="button"
              className="demo-pill-button"
              onClick={() => fillDemo("nanang@apti.or.id", "password123")}
            >
              Ketua Umum (Ir. Nanang)
            </button>
          </div>
        </div>

        <p className="form-footnote">
          Belum terdaftar sebagai anggota?{" "}
          <Link href="/join">Daftar Keanggotaan Baru</Link>
        </p>
      </form>
    </div>
  );
}
