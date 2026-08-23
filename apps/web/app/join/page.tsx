import type { Metadata } from "next";
import { Suspense } from "react";
import { JoinPageInteractive } from "@/components/join-page-interactive";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Syarat & Pendaftaran Keanggotaan · ${site.organization.name}`,
    description: `Syarat keanggotaan, formulir registrasi mandiri anggota baru, verifikasi berkas DPD, dan aktivasi KTA digital resmi ${site.organization.name}.`,
  };
}

export default async function JoinPage() {
  const site = await getSite();

  return (
    <Suspense
      fallback={
        <div className="join-page-suite">
          <div className="tech-hero join-hero-refined">
            <div className="wrap tech-hero-inner">
              <h1 className="tech-hero-title">
                Memuat Portal Pendaftaran & Keanggotaan...
              </h1>
            </div>
          </div>
        </div>
      }
    >
      <JoinPageInteractive site={site} />
    </Suspense>
  );
}
