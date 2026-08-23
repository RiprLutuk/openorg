"use client";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { memberApi } from "@/lib/member-client";
import { useMemberAuth } from "@/lib/use-member-auth";

type Unit = { id: string; name: string; type: string };

export function MembershipRegistration({
  organizationName,
}: {
  organizationName: string;
}) {
  const { isLoggedIn, member } = useMemberAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [stage, setStage] = useState<"register" | "done">("register");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    memberApi<{ data: { units: Unit[] } }>("/v1/public/structure")
      .then((result) => setUnits(result.data.units))
      .catch(() => setUnits([]));
  }, []);

  if (isLoggedIn) {
    return (
      <div className="member-success-card">
        <span>
          <UserCheck size={32} />
        </span>
        <p className="eyebrow">Akun Terverifikasi</p>
        <h2>Anda Sudah Terdaftar Sebagai Anggota</h2>
        <p>
          Anda saat ini sedang login dengan akun <strong>{member?.name}</strong>{" "}
          {member?.memberNumber ? `(No. KTA: ${member.memberNumber})` : ""}.
          Anda tidak perlu mengisi formulir pendaftaran ulang.
        </p>
        <div className="gate-action-buttons mt-4">
          <Link className="button primary" href="/member">
            Buka Portal & KTA Digital Saya <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  }

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const nextEmail = value("email").toLowerCase();
    try {
      await memberApi<{
        data: { memberId?: string };
      }>("/v1/public/membership/register", {
        method: "POST",
        body: JSON.stringify({
          name: value("name"),
          email: nextEmail,
          phone: value("phone"),
          password: value("password"),
          address: value("address") || null,
          unitId: value("unitId") || null,
          dateOfBirth: value("dateOfBirth") || null,
          companyName: value("companyName") || null,
          consent: data.get("consent") === "on",
        }),
      });
      toast.success("Pendaftaran anggota berhasil dikirimkan ke Sekretariat!");
      setStage("done");
    } catch (reason) {
      const msg =
        reason instanceof Error
          ? reason.message
          : "Pendaftaran gagal dikirimkan.";
      setError(msg);
      toast.error(`Pendaftaran gagal: ${msg}`);
    } finally {
      setPending(false);
    }
  };

  if (stage === "done") {
    return (
      <div className="member-success-card">
        <span>
          <BadgeCheck size={36} color="#16a34a" />
        </span>
        <p className="eyebrow text-emerald-600 font-bold">
          Pendaftaran Berhasil Terkirim
        </p>
        <h2>Permohonan Anda Sedang Ditinjau</h2>
        <p>
          Tautan aktivasi akun dan verifikasi email telah dikirimkan ke alamat
          email dan nomor WhatsApp Anda untuk keamanan penerbitan KTA Digital.
        </p>
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "14px",
            padding: "16px",
            margin: "16px 0",
            textAlign: "left",
          }}
        >
          <h4
            style={{
              fontSize: "13.5px",
              fontWeight: 800,
              color: "#166534",
              margin: "0 0 6px",
            }}
          >
            Langkah Selanjutnya:
          </h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              fontSize: "12.5px",
              color: "#334155",
              lineHeight: 1.6,
            }}
          >
            <li>
              Buka email masuk / WhatsApp Anda dan klik tautan konfirmasi.
            </li>
            <li>
              Pengurus Daerah (DPD) {organizationName} akan memvalidasi berkas
              Anda.
            </li>
            <li>
              Setelah diverifikasi, Nomor KTA dan barcode digital aktif
              otomatis.
            </li>
          </ul>
        </div>
        <div className="gate-action-buttons mt-4">
          <Link className="button primary" href="/member/login">
            Masuk ke Portal Anggota <ArrowRight size={17} />
          </Link>
          <Link className="button secondary" href="/member/verify-email">
            Cek Status Verifikasi Email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="member-form" onSubmit={register}>
      <div className="member-form-heading">
        <span className="member-form-icon">
          <Building2 size={24} color="#0284c7" />
        </span>
        <div>
          <p className="eyebrow">Formulir Registrasi Mandiri</p>
          <h2>Data Permohonan Anggota Baru</h2>
        </div>
      </div>

      {error && (
        <div
          className="form-error full"
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* Field: Full Name */}
      <label>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "4px",
          }}
        >
          <User size={13} color="#0284c7" /> Nama Lengkap (Sesuai KTP) *
        </span>
        <input
          name="name"
          placeholder="Contoh: Budi Santoso, S.T."
          required
          minLength={2}
          autoComplete="name"
        />
      </label>

      {/* Field: Email */}
      <label>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "4px",
          }}
        >
          <Mail size={13} color="#0284c7" /> Alamat Email Aktif *
        </span>
        <input
          name="email"
          type="email"
          placeholder="email.aktif@domain.com"
          required
          autoComplete="email"
        />
      </label>

      {/* Field: Phone */}
      <label>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "4px",
          }}
        >
          <Phone size={13} color="#0284c7" /> No. WhatsApp / HP Aktif *
        </span>
        <input
          name="phone"
          placeholder="081234567890"
          required
          minLength={8}
          autoComplete="tel"
        />
      </label>

      {/* Field: Date of Birth */}
      <label>
        <span style={{ marginBottom: "4px", display: "block" }}>
          Tanggal Lahir
        </span>
        <input name="dateOfBirth" type="date" />
      </label>

      {/* Field: DPD / Unit Selection */}
      <label>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "4px",
          }}
        >
          <MapPin size={13} color="#0284c7" /> Pengurus Daerah (DPD Pengampu)
        </span>
        <select name="unitId" defaultValue="">
          <option value="">Pilih Pengurus Daerah Terdekat...</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name} ({unit.type})
            </option>
          ))}
        </select>
      </label>

      {/* Field: Workshop / Company Name */}
      <label>
        <span style={{ marginBottom: "4px", display: "block" }}>
          Nama Bengkel / Workshop / Instansi (Opsional)
        </span>
        <input
          name="companyName"
          placeholder="Contoh: Berkah Teknik AC"
          autoComplete="organization"
        />
      </label>

      {/* Field: Full Address */}
      <label className="full">
        <span style={{ marginBottom: "4px", display: "block" }}>
          Alamat Lengkap Domisili / Bengkel
        </span>
        <textarea
          name="address"
          rows={3}
          placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten..."
          autoComplete="street-address"
        />
      </label>

      {/* Field: Password */}
      <label className="full">
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "4px",
          }}
        >
          <Lock size={13} color="#0284c7" /> Buat Kata Sandi Akun Portal *
        </span>
        <input
          name="password"
          type="password"
          placeholder="Minimal 8 karakter (kombinasi huruf & angka)"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>

      {/* Consent Checkbox */}
      <label className="member-consent full">
        <input name="consent" type="checkbox" required />
        <span>
          Saya menyatakan bahwa seluruh data yang saya isikan adalah benar dan
          sah. Saya bersedia mematuhi <strong>AD/ART</strong> serta{" "}
          <strong>9 Butir Pakta Integritas</strong> {organizationName}.
        </span>
      </label>

      {/* Actions Bar */}
      <div className="member-form-actions full">
        <span>
          Sudah punya akun?{" "}
          <Link
            href="/member/login"
            style={{ color: "#0284c7", fontWeight: 700 }}
          >
            Masuk Portal
          </Link>
        </span>
        <button className="button primary" type="submit" disabled={pending}>
          {pending
            ? "Mengirimkan Permohonan..."
            : "Kirim Pendaftaran Keanggotaan"}
          {!pending && <ArrowRight size={17} />}
        </button>
      </div>
    </form>
  );
}
