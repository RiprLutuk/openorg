import {
  Award,
  CheckCircle2,
  FileCheck2,
  Lock,
  QrCode,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { InteractiveCredentialChecker } from "@/components/interactive-credential-checker";
import { MembershipVerification } from "@/components/membership-verification";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Verifikasi Kredensial & KTA Digital · ${site.organization.name}`,
    description: `Layanan audit instan keabsahan kartu tanda anggota (KTA) digital, sertifikat kompetensi BNSP, kode TKT klub, dan SK kemitraan resmi ${site.organization.name}.`,
  };
}

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function VerifyPage({ searchParams }: Props) {
  const { code } = await searchParams;
  const site = await getSite();

  return (
    <div className="verify-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero verify-hero-master">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <ShieldCheck size={15} color="#38bdf8" />
            <span>COMPLYFLOW · ZERO-TRUST VALIDATION ENGINE</span>
          </div>

          <h1 className="tech-hero-title">
            Verifikasi Kredensial & KTA{" "}
            <span className="text-gradient">Resmi Real-Time</span>
          </h1>

          <p className="tech-hero-lead">
            Audit instan keabsahan kartu tanda anggota (KTA), sertifikat
            kompetensi BNSP, nomor akreditasi klub (TKT), dan legalitas
            kemitraan <strong>{site.organization.name}</strong> secara
            transparan dan terenkripsi.
          </p>

          {/* Impact Metrics Bar */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Zap size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>Audit Instan &lt;1 Detik</strong>
                <small>Buku Besar Digital</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Lock size={22} color="#34d399" />
              </div>
              <div>
                <strong>QR Anti-Pemalsuan</strong>
                <small>Token Kriptografi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Award size={22} color="#818cf8" />
              </div>
              <div>
                <strong>Terhubung BNSP</strong>
                <small>Lisensi Standar SKKNI</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <ShieldCheck size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>100% Data Sah</strong>
                <small>Audit Registri Terbuka</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Verification Interactive Desk or Direct Result */}
      <section className="verify-body section-space">
        <div className="wrap">
          {code ? (
            <div className="verify-direct-result-panel">
              <div className="verify-direct-header">
                <div>
                  <span className="eyebrow">Hasil Audit Registri</span>
                  <h2>Data Kredensial Terverifikasi</h2>
                </div>
                <a
                  href="/verify"
                  className="button secondary btn-search-another"
                >
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
          <section className="verify-assurance-section mt-12">
            <div className="assurance-grid">
              <div className="assurance-card">
                <div className="assurance-icon-box blue">
                  <Zap size={22} />
                </div>
                <h3>Sinkronisasi Database Real-Time</h3>
                <p>
                  Status keaktifan anggota, SKP pelatihan, dan DPD terhubung
                  langsung dengan buku besar digital pusat{" "}
                  {site.organization.name}.
                </p>
              </div>

              <div className="assurance-card">
                <div className="assurance-icon-box green">
                  <FileCheck2 size={22} />
                </div>
                <h3>Standar Uji Kompetensi BNSP</h3>
                <p>
                  Membuktikan legalitas sertifikasi profesi teknisi dan pengurus
                  dengan standar mutu kompetensi teknis nasional SKKNI.
                </p>
              </div>

              <div className="assurance-card">
                <div className="assurance-icon-box purple">
                  <Lock size={22} />
                </div>
                <h3>QR Code Anti-Pemalsuan</h3>
                <p>
                  Setiap KTA digital dilengkapi token verifikasi unik yang tidak
                  dapat diduplikasi atau dipalsukan oleh pihak luar.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* 4. Bottom CTA: Get Certified */}
      <DynamicBottomCta
        organizationName={site.organization.name}
        guestTitle="Ingin Memiliki KTA Digital & Sertifikasi BNSP Resmi?"
        guestDescription="Bergabunglah dengan ribuan teknisi berlisensi di 38 provinsi dan dapatkan akses uji kompetensi, perlindungan hukum, serta direktori teknisi nasional."
        guestPrimaryCta={{ label: "Daftar Anggota Sekarang", href: "/join" }}
        guestSecondaryCta={{
          label: "Cari Teknisi Terdekat",
          href: "/technicians",
        }}
        memberTitle="Perpanjang KTA atau Unduh Kartu Digital"
        memberDescription="Masuk ke portal anggota untuk memeriksa masa berlaku kartu, mengumpulkan poin SKP, atau memperbarui data keahlian bengkel Anda."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{ label: "Agenda Sertifikasi", href: "/events" }}
      />
    </div>
  );
}
