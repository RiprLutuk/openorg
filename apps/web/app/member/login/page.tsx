import type { Metadata } from "next";
import { MemberLogin } from "@/components/member-login";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Masuk Portal Anggota · ${site.organization.name}`,
    description: `Akses akun keanggotaan resmi ${site.organization.name}, unduh kartu KTA digital, dan pantau buku log SKP/CPD.`,
  };
}

export default async function MemberLoginPage() {
  const site = await getSite();
  return (
    <div className="login-page-suite">
      <div className="login-ambient-glow" />
      <div className="wrap login-page-inner">
        <MemberLogin organizationName={site.organization.name} />
      </div>
    </div>
  );
}
