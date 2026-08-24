"use client";

import type { PublicSite } from "@openorg/contracts";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Flame,
  HelpCircle,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  QrCode,
  Send,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCheck,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import type { EventItem } from "@/lib/api";

interface Props {
  event: EventItem;
  site: PublicSite;
}

export function EventDetailClient({ event, site }: Props) {
  const [activeTab, setActiveTab] = useState<
    "syllabus" | "requirements" | "workflow" | "assessors" | "faq"
  >("syllabus");
  const [modalOpen, setModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "qris" | "va_mandiri" | "va_bca" | "va_bri" | "bank_transfer"
  >("qris");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "Budi Pratama",
    email: "budi.teknisi@gmail.com",
    phone: "081299887766",
    level: "level_2",
    tukCity: "jakarta_pusat",
    nik: "3175081909920003",
    workshop: "Jakarta Aircon Service",
  });

  const startsAt = new Date(event.startsAt);
  const isUpcoming = startsAt.getTime() >= Date.now();
  const capacity = event.capacity || 100;
  const enrolledCount = Math.min(84, capacity);
  const remainingSeats = Math.max(0, capacity - enrolledCount);
  const percentFilled = Math.round((enrolledCount / capacity) * 100);

  const handleCopyVa = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setCheckoutStep(3);
  };

  return (
    <article className="event-detail-page-suite">
      {/* 1. Master Flagship Dark Hero Header */}
      <header className="event-detail-master-hero">
        <div className="wrap">
          {/* Breadcrumb Navigation */}
          <nav className="event-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <span className="crumb-sep">/</span>
            <Link href="/events">Agenda & Pelatihan</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{event.title}</span>
          </nav>

          {/* Trust Badges Strip */}
          <div className="event-detail-hero-pills">
            <div className="hero-trust-pill gold">
              <ShieldCheck size={14} />
              <span>TERAKREDITASI BNSP & LSP TPTU RESMI</span>
            </div>
            <div className="hero-trust-pill emerald">
              <Sparkles size={14} />
              <span>+8 SKP CPD KTA DIGITAL</span>
            </div>
            <div className="hero-trust-pill blue">
              <Award size={14} />
              <span>SKKNI TATA UDARA REFRIGERASI</span>
            </div>
          </div>

          <h1 className="event-detail-hero-title">{event.title}</h1>

          <p className="event-detail-hero-lead">
            {event.description ??
              "Program asesmen kompetensi resmi Badan Nasional Sertifikasi Profesi (BNSP) untuk teknisi refrigerasi dan tata udara. Kelulusan memberikan legitimasi sertifikat Garuda Emas resmi negara, KTA Digital terverifikasi QR Code, dan hak pengerjaan instalasi komersial berstandar K3."}
          </p>

          {/* 4-Column Key Metrics Bar */}
          <div className="event-detail-stats-bar">
            <div className="event-stat-card">
              <div className="stat-icon-wrap blue">
                <CalendarDays size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Jadwal Pelaksanaan</span>
                <strong className="stat-val">
                  {startsAt.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                <small className="stat-sub">
                  Pukul{" "}
                  {startsAt.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  - 17:00 WIB
                </small>
              </div>
            </div>

            <div className="event-stat-card">
              <div className="stat-icon-wrap emerald">
                <MapPin size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Lokasi / Venue TUK</span>
                <strong className="stat-val">
                  {event.locationName ?? "Balai Latihan Kerja (BLK) Pusat"}
                </strong>
                <small className="stat-sub">
                  {event.address ?? "Jakarta Timur & Hybrid Online"}
                </small>
              </div>
            </div>

            <div className="event-stat-card">
              <div className="stat-icon-wrap amber">
                <Users size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Kapasitas Peserta</span>
                <strong className="stat-val">
                  {enrolledCount} / {capacity} Terisi
                </strong>
                <div className="quota-micro-track">
                  <div
                    className="quota-micro-fill"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <small className="stat-sub text-emerald">
                  Sisa {remainingSeats} Kursi Tersedia
                </small>
              </div>
            </div>

            <div className="event-stat-card">
              <div className="stat-icon-wrap purple">
                <Sparkles size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Kredit Profesi</span>
                <strong className="stat-val">+8 SKP CPD Resmi</strong>
                <small className="stat-sub">
                  Tercatat di Buku Besar Anggota
                </small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <section className="event-detail-body section-space">
        <div className="wrap event-detail-two-col-grid">
          {/* Left Column (68% width): Tabs & Rich Sections */}
          <div className="event-detail-main-col">
            {/* Nav Tab Buttons (Swiss Style) */}
            <div className="event-detail-nav-tabs">
              <button
                type="button"
                className={`event-tab-btn ${activeTab === "syllabus" ? "active" : ""}`}
                onClick={() => setActiveTab("syllabus")}
              >
                <BookOpen size={16} />
                <span>Silabus & Unit SKKNI</span>
              </button>
              <button
                type="button"
                className={`event-tab-btn ${activeTab === "requirements" ? "active" : ""}`}
                onClick={() => setActiveTab("requirements")}
              >
                <FileCheck size={16} />
                <span>Syarat Berkas & Peserta</span>
              </button>
              <button
                type="button"
                className={`event-tab-btn ${activeTab === "workflow" ? "active" : ""}`}
                onClick={() => setActiveTab("workflow")}
              >
                <Layers size={16} />
                <span>Alur Uji & Sertifikat</span>
              </button>
              <button
                type="button"
                className={`event-tab-btn ${activeTab === "assessors" ? "active" : ""}`}
                onClick={() => setActiveTab("assessors")}
              >
                <UserCheck size={16} />
                <span>Tim Asesor BNSP</span>
              </button>
              <button
                type="button"
                className={`event-tab-btn ${activeTab === "faq" ? "active" : ""}`}
                onClick={() => setActiveTab("faq")}
              >
                <HelpCircle size={16} />
                <span>FAQ Uji</span>
              </button>
            </div>

            {/* TAB 1: SILABUS & UNIT KOMPETENSI */}
            {activeTab === "syllabus" && (
              <div className="event-tab-content-panel slide-in-up">
                <div className="panel-intro-card">
                  <div className="panel-intro-badge">
                    <ShieldCheck size={16} color="#0284c7" />
                    <span>STANDAR KOMPETENSI KERJA NASIONAL INDONESIA</span>
                  </div>
                  <h2>Struktur Unit Kompetensi Uji Sertifikasi</h2>
                  <p>
                    Materi uji mengacu pada Kepmenaker No. SKKNI Teknisi
                    Refrigerasi dan Tata Udara, mencakup aspek pengetahuan teori
                    dasar termodinamika, keselamatan kerja APD K3, serta praktik
                    hands-on menggunakan unit AC inverter dan refrigeran ramah
                    lingkungan.
                  </p>
                </div>

                <div className="skkni-units-list">
                  <div className="skkni-unit-item">
                    <div className="unit-number-tag">01</div>
                    <div className="unit-content">
                      <div className="unit-header-row">
                        <span className="unit-code-chip">
                          KODE: K3-HVAC-001
                        </span>
                        <span className="unit-type-tag">Wajib K3</span>
                      </div>
                      <h3>
                        Menerapkan Prosedur K3 dan Penggunaan APD pada Sistem
                        Refrigerasi
                      </h3>
                      <p>
                        Identifikasi potensi bahaya ledakan gas bertekanan,
                        penanganan freon flammable (R32/R290), pencegahan
                        kebocoran beracun, dan standar APD lengkap di
                        ketinggian.
                      </p>
                    </div>
                  </div>

                  <div className="skkni-unit-item">
                    <div className="unit-number-tag">02</div>
                    <div className="unit-content">
                      <div className="unit-header-row">
                        <span className="unit-code-chip">
                          KODE: BRZ-TPTU-002
                        </span>
                        <span className="unit-type-tag">Praktik Inti</span>
                      </div>
                      <h3>
                        Penyambungan & Pengelasan (Brazing) Pipa Tembaga Bebas
                        Oksidasi (N2 Purging)
                      </h3>
                      <p>
                        Teknik pengelasan torch oksigen-asetilena/LPG dengan
                        aliran gas nitrogen kering untuk mencegah terbentuknya
                        kerak kerak karbon di dalam saluran sirkulasi oli.
                      </p>
                    </div>
                  </div>

                  <div className="skkni-unit-item">
                    <div className="unit-number-tag">03</div>
                    <div className="unit-content">
                      <div className="unit-header-row">
                        <span className="unit-code-chip">
                          KODE: VAC-TPTU-003
                        </span>
                        <span className="unit-type-tag">Praktik Inti</span>
                      </div>
                      <h3>
                        Evakuasi & Pemvakuman Sistem Presisi di Bawah 500 Micron
                      </h3>
                      <p>
                        Pengoperasian pompa vakum 2-stage (two-stage), pembacaan
                        mikron digital manifold presisi, serta uji retensi
                        kebocoran sistem refrigerasi.
                      </p>
                    </div>
                  </div>

                  <div className="skkni-unit-item">
                    <div className="unit-number-tag">04</div>
                    <div className="unit-content">
                      <div className="unit-header-row">
                        <span className="unit-code-chip">
                          KODE: CHG-TPTU-004
                        </span>
                        <span className="unit-type-tag">Praktik Inti</span>
                      </div>
                      <h3>
                        Pengisian & Recovery Refrigeran Eco-Friendly Sesuai
                        Timbangan Digital
                      </h3>
                      <p>
                        Kalkulasi superheat/subcooling, pengisian freon cair
                        menggunakan timbangan elektronik, dan prosedur recovery
                        freon sesuai regulasi Kementerian LHK.
                      </p>
                    </div>
                  </div>

                  <div className="skkni-unit-item">
                    <div className="unit-number-tag">05</div>
                    <div className="unit-content">
                      <div className="unit-header-row">
                        <span className="unit-code-chip">
                          KODE: ELEC-INV-005
                        </span>
                        <span className="unit-type-tag">Troubleshooting</span>
                      </div>
                      <h3>
                        Diagnostik Kelistrikan Inverter, Modul PCB, & Sensor
                        Termistor
                      </h3>
                      <p>
                        Pengukuran resistansi lilitan kompresor inverter, cek
                        tegangan DC link IPM, pembacaan sinyal komunikasi
                        indoor-outdoor, dan pembacaan kode blink error.
                      </p>
                    </div>
                  </div>

                  <div className="skkni-unit-item">
                    <div className="unit-number-tag">06</div>
                    <div className="unit-content">
                      <div className="unit-header-row">
                        <span className="unit-code-chip">
                          KODE: COM-TPTU-006
                        </span>
                        <span className="unit-type-tag">Laporan Akhir</span>
                      </div>
                      <h3>
                        Commissioning, Uji Efisiensi Arus Listrik, & Pembuatan
                        Berita Acara Servis
                      </h3>
                      <p>
                        Pengukuran delta T (suhu return vs supply), pengukuran
                        tegangan dan arus kerja kompresor, pencatatan garansi
                        digital, dan etika komunikasi dengan pelanggan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Toolkit Box */}
                <div className="event-tools-provided-box mt-6">
                  <div className="tools-box-header">
                    <Wrench size={18} color="#f59e0b" />
                    <h3>Peralatan & Fasilitas Uji yang Disediakan TUK</h3>
                  </div>
                  <div className="tools-badges-grid">
                    <span>✅ Unit AC Split Inverter & Multi-Split</span>
                    <span>✅ Manifold Gauge Digital 4-Valve</span>
                    <span>✅ Pompa Vakum 2-Stage & Micron Gauge</span>
                    <span>✅ Tabung Gas Nitrogen (N2) & Regulator</span>
                    <span>✅ Torch Set Brazing & Kawat Perak (Silver)</span>
                    <span>✅ Timbangan Freon Digital Presisi 1g</span>
                    <span>✅ Clamp Meter Digital (Tang Ampere)</span>
                    <span>✅ Recovery Machine & Tabung Recovery R32</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PERSYARATAN BERKAS */}
            {activeTab === "requirements" && (
              <div className="event-tab-content-panel slide-in-up">
                <div className="panel-intro-card">
                  <div className="panel-intro-badge">
                    <FileCheck size={16} color="#16a34a" />
                    <span>PERSYARATAN ADMINISTRASI & PORTOFOLIO</span>
                  </div>
                  <h2>Dokumen Wajib Calon Asesi BNSP</h2>
                  <p>
                    Sesuai panduan Lembaga Sertifikasi Profesi (LSP TPTU), calon
                    peserta wajib melengkapi berkas administrasi Form APL-01 dan
                    APL-02 maksimal H-3 sebelum jadwal asesmen.
                  </p>
                </div>

                <div className="requirements-checklist-grid">
                  <div className="req-card">
                    <div className="req-icon blue">
                      <FileText size={20} />
                    </div>
                    <div className="req-detail">
                      <strong>1. Identitas Kependudukan (KTP/e-KTP)</strong>
                      <p>
                        Salinan scan/foto KTP asli yang masih berlaku (WNI
                        berusia minimal 18 tahun).
                      </p>
                      <span className="req-badge wajib">Wajib Diunggah</span>
                    </div>
                  </div>

                  <div className="req-card">
                    <div className="req-icon emerald">
                      <BookOpen size={20} />
                    </div>
                    <div className="req-detail">
                      <strong>
                        2. Ijazah Terakhir / Surat Pengalaman Kerja
                      </strong>
                      <p>
                        Scan ijazah minimal SMP/SMA/SMK atau Surat Keterangan
                        Bekerja / Riwayat Usaha Bengkel AC minimal 1 tahun.
                      </p>
                      <span className="req-badge wajib">Wajib Diunggah</span>
                    </div>
                  </div>

                  <div className="req-card">
                    <div className="req-icon amber">
                      <Users size={20} />
                    </div>
                    <div className="req-detail">
                      <strong>3. Pas Foto Formal (Latar Merah)</strong>
                      <p>
                        File foto formal berpakaian rapi / kemeja berkerah latar
                        belakang merah ukuran 3x4 resolusi tajam.
                      </p>
                      <span className="req-badge wajib">Untuk Blanko BNSP</span>
                    </div>
                  </div>

                  <div className="req-card">
                    <div className="req-icon purple">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="req-detail">
                      <strong>4. Logbook Riwayat Kerja (APL-02)</strong>
                      <p>
                        Catatan ringkas 3 pekerjaan servis AC yang pernah
                        dikerjakan (foto pengerjaan/nota servis).
                      </p>
                      <span className="req-badge opsional">
                        Template Disediakan
                      </span>
                    </div>
                  </div>
                </div>

                <div className="download-template-card mt-6">
                  <div className="download-copy">
                    <FileText size={22} color="#0284c7" />
                    <div>
                      <strong>
                        Unduh Template Berkas Uji Asesi (APL-01 & APL-02)
                      </strong>
                      <p>
                        Gunakan formulir resmi format PDF untuk mempermudah
                        verifikasi awal asesor.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() =>
                      alert("Mengunduh Paket Formulir APL-01 & APL-02 (PDF)...")
                    }
                  >
                    <Download size={15} />
                    <span>Unduh Template (PDF)</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: ALUR UJI, PEMBAYARAN & SERTIFIKAT */}
            {activeTab === "workflow" && (
              <div className="event-tab-content-panel slide-in-up">
                <div className="panel-intro-card">
                  <div className="panel-intro-badge">
                    <Layers size={16} color="#818cf8" />
                    <span>SIKLUS LENGKAP PROSES BISNIS</span>
                  </div>
                  <h2>Alur Dari Pendaftaran Hingga Pengiriman Fisik</h2>
                  <p>
                    Seluruh proses dirancang transparan, otomatis, dan tercatat
                    dalam buku besar digital (*ComplyFlow Ledger*) OpenOrg.
                  </p>
                </div>

                <div className="workflow-timeline-suite">
                  <div className="workflow-step-card">
                    <div className="step-circle blue">1</div>
                    <div className="step-body">
                      <div className="step-top-row">
                        <CreditCard size={16} color="#0284c7" />
                        <strong>Pendaftaran & Pembayaran Multi-Channel</strong>
                      </div>
                      <p>
                        Pilih skema SKKNI dan lokasi TUK. Bayar melalui QRIS
                        Dinamis (15 menit) atau Virtual Account 4 Bank (BCA,
                        Mandiri, BRI, BNI). Status langsung terverifikasi
                        otomatis (*instant settlement*).
                      </p>
                    </div>
                  </div>

                  <div className="workflow-step-card">
                    <div className="step-circle emerald">2</div>
                    <div className="step-body">
                      <div className="step-top-row">
                        <MessageSquare size={16} color="#16a34a" />
                        <strong>E-Ticket & Notifikasi WhatsApp Gateway</strong>
                      </div>
                      <p>
                        Sistem langsung mengirimkan E-Ticket resmi, Nomor
                        Registrasi Peserta, jadwal kalender, panduan materi,
                        serta link grup koordinasi TUK ke nomor WhatsApp & email
                        peserta.
                      </p>
                    </div>
                  </div>

                  <div className="workflow-step-card">
                    <div className="step-circle amber">3</div>
                    <div className="step-body">
                      <div className="step-top-row">
                        <Wrench size={16} color="#f59e0b" />
                        <strong>
                          Pelaksanaan Uji di TUK (Teori & Praktik)
                        </strong>
                      </div>
                      <p>
                        Asesi hadir di Balai Latihan Kerja (BLK), mengikuti uji
                        tulis, verifikasi portofolio kerja, dan uji praktik
                        langsung di hadapan Asesor Berlisensi BNSP.
                      </p>
                    </div>
                  </div>

                  <div className="workflow-step-card">
                    <div className="step-circle purple">4</div>
                    <div className="step-body">
                      <div className="step-top-row">
                        <Sparkles size={16} color="#9333ea" />
                        <strong>E-Sertifikat QR Digital Instan & +8 SKP</strong>
                      </div>
                      <p>
                        Setelah asesor menetapkan predikat <em>Kompeten</em>,
                        E-Sertifikat digital terbit instan di Portal Member
                        ber-QR Code Kriptografis yang dapat diverifikasi siapa
                        saja di <Link href="/verify">/verify</Link>.
                      </p>
                    </div>
                  </div>

                  <div className="workflow-step-card">
                    <div className="step-circle cyan">5</div>
                    <div className="step-body">
                      <div className="step-top-row">
                        <Truck size={16} color="#06b6d4" />
                        <strong>
                          Cetak Blanko Garuda Emas & Ekspedisi Kurir JNE/J&T
                        </strong>
                      </div>
                      <p>
                        Blanko resmi berhologram Garuda dicetak dan dicap basah
                        BNSP, dikemas rapi, lalu dikirim ke alamat rumah/bengkel
                        peserta dengan nomor resi pelacakan langsung di portal
                        anggota.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TIM ASESOR BNSP */}
            {activeTab === "assessors" && (
              <div className="event-tab-content-panel slide-in-up">
                <div className="panel-intro-card">
                  <div className="panel-intro-badge">
                    <UserCheck size={16} color="#0284c7" />
                    <span>TIM PENGUJI TERAKREDITASI</span>
                  </div>
                  <h2>Dewan Asesor & Master Trainer Berlisensi</h2>
                  <p>
                    Pengujian dilakukan secara independen, objektif, dan
                    profesional oleh praktisi senior berlisensi Master of
                    Evaluation & Testing (MET) dari BNSP.
                  </p>
                </div>

                <div className="assessors-cards-grid">
                  <div className="assessor-card">
                    <div className="assessor-avatar-box">
                      <Users size={32} />
                    </div>
                    <div className="assessor-info">
                      <span className="assessor-role-tag">
                        Lead Master Asesor
                      </span>
                      <h3>Ir. H. Nanang Varian Supriadi</h3>
                      <p className="assessor-met">
                        No. Reg MET: <strong>MET.000.00192.2018</strong>
                      </p>
                      <p className="assessor-bio">
                        Auditor Sistem Tata Udara & Praktisi Industri HVAC 25+
                        Tahun. Penguji Senior LSP TPTU Indonesia.
                      </p>
                    </div>
                  </div>

                  <div className="assessor-card">
                    <div className="assessor-avatar-box">
                      <Users size={32} />
                    </div>
                    <div className="assessor-info">
                      <span className="assessor-role-tag">
                        Asesor Teknis Lapangan
                      </span>
                      <h3>M. Ridwan Syah, ST</h3>
                      <p className="assessor-met">
                        No. Reg MET: <strong>MET.000.00481.2021</strong>
                      </p>
                      <p className="assessor-bio">
                        Spesialis Modul Elektronika Inverter & VRV/VRF. Asesor
                        Kompetensi K3 Refrigeran Mudah Terbakar (R290).
                      </p>
                    </div>
                  </div>

                  <div className="assessor-card">
                    <div className="assessor-avatar-box">
                      <Users size={32} />
                    </div>
                    <div className="assessor-info">
                      <span className="assessor-role-tag">
                        Instruktur Penguji
                      </span>
                      <h3>Dedi Kurniawan, S.Pd</h3>
                      <p className="assessor-met">
                        No. Reg MET: <strong>MET.000.00912.2023</strong>
                      </p>
                      <p className="assessor-bio">
                        Kepala Workshop Balai Latihan Vokasi & Pelatih Juara
                        National Skill Contest HVAC 2025.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: FAQ & PANDUAN UJI */}
            {activeTab === "faq" && (
              <div className="event-tab-content-panel slide-in-up">
                <div className="panel-intro-card">
                  <div className="panel-intro-badge">
                    <HelpCircle size={16} color="#0284c7" />
                    <span>PANDUAN & PERTANYAAN UMUM</span>
                  </div>
                  <h2>Pertanyaan yang Sering Diajukan (FAQ)</h2>
                </div>

                <div className="faq-accordion-list">
                  <div className="faq-item">
                    <h4>
                      Berapa lama masa berlaku sertifikat kompetensi BNSP?
                    </h4>
                    <p>
                      Sertifikat kompetensi resmi BNSP berlaku selama 3 (tiga)
                      tahun sejak tanggal diterbitkan. Setelah itu, teknisi
                      dapat memperpanjangnya melalui jalur verifikasi portofolio
                      kredit SKP di asosiasi.
                    </p>
                  </div>
                  <div className="faq-item">
                    <h4>
                      Bagaimana jika pada hari pelaksanaan asesi dinyatakan
                      belum kompeten?
                    </h4>
                    <p>
                      APTI Indonesia memberikan jaminan{" "}
                      <strong>1x Remedial Gratis</strong> pada unit kompetensi
                      yang belum tercapai pada gelombang uji berikutnya tanpa
                      dipungut biaya pendaftaran ulang.
                    </p>
                  </div>
                  <div className="faq-item">
                    <h4>
                      Apakah teknisi dari luar kota Jakarta bisa mendaftar?
                    </h4>
                    <p>
                      Bisa. Calon peserta dari seluruh 38 provinsi di Indonesia
                      dapat mendaftar. Tersedia pilihan Tempat Uji Kompetensi
                      (TUK) regional di Jakarta, Surabaya, Bandung, Semarang,
                      Medan, dan Denpasar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (32% width): Sticky Checkout & Registration Box */}
          <aside className="event-detail-sidebar-col">
            <div className="event-sticky-card">
              {/* Status Header */}
              <div className="sticky-card-status-row">
                <div className="live-status-chip">
                  <span className="live-dot" />
                  <span>
                    {isUpcoming ? "Pendaftaran Dibuka" : "Kegiatan Ditutup"}
                  </span>
                </div>
                <span className="badge-skp-highlight">+8 SKP BNSP</span>
              </div>

              {/* Price Block */}
              <div className="sticky-price-box">
                <span className="price-tag-label">Biaya Uji Sertifikasi</span>
                <div className="price-main-row">
                  <span className="price-currency">Rp</span>
                  <span className="price-val">750.000</span>
                  <span className="price-period">/ Peserta</span>
                </div>
                <div className="price-subsidy-pill">
                  <span>
                    💎 Subsidi Khusus Anggota KTA APTI (Normal Rp 1.250.000)
                  </span>
                </div>
              </div>

              {/* Quota Gauge */}
              <div className="sidebar-quota-box">
                <div className="quota-text-row">
                  <span>Kuota Peserta TUK</span>
                  <strong>
                    {enrolledCount} / {capacity} Kursi
                  </strong>
                </div>
                <div className="quota-bar-track">
                  <div
                    className="quota-bar-fill"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <small className="quota-info-text">
                  🔥 <strong>Tersisa {remainingSeats} kursi</strong> untuk
                  gelombang ini.
                </small>
              </div>

              {/* Primary Action Buttons */}
              <div className="sidebar-actions-stack">
                <button
                  type="button"
                  className="button primary btn-hero-register"
                  onClick={() => {
                    setModalOpen(true);
                    setCheckoutStep(1);
                  }}
                >
                  <Zap size={17} />
                  <span>Daftar Sekarang (1-Click)</span>
                </button>

                <a
                  className="button secondary btn-wa-consult"
                  href="https://wa.me/6281299887766?text=Halo%20Sekretariat%20APTI,%20saya%20ingin%20konsultasi%20pendaftaran%20Uji%20Kompetensi%20BNSP%202026"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone size={15} color="#16a34a" />
                  <span>Konsultasi Panitia via WhatsApp</span>
                </a>
              </div>

              {/* Included Perks List */}
              <div className="sidebar-perks-list">
                <h4>Fasilitas Termasuk:</h4>
                <ul>
                  <li>
                    <Check size={14} color="#16a34a" />
                    <span>Blanko Sertifikat Garuda Emas BNSP</span>
                  </li>
                  <li>
                    <Check size={14} color="#16a34a" />
                    <span>E-Sertifikat Digital Verifikasi QR Code</span>
                  </li>
                  <li>
                    <Check size={14} color="#16a34a" />
                    <span>+8 Poin Kredit SKP CPD ke KTA Digital</span>
                  </li>
                  <li>
                    <Check size={14} color="#16a34a" />
                    <span>Buku Saku SOP Servis Standar BNSP</span>
                  </li>
                  <li>
                    <Check size={14} color="#16a34a" />
                    <span>Makan Siang & Coffee Break di TUK</span>
                  </li>
                  <li>
                    <Check size={14} color="#16a34a" />
                    <span>Pengiriman Blanko Fisik via JNE / J&T</span>
                  </li>
                </ul>
              </div>

              {/* Security Note */}
              <div className="sidebar-security-badge">
                <ShieldCheck size={14} color="#64748b" />
                <span>Transaksi Diamankan oleh Enkripsi SSL 256-Bit</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 3. Interactive Registration & Checkout Modal */}
      {modalOpen && (
        <div className="checkout-modal-backdrop">
          <div className="checkout-modal-card slide-in-up">
            {/* Modal Header */}
            <div className="modal-top-bar">
              <div className="modal-title-wrap">
                <Award size={20} color="#0284c7" />
                <div>
                  <h3>Pendaftaran & Uji Sertifikasi BNSP 2026</h3>
                  <p>Lembaga Sertifikasi Profesi LSP-TPTU Indonesia</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Tutup Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="modal-stepper-row">
              <div className={`step-item ${checkoutStep >= 1 ? "active" : ""}`}>
                <span className="step-num">1</span>
                <span>Data Peserta</span>
              </div>
              <div className="step-line" />
              <div className={`step-item ${checkoutStep >= 2 ? "active" : ""}`}>
                <span className="step-num">2</span>
                <span>Pembayaran</span>
              </div>
              <div className="step-line" />
              <div className={`step-item ${checkoutStep >= 3 ? "active" : ""}`}>
                <span className="step-num">3</span>
                <span>E-Ticket & Konfirmasi</span>
              </div>
            </div>

            {/* MODAL STEP 1: FORM DATA PESERTA */}
            {checkoutStep === 1 && (
              <div className="modal-body-content">
                <div className="form-two-col-grid">
                  <div className="form-field">
                    <label>Nama Lengkap (Sesuai KTP & Sertifikat) *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Masukkan nama lengkap dengan gelar..."
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Nomor Induk Kependudukan (NIK) *</label>
                    <input
                      type="text"
                      value={formData.nik}
                      onChange={(e) =>
                        setFormData({ ...formData, nik: e.target.value })
                      }
                      placeholder="16 digit NIK KTP..."
                      required
                    />
                  </div>
                </div>

                <div className="form-two-col-grid mt-4">
                  <div className="form-field">
                    <label>Nomor WhatsApp Aktif (Notifikasi Tiket) *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Contoh: 08123456789"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Alamat Email Aktif *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="nama@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-two-col-grid mt-4">
                  <div className="form-field">
                    <label>Pilihan Jenjang Skema SKKNI *</label>
                    <select
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                    >
                      <option value="level_1">
                        Level 1 - Teknisi Junior AC Split & Residensial
                      </option>
                      <option value="level_2">
                        Level 2 - Teknisi Madya Inverter & Komersial
                      </option>
                      <option value="level_3">
                        Level 3 - Teknisi Utama VRV/VRF & Cold Storage
                      </option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Pilihan Tempat Uji Kompetensi (TUK) *</label>
                    <select
                      value={formData.tukCity}
                      onChange={(e) =>
                        setFormData({ ...formData, tukCity: e.target.value })
                      }
                    >
                      <option value="jakarta_pusat">
                        Jakarta Timur - Balai Latihan Kerja (BLK) Pusat
                      </option>
                      <option value="surabaya">
                        Surabaya - TUK Vokasi Jawa Timur
                      </option>
                      <option value="bandung">
                        Bandung - Training Center Daikin APTI
                      </option>
                      <option value="medan">
                        Medan - Lab Refrigerasi Politeknik Negeri Medan
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-field mt-4">
                  <label>Nama Workshop / Bengkel Servis</label>
                  <input
                    type="text"
                    value={formData.workshop}
                    onChange={(e) =>
                      setFormData({ ...formData, workshop: e.target.value })
                    }
                    placeholder="Contoh: CV Mandiri Aircon Service"
                  />
                </div>

                {/* Summary Box */}
                <div className="modal-summary-box mt-5">
                  <div className="sum-row">
                    <span>Biaya Uji Sertifikasi (Level 2)</span>
                    <strong>Rp 1.250.000</strong>
                  </div>
                  <div className="sum-row text-emerald">
                    <span>Subsidi Asosiasi Pemegang KTA APTI</span>
                    <strong>- Rp 500.000</strong>
                  </div>
                  <div className="sum-divider" />
                  <div className="sum-row total">
                    <span>Total Pembayaran</span>
                    <strong className="text-primary">Rp 750.000</strong>
                  </div>
                </div>

                <div className="modal-footer-actions mt-6">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => setCheckoutStep(2)}
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* MODAL STEP 2: METODE PEMBAYARAN */}
            {checkoutStep === 2 && (
              <div className="modal-body-content">
                <div className="payment-options-grid">
                  <button
                    type="button"
                    className={`payment-option-card ${selectedPaymentMethod === "qris" ? "active" : ""}`}
                    onClick={() => setSelectedPaymentMethod("qris")}
                  >
                    <div className="opt-radio">
                      {selectedPaymentMethod === "qris" && (
                        <div className="dot" />
                      )}
                    </div>
                    <QrCode size={20} color="#0284c7" />
                    <div>
                      <strong>QRIS Dinamis (Instan)</strong>
                      <small>GoPay, OVO, Dana, BCA, ShopeePay</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`payment-option-card ${selectedPaymentMethod === "va_mandiri" ? "active" : ""}`}
                    onClick={() => setSelectedPaymentMethod("va_mandiri")}
                  >
                    <div className="opt-radio">
                      {selectedPaymentMethod === "va_mandiri" && (
                        <div className="dot" />
                      )}
                    </div>
                    <CreditCard size={20} color="#16a34a" />
                    <div>
                      <strong>Mandiri Virtual Account</strong>
                      <small>Verifikasi Otomatis 24 Jam</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`payment-option-card ${selectedPaymentMethod === "va_bca" ? "active" : ""}`}
                    onClick={() => setSelectedPaymentMethod("va_bca")}
                  >
                    <div className="opt-radio">
                      {selectedPaymentMethod === "va_bca" && (
                        <div className="dot" />
                      )}
                    </div>
                    <CreditCard size={20} color="#0284c7" />
                    <div>
                      <strong>BCA Virtual Account</strong>
                      <small>Verifikasi Otomatis 24 Jam</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`payment-option-card ${selectedPaymentMethod === "bank_transfer" ? "active" : ""}`}
                    onClick={() => setSelectedPaymentMethod("bank_transfer")}
                  >
                    <div className="opt-radio">
                      {selectedPaymentMethod === "bank_transfer" && (
                        <div className="dot" />
                      )}
                    </div>
                    <FileText size={20} color="#f59e0b" />
                    <div>
                      <strong>Transfer Bank Manual</strong>
                      <small>Upload Bukti Struk / Slip ATM</small>
                    </div>
                  </button>
                </div>

                {/* Dynamic Payment Instruction Panel */}
                {selectedPaymentMethod === "qris" && (
                  <div className="payment-instruction-box mt-5">
                    <div className="qris-visual-wrap">
                      <div className="qris-header">
                        <QrCode size={18} />
                        <strong>
                          QRIS STANDAR NASIONAL (NMID: ID102026849201)
                        </strong>
                      </div>
                      <div className="qris-qr-frame">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226580016ID.CO.OPENORG.APTI01189360099887766020300151440014ID.LINKAJA.WWW02152026084920000015204581253033605802ID5914APTI+INDONESIA6007JAKARTA61051022062070703A016304D1B8"
                          alt="QRIS Code Pembayaran"
                          className="qris-img"
                        />
                      </div>
                      <div className="qris-timer-pill">
                        <Clock size={13} />
                        <span>Sisa Waktu Pembayaran: 14:52 Menit</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod.startsWith("va_") && (
                  <div className="payment-instruction-box mt-5">
                    <div className="va-copy-box">
                      <span className="va-label">
                        Nomor Virtual Account (VA{" "}
                        {selectedPaymentMethod === "va_mandiri"
                          ? "Bank Mandiri"
                          : "BCA"}
                        ):
                      </span>
                      <div className="va-num-row">
                        <strong>
                          {selectedPaymentMethod === "va_mandiri"
                            ? "88708 081299887766"
                            : "3901 081299887766"}
                        </strong>
                        <button
                          type="button"
                          className="button secondary btn-copy"
                          onClick={() =>
                            handleCopyVa(
                              selectedPaymentMethod === "va_mandiri"
                                ? "88708081299887766"
                                : "3901081299887766",
                            )
                          }
                        >
                          {copied ? (
                            <>
                              <Check size={14} color="#16a34a" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Salin Nomor</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="va-hint">
                        Total Tagihan: <strong>Rp 750.000</strong> (Tepat hingga
                        digit terakhir).
                      </p>
                    </div>
                  </div>
                )}

                <div className="modal-footer-actions mt-6">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setCheckoutStep(1)}
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    className="button primary"
                    onClick={handleSimulatePayment}
                  >
                    <CheckCircle2 size={16} />
                    <span>Konfirmasi & Bayar (Rp 750.000)</span>
                  </button>
                </div>
              </div>
            )}

            {/* MODAL STEP 3: STATUS LUNAS, E-TICKET & NOTIFIKASI */}
            {checkoutStep === 3 && (
              <div className="modal-body-content text-center py-4">
                <div className="success-icon-badge">
                  <CheckCircle2 size={44} color="#16a34a" />
                </div>

                <h3 className="success-heading">
                  Pembayaran Berhasil Diterima!
                </h3>
                <p className="success-sub">
                  Invoice <strong>#INV-BNSP-2026-0841</strong> telah lunas dan
                  tercatat pada Buku Besar ComplyFlow. Kuota Anda telah dikunci
                  secara resmi.
                </p>

                {/* E-Ticket Box */}
                <div className="e-ticket-card mt-5">
                  <div className="e-ticket-header">
                    <div className="ticket-brand">
                      <Award size={18} color="#0284c7" />
                      <span>E-TICKET UJI SERTIFIKASI BNSP</span>
                    </div>
                    <span className="ticket-status-pill">
                      CONFIRMED / LUNAS
                    </span>
                  </div>

                  <div className="e-ticket-grid">
                    <div className="ticket-item">
                      <small>Nama Asesi / Peserta</small>
                      <strong>{formData.name}</strong>
                    </div>
                    <div className="ticket-item">
                      <small>Nomor Registrasi Uji</small>
                      <strong className="text-primary">
                        TUK-BNSP-2026-08492
                      </strong>
                    </div>
                    <div className="ticket-item">
                      <small>Jadwal Asesmen</small>
                      <strong>
                        {startsAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                    </div>
                    <div className="ticket-item">
                      <small>Lokasi Tempat Uji</small>
                      <strong>BLK Jakarta Pusat</strong>
                    </div>
                  </div>

                  <div className="e-ticket-footer">
                    <div className="notif-dispatch-alert">
                      <MessageSquare size={16} color="#16a34a" />
                      <span>
                        Notifikasi E-Ticket & SOP Uji telah dikirimkan ke
                        WhatsApp <strong>{formData.phone}</strong> & Email{" "}
                        <strong>{formData.email}</strong>.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer-actions centered mt-6">
                  <Link
                    href="/member"
                    className="button primary"
                    onClick={() => setModalOpen(false)}
                  >
                    <span>Buka di Portal Member</span>
                    <ArrowRight size={15} />
                  </Link>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      alert("Mengunduh Lembar E-Ticket Resmi (PDF)...");
                    }}
                  >
                    <Download size={15} />
                    <span>Download E-Ticket (PDF)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Bottom Dynamic CTA */}
      <DynamicBottomCta
        organizationName={site.organization.name}
        guestTitle="Raih Sertifikasi Kompetensi & Lisensi Resmi Teknisi Pendingin"
        guestDescription="Tingkatkan tarif jasa servis dan bangun reputasi terpercaya dengan sertifikat resmi berstandar BNSP dan KTA Digital APTI."
        guestPrimaryCta={{ label: "Lihat Semua Agenda", href: "/events" }}
        guestSecondaryCta={{
          label: "Daftar Anggota KTA",
          href: "/join",
        }}
        memberTitle="Poin SKP Terintegrasi dengan Akun KTA Digital Anda"
        memberDescription="Setelah menyelesaikan uji sertifikasi, poin SKP dan e-sertifikat akan otomatis masuk ke dalam riwayat kredensial Anda."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{ label: "Verifikasi Kredensial", href: "/verify" }}
      />
    </article>
  );
}
