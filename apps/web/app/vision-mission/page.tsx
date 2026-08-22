import {
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  FileText,
  Handshake,
  Leaf,
  Lightbulb,
  Scale,
  Shield,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Visi, Misi & Nilai Kehormatan · ${site.organization.name}`,
    description: `Arah strategis, komitmen etika, dan fondasi nilai ${site.organization.name} dalam memajukan industri tata udara & refrigerasi berstandar global dan ramah lingkungan.`,
  };
}

export default async function VisionMissionPage() {
  const site = await getSite();

  const missions = [
    {
      number: "01",
      icon: Award,
      color: "#38bdf8",
      title: "Standardisasi & Uji Kompetensi Nasional",
      description:
        "Mendorong seluruh teknisi dan praktisi tata udara memiliki sertifikasi profesi resmi BNSP level nasional melalui Lembaga Sertifikasi Profesi (LSP) terakreditasi.",
      deliverables: [
        "Kurikulum SKKNI Berkelanjutan",
        "Sertifikasi Penanganan Gas K3",
        "Pelatihan Vokasi Berkala di 38 DPD",
      ],
    },
    {
      number: "02",
      icon: Zap,
      color: "#34d399",
      title: "Transformasi Digital & Registri Terbuka",
      description:
        "Menghadirkan infrastruktur digital mandiri dengan KTA Digital ber-QR Code anti-pemalsuan, buku log kredit SKP realtime, dan verifikasi publik transparan.",
      deliverables: [
        "Identitas Digital KTA Berenkripsi",
        "Logbook Kredit SKP/CPD Real-Time",
        "Direktori Publik Terverifikasi",
      ],
    },
    {
      number: "03",
      icon: Leaf,
      color: "#818cf8",
      title: "Advokasi Kebijakan & Transisi Hijau",
      description:
        "Bermitra strategis dengan KLHK, Kemenperin, dan ESDM dalam implementasi protokol lingkungan pengurangan emisi refrigeran perusak ozon dan efisiensi energi.",
      deliverables: [
        "Kampanye Refrigeran Rendah GWP",
        "SOP Recovery & Daur Ulang Freon",
        "Advokasi Regulasi Importasi Suku Cadang",
      ],
    },
    {
      number: "04",
      icon: Scale,
      color: "#f59e0b",
      title: "Penegakan Kode Etik & Perlindungan Konsumen",
      description:
        "Menjamin tegaknya standar kejujuran teknis, transparansi tarif wajar, serta menyediakan mekanisme mediasi pengaduan konsumen yang independen dan adil.",
      deliverables: [
        "Pakta Integritas Anggota Mengikat",
        "Pedoman Standar Biaya Layanan Wajar",
        "Layanan Posko Pengaduan Etik",
      ],
    },
    {
      number: "05",
      icon: Handshake,
      color: "#ec4899",
      title: "Pemberdayaan UMKM & Jejaring Workshop",
      description:
        "Memperkuat ketahanan usaha bengkel binaan daerah melalui pelatihan manajemen bisnis, kemitraan rantai pasok suku cadang original, dan bantuan hukum profesi.",
      deliverables: [
        "Manajemen Workshop Modern",
        "Kemitraan Prinsipal Suku Cadang",
        "Advokasi Perlindungan Hukum Anggota",
      ],
    },
  ];

  const coreValues = [
    {
      icon: ShieldCheck,
      color: "#38bdf8",
      title: "Integritas & Kejujuran",
      subtitle: "Integrity First",
      description:
        "Mengutamakan transparansi diagnosa kerusakan alat, kejujuran spesifikasi suku cadang, dan penetapan biaya jasa yang adil bagi seluruh konsumen.",
    },
    {
      icon: Shield,
      color: "#34d399",
      title: "Keandalan & Standar K3",
      subtitle: "Safety & Quality",
      description:
        "Menjunjung tinggi standar keselamatan kerja (K3) dalam instalasi sistem gas bertekanan, pemeliharaan sirkuit kelistrikan, dan penjaminan mutu garansi.",
    },
    {
      icon: Leaf,
      color: "#818cf8",
      title: "Tanggung Jawab Ekologis",
      subtitle: "Eco Stewardship",
      description:
        "Berkomitmen aktif menjaga kelestarian atmosfer bumi dengan mematuhi protokol penanganan refrigeran ramah lingkungan dan pencegahan kebocoran freon.",
    },
    {
      icon: Users,
      color: "#f59e0b",
      title: "Solidaritas & Profesionalisme",
      subtitle: "Professional Brotherhood",
      description:
        "Membangun persaudaraan sesama praktisi, saling berbagi wawasan teknologi pendingin terbaru, dan memajukan martabat profesi teknisi Indonesia.",
    },
  ];

  return (
    <div className="vision-mission-page">
      {/* 1. Flagship Hero */}
      <header className="vm-hero">
        <div className="wrap vm-hero-inner">
          <div className="vm-hero-pill">
            <Compass size={15} color="#38bdf8" />
            <span>ARAH STRATEGIS & ETIKA ORGANISASI</span>
          </div>

          <h1 className="vm-hero-title">
            Visi, Misi & Komitmen Kehormatan{" "}
            <span className="text-gradient">{site.organization.name}</span>
          </h1>

          <p className="vm-hero-lead">
            Fondasi cita-cita jangka panjang, pedoman etika profesi pendingin,
            dan cetak biru dedikasi organisasi dalam mewujudkan ekosistem tata
            udara yang berdaya saing global, berintegritas tinggi, dan lestari.
          </p>

          <div className="vm-hero-actions">
            <Link href="/join" className="button primary btn-hero-lg">
              <span>Bergabung Jadi Anggota</span>
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/regulations"
              className="button outline btn-hero-outline"
            >
              <FileText size={16} />
              <span>Naskah AD/ART & Kode Etik</span>
            </Link>
            <Link
              href="/structure"
              className="button secondary btn-hero-outline"
            >
              <Users size={16} />
              <span>Struktur DPP & DPD</span>
            </Link>
          </div>

          {/* Strategic Pillar Badges */}
          <div className="vm-hero-badges-grid">
            <div className="vm-badge-box">
              <Target size={20} color="#38bdf8" />
              <div>
                <strong>Visi Global 2030</strong>
                <small>Daya Saing Regional</small>
              </div>
            </div>
            <div className="vm-badge-box">
              <ShieldCheck size={20} color="#34d399" />
              <div>
                <strong>100% Integritas</strong>
                <small>Kode Etik Mengikat</small>
              </div>
            </div>
            <div className="vm-badge-box">
              <Leaf size={20} color="#818cf8" />
              <div>
                <strong>Eco-Refrigerant</strong>
                <small>Protokol Hijau KLHK</small>
              </div>
            </div>
            <div className="vm-badge-box">
              <Award size={20} color="#f59e0b" />
              <div>
                <strong>Standar BNSP</strong>
                <small>Uji Kompetensi Nasional</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Grand Vision Card (Heroic Statement) */}
      <section className="vm-grand-vision-section section-space">
        <div className="wrap">
          <div className="grand-vision-card">
            <div className="grand-vision-glow" />
            <div className="grand-vision-head">
              <div className="vision-pill-tag">
                <Lightbulb size={16} />
                <span>VISI UTAMA ASOSIASI</span>
              </div>
            </div>

            <blockquote className="vision-quote">
              &ldquo;Menjadi asosiasi profesi tata udara dan refrigerasi
              (HVAC/R) terdepan di Asia Tenggara yang mandiri, berintegritas
              tinggi, berdaya saing global, serta menjadi pelopor utama transisi
              teknologi pendingin hemat energi dan ramah lingkungan hidup di
              Indonesia.&rdquo;
            </blockquote>

            <div className="vision-tenets-row">
              <div className="vision-tenet">
                <div className="tenet-dot" />
                <div>
                  <strong>Kompetensi Berkelanjutan</strong>
                  <p>Harmonisasi standar keahlian teknisi berlisensi BNSP.</p>
                </div>
              </div>
              <div className="vision-tenet">
                <div className="tenet-dot" />
                <div>
                  <strong>Perlindungan Konsumen</strong>
                  <p>Kepastian garansi dan transparansi kode etik profesi.</p>
                </div>
              </div>
              <div className="vision-tenet">
                <div className="tenet-dot" />
                <div>
                  <strong>Kelestarian Lingkungan</strong>
                  <p>
                    Implementasi refrigeran ramah iklim dan efisiensi energi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Five Strategic Missions Bento */}
      <section className="vm-missions-section section-space">
        <div className="wrap">
          <div className="section-heading text-center">
            <span className="eyebrow">AGENDA AKSI & MISI</span>
            <h2>Lima Misi Strategis Pembangunan Berkelanjutan</h2>
            <p>
              Program terpadu organisasi dalam melayani anggota, membina
              workshop daerah, dan mengawal kepatuhan standar industri
              pendingin.
            </p>
          </div>

          <div className="missions-bento-grid">
            {missions.map((m) => {
              const Icon = m.icon;
              return (
                <article className="mission-card" key={m.title}>
                  <div className="mission-card-top">
                    <span className="mission-number">{m.number}</span>
                    <div
                      className="mission-icon-box"
                      style={{
                        background: `${m.color}15`,
                        color: m.color,
                        borderColor: `${m.color}35`,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                  </div>

                  <h3>{m.title}</h3>
                  <p>{m.description}</p>

                  <div className="mission-deliverables">
                    <small>Target & Capaian Kunci:</small>
                    <ul>
                      {m.deliverables.map((item) => (
                        <li key={item}>
                          <CheckCircle2 size={15} color={m.color} />
                          <span>{item}</span>
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

      {/* 4. Core Values & Code of Honor Matrix */}
      <section className="vm-values-section section-space">
        <div className="wrap">
          <div className="section-heading text-center">
            <span className="eyebrow">NILAI KEHORMATAN</span>
            <h2>Empat Nilai Utama Penuntun Sikap & Kerja</h2>
            <p>
              Prinsip integritas yang wajib dipedomani oleh seluruh pemegang KTA
              Digital resmi dan jajaran pengurus di seluruh Indonesia.
            </p>
          </div>

          <div className="values-grid">
            {coreValues.map((v) => {
              const Icon = v.icon;
              return (
                <article className="value-card" key={v.title}>
                  <div
                    className="value-icon-box"
                    style={{
                      background: `${v.color}15`,
                      color: v.color,
                      borderColor: `${v.color}35`,
                    }}
                  >
                    <Icon size={26} />
                  </div>
                  <span className="value-subtitle">{v.subtitle}</span>
                  <h3>{v.title}</h3>
                  <p>{v.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Member Integrity Pledge Shell */}
      <section className="vm-pledge-section section-space">
        <div className="wrap">
          <div className="pledge-card-shell">
            <div className="pledge-head">
              <div className="pledge-icon-wrap">
                <ShieldCheck size={32} color="#38bdf8" />
              </div>
              <div>
                <span className="eyebrow light">IKRAR KEHORMATAN ANGGOTA</span>
                <h2>Pakta Integritas Teknisi & Bengkel Pendingin</h2>
              </div>
            </div>

            <div className="pledge-content-box">
              <p className="pledge-intro">
                Setiap anggota yang terdaftar secara sah dalam Sistem Registri
                Nasional {site.organization.name} menyatakan ikrar:
              </p>

              <ol className="pledge-list">
                <li>
                  <strong>Menjaga Kejujuran & Transparansi:</strong> Tidak
                  melakukan manipulasi diagnosa kerusakan ataupun menaikkan
                  harga jasa tanpa persetujuan terbuka dari pelanggan.
                </li>
                <li>
                  <strong>Mengutamakan Keselamatan K3:</strong> Menerapkan
                  prosedur kerja aman terhadap bahaya tekanan gas, kebakaran,
                  serta keselamatan kelistrikan.
                </li>
                <li>
                  <strong>Melindungi Kelestarian Ozon & Iklim:</strong> Wajib
                  menggunakan alat *recovery* dan tidak melepaskan freon secara
                  bebas ke udara terbuka.
                </li>
                <li>
                  <strong>Menjunjung Kehormatan Profesi:</strong> Senantiasa
                  meningkatkan kompetensi keahlian dan memelihara nama baik
                  asosiasi di mata masyarakat.
                </li>
              </ol>
            </div>

            <div className="pledge-foot">
              <Link
                href="/regulations"
                className="button outline-light btn-pledge"
              >
                <FileText size={15} />
                <span>Pelajari Regulasi & Sanksi Etik Lengkap</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. High-Impact Conversion CTA */}
      <section className="vm-bottom-cta">
        <div className="wrap">
          <div className="vm-cta-shell">
            <div className="vm-cta-content">
              <h2>Wujudkan Industri Pendingin yang Profesional & Kredibel</h2>
              <p>
                Mari bergabung bersama ribuan teknisi dan bengkel terakreditasi
                di 38 provinsi di seluruh Nusantara.
              </p>
            </div>
            <div className="vm-cta-actions">
              <Link href="/join" className="button primary btn-cta-main">
                <span>Daftar Keanggotaan</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/whois" className="button secondary btn-cta-sec">
                <span>Cek Registri Anggota</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
