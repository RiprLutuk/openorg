import type { Metadata } from "next";
import { Suspense } from "react";
import { MemberVerifyEmail } from "@/components/member-verify-email";

export const metadata: Metadata = {
  title: "Verifikasi Email Anggota | OpenOrg",
  description:
    "Verifikasi email pendaftaran akun anggota resmi OpenOrg & APTI Indonesia.",
};

export default function MemberVerifyEmailPage() {
  return (
    <section className="member-verify-page">
      <div className="wrap">
        <Suspense
          fallback={<div className="portal-loading">Memuat verifikasi…</div>}
        >
          <MemberVerifyEmail />
        </Suspense>
      </div>
    </section>
  );
}
