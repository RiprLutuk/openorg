import {
  Award,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  HelpCircle,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MembershipRegistration } from "@/components/membership-registration";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Pendaftaran Keanggotaan Baru · ${site.organization.name}`,
    description: `Formulir registrasi mandiri anggota baru, verifikasi berkas digital, dan penerbitan KTA resmi ber-QR Code ${site.organization.name}.`,
  };
}

export default async function JoinPage() {
  const site = await getSite();

  const benefits = [
    {
      icon: CreditCard,
      color: "#38bdf8",
      title: "KTA Digital Ber-QR Code Anti-Pemalsuan",
      description:
        "Identitas profesi resmi yang dapat diverifikasi instan oleh konsumen, manajemen gedung, dan asosiasi di seluruh Indonesia.",
    },
    {
      icon: GraduationCap,
      color: "#34d399",
      title: "Akses Pelatihan & Kredit SKP/CPD",
      description:
        "Ikuti webinar teknis, workshop penanganan freon ramah lingkungan, dan raih sertifikat uji kompetensi BNSP resmi.",
    },
    {
      icon: Wrench,
      color: "#818cf8",
      title: "Listing Direktori Teknisi & Workshop Nasional",
      description:
        "Nama dan bengkel Anda terdaftar di mesin pencari resmi organisasi, memudahkan calon pelanggan menemukan jasa Anda.",
    },
    {
      icon: ShieldCheck,
      color: "#f59e0b",
      title: "Advokasi Hukum & Perlindungan Usaha",
      description:
        "Dukungan mediasi hukum profesi, standarisasi tarif kerja wajar, dan akses suku cadang original dari prinsipal.",
    },
  ];

  return (
    <div className="join-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero join-hero-refined">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <Sparkles size={15} color="#38bdf8" />
            <span>PORTAL REGISTRASI MANDIRI & DIGITAL</span>
          </div>

          <h1 className="tech-hero-title">
            Bergabung Bersama Komunitas{" "}
            <span className="text-gradient">Profesional Terdepan</span>
          </h1>

          <p className="tech-hero-lead">
            Daftarkan diri Anda atau workshop secara online, nikmati kemudahan
            akses KTA digital resmi, kredit kompetensi SKP, dan jejaring
            solidaritas ribuan teknisi di 38 provinsi bersama{" "}
            <strong>{site.organization.name}</strong>.
          </p>

          {/* Value Badges Bar */}
          <div className="join-badges-row">
            <span className="join-badge-item">
              <CheckCircle2 size={14} color="#34d399" />
              <span>Verifikasi Berkas Cepat</span>
            </span>
            <span className="join-badge-item">
              <CheckCircle2 size={14} color="#34d399" />
              <span>KTA Ber-QR Code Unik</span>
            </span>
            <span className="join-badge-item">
              <CheckCircle2 size={14} color="#34d399" />
              <span>Standarisasi BNSP</span>
            </span>
            <span className="join-badge-item">
              <CheckCircle2 size={14} color="#34d399" />
              <span>Akses Portal Mandiri</span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Split: Registration Flow & Step Guidance */}
      <section className="join-body section-space">
        <div className="wrap join-grid-layout">
          {/* Left Column: 3-Step Process & Benefits */}
          <div className="join-guide-column">
            <div className="join-steps-card">
              <div className="steps-card-head">
                <span className="step-tag">Tahapan Registrasi</span>
                <h3>3 Langkah Praktis Menjadi Anggota</h3>
              </div>

              <div className="modern-steps-list">
                <div className="modern-step-item">
                  <div className="step-number-circle">01</div>
                  <div className="step-item-content">
                    <h4>Pengisian Formulir Mandiri</h4>
                    <p>
                      Lengkapi data identitas diri, nomor kontak aktif, dan
                      pilih unit kepengurusan daerah (DPD) tempat Anda
                      berdomisili.
                    </p>
                  </div>
                </div>

                <div className="modern-step-item">
                  <div className="step-number-circle">02</div>
                  <div className="step-item-content">
                    <h4>Verifikasi Berkas Pengurus Daerah</h4>
                    <p>
                      Sekretariat DPD akan memvalidasi data dan mengonfirmasi
                      keabsahan pendaftaran secara transparan.
                    </p>
                  </div>
                </div>

                <div className="modern-step-item">
                  <div className="step-number-circle">03</div>
                  <div className="step-item-content">
                    <h4>Aktivasi KTA Digital & Hak Akses Portal</h4>
                    <p>
                      Nomor KTA diterbitkan otomatis, dapat diunduh/dicetak
                      langsung, dan siap digunakan untuk uji kompetensi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Bento Mini Grid */}
            <div className="join-benefits-grid">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div className="join-benefit-card" key={b.title}>
                    <div
                      className="benefit-icon-box"
                      style={{ color: b.color, background: `${b.color}15` }}
                    >
                      <Icon size={20} />
                    </div>
                    <h4>{b.title}</h4>
                    <p>{b.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Need Help Box */}
            <div className="join-help-card">
              <HelpCircle size={22} color="#0284c7" />
              <div>
                <h4>Butuh Bantuan Pendaftaran?</h4>
                <p>
                  Hubungi Sekretariat DPP melalui WhatsApp resmi di{" "}
                  <strong>
                    {site.quickContact?.label || "0812-8000-APTI"}
                  </strong>{" "}
                  untuk panduan berkas keanggotaan.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Registration Form */}
          <div className="join-form-column">
            <div className="join-form-wrapper">
              <MembershipRegistration
                organizationName={site.organization.name}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
