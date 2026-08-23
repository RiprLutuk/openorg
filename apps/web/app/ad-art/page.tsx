import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Gavel,
  Globe,
  Handshake,
  HeartHandshake,
  Landmark,
  Leaf,
  Lock,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `AD/ART & Kode Etik Profesi · ${site.organization.name}`,
    description: `Naskah resmi Anggaran Dasar, Anggaran Rumah Tangga (AD/ART), dan 9 Butir Pakta Integritas Profesi ${site.organization.name}.`,
  };
}

export default async function AdArtPage() {
  const site = await getSite();

  const adChapters = [
    {
      chapter: "BAB I",
      title: "Nama, Waktu & Kedudukan",
      summary:
        "Organisasi didirikan untuk jangka waktu yang tidak ditentukan dan berkedudukan di Ibukota Negara Republik Indonesia dengan cabang di 38 Provinsi.",
      articles: [
        "Pasal 1: Nama Organisasi dan Identitas Resmi",
        "Pasal 2: Waktu Pembentukan & Landasan Hukum",
        "Pasal 3: Kedudukan Sekretariat DPP & DPD",
      ],
      color: "#38bdf8",
      icon: Landmark,
    },
    {
      chapter: "BAB II",
      title: "Asas, Visi & Tujuan Pokok",
      summary:
        "Berasaskan Pancasila dan UUD 1945, bertujuan membina profesionalisme, menstandarkan kompetensi, serta melindungi praktisi tata udara & refrigerasi.",
      articles: [
        "Pasal 4: Asas dan Kedaulatan Profesi",
        "Pasal 5: Visi & Misi Keorganisasian 2024–2029",
        "Pasal 6: Tujuan Pembangunan Standar Nasional",
      ],
      color: "#34d399",
      icon: Scale,
    },
    {
      chapter: "BAB III",
      title: "Status & Kualifikasi Keanggotaan",
      summary:
        "Keanggotaan terdiri dari Anggota Biasa (Teknisi/Bengkel Terverifikasi), Anggota Luar Biasa (Akademisi/Instruktur), dan Anggota Kehormatan.",
      articles: [
        "Pasal 7: Klasifikasi & Kriteria Anggota",
        "Pasal 8: Syarat Pendaftaran & Registrasi KTA",
        "Pasal 9: Hak Suara & Kewajiban Organisasi",
      ],
      color: "#818cf8",
      icon: Users,
    },
    {
      chapter: "BAB IV",
      title: "Struktur Kepengurusan & Musyawarah",
      summary:
        "Kekuasaan tertinggi berada pada Musyawarah Nasional (Munas), dengan pimpinan eksekutif Dewan Pimpinan Pusat (DPP) dan Dewan Pimpinan Daerah (DPD).",
      articles: [
        "Pasal 10: Hierarki Musyawarah (Munas, Musda, Rakernas)",
        "Pasal 11: Wewenang & Tanggung Jawab Pengurus DPP",
        "Pasal 12: Pengurus Daerah (DPD) & Korwil Provinsi",
      ],
      color: "#f59e0b",
      icon: Building2,
    },
    {
      chapter: "BAB V",
      title: "Kode Etik Profesi & Majelis Kehormatan",
      summary:
        "Setiap anggota wajib memegang teguh 9 butir pakta integritas dan tunduk pada pengawasan Majelis Etik Organisasi.",
      articles: [
        "Pasal 13: Piagam Kode Etik Pelayanan Konsumen",
        "Pasal 14: Tata Tertib Sidang Majelis Etik",
        "Pasal 15: Sanksi Administratif & Pencabutan KTA",
      ],
      color: "#ec4899",
      icon: Gavel,
    },
    {
      chapter: "BAB VI",
      title: "Keuangan, Iuran & Aset Organisasi",
      summary:
        "Keuangan bersumber dari iuran pangkal, iuran tahunan anggota, dan kontribusi halal yang diaudit transparan berkala.",
      articles: [
        "Pasal 16: Pengelolaan Iuran Anggota",
        "Pasal 17: Audit Publik & Laporan Keuangan Tahunan",
        "Pasal 18: Pengelolaan Hak Kekayaan & Aset Asosiasi",
      ],
      color: "#06b6d4",
      icon: ShieldCheck,
    },
  ];

  const ethicsPledges = [
    {
      number: "01",
      title: "Kejujuran & Transparansi Diagnosa",
      description:
        "Wajib menyampaikan kondisi riil kerusakan perangkat pendingin secara jujur kepada konsumen tanpa rekayasa komponen.",
      icon: ShieldCheck,
      badge: "Integritas",
    },
    {
      number: "02",
      title: "Standar Tarif Wajar & Terbuka",
      description:
        "Menerapkan estimasi biaya jasa dan suku cadang yang transparan, profesional, dan dapat dipertanggungjawabkan.",
      icon: Scale,
      badge: "Kewajaran",
    },
    {
      number: "03",
      title: "Jaminan Garansi Kerja Pasti",
      description:
        "Memberikan kepastian garansi perbaikan yang sah sebagai wujud tanggung jawab profesionalisme workshop anggota.",
      icon: Award,
      badge: "Garansi Mutu",
    },
    {
      number: "04",
      title: "K3 & Alat Pelindung Diri (APD)",
      description:
        "Memprioritaskan keselamatan kerja teknisi dan lingkungan sekitar dengan penggunaan peralatan berstandar SNI.",
      icon: Wrench,
      badge: "K3 & Safety",
    },
    {
      number: "05",
      title: "Kelestarian Iklim (Eco-Recovery)",
      description:
        "Wajib menggunakan mesin recovery freon dan melarang pembuangan refrigeran sintetik secara bebas ke atmosfer bumi.",
      icon: Leaf,
      badge: "Ramah Lingkungan",
    },
    {
      number: "06",
      title: "Keamanan Properti Konsumen",
      description:
        "Menjaga kerahasiaan, kehormatan tempat kerja, serta keselamatan aset milik pelanggan selama proses instalasi/servis.",
      icon: Lock,
      badge: "Keamanan Aset",
    },
    {
      number: "07",
      title: "Solidaritas Sesama Workshop",
      description:
        "Menjaga persaingan usaha yang sehat, saling menghargai sesama rekan seprofesi, dan tidak merusak nama baik asosiasi.",
      icon: HeartHandshake,
      badge: "Persaudaraan",
    },
    {
      number: "08",
      title: "Kompetensi Berkelanjutan (SKP)",
      description:
        "Senantiasa meningkatkan keahlian teknis melalui program pelatihan resmi, uji sertifikasi BNSP, dan logbook SKP.",
      icon: Zap,
      badge: "Pengembangan Diri",
    },
    {
      number: "09",
      title: "Kepatuhan AD/ART & Hukum Nasional",
      description:
        "Tunduk pada seluruh keputusan Munas, instruksi Surat Edaran DPP, serta peraturan perundang-undangan Republik Indonesia.",
      icon: Landmark,
      badge: "Hukum & Disiplin",
    },
  ];

  return (
    <div className="organization-profile-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="org-hero">
        <div className="wrap org-hero-inner">
          <div className="org-hero-pill">
            <Scale size={15} color="#38bdf8" />
            <span>LANDASAN HUKUM & KONSTITUSI ORGANISASI</span>
          </div>

          <h1 className="org-hero-title">
            Anggaran Dasar, AD/ART &{" "}
            <span className="text-gradient">Kode Etik Profesi</span>
          </h1>

          <p className="org-hero-lead">
            Konstitusi pokok {site.organization.name} yang disahkan melalui
            Musyawarah Nasional (Munas) sebagai pedoman tata kelola, hak &
            kewajiban anggota, struktur pengurus, dan 9 Butir Pakta Integritas.
          </p>

          {/* Key Metrics / Legal Proof */}
          <div className="org-hero-metrics">
            <div className="org-metric-box">
              <div className="org-metric-icon">
                <Landmark size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>SK Kemenkumham Sah</strong>
                <small>AHU-0012948.AH.01.07</small>
              </div>
            </div>
            <div className="org-metric-box">
              <div className="org-metric-icon">
                <FileCheck2 size={22} color="#34d399" />
              </div>
              <div>
                <strong>Naskah Munas 2024–2029</strong>
                <small>Konstitusi Baku Berlaku</small>
              </div>
            </div>
            <div className="org-metric-box">
              <div className="org-metric-icon">
                <ShieldCheck size={22} color="#818cf8" />
              </div>
              <div>
                <strong>9 Butir Pakta Integritas</strong>
                <small>Wajib Seluruh Anggota</small>
              </div>
            </div>
            <div className="org-metric-box">
              <div className="org-metric-icon">
                <Users size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>38 DPD Provinsi</strong>
                <small>Struktur Musyawarah Sah</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Ringkasan Pokok Anggaran Dasar (AD) */}
      <section className="section-space org-pillars-section">
        <div className="wrap">
          <div className="section-heading text-center">
            <span className="eyebrow">KONSTITUSI POKOK</span>
            <h2>Struktur & Ketentuan Pokok Anggaran Dasar</h2>
            <p>
              Enam bab utama yang menjadi fondasi hukum keberlangsungan
              organisasi, kedaulatan anggota, dan pembagian wewenang pengurus.
            </p>
          </div>

          <div className="org-pillars-grid">
            {adChapters.map((item) => {
              const Icon = item.icon;
              return (
                <article className="pillar-card" key={item.chapter}>
                  <div className="pillar-card-top">
                    <div
                      className="pillar-icon-box"
                      style={{
                        background: `${item.color}15`,
                        color: item.color,
                        borderColor: `${item.color}35`,
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="pillar-badge">{item.chapter}</span>
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>

                  <div className="pillar-points">
                    <ul>
                      {item.articles.map((art) => (
                        <li key={art}>
                          <CheckCircle2 size={14} color={item.color} />
                          <span>{art}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. 9 Butir Pakta Integritas & Kode Etik */}
      <section
        className="section-space vm-values-section"
        style={{ background: "#f8fafc" }}
      >
        <div className="wrap">
          <div className="section-heading text-center">
            <span className="eyebrow">KODE ETIK PROFESI</span>
            <h2>9 Butir Pakta Integritas Anggota & Teknisi</h2>
            <p>
              Standar moral dan profesionalisme wajib yang diikrarkan oleh
              seluruh praktisi, pemilik bengkel, dan pemegang KTA resmi.
            </p>
          </div>

          <div className="values-grid">
            {ethicsPledges.map((pledge) => {
              return (
                <article className="value-card" key={pledge.number}>
                  <div className="value-card-header">
                    <span className="value-index">{pledge.number}</span>
                    <span className="doc-type-badge">{pledge.badge}</span>
                  </div>
                  <h3>{pledge.title}</h3>
                  <p>{pledge.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Majelis Kehormatan & Sanksi Disiplin */}
      <section className="section-space">
        <div className="wrap">
          <div className="org-governance-shell">
            <div className="gov-content">
              <div className="gov-icon-badge">
                <Gavel size={26} color="#0284c7" />
              </div>
              <h2>Penegakan Disiplin & Majelis Etik JENDELA</h2>
              <p>
                Organisasi menjamin perlindungan hak konsumen dan kepastian
                profesi teknisi melalui Dewan Kehormatan & Majelis Etik. Setiap
                laporan pelanggaran kode etik ditindaklanjuti secara berjenjang
                dan objektif:
              </p>
              <div className="gov-steps">
                <div className="gov-step-item">
                  <div className="gov-step-num">1</div>
                  <div>
                    <strong>Penerimaan Laporan</strong>
                    <p>Verifikasi bukti faktual melalui Posko JENDELA.</p>
                  </div>
                </div>
                <div className="gov-step-item">
                  <div className="gov-step-num">2</div>
                  <div>
                    <strong>Mediasi Dewan Etik</strong>
                    <p>Musyawarah klarifikasi bersama pengurus DPD.</p>
                  </div>
                </div>
                <div className="gov-step-item">
                  <div className="gov-step-num">3</div>
                  <div>
                    <strong>Putusan & Sanksi</strong>
                    <p>Pemberian teguran, pembekuan, hingga pencabutan KTA.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="gov-action-card">
              <ShieldAlert size={36} color="#ef4444" />
              <h4>Ada Indikasi Pelanggaran Kode Etik?</h4>
              <p>
                Masyarakat dan konsumen dapat menyampaikan aduan resmi mengenai
                pelayanan teknisi ber-KTA kepada Dewan Kehormatan.
              </p>
              <Link
                href="/complaints"
                className="button primary btn-gov-action"
              >
                <span>Posko Pengaduan Etik</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Repositori Dokumen Legalitas & Unduhan Naskah */}
      <section className="section-space org-docs-section">
        <div className="wrap">
          <div className="section-heading text-center">
            <span className="eyebrow">UNDUHAN DOKUMEN RESMI</span>
            <h2>Naskah Otentik AD/ART & Pedoman Organisasi</h2>
            <p>
              Akses naskah digital berlisensi resmi hasil ketetapan Musyawarah
              Nasional untuk keperluan legalitas dan rujukan anggota.
            </p>
          </div>

          <div className="docs-download-grid">
            <article className="doc-card">
              <div className="doc-card-icon">
                <FileText size={28} color="#38bdf8" />
              </div>
              <div className="doc-card-body">
                <span className="doc-type-badge">PDF Resmi Munas</span>
                <h3>Naskah Lengkap AD/ART 2024–2029</h3>
                <p>
                  Naskah lengkap 18 Bab Anggaran Dasar dan Anggaran Rumah Tangga
                  hasil ketetapan Musyawarah Nasional terbaru.
                </p>
              </div>
              <div className="doc-card-foot">
                <a
                  href="/regulations?kategori=ad-art"
                  className="button outline btn-doc"
                >
                  <Download size={15} />
                  <span>Unduh Naskah AD/ART</span>
                </a>
              </div>
            </article>

            <article className="doc-card">
              <div className="doc-card-icon">
                <BadgeCheck size={28} color="#34d399" />
              </div>
              <div className="doc-card-body">
                <span className="doc-type-badge">Salinan Kemenkumham</span>
                <h3>SK Pengesahan Badan Hukum</h3>
                <p>
                  Keputusan Menteri Hukum dan HAM RI tentang Pengesahan Badan
                  Hukum Perkumpulan Asosiasi Pendingin Indonesia.
                </p>
              </div>
              <div className="doc-card-foot">
                <a
                  href="/regulations?kategori=ad-art"
                  className="button outline btn-doc"
                >
                  <FileCheck2 size={15} />
                  <span>Lihat Salinan SK</span>
                </a>
              </div>
            </article>

            <article className="doc-card">
              <div className="doc-card-icon">
                <Scale size={28} color="#818cf8" />
              </div>
              <div className="doc-card-body">
                <span className="doc-type-badge">Pedoman Majelis</span>
                <h3>Buku Pedoman Kode Etik & Sanksi</h3>
                <p>
                  Panduan baku tata cara penegakan disiplin anggota, etika
                  pelayanan pelanggan, dan sidang Majelis Kehormatan.
                </p>
              </div>
              <div className="doc-card-foot">
                <a
                  href="/regulations?kategori=ad-art"
                  className="button outline btn-doc"
                >
                  <FileText size={15} />
                  <span>Buka Pedoman Etik</span>
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 6. Smart Dynamic Bottom CTA */}
      <DynamicBottomCta
        organizationName={site.organization.name}
        guestTitle="Jadilah Bagian dari Komunitas Pendingin Berintegritas"
        guestDescription="Daftarkan diri Anda atau bengkel Anda untuk mendapatkan KTA Digital resmi, perlindungan hukum, dan pengakuan kode etik profesi nasional."
        guestPrimaryCta={{ label: "Daftar Jadi Anggota", href: "/join" }}
        guestSecondaryCta={{ label: "Cek Validitas KTA", href: "/verify" }}
        memberTitle="Patuhi Kode Etik & Tingkatkan Kredensial Anda"
        memberDescription="Sebagai anggota aktif, Anda berhak mencantumkan sertifikat integritas etik dan memanfaatkan jejaring advokasi asosiasi."
        memberPrimaryCta={{ label: "Buka Portal & KTA Saya", href: "/member" }}
        memberSecondaryCta={{ label: "Struktur Pengurus", href: "/structure" }}
      />
    </div>
  );
}
