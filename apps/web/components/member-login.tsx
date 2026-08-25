"use client";

import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Lock,
  LogOut,
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      try {
        localStorage.removeItem("openorg_member_logged_in");
      } catch {
        // storage blocked
      }
      await memberApi("/v1/member/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.reload();
  };

  if (isLoggedIn) {
    return (
      <div className="modern-login-split-card logged-in-split-card">
        {/* Left Side: Member Identity & KTA Card Preview */}
        <div className="login-privilege-side">
          <div className="login-brand-pill">
            <ShieldCheck size={14} color="#38bdf8" />
            <span>Sesi Terotentikasi Aktif</span>
          </div>

          <h3>Ruang Kerja Anggota</h3>
          <p className="login-side-lead">
            Akun Anda terhubung dengan verifikasi identitas resmi{" "}
            {organizationName}.
          </p>

          {/* Mini Holographic KTA Card */}
          <div className="mini-kta-preview-card">
            <div className="mini-kta-head">
              <div className="mini-kta-chip" />
              <span className="mini-kta-badge">ANGGOTA AKTIF</span>
            </div>
            <div className="mini-kta-body">
              <span className="mini-kta-org">{organizationName}</span>
              <h4 className="mini-kta-name">
                {member?.name || "Nama Anggota"}
              </h4>
              <p className="mini-kta-num">
                {member?.memberNumber || "APTI-00.2026.00007"}
              </p>
            </div>
            <div className="mini-kta-foot">
              <span>Status: Terverifikasi</span>
              <span className="mini-kta-qr-tag">QR Encrypted</span>
            </div>
          </div>

          <div className="login-session-security-note">
            <Lock size={14} color="#34d399" />
            <span>Enkripsi TLS 1.3 · Akses Portal Dilindungi</span>
          </div>
        </div>

        {/* Right Side: Quick Action Bento & Dashboard Entry */}
        <div className="login-active-session-side">
          <div className="active-session-header">
            <div className="active-session-avatar">
              {member?.name?.charAt(0) || "A"}
            </div>
            <div>
              <span className="active-welcome-eyebrow">
                Selamat Datang Kembali
              </span>
              <h2 className="active-member-title">{member?.name}</h2>
              <p className="active-member-sub">
                No. Registrasi:{" "}
                <strong>{member?.memberNumber || "APTI-00.2026.00007"}</strong>
              </p>
            </div>
          </div>

          {/* Quick Access Bento Grid */}
          <div className="active-bento-links">
            <Link href="/member" className="active-bento-item highlight">
              <div className="bento-icon-circle blue">
                <LayoutDashboard size={20} />
              </div>
              <div className="bento-text">
                <strong>Buka Dashboard Utama</strong>
                <small>Ringkasan program kerja, notifikasi, dan tagihan</small>
              </div>
              <ArrowRight size={16} className="bento-arrow" />
            </Link>

            <Link href="/member" className="active-bento-item">
              <div className="bento-icon-circle emerald">
                <CreditCard size={20} />
              </div>
              <div className="bento-text">
                <strong>Kartu KTA Digital</strong>
                <small>
                  Lihat kartu ber-QR Code untuk verifikasi pelanggan
                </small>
              </div>
              <ArrowRight size={16} className="bento-arrow" />
            </Link>

            <Link href="/member" className="active-bento-item">
              <div className="bento-icon-circle purple">
                <GraduationCap size={20} />
              </div>
              <div className="bento-text">
                <strong>Buku Log SKP & Pelatihan</strong>
                <small>Akumulasi kredit kompetensi dan sertifikasi BNSP</small>
              </div>
              <ArrowRight size={16} className="bento-arrow" />
            </Link>
          </div>

          {/* Switch Account or Logout Action */}
          <div className="active-session-footer">
            <button
              type="button"
              className="btn-switch-account"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={15} />
              <span>
                {loggingOut ? "Memproses Keluar…" : "Keluar & Ganti Akun"}
              </span>
            </button>

            <Link href="/member" className="button primary btn-goto-portal">
              <span>Masuk ke Portal</span>
              <ArrowRight size={16} />
            </Link>
          </div>
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
      try {
        localStorage.setItem("openorg_member_logged_in", "1");
      } catch {
        // storage blocked
      }
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

        <label htmlFor="login-email" className="login-field-label">
          <span>Alamat Email</span>
          <input
            id="login-email"
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

        <label htmlFor="login-password" className="login-field-label">
          <span>Kata Sandi</span>
          <input
            id="login-password"
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
