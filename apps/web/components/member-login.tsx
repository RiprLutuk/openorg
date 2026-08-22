"use client";

import { ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { memberApi } from "@/lib/member-client";
import { useMemberAuth } from "@/lib/use-member-auth";

export function MemberLogin() {
  const { isLoggedIn, member } = useMemberAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isLoggedIn) {
    return (
      <div className="member-success-card">
        <span>
          <UserCheck size={32} />
        </span>
        <p className="eyebrow">Sesi Masuk Aktif</p>
        <h2>Anda Sudah Masuk</h2>
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
    <form className="member-form compact-member-form" onSubmit={submit}>
      <div className="member-form-heading">
        <span className="member-form-icon">
          <ShieldCheck size={23} />
        </span>
        <div>
          <p className="eyebrow">Portal Anggota Resmi</p>
          <h2>Selamat Datang Kembali</h2>
        </div>
      </div>
      <p className="form-intro">
        Masuk untuk mengakses Kartu KTA Digital, memantau buku log kredit SKP /
        CPD, dan pembaruan profil keanggotaan.
      </p>
      {error && <p className="form-error">{error}</p>}
      <label>
        Alamat Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
        />
      </label>
      <label>
        Kata Sandi
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </label>
      <button className="button primary" type="submit" disabled={pending}>
        {pending ? "Memverifikasi akun…" : "Masuk ke Portal"}
        {!pending && <ArrowRight size={17} />}
      </button>

      <div className="demo-account-hint">
        <small className="demo-hint-title">💡 Akun Demo Siap Pakai:</small>
        <div className="demo-hint-buttons">
          <button
            type="button"
            className="demo-pill-button"
            onClick={() => fillDemo("member@demo.openorg", "OpenOrg!2026Demo")}
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
  );
}
