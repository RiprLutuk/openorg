"use client";

import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Download,
  ExternalLink,
  Flame,
  GraduationCap,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

interface EventItemData {
  id: string;
  title: string;
  slug: string;
  category: "bnsp" | "inverter" | "k3" | "munas";
  categoryLabel: string;
  skpPoints: number;
  startsAt: string;
  timeRange: string;
  locationName: string;
  city: string;
  capacity: number;
  enrolled: number;
  instructor: string;
  fee: string;
  summary: string;
  isFeatured?: boolean;
}

const EVENTS_DATABASE: EventItemData[] = [
  {
    id: "0d5bd3f9-c232-4643-a277-484a97ee48a2",
    title: "Uji Kompetensi & Sertifikasi Teknisi Pendingin BNSP 2026",
    slug: "uji-kompetensi-sertifikasi-bnsp-2026",
    category: "bnsp",
    categoryLabel: "Sertifikasi BNSP",
    skpPoints: 8,
    startsAt: "2026-09-04",
    timeRange: "08:00 - 17:00 WIB",
    locationName: "Gedung Balai Latihan Kerja (BLK) Pusat",
    city: "Jakarta Pusat",
    capacity: 100,
    enrolled: 82,
    instructor: "Tim Asesor LSP-HVAC & BNSP RI",
    fee: "Rp 650.000 (Subsidi Asosiasi)",
    summary:
      "Sertifikasi kompetensi resmi LSP-HVAC dan BNSP untuk teknisi AC Split, VRV/VRF, dan Cold Storage. Peserta yang lulus berhak mendapatkan sertifikat BNSP dan KTA Digital APTI.",
    isFeatured: true,
  },
  {
    id: "fff3f73a-0373-4431-a9af-bee89bce56b8",
    title:
      "Workshop Penanganan Flammable Refrigerant (R290 & R32) dan K3 Kerja",
    slug: "workshop-flammable-refrigerant-r290-r32",
    category: "k3",
    categoryLabel: "Safety K3 & Freon",
    skpPoints: 4,
    startsAt: "2026-09-12",
    timeRange: "08:30 - 15:30 WIB",
    locationName: "Hotel Santika Premiere & Hybrid Zoom",
    city: "Surabaya",
    capacity: 250,
    enrolled: 194,
    instructor: "Ir. Hendro Wijaya (Instruktur K3 KLHK)",
    fee: "Gratis (Anggota Aktif KTA)",
    summary:
      "Bimbingan teknis penggunaan freon ramah lingkungan R32 dan Hydrocarbon R290 dengan standar keselamatan K3 tinggi untuk mencegah risiko kecelakaan kerja.",
  },
  {
    id: "vrv-inverter-masterclass-2026",
    title:
      "Masterclass Troubleshooting Modul Inverter PCB & Sistem Tata Udara VRV/VRF",
    slug: "masterclass-troubleshooting-inverter-vrv",
    category: "inverter",
    categoryLabel: "Workshop Inverter",
    skpPoints: 6,
    startsAt: "2026-09-26",
    timeRange: "09:00 - 16:30 WIB",
    locationName: "Training Center Daikin-APTI",
    city: "Bandung",
    capacity: 60,
    enrolled: 48,
    instructor: "Budi Santoso, S.T. (Senior HVAC Specialist)",
    fee: "Rp 350.000",
    summary:
      "Pelatihan komprehensif pembacaan kode error, penggantian IPM/IGBT modul outdoor inverter, kalkulasi pipa cabang refnet VRV, dan teknik commissioning digital.",
  },
  {
    id: "0e209bb5-6b61-4f1c-9b6e-fe58ea1a1f97",
    title: "Musyawarah Nasional (MUNAS) & Rakernas APTI Indonesia 2026",
    slug: "munas-rakernas-apti-indonesia-2026",
    category: "munas",
    categoryLabel: "Munas & Rakernas",
    skpPoints: 4,
    startsAt: "2026-10-07",
    timeRange: "3 Hari Penuh",
    locationName: "Grand Ballroom Hotel Patra",
    city: "Semarang",
    capacity: 500,
    enrolled: 412,
    instructor: "Dewan Pengurus Pusat & Tamu Kehormatan",
    fee: "Delegasi DPD & Undangan Khusus",
    summary:
      "Pertemuan akbar seluruh Pengurus DPP, DPD 38 Provinsi, dan Korwil Cabang APTI Indonesia untuk menyusun arah kebijakan dan kemitraan dengan produsen AC terkemuka.",
  },
  {
    id: "chiller-cold-chain-medan",
    title:
      "Pelatihan Sistem Cold Storage Industri & Pemeliharaan Chiller Water-Cooled",
    slug: "pelatihan-cold-storage-chiller-medan",
    category: "inverter",
    categoryLabel: "Workshop Inverter",
    skpPoints: 6,
    startsAt: "2026-10-20",
    timeRange: "08:30 - 16:30 WIB",
    locationName: "Politeknik Negeri Medan (Lab Refrigerasi)",
    city: "Medan",
    capacity: 80,
    enrolled: 53,
    instructor: "Drs. M. Ridwan, M.Eng (Praktisi Cold Chain)",
    fee: "Rp 400.000",
    summary:
      "Teknik instalasi evaporator blast freezer, setting ekspansi thermostatic/electronic (TXV/EEV), serta penanganan oli kompresor semi-hermetic.",
  },
  {
    id: "bnsp-level2-bali",
    title: "Uji Sertifikasi BNSP Teknisi Madya Komersial (Bali & Nusra)",
    slug: "uji-kompetensi-bnsp-bali-nusra",
    category: "bnsp",
    categoryLabel: "Sertifikasi BNSP",
    skpPoints: 8,
    startsAt: "2026-11-05",
    timeRange: "08:00 - 17:00 WITA",
    locationName: "TUK Balai Vokasi Denpasar",
    city: "Denpasar",
    capacity: 75,
    enrolled: 39,
    instructor: "Asesor LSP Sektor Pendingin & Tata Udara",
    fee: "Rp 650.000",
    summary:
      "Asesmen kompetensi teknisi pendingin komersial hotel, villa, dan gedung bertingkat wilayah Bali, NTB, dan NTT bersertifikat Garuda Emas BNSP.",
  },
];

const SKKNI_LEVELS = [
  {
    level: "Jenjang 1 (Junior)",
    badge: "SKKNI Level 1",
    title: "Teknisi Muda Tata Udara Residensial",
    target: "Pemasangan AC Split Standar, Cuci AC, Vakum & Uji Kebocoran",
    units: "7 Unit Kompetensi",
    prerequisites:
      "Pengalaman kerja min. 6 bulan atau lulusan SMK Kelistrikan/TKR",
    validity: "Berlaku 3 Tahun Nasional (Sertifikat BNSP Garuda Emas)",
  },
  {
    level: "Jenjang 2 (Madya)",
    badge: "SKKNI Level 2",
    title: "Teknisi Madya Komersial & Inverter",
    target:
      "AC Inverter, Cassette, Ducted, Perbaikan Modul PCB & Flaring Standar",
    units: "11 Unit Kompetensi",
    prerequisites:
      "Memiliki sertifikat Level 1 atau pengalaman terbukti min. 2 tahun",
    validity: "Berlaku 3 Tahun Nasional (KTA Grade A Teknisi Mandiri)",
  },
  {
    level: "Jenjang 3 (Utama)",
    badge: "SKKNI Level 3",
    title: "Teknisi Utama VRV/VRF & Sistem Industri",
    target:
      "Sistem Sentral VRV/VRF, Chiller, Cold Storage, Commissioning Digital",
    units: "15 Unit Kompetensi",
    prerequisites:
      "Memiliki sertifikat Level 2 & pengalaman proyek komersial min. 3 tahun",
    validity: "Berlaku 3 Tahun + Lisensi Penanggung Jawab Teknis Badan Usaha",
  },
];

export default function EventsPage() {
  const [activeSuiteTab, setActiveSuiteTab] = useState<
    "agenda" | "skkni" | "tuk"
  >("agenda");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return EVENTS_DATABASE.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchCity =
        selectedCity === "all" ||
        item.city.toLowerCase().includes(selectedCity.toLowerCase());
      const matchQuery =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchCity && matchQuery;
    });
  }, [selectedCategory, selectedCity, searchQuery]);

  const featuredEvent = EVENTS_DATABASE.find((e) => e.isFeatured);

  return (
    <div className="events-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero events-hero-master">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <GraduationCap size={15} color="#38bdf8" />
            <span>
              AKADEMI VOKASI & PENGEMBANGAN PROFESI BERKELANJUTAN (CPD)
            </span>
          </div>

          <h1 className="tech-hero-title">
            Agenda Pelatihan, Workshop &{" "}
            <span className="text-gradient">Sertifikasi BNSP 2026</span>
          </h1>

          <p className="tech-hero-lead">
            Tingkatkan keterampilan teknis melalui pelatihan intensif
            bersertifikat nasional: teknologi inverter, tata udara sentral
            VRV/VRF, keselamatan kerja freon R290, serta lisensi resmi BNSP.
          </p>

          {/* Impact Metrics Bar */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Award size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>Akreditasi BNSP</strong>
                <small>Lisensi Standar SKKNI</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Zap size={22} color="#34d399" />
              </div>
              <div>
                <strong>Kredit Poin SKP / CPD</strong>
                <small>+4 s.d +8 Poin Per Acara</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Wrench size={22} color="#818cf8" />
              </div>
              <div>
                <strong>80% Praktik Hands-On</strong>
                <small>Unit Asli & Manifold Digital</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Compass size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>38 DPD Se-Indonesia</strong>
                <small>Pelatihan Rutin Daerah</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Interactive Workspace Section */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Suite Tab Toolbar */}
          <div className="directory-controls-row">
            <div className="directory-cat-pills">
              <button
                type="button"
                className={`dir-cat-btn ${activeSuiteTab === "agenda" ? "active" : ""}`}
                onClick={() => setActiveSuiteTab("agenda")}
              >
                <CalendarDays size={15} />
                <span>Jadwal Agenda Pelatihan</span>
              </button>

              <button
                type="button"
                className={`dir-cat-btn ${activeSuiteTab === "skkni" ? "active" : ""}`}
                onClick={() => setActiveSuiteTab("skkni")}
              >
                <Award size={15} />
                <span>Skema Sertifikasi BNSP</span>
              </button>

              <button
                type="button"
                className={`dir-cat-btn ${activeSuiteTab === "tuk" ? "active" : ""}`}
                onClick={() => setActiveSuiteTab("tuk")}
              >
                <Building2 size={15} />
                <span>Pengajuan TUK & Workshop DPD</span>
              </button>
            </div>
          </div>

          {/* TAB 1: JADWAL AGENDA */}
          {activeSuiteTab === "agenda" && (
            <div className="events-main-flow slide-in-up">
              {/* Spotlight Featured Agenda */}
              {featuredEvent && (
                <div className="event-spotlight-card">
                  <div className="spotlight-left">
                    <div className="spotlight-badge">
                      <Sparkles size={14} />
                      <span>AGENDA UTAMA BULAN INI</span>
                    </div>
                    <h2>{featuredEvent.title}</h2>
                    <p className="spotlight-summary">{featuredEvent.summary}</p>

                    <div className="spotlight-meta-row">
                      <div className="spotlight-meta-item">
                        <Calendar size={15} color="#0284c7" />
                        <span>
                          {new Date(featuredEvent.startsAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}{" "}
                          ({featuredEvent.timeRange})
                        </span>
                      </div>
                      <div className="spotlight-meta-item">
                        <MapPin size={15} color="#16a34a" />
                        <span>
                          {featuredEvent.locationName}, {featuredEvent.city}
                        </span>
                      </div>
                    </div>

                    <div className="spotlight-quota-block">
                      <div className="quota-labels">
                        <small>
                          Kuota Pendaftaran: {featuredEvent.enrolled} /{" "}
                          {featuredEvent.capacity} Terisi
                        </small>
                        <span className="quota-percent">
                          {Math.round(
                            (featuredEvent.enrolled / featuredEvent.capacity) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="quota-track">
                        <div
                          className="quota-fill"
                          style={{
                            width: `${(featuredEvent.enrolled / featuredEvent.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="spotlight-right">
                    <div className="spotlight-reward-box">
                      <div className="reward-pill">
                        <Award size={16} />
                        <span>+{featuredEvent.skpPoints} SKP CPD RESMI</span>
                      </div>
                      <div className="spotlight-fee-row">
                        <small>Biaya Kontribusi:</small>
                        <strong>{featuredEvent.fee}</strong>
                      </div>
                      <div className="spotlight-speaker-row">
                        <small>Penguji / Asesor:</small>
                        <span>{featuredEvent.instructor}</span>
                      </div>

                      <div className="spotlight-actions">
                        <Link
                          href={`/events/${featuredEvent.slug}`}
                          className="calc-cta-btn"
                          style={{ width: "100%" }}
                        >
                          <UserCheck size={16} />
                          <span>Daftar Sekarang</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Toolbar & Search Bar */}
              <div className="events-filter-bar">
                <div className="events-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Cari judul pelatihan, kota, atau instruktur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="events-pills-row">
                  <button
                    type="button"
                    className={`filter-pill-btn ${selectedCategory === "all" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    Semua ({EVENTS_DATABASE.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${selectedCategory === "bnsp" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("bnsp")}
                  >
                    Sertifikasi BNSP
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${selectedCategory === "inverter" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("inverter")}
                  >
                    Inverter & VRV/VRF
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${selectedCategory === "k3" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("k3")}
                  >
                    Safety K3 & Freon
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${selectedCategory === "munas" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("munas")}
                  >
                    Munas & Rakernas
                  </button>
                </div>
              </div>

              {/* Events Cards Grid */}
              <div className="events-cards-grid">
                {filteredEvents.map((event) => {
                  const startDate = new Date(event.startsAt);
                  const isUpcoming = startDate.getTime() >= Date.now();
                  const remainingQuota = event.capacity - event.enrolled;

                  return (
                    <article key={event.id} className="event-modern-card">
                      <div>
                        <div className="event-card-header-row">
                          <div className="event-date-badge">
                            <CalendarDays size={13} />
                            <span>
                              {startDate.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <span className="event-skp-pill">
                            <Award size={13} />
                            <span>+{event.skpPoints} SKP</span>
                          </span>
                        </div>

                        <div className="event-cat-tag">
                          <span>{event.categoryLabel}</span>
                        </div>

                        <h3 className="event-title">{event.title}</h3>

                        <div className="event-location-row">
                          <MapPin size={14} color="#0284c7" />
                          <span>
                            {event.locationName}, <strong>{event.city}</strong>
                          </span>
                        </div>

                        <p className="event-summary-text">{event.summary}</p>
                      </div>

                      <div>
                        <div className="event-extra-meta">
                          <div className="meta-inst">
                            <small>Instruktur / Narasumber:</small>
                            <strong>{event.instructor}</strong>
                          </div>
                          <div className="meta-quota">
                            <small>Sisa Kuota:</small>
                            <span
                              style={{
                                color:
                                  remainingQuota < 20 ? "#dc2626" : "#16a34a",
                                fontWeight: 700,
                              }}
                            >
                              {remainingQuota} Kursi
                            </span>
                          </div>
                        </div>

                        <div className="event-card-footer">
                          <div className="event-quota-status">
                            <span
                              className={`status-dot ${isUpcoming ? "active" : "closed"}`}
                            />
                            <span>
                              {isUpcoming ? "Pendaftaran Terbuka" : "Selesai"}
                            </span>
                          </div>

                          <Link
                            href={`/events/${event.slug}`}
                            className="calc-cta-btn btn-event-action"
                          >
                            <span>Rincian & Daftar</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredEvents.length === 0 && (
                <div className="empty-state">
                  <CalendarDays size={48} color="#94a3b8" />
                  <h3>Tidak Ada Agenda yang Sesuai</h3>
                  <p>
                    Coba ganti filter kategori atau kata kunci pencarian Anda.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SKEMA SKKNI & BNSP */}
          {activeSuiteTab === "skkni" && (
            <div className="skkni-suite-flow slide-in-up">
              <div className="skkni-intro-box">
                <ShieldCheck size={28} color="#0284c7" />
                <div>
                  <h3>Jenjang Sertifikasi Kompetensi Kerja Nasional (SKKNI)</h3>
                  <p>
                    Standar uji kompetensi profesi teknisi tata udara dan
                    refrigerasi mengacu pada Kepmenaker RI dan diawasi langsung
                    oleh Badan Nasional Sertifikasi Profesi (BNSP) melalui
                    LSP-HVAC Indonesia.
                  </p>
                </div>
              </div>

              <div className="skkni-cards-grid">
                {SKKNI_LEVELS.map((lvl) => (
                  <div key={lvl.level} className="skkni-card">
                    <div className="skkni-badge">{lvl.badge}</div>
                    <h3>{lvl.title}</h3>
                    <p className="skkni-target">{lvl.target}</p>

                    <div className="skkni-specs">
                      <div className="skkni-spec-item">
                        <small>Cakupan Materi Uji</small>
                        <strong>{lvl.units}</strong>
                      </div>
                      <div className="skkni-spec-item">
                        <small>Persyaratan Asesi</small>
                        <span>{lvl.prerequisites}</span>
                      </div>
                      <div className="skkni-spec-item">
                        <small>Masa Berlaku Lisensi</small>
                        <strong style={{ color: "#16a34a" }}>
                          {lvl.validity}
                        </strong>
                      </div>
                    </div>

                    <div className="skkni-footer">
                      <Link
                        href="/join"
                        className="button secondary"
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        <UserCheck size={14} />
                        <span>Daftar Sertifikasi Ini</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PENGAJUAN TUK DPD */}
          {activeSuiteTab === "tuk" && (
            <div className="tuk-workspace-grid slide-in-up">
              <div className="tuk-guidance-card">
                <div className="sop-badge">
                  <Building2 size={15} />
                  <span>KOLABORASI PENYELENGGARAAN DAERAH</span>
                </div>
                <h3>Prosedur Pengajuan Workshop & Sertifikasi Mandiri</h3>
                <p>
                  Pengurus DPD, DPC, maupun SMK Pusat Keunggulan dapat
                  mengajukan diri sebagai Tempat Uji Kompetensi (TUK) resmi
                  untuk menyelenggarakan sertifikasi BNSP di wilayahnya.
                </p>

                <div className="tuk-steps-list">
                  <div className="tuk-step-item">
                    <span className="step-num">1</span>
                    <div>
                      <strong>Verifikasi Kelayakan Bengkel / Lab</strong>
                      <p>
                        Memiliki minimum 5 unit AC praktik, pompa vakum dual
                        stage, manifold digital, tabung nitrogen N2, dan APD K3
                        lengkap.
                      </p>
                    </div>
                  </div>

                  <div className="tuk-step-item">
                    <span className="step-num">2</span>
                    <div>
                      <strong>Pengajuan Jadwal & Kuota ke DPP</strong>
                      <p>
                        Kirimkan surat permohonan melalui sekretariat DPP
                        minimal 30 hari sebelum tanggal pelaksanaan yang
                        ditargetkan.
                      </p>
                    </div>
                  </div>

                  <div className="tuk-step-item">
                    <span className="step-num">3</span>
                    <div>
                      <strong>Penugasan Tim Asesor Resmi LSP</strong>
                      <p>
                        DPP bersama LSP-HVAC akan menugaskan Master Asesor BNSP
                        ke lokasi TUK yang telah terverifikasi.
                      </p>
                    </div>
                  </div>

                  <div className="tuk-step-item">
                    <span className="step-num">4</span>
                    <div>
                      <strong>Penerbitan Sertifikat & KTA Digital</strong>
                      <p>
                        Peserta yang dinyatakan kompeten akan menerima
                        Sertifikat Garuda Emas BNSP dan status Grade
                        Terverifikasi di sistem APTI.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hotline DPD Box */}
              <div className="tuk-sidebar-box">
                <div className="hotline-card">
                  <Phone size={24} color="#0284c7" />
                  <h4>Sekretariat Diklat DPP</h4>
                  <p>
                    Konsultasikan pembentukan TUK daerah atau bantuan modul
                    pelatihan vokasi:
                  </p>
                  <a
                    href="https://wa.me/6281122334455"
                    target="_blank"
                    rel="noreferrer"
                    className="calc-cta-btn"
                    style={{ marginTop: "12px", width: "100%" }}
                  >
                    <MessageSquare size={15} />
                    <span>WhatsApp Diklat DPP</span>
                  </a>
                </div>

                <div className="download-guide-box">
                  <BookOpen size={20} color="#16a34a" />
                  <div>
                    <strong>Panduan Pedoman TUK BNSP</strong>
                    <small>Dokumen PDF Standar Sarpras (1.4 MB)</small>
                  </div>
                  <Link
                    href="/regulations"
                    className="button secondary"
                    style={{
                      marginTop: "8px",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Download size={14} />
                    <span>Unduh Pedoman</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Ingin Menyelenggarakan Sertifikasi di Kota Anda?"
        guestDescription="DPD dan Komunitas Bengkel dapat mengajukan permohonan pelaksanaan pelatihan dan uji kompetensi BNSP di daerah masing-masing."
        guestPrimaryCta={{ label: "Daftar Anggota Teknisi", href: "/join" }}
        guestSecondaryCta={{
          label: "Lihat Standar Regulasi",
          href: "/regulations",
        }}
        memberTitle="Kumpulkan Poin SKP untuk Perpanjangan KTA"
        memberDescription="Periksa riwayat sertifikat pelatihan dan jumlah kredit SKP aktif Anda secara langsung di portal anggota."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{
          label: "Klasemen Kejuaraan",
          href: "/championships",
        }}
      />
    </div>
  );
}
