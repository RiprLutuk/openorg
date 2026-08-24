"use client";

import type { PublicSite } from "@openorg/contracts";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Phone,
  QrCode,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MembershipRegistration } from "@/components/membership-registration";

interface JoinPageProps {
  site: PublicSite;
}

type TabType = "form" | "syarat" | "manfaat" | "faq";

export function JoinPageInteractive({ site }: JoinPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") as TabType;
  const initialTab: TabType =
    tabParam && ["form", "syarat", "manfaat", "faq"].includes(tabParam)
      ? tabParam
      : "form";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (tabParam && ["form", "syarat", "manfaat", "faq"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const benefits = [
    {
      icon: CreditCard,
      color: "#38bdf8",
      title: "KTA Digital Ber-QR Code Anti-Pemalsuan",
      description:
        "Identitas profesi resmi ber-QR Code yang dapat diverifikasi instan oleh konsumen, manajemen gedung, dan asosiasi di seluruh Indonesia.",
    },
    {
      icon: GraduationCap,
      color: "#34d399",
      title: "Akses Pelatihan & Kredit SKP/CPD",
      description:
        "Ikuti webinar teknis, workshop penanganan freon ramah lingkungan, dan raih sertifikat uji kompetensi BNSP resmi dengan potongan biaya.",
    },
    {
      icon: Wrench,
      color: "#818cf8",
      title: "Listing Direktori Teknisi & Workshop Nasional",
      description:
        "Nama dan bengkel Anda terdaftar di mesin pencari resmi organisasi, memudahkan calon pelanggan dan mitra korporat menemukan jasa Anda.",
    },
    {
      icon: ShieldCheck,
      color: "#f59e0b",
      title: "Advokasi Hukum & Perlindungan Profesi",
      description:
        "Dukungan mediasi hukum profesi, standarisasi tarif kerja wajar, perlindungan keselamatan kerja K3, dan akses suku cadang resmi.",
    },
    {
      icon: Users,
      color: "#ec4899",
      title: "Jejaring Solidaritas 38 Provinsi",
      description:
        "Terhubung dengan ribuan praktisi HVAC/R di seluruh Indonesia melalui paguyuban korwil, musyawarah daerah, dan forum teknis.",
    },
    {
      icon: Award,
      color: "#a855f7",
      title: "Peluang Kejuaraan & Skill Contest",
      description:
        "Kesempatan bertanding di ajang kejuaraan teknisi tingkat daerah, nasional, dan seleksi perwakilan Indonesia pada kompetisi regional.",
    },
  ];

  const faqs = [
    {
      q: "Siapa saja yang berhak mendaftar menjadi anggota?",
      a: "Seluruh Warga Negara Indonesia (WNI) yang berprofesi sebagai teknisi pendingin/tata udara (HVAC/R), pemilik bengkel/workshop AC, instruktur/akademisi kejuruan refrigerasi, maupun praktisi industri tata udara yang menyetujui AD/ART organisasi.",
    },
    {
      q: "Berapa lama proses verifikasi berkas setelah mendaftar online?",
      a: "Setelah Anda melengkapi formulir dan memverifikasi email, tim Sekretariat Pengurus Daerah (DPD) setempat akan meninjau berkas Anda dalam waktu 1x24 jam hingga maksimal 3 hari kerja.",
    },
    {
      q: "Apakah teknisi mandiri yang belum memiliki workshop tetap bisa mendaftar?",
      a: "Bisa. Keanggotaan terbuka baik bagi teknisi mandiri (freelance), teknisi instansi, maupun pemilik badan usaha bengkel pendingin.",
    },
    {
      q: "Bagaimana cara mendapatkan KTA Fisik selain KTA Digital?",
      a: "KTA Digital ber-QR Code langsung aktif di portal anggota setelah disetujui. Untuk pencetakan kartu fisik KTA berbasis chip/PVC, Anda dapat mengajukannya melalui Pengurus Daerah (DPD) pengampu domisili Anda.",
    },
    {
      q: "Apakah ada biaya pendaftaran atau iuran anggota?",
      a: "Pendaftaran awal dan akun digital saat ini difasilitasi gratis. Ketetapan iuran pemeliharaan organisasi diatur sesuai musyawarah kerja daerah (DPD) masing-masing guna mendukung operasional dan advokasi anggota.",
    },
  ];

  return (
    <div className="join-page-suite">
      {/* 1. Flagship 2-Column Split Hero Header */}
      <header className="tech-hero">
        <div className="wrap hero-split-grid">
          <div className="tech-hero-inner">
            <div className="tech-hero-pill">
              <Sparkles size={14} />
              <span>PORTAL REGISTRASI MANDIRI & DIGITAL</span>
            </div>

            <h1 className="tech-hero-title">
              Syarat, Alur & Pendaftaran{" "}
              <span className="text-gradient">Anggota Baru</span>
            </h1>

            <p className="tech-hero-lead">
              Daftarkan diri Anda atau workshop secara online, nikmati kemudahan
              akses KTA digital resmi, kredit kompetensi SKP, dan jejaring
              solidaritas ribuan teknisi di 38 provinsi bersama{" "}
              <strong>{site.organization.name}</strong>.
            </p>
          </div>

          {/* Right Column: Hero Metrics Bento Card */}
          <div className="hero-stats-bento-card">
            <div className="stats-card-header">
              <span className="stats-card-badge">Keanggotaan Mandiri</span>
              <span className="stats-card-status">● 38 Provinsi</span>
            </div>
            <div className="stats-card-grid">
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "rgba(2, 132, 199, 0.12)", color: "#38bdf8" }}
                >
                  <FileCheck size={20} />
                </div>
                <div>
                  <strong>100% Online</strong>
                  <small>Verifikasi Cepat</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399" }}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <strong>KTA Digital</strong>
                  <small>QR Anti-Palsu</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <strong>Standar BNSP</strong>
                  <small>Kredit SKP/CPD</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <strong>Solidaritas</strong>
                  <small>Paguyuban Korwil</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Interactive Navigation Tabs Bar (Full Width & Sticky) */}
      <div className="adart-sticky-bar join-tabs-bar">
        <div className="wrap">
          <nav
            className="adart-tabs-list join-tabs-nav"
            aria-label="Pilihan Bagian Pendaftaran"
          >
            <button
              type="button"
              className={`adart-tab-btn ${activeTab === "form" ? "active" : ""}`}
              onClick={() => handleTabChange("form")}
            >
              <FileText size={15} />
              <span>Formulir Pendaftaran</span>
            </button>

            <button
              type="button"
              className={`adart-tab-btn ${activeTab === "syarat" ? "active" : ""}`}
              onClick={() => handleTabChange("syarat")}
            >
              <FileCheck size={15} />
              <span>Syarat & Ketentuan</span>
            </button>

            <button
              type="button"
              className={`adart-tab-btn ${activeTab === "manfaat" ? "active" : ""}`}
              onClick={() => handleTabChange("manfaat")}
            >
              <ShieldCheck size={15} />
              <span>Fasilitas & Manfaat KTA</span>
            </button>

            <button
              type="button"
              className={`adart-tab-btn ${activeTab === "faq" ? "active" : ""}`}
              onClick={() => handleTabChange("faq")}
            >
              <HelpCircle size={15} />
              <span>Tanya Jawab (FAQ)</span>
            </button>
          </nav>
        </div>
      </div>

      {/* 3. Main Content Body Based On Active Tab */}
      <section className="join-body section-space">
        <div className="wrap">
          {/* TAB 1: FORMULIR PENDAFTARAN & STEP-BY-STEP */}
          {activeTab === "form" && (
            <div className="join-grid-layout">
              {/* Left Column: 3-Step Process & Quick Guidelines */}
              <div className="join-guide-column">
                <div className="join-steps-card">
                  <div className="steps-card-head">
                    <span className="step-tag">Alur Pendaftaran</span>
                    <h3>3 Langkah Praktis Menjadi Anggota Resmi</h3>
                  </div>

                  <div className="modern-steps-list">
                    <div className="modern-step-item">
                      <div className="step-number-circle">01</div>
                      <div className="step-item-content">
                        <h4>Pengisian Formulir Mandiri</h4>
                        <p>
                          Lengkapi data identitas diri, nomor kontak WhatsApp
                          aktif, dan pilih Pengurus Daerah (DPD) domisili Anda.
                        </p>
                      </div>
                    </div>

                    <div className="modern-step-item">
                      <div className="step-number-circle">02</div>
                      <div className="step-item-content">
                        <h4>Verifikasi Berkas Pengurus Daerah</h4>
                        <p>
                          Sekretariat DPD akan memvalidasi data dan
                          mengonfirmasi keabsahan permohonan secara transparan.
                        </p>
                      </div>
                    </div>

                    <div className="modern-step-item">
                      <div className="step-number-circle">03</div>
                      <div className="step-item-content">
                        <h4>Aktivasi KTA Digital & Portal</h4>
                        <p>
                          Nomor KTA diterbitkan otomatis, kode QR aktif, dan
                          profil Anda langsung terdaftar di direktori publik.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements Quick Checklist */}
                <div
                  className="join-steps-card"
                  style={{ background: "#f8fafc" }}
                >
                  <div className="steps-card-head" style={{ marginBottom: 16 }}>
                    <span className="step-tag">Persiapan Berkas</span>
                    <h3 style={{ fontSize: "16.5px" }}>
                      Dokumen yang Perlu Disiapkan
                    </h3>
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      fontSize: "13px",
                      color: "#334155",
                    }}
                  >
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>Kartu Tanda Penduduk (KTP) yang masih berlaku</span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>
                        Nomor WhatsApp aktif untuk konfirmasi & aktivasi
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>Alamat email aktif untuk akses Portal Anggota</span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>
                        Nama & alamat workshop/bengkel kerja (opsional)
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Need Help Box */}
                <div className="join-help-card">
                  <HelpCircle size={24} color="#0284c7" />
                  <div>
                    <h4>Butuh Bantuan Pendaftaran?</h4>
                    <p>
                      Hubungi Sekretariat DPP melalui WhatsApp resmi di{" "}
                      <strong>
                        {site.quickContact?.label || "0812-8000-APTI"}
                      </strong>{" "}
                      untuk panduan berkas atau konsultasi keanggotaan.
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
          )}

          {/* TAB 2: SYARAT & KETENTUAN KEANGGOTAAN LENGKAP */}
          {activeTab === "syarat" && (
            <div className="join-tab-pane">
              <div className="join-terms-container">
                <div className="join-terms-header">
                  <h2>Ketentuan & Hak Keanggotaan Resmi</h2>
                  <p>
                    Berdasarkan Anggaran Dasar & Anggaran Rumah Tangga (AD/ART){" "}
                    {site.organization.name} mengenai tata kelola anggota dan
                    kode kehormatan profesi.
                  </p>
                </div>

                <div className="join-terms-grid">
                  {/* Card 1: Kategori Anggota */}
                  <div className="join-term-card">
                    <div className="term-card-icon">
                      <Users size={22} color="#0284c7" />
                    </div>
                    <h3>1. Klasifikasi Keanggotaan</h3>
                    <ul>
                      <li>
                        <strong>Anggota Biasa:</strong> Praktisi, teknisi AC,
                        dan pemilik bengkel refrigerasi WNI yang aktif
                        menjalankan profesi.
                      </li>
                      <li>
                        <strong>Anggota Luar Biasa:</strong> Badan usaha,
                        distributor, atau prinsipal produsen yang terafiliasi
                        dengan industri pendingin.
                      </li>
                      <li>
                        <strong>Anggota Kehormatan:</strong> Tokoh masyarakat,
                        pakar akademisi, atau pejabat yang berjasa memajukan
                        standar refrigerasi nasional.
                      </li>
                    </ul>
                  </div>

                  {/* Card 2: Persyaratan Umum */}
                  <div className="join-term-card">
                    <div className="term-card-icon">
                      <FileCheck size={22} color="#16a34a" />
                    </div>
                    <h3>2. Persyaratan Administratif</h3>
                    <ul>
                      <li>
                        Warga Negara Indonesia (WNI) berusia sekurang-kurangnya
                        18 tahun atau telah menikah.
                      </li>
                      <li>
                        Memiliki identitas kependudukan (KTP) yang sah dan
                        berdomisili di wilayah NKRI.
                      </li>
                      <li>
                        Menyatakan tunduk dan patuh pada AD/ART serta 9 Butir
                        Pakta Integritas Organisasi.
                      </li>
                      <li>
                        Mengisi formulir registrasi mandiri secara benar dan
                        dapat dipertanggungjawabkan.
                      </li>
                    </ul>
                  </div>

                  {/* Card 3: Hak Anggota */}
                  <div className="join-term-card">
                    <div className="term-card-icon">
                      <ShieldCheck size={22} color="#f59e0b" />
                    </div>
                    <h3>3. Hak Anggota</h3>
                    <ul>
                      <li>
                        Memperoleh Nomor KTA resmi dan Kartu Tanda Anggota
                        Digital ber-QR Code.
                      </li>
                      <li>
                        Mengikuti seluruh kegiatan pelatihan, seminar teknis,
                        dan uji kompetensi berstandar BNSP.
                      </li>
                      <li>
                        Mendapatkan advokasi dan pendampingan hukum profesi atas
                        sengketa ketenagakerjaan.
                      </li>
                      <li>
                        Memiliki hak bicara dan hak suara dalam Musyawarah
                        Daerah (Musda) dan Munas.
                      </li>
                    </ul>
                  </div>

                  {/* Card 4: Kewajiban Anggota */}
                  <div className="join-term-card">
                    <div className="term-card-icon">
                      <BookOpen size={22} color="#6366f1" />
                    </div>
                    <h3>4. Kewajiban Anggota</h3>
                    <ul>
                      <li>
                        Menjaga nama baik dan kehormatan organisasi di mata
                        masyarakat dan konsumen.
                      </li>
                      <li>
                        Menerapkan Standar Operasional Prosedur (SOP) dan
                        keselamatan kerja (K3) refrigeran.
                      </li>
                      <li>
                        Memenuhi kewajiban iuran pemeliharaan organisasi sesuai
                        ketetapan DPD pengampu.
                      </li>
                      <li>
                        Berperan aktif dalam kegiatan silaturahmi, workshop, dan
                        kegiatan sosial organisasi.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA within Syarat Tab */}
                <div className="join-terms-bottom-cta">
                  <div>
                    <h3>Siap Bergabung dan Menjadi Bagian dari Kami?</h3>
                    <p>
                      Isi formulir pendaftaran digital sekarang dan dapatkan KTA
                      resmi Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button primary btn-hero-lg"
                    onClick={() => handleTabChange("form")}
                  >
                    <span>Buka Formulir Pendaftaran</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FASILITAS & MANFAAT KTA */}
          {activeTab === "manfaat" && (
            <div className="join-tab-pane">
              <div className="join-terms-header">
                <h2>Fasilitas & Keuntungan Anggota Resmi</h2>
                <p>
                  Manfaat eksklusif yang dirancang untuk mendukung peningkatan
                  kesejahteraan, kompetensi teknis, dan perlindungan usaha Anda.
                </p>
              </div>

              <div className="join-benefits-full-grid">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div className="join-benefit-full-card" key={b.title}>
                      <div
                        className="benefit-icon-box-lg"
                        style={{ color: b.color, background: `${b.color}15` }}
                      >
                        <Icon size={24} />
                      </div>
                      <h3>{b.title}</h3>
                      <p>{b.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom CTA within Manfaat Tab */}
              <div
                className="join-terms-bottom-cta"
                style={{ marginTop: "32px" }}
              >
                <div>
                  <h3>Daftar Sekarang untuk Menikmati Seluruh Fasilitas</h3>
                  <p>
                    Proses mudah, terhubung dengan ribuan praktisi tata udara
                    se-Indonesia.
                  </p>
                </div>
                <button
                  type="button"
                  className="button primary btn-hero-lg"
                  onClick={() => handleTabChange("form")}
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TANYA JAWAB (FAQ) */}
          {activeTab === "faq" && (
            <div className="join-tab-pane">
              <div className="join-terms-header">
                <h2>Pertanyaan Umum Seputar Pendaftaran</h2>
                <p>
                  Temukan jawaban atas pertanyaan yang sering diajukan mengenai
                  keanggotaan, proses verifikasi, dan aktivasi KTA Digital.
                </p>
              </div>

              <div className="join-faq-accordion">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={faq.q}
                      className={`faq-item-card ${isOpen ? "open" : ""}`}
                    >
                      <button
                        type="button"
                        className="faq-question-btn"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="faq-q-text">{faq.q}</span>
                        <ChevronDown
                          size={18}
                          className={`faq-chevron ${isOpen ? "rotated" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="faq-answer-body">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Need More Help Box */}
              <div className="join-help-card" style={{ marginTop: "32px" }}>
                <Phone size={24} color="#0284c7" />
                <div>
                  <h4>Pertanyaan Anda Belum Terjawab?</h4>
                  <p>
                    Hubungi tim helpdesk Sekretariat {site.organization.name} di{" "}
                    <strong>
                      {site.quickContact?.label || "0812-8000-APTI"}
                    </strong>{" "}
                    atau kirimkan email ke{" "}
                    <strong>sekretariat@openorg.id</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
