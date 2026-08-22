import { FileCheck2, Lock, Search, ShieldCheck, Zap } from "lucide-react";
import type { Metadata } from "next";
import { InteractiveCredentialChecker } from "@/components/interactive-credential-checker";
import { MembershipVerification } from "@/components/membership-verification";
import { getSite } from "@/lib/api";

export const metadata: Metadata = {
  title: "ComplyFlow · Verifikasi Kredensial & Kartu Anggota Digital",
  description:
    "Layanan verifikasi keabsahan KTA digital, lisensi profesi, dan sertifikat kompetensi BNSP secara real-time dan anti-pemalsuan.",
};

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function VerifyPage({ searchParams }: Props) {
  const { code } = await searchParams;
  const site = await getSite();

  return (
    <div className="verify-page-master">
      {/* 1. Hero Header */}
      <section className="verify-hero-refined">
        <div className="wrap">
          <div className="hero-pill-white">
            <ShieldCheck size={14} />
            <span>ComplyFlow · Zero-Trust Validation Engine</span>
          </div>
          <h1>Verifikasi Kredensial, KTA & Sertifikasi Resmi</h1>
          <p className="verify-lead">
            Audit instan keabsahan kartu tanda anggota (KTA), sertifikat
            kompetensi BNSP, dan status keaktifan anggota{" "}
            <strong>{site.organization.name}</strong> secara transparan.
          </p>
        </div>
      </section>

      {/* 2. Main Verification Interactive Desk or Result */}
      <div className="wrap verify-content-wrap">
        {code ? (
          <div className="verify-direct-result-panel">
            <div className="verify-direct-header">
              <div>
                <span className="eyebrow">Hasil Audit Registri</span>
                <h2>Data Kredensial Terverifikasi</h2>
              </div>
              <a href="/verify" className="btn-search-another">
                <Search size={15} />
                <span>Cari Kredensial Lain</span>
              </a>
            </div>
            <MembershipVerification code={code} />
          </div>
        ) : (
          <InteractiveCredentialChecker orgName={site.organization.name} />
        )}

        {/* 3. Assurance & Security Pillars */}
        <section className="verify-assurance-section">
          <div className="assurance-grid">
            <div className="assurance-card">
              <div className="assurance-icon-box blue">
                <Zap size={22} />
              </div>
              <h3>Sinkronisasi Database Real-Time</h3>
              <p>
                Status keaktifan anggota dan SKP terhubung langsung dengan buku
                besar digital pusat {site.organization.name}.
              </p>
            </div>

            <div className="assurance-card">
              <div className="assurance-icon-box green">
                <FileCheck2 size={22} />
              </div>
              <h3>Standar Uji Kompetensi BNSP</h3>
              <p>
                Membuktikan legalitas sertifikasi profesi teknisi dan pengurus
                dengan standar mutu kompetensi nasional.
              </p>
            </div>

            <div className="assurance-card">
              <div className="assurance-icon-box purple">
                <Lock size={22} />
              </div>
              <h3>QR Code Anti-Pemalsuan</h3>
              <p>
                Setiap KTA digital dilengkapi token kriptografi unik yang tidak
                dapat diduplikasi atau dipalsukan.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
