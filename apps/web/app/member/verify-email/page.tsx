import type { Metadata } from "next";
import { Suspense } from "react";
import { MemberVerifyEmail } from "@/components/member-verify-email";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Verifikasi Email & Aktivasi KTA · ${site.organization.name}`,
    description: `Verifikasi email pendaftaran akun anggota resmi ${site.organization.name} untuk aktivasi KTA Digital dan kredensial SKP.`,
  };
}

export default async function MemberVerifyEmailPage() {
  const site = await getSite();
  return (
    <div className="login-page-suite">
      <div className="login-ambient-glow" />
      <div className="wrap login-page-inner">
        <Suspense
          fallback={
            <div className="modern-login-split-card" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#64748b", fontWeight: 600 }}>Memuat validasi keanggotaan…</p>
            </div>
          }
        >
          <MemberVerifyEmail organizationName={site.organization.name} />
        </Suspense>
      </div>
    </div>
  );
}
