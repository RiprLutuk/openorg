"use client";

import { ArrowRight, BadgeCheck, Building2, UserCheck } from "lucide-react";
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
        <p className="eyebrow">Akun Terdaftar</p>
        <h2>Anda Sudah Menjadi Anggota</h2>
        <p>
          Anda sedang masuk dengan akun <strong>{member?.name}</strong>{" "}
          {member?.memberNumber ? `(No. KTA: ${member.memberNumber})` : ""}.
          Anda tidak perlu mendaftar ulang.
        </p>
        <div className="gate-action-buttons mt-4">
          <Link className="button primary" href="/member">
            Buka Portal & KTA Saya <ArrowRight size={17} />
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
        reason instanceof Error ? reason.message : "Pendaftaran gagal.";
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
          <BadgeCheck size={32} />
        </span>
        <p className="eyebrow">Pendaftaran Berhasil Dikirim</p>
        <h2>Permohonan Anda Sedang Diproses</h2>
        <p>
          Tautan verifikasi email telah dikirimkan ke alamat email dan nomor
          WhatsApp Anda untuk mencegah data spam dan mengamankan akun KTA
          Digital.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Setelah memverifikasi email, tim pengurus {organizationName} akan
          meninjau berkas permohonan keanggotaan Anda. Anda dapat langsung masuk
          ke portal anggota untuk melengkapi profil dan memantau status
          persetujuan.
        </p>
        <div className="gate-action-buttons mt-4">
          <Link className="button primary" href="/member/login">
            Buka Portal Anggota <ArrowRight size={17} />
          </Link>
          <Link className="button secondary" href="/member/verify-email">
            Cek Verifikasi Email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="member-form" onSubmit={register}>
      <div className="member-form-heading">
        <span className="member-form-icon">
          <Building2 size={23} />
        </span>
        <div>
          <p className="eyebrow">Membership application</p>
          <h2>Tell us about yourself</h2>
        </div>
      </div>
      {error && <p className="form-error full">{error}</p>}
      <label>
        Full name
        <input name="name" required minLength={2} autoComplete="name" />
      </label>
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Mobile number
        <input name="phone" required minLength={8} autoComplete="tel" />
      </label>
      <label>
        Date of birth
        <input name="dateOfBirth" type="date" />
      </label>
      <label>
        Organization unit
        <select name="unitId" defaultValue="">
          <option value="">Choose later</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name} · {unit.type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Company / institution
        <input name="companyName" autoComplete="organization" />
      </label>
      <label className="full">
        Address
        <textarea name="address" rows={3} autoComplete="street-address" />
      </label>
      <label>
        Create password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label className="member-consent full">
        <input name="consent" type="checkbox" required />
        <span>
          I confirm this information is accurate and consent to its use for
          membership administration.
        </span>
      </label>
      <div className="member-form-actions full">
        <span>
          Already registered? <Link href="/member/login">Sign in</Link>
        </span>
        <button className="button primary" type="submit" disabled={pending}>
          {pending ? "Submitting application…" : "Submit application"}
          {!pending && <ArrowRight size={17} />}
        </button>
      </div>
    </form>
  );
}
