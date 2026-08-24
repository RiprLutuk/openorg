import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Globe,
  Landmark,
  Network,
  QrCode,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Profil & Sejarah Organisasi · ${site.organization.name}`,
    description: `Mengenal profil, sejarah pembentukan, pilar strategis, dan komitmen ${site.organization.name} dalam memajukan standar tata udara & refrigerasi Indonesia.`,
  };
}

export default async function OrganizationProfilePage() {
  const site = await getSite();

  const milestones = [
    {
      year: "2018",
      phase: "Fase Inisiasi & Deklarasi Nasional",
      title: "Penyatuan Praktisi & Standar Bengkel Pendingin",
      description:
        "Deklarasi formatur bersama para praktisi senior HVAC/R dan pengusaha workshop dari berbagai daerah untuk menyatukan visi, kode etik profesi, dan keselamatan kerja (K3) tata udara di Indonesia.",
      tags: ["Deklarasi Nasional", "Kode Etik", "Formatur DPP"],
      highlight: "Inisiasi Bersama",
    },
    {
      year: "2020",
      phase: "Fase Standarisasi & Akreditasi",
      title: "Harmonisasi Kompetensi BNSP & Eco-Refrigerant",
      description:
        "Penyusunan Standar Kompetensi Kerja Nasional Indonesia (SKKNI) bersama BNSP serta pelatihan penanganan zat refrigeran ramah lingkungan (non-ODS & rendah GWP) berkolaborasi dengan kementerian terkait.",
      tags: ["Standar BNSP", "SKKNI Refrigerasi", "Eco-Friendly Freon"],
      highlight: "Akreditasi BNSP",
    },
    {
      year: "2023",
      phase: "Fase Ekspansi Wilayah Terpadu",
      title: "Konsolidasi Kepengurusan 38 DPD Seluruh Provinsi",
      description:
        "Pengukuhan jaringan Dewan Pimpinan Daerah (DPD) di 38 provinsi di seluruh Nusantara guna memastikan pembinaan bengkel lokal, perlindungan teknisi daerah, dan standarisasi tarif kerja transparan.",
      tags: ["38 Provinsi", "Pengurus Daerah", "Advokasi Bengkel"],
      highlight: "Jaringan 38 DPD",
    },
    {
      year: "2026",
      phase: "Fase Modernisasi & KTA Digital",
      title: "Ekosistem Terpadu Registri & Audit Kredensial",
      description:
        "Peluncuran infrastruktur digital mandiri OpenOrg: penerbitan KTA Digital ber-QR Code anti-pemalsuan, sistem Satuan Kredit Profesi (SKP) realtime, dan portal verifikasi publik terpercaya.",
      tags: ["KTA Digital Realtime", "QR Anti-Pemalsuan", "Audit Publik"],
      highlight: "Transformasi Digital",
    },
  ];

  const strategicPillars = [
    {
      icon: Award,
      color: "#38bdf8",
      badge: "Sertifikasi Resmi",
      title: "Standardisasi & Uji Kompetensi BNSP",
      description:
        "Menyelenggarakan uji kompetensi berkala berstandar nasional dan internasional untuk menjamin keahlian teknisi pada instalasi, pemeliharaan, dan retrofit sistem pendingin komersial maupun residensial.",
      points: [
        "Kurikulum SKKNI HVAC/R Terakreditasi",
        "Sistem Satuan Kredit Profesi (SKP) Mandiri",
        "Sertifikasi Penanganan Gas Bertekanan K3",
      ],
    },
    {
      icon: ShieldCheck,
      color: "#34d399",
      badge: "Anti-Pemalsuan",
      title: "Registri KTA & Audit Publik Real-Time",
      description:
        "Penerbitan identitas digital resmi bagi seluruh anggota aktif dengan QR code berenkripsi, memudahkan pelanggan dan manajemen gedung memverifikasi keabsahan teknisi dalam hitungan detik.",
      points: [
        "Nomor Registrasi Anggota Unik Nasional",
        "Pindai Instan di Semua Kamera Smartphone",
        "Database Riwayat Proyek & Status Aktif",
      ],
    },
    {
      icon: Globe,
      color: "#818cf8",
      badge: "Kemitraan Strategis",
      title: "Advokasi Kebijakan & Lingkungan Hidup",
      description:
        "Menjadi mitra resmi pemerintah (KLHK, Kemenperin, Kemendag) dalam implementasi protokol lingkungan pengurangan emisi refrigeran perusak ozon serta standardisasi alat kerja hemat energi.",
      points: [
        "Kampanye Refrigeran Hijau Ramah Lingkungan",
        "Advokasi Kebijakan Importasi Suku Cadang",
        "Penetapan Panduan Keselamatan Bengkel K3",
      ],
    },
    {
      icon: Users,
      color: "#f59e0b",
      badge: "Kesejahteraan",
      title: "Perlindungan Usaha & Solidaritas Workshop",
      description:
        "Membangun jejaring kolaborasi bisnis bengkel, perlindungan hukum bagi teknisi di lapangan, standarisasi estimasi biaya jasa yang adil, dan akses suplai komponen original langsung dari prinsipal.",
      points: [
        "Konsultasi Bantuan Hukum Profesi",
        "Standar Biaya Jasa Wajar & Terpercaya",
        "Grup Kolaborasi Suku Cadang Antar-DPD",
      ],
    },
  ];

  const governanceItems = [
    {
      icon: Landmark,
      title: "Akreditasi & Kepesertaan Lembaga",
      desc: "Badan hukum resmi terdaftar di Kemenkumham RI dan terafiliasi dengan BNSP serta asosiasi industri pendingin internasional.",
    },
    {
      icon: Scale,
      title: "AD / ART & Kode Etik Mengikat",
      desc: "Setiap anggota terikat pakta integritas kejujuran teknis, transparansi garansi perbaikan, dan pencegahan praktik curang.",
    },
    {
      icon: FileCheck2,
      title: "Audit Kredensial & Kepatuhan Kas",
      desc: "Laporan iuran keanggotaan dan kas DPP/DPD dikelola secara transparan dan dapat dipantau oleh pengurus perwakilan wilayah.",
    },
    {
      icon: Network,
      title: "Koordinasi Multi-Tingkat Terstruktur",
      desc: "Rapat koordinasi nasional tahunan (Rakornas) dan Musda DPD diselenggarakan berkala untuk regenerasi kepemimpinan yang sehat.",
    },
  ];

  return (
    <div className="org-profile-page">
      {/* Flagship 2-Column Split Hero */}
      <header className="org-profile-hero">
        <div className="wrap org-profile-hero-grid">
          {/* Left Column: Authoritative Copy & Actions */}
          <div className="org-profile-hero-inner">
            <div className="org-hero-badge-pill">
              <ShieldCheck size={14} />
              <span>PROFIL RESMI ASOSIASI</span>
            </div>

            <h1 className="org-hero-title">
              Mengenal Perjalanan & Peran Strategis{" "}
              <span className="text-gradient">{site.organization.name}</span>
            </h1>

            <p className="org-hero-lead">
              Wadah persatuan pengusaha pendingin, bengkel workshop, dan praktisi
              refrigerasi tata udara (HVAC/R) Indonesia. Berdedikasi menghadirkan
              standarisasi kompetensi BNSP, kepatuhan kode etik, dan transparansi
              layanan bagi masyarakat luas.
            </p>

            <div className="org-hero-cta-row">
              <Link
                href="/join"
                className="btn-hero-primary"
                style={{ width: "auto" }}
              >
                <Users size={16} />
                <span>Gabung Keanggotaan</span>
                <ArrowRight size={15} className="btn-arrow" />
              </Link>
              <Link
                href="/structure"
                className="btn-hero-secondary"
              >
                <Building2 size={16} />
                <span>Struktur DPP & DPD</span>
              </Link>
              <Link href="/whois" className="btn-hero-ghost">
                <QrCode size={15} />
                <span>Cek KTA</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Key Impact Stats Bento Card (2x2) */}
          <div className="hero-stats-bento-card">
            <div className="stats-card-header">
              <span className="stats-card-badge">Data Pokok Organisasi</span>
              <span className="stats-card-status">● Terkini 2026</span>
            </div>
            <div className="stats-card-grid">
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#f0f9ff", color: "#0284c7" }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <strong>38 Provinsi</strong>
                  <small>Dewan Pimpinan Daerah</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#ecfdf5", color: "#10b981" }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <strong>8.400+ Teknisi</strong>
                  <small>Anggota Terakreditasi</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#eef2ff", color: "#6366f1" }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <strong>BNSP & K3</strong>
                  <small>Standar Kompetensi</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#fffbeb", color: "#f59e0b" }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>100% Real-Time</strong>
                  <small>Audit Terbuka</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Strategic Pillars Bento Grid */}
      <section className="org-pillars-section section-space">
        <div className="wrap">
          <div className="section-heading">
            <span className="eyebrow">PILAR STRATEGIS</span>
            <h2>Empat Pilar Dedikasi Memajukan Ekosistem Nasional</h2>
            <p>
              Kerangka kerja komprehensif organisasi dalam melayani anggota,
              membina bengkel, dan memberikan jaminan mutu kepada konsumen.
            </p>
          </div>

          <div className="org-pillars-grid">
            {strategicPillars.map((pillar) => {
              const IconComp = pillar.icon;
              return (
                <div className="pillar-card" key={pillar.title}>
                  <div className="pillar-card-head">
                    <div
                      className="pillar-icon-box"
                      style={{
                        background: `${pillar.color}15`,
                        color: pillar.color,
                        borderColor: `${pillar.color}35`,
                      }}
                    >
                      <IconComp size={24} />
                    </div>
                    <span
                      className="pillar-badge"
                      style={{
                        color: pillar.color,
                        background: `${pillar.color}12`,
                        borderColor: `${pillar.color}25`,
                      }}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>

                  <ul className="pillar-points">
                    {pillar.points.map((pt) => (
                      <li key={pt}>
                        <CheckCircle2 size={16} color={pillar.color} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Interactive Milestones Timeline */}
      <section className="org-timeline-section section-space">
        <div className="wrap">
          <div className="section-heading">
            <span className="eyebrow">REKAM JEJAK & SEJARAH</span>
            <h2>Perjalanan Transformasi Menuju Tata Kelola Modern</h2>
            <p>
              Dari inisiasi paguyuban daerah hingga menjadi asosiasi profesi
              berbadan hukum yang menaungi ribuan profesional pendingin
              se-Indonesia.
            </p>
          </div>

          <div className="org-timeline-track">
            {milestones.map((ms, idx) => (
              <div className="timeline-milestone-item" key={ms.year}>
                <div className="timeline-node">
                  <div className="timeline-node-dot">
                    <span>{idx + 1}</span>
                  </div>
                  <div className="timeline-year-label">{ms.year}</div>
                </div>

                <div className="timeline-card">
                  <div className="timeline-card-meta">
                    <span className="timeline-phase">{ms.phase}</span>
                    <span className="timeline-highlight-badge">
                      {ms.highlight}
                    </span>
                  </div>
                  <h3>{ms.title}</h3>
                  <p>{ms.description}</p>

                  <div className="timeline-tags">
                    {ms.tags.map((tag) => (
                      <span key={tag} className="timeline-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Governance & Institutional Legitimacy */}
      <section className="org-governance-section section-space">
        <div className="wrap">
          <div className="governance-card-shell">
            <div className="governance-head">
              <div className="governance-head-left">
                <span className="eyebrow">TATA KELOLA & INTEGRITAS</span>
                <h2>Fondasi Organisasi yang Kredibel & Terbuka</h2>
                <p>
                  {site.organization.name} memegang teguh transparansi,
                  kepatuhan hukum negara, dan pertanggungjawaban publik dalam
                  setiap program kerja kepengurusan.
                </p>
              </div>
              <div className="governance-head-right">
                <div className="gov-seal">
                  <ShieldCheck size={36} color="#34d399" />
                  <div>
                    <strong>Terdaftar Resmi</strong>
                    <small>Kemenkumham & BNSP</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="governance-grid">
              {governanceItems.map((gov) => {
                const Icon = gov.icon;
                return (
                  <div className="gov-item" key={gov.title}>
                    <div className="gov-item-icon">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4>{gov.title}</h4>
                      <p>{gov.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Document Repository & Public Resources */}
      <section className="org-docs-section section-space">
        <div className="wrap">
          <div className="section-heading">
            <span className="eyebrow">DOKUMEN & BERKAS RESMI</span>
            <h2>Unduh Naskah Publik & Pedoman Anggota</h2>
            <p>
              Akses transparansi dokumen Anggaran Dasar & Rumah Tangga, Surat
              Edaran Dewan Pimpinan Pusat, dan ringkasan profil lembaga.
            </p>
          </div>

          <div className="docs-download-grid">
            <div className="doc-card">
              <div className="doc-card-icon">
                <FileText size={28} color="#38bdf8" />
              </div>
              <div className="doc-card-body">
                <span className="doc-type-badge">PDF Resmi</span>
                <h3>Anggaran Dasar & Rumah Tangga (AD/ART)</h3>
                <p>
                  Naskah ketentuan pokok, hak dan kewajiban anggota, struktur
                  organisasi, dan kode etik profesi pendingin.
                </p>
              </div>
              <div className="doc-card-foot">
                <Link href="/ad-art" className="button outline btn-doc">
                  <Download size={15} />
                  <span>Buka Naskah AD/ART</span>
                </Link>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-card-icon">
                <BadgeCheck size={28} color="#34d399" />
              </div>
              <div className="doc-card-body">
                <span className="doc-type-badge">Pedoman Teknis</span>
                <h3>Standar Operasional Prosedur (SOP) Teknisi</h3>
                <p>
                  Panduan baku keselamatan kerja (K3), instalasi ramah
                  lingkungan, dan penanganan gas refrigeran bertekanan.
                </p>
              </div>
              <div className="doc-card-foot">
                <Link
                  href="/regulations?kategori=surat-edaran"
                  className="button outline btn-doc"
                >
                  <FileCheck2 size={15} />
                  <span>Lihat Dokumen</span>
                </Link>
              </div>
            </div>

            <div className="doc-card">
              <div className="doc-card-icon">
                <Network size={28} color="#818cf8" />
              </div>
              <div className="doc-card-body">
                <span className="doc-type-badge">Direktori Wilayah</span>
                <h3>Daftar Kontak Pengurus DPP & 38 DPD</h3>
                <p>
                  Informasi jalur koordinasi resmi sekretariat daerah dan
                  narahubung verifikasi workshop se-Indonesia.
                </p>
              </div>
              <div className="doc-card-foot">
                <Link href="/structure" className="button outline btn-doc">
                  <Users size={15} />
                  <span>Lihat Direktori</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Smart Conversion Footer Banner */}
      <DynamicBottomCta
        organizationName={site.organization.name}
        guestTitle="Tingkatkan Legitimasi Profesionalisme Usaha Anda"
        guestDescription="Bergabunglah bersama ribuan praktisi dan workshop pendingin terakreditasi di seluruh Indonesia dengan KTA Digital resmi."
        guestPrimaryCta={{ label: "Daftar Jadi Anggota", href: "/join" }}
        guestSecondaryCta={{ label: "Cek Validitas KTA", href: "/verify" }}
      />
    </div>
  );
}
