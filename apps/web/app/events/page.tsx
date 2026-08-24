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
  ChevronLeft,
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
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

const EVENTS_PER_PAGE = 6;

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
  {
    id: "cassette-ducted-jogja",
    title:
      "Workshop Instalasi & Pemeliharaan AC Cassette, Ceiling Suspended & Ducted",
    slug: "workshop-ac-cassette-ducted-yogyakarta",
    category: "inverter",
    categoryLabel: "Workshop Inverter",
    skpPoints: 6,
    startsAt: "2026-11-18",
    timeRange: "08:30 - 16:00 WIB",
    locationName: "Balai Latihan Pendidikan Teknik (BLPT)",
    city: "Yogyakarta",
    capacity: 70,
    enrolled: 44,
    instructor: "Agus Prasetyo, S.T. (Konsultan Tata Udara)",
    fee: "Rp 300.000",
    summary:
      "Praktik pemasangan drainase gravitasi/pompa drain, pembuatan saluran udara ducting PU, serta penyesuaian static pressure pada unit komersial ringan.",
  },
  {
    id: "bnsp-makassar-sulsel",
    title: "Sertifikasi BNSP Teknisi Utama Sistem Sentral (Sulawesi & IBT)",
    slug: "sertifikasi-bnsp-level3-makassar",
    category: "bnsp",
    categoryLabel: "Sertifikasi BNSP",
    skpPoints: 8,
    startsAt: "2026-12-02",
    timeRange: "08:00 - 17:00 WITA",
    locationName: "Politeknik Ujung Pandang (Lab Pendingin)",
    city: "Makassar",
    capacity: 60,
    enrolled: 31,
    instructor: "Master Asesor LSP TPTU Indonesia",
    fee: "Rp 650.000",
    summary:
      "Uji sertifikasi keahlian tingkat lanjut untuk teknisi kawasan timur Indonesia, meliputi chiller sentral, VRV commissioning, dan manajemen K3 refrigerasi.",
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

const CATEGORIES = [
  { id: "all", label: "Semua Agenda" },
  { id: "bnsp", label: "Sertifikasi BNSP" },
  { id: "inverter", label: "Inverter & VRV/VRF" },
  { id: "k3", label: "Safety K3 & Freon" },
  { id: "munas", label: "Munas & Rakernas" },
];

export default function EventsPage() {
  const [activeSuiteTab, setActiveSuiteTab] = useState<
    "agenda" | "skkni" | "tuk"
  >("agenda");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const featuredEvent = useMemo(() => {
    return EVENTS_DATABASE.find((e) => e.isFeatured) ?? EVENTS_DATABASE[0];
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return EVENTS_DATABASE.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchQuery =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Is the spotlight featured banner visible?
  const isSpotlightVisible =
    !searchQuery.trim() &&
    selectedCategory === "all" &&
    currentPage === 1 &&
    Boolean(featuredEvent);

  // Exclude featured item from catalog grid to eliminate duplicate content
  const catalogEvents = useMemo(() => {
    if (isSpotlightVisible && featuredEvent) {
      return filteredEvents.filter((e) => e.id !== featuredEvent.id);
    }
    return filteredEvents;
  }, [filteredEvents, isSpotlightVisible, featuredEvent]);

  const totalPages = Math.ceil(catalogEvents.length / EVENTS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + EVENTS_PER_PAGE,
    catalogEvents.length,
  );
  const paginatedEvents = catalogEvents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const feedElement = document.getElementById("events-grid-anchor");
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

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
          {/* Suite Tab Switcher */}
          <div className="events-suite-tabs-row">
            <div className="events-suite-tabs-nav">
              <button
                type="button"
                className={`suite-tab-btn ${activeSuiteTab === "agenda" ? "active" : ""}`}
                onClick={() => setActiveSuiteTab("agenda")}
              >
                <CalendarDays size={16} />
                <span>Jadwal Agenda Pelatihan</span>
              </button>

              <button
                type="button"
                className={`suite-tab-btn ${activeSuiteTab === "skkni" ? "active" : ""}`}
                onClick={() => setActiveSuiteTab("skkni")}
              >
                <Award size={16} />
                <span>Skema Sertifikasi BNSP</span>
              </button>

              <button
                type="button"
                className={`suite-tab-btn ${activeSuiteTab === "tuk" ? "active" : ""}`}
                onClick={() => setActiveSuiteTab("tuk")}
              >
                <Building2 size={16} />
                <span>Pengajuan TUK & Workshop DPD</span>
              </button>
            </div>
          </div>

          {/* TAB 1: JADWAL AGENDA */}
          {activeSuiteTab === "agenda" && (
            <div className="events-main-flow slide-in-up">
              {/* Unified Swiss Directory Controls Toolbar */}
              <div id="events-grid-anchor" className="directory-controls-row">
                <div className="directory-cat-pills">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`dir-cat-btn ${selectedCategory === cat.id ? "active" : ""}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="dir-search-wrap">
                  <Search size={16} />
                  <input
                    id="events-search-query"
                    name="eventsSearchQuery"
                    type="text"
                    placeholder="Cari pelatihan, kota, instruktur..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    aria-label="Cari agenda pelatihan"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => handleSearchChange("")}
                      aria-label="Bersihkan pencarian"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Clean Swiss Spotlight Featured Agenda (Wide Expansive Layout) */}
              {isSpotlightVisible && featuredEvent && (
                <div className="event-spotlight-card">
                  {/* Top Bar: Badges */}
                  <div className="spotlight-top-bar">
                    <div className="spotlight-badge-group">
                      <span className="spotlight-badge">
                        <Sparkles size={14} />
                        <span>AGENDA UTAMA BULAN INI</span>
                      </span>
                      <span className="spotlight-cat-tag">
                        {featuredEvent.categoryLabel}
                      </span>
                    </div>
                    <div className="reward-pill">
                      <Award size={15} />
                      <span>+{featuredEvent.skpPoints} SKP CPD RESMI</span>
                    </div>
                  </div>

                  {/* Hero Heading & Summary */}
                  <div className="spotlight-main-body">
                    <h2 className="spotlight-hero-title">
                      {featuredEvent.title}
                    </h2>
                    <p className="spotlight-hero-summary">
                      {featuredEvent.summary}
                    </p>
                  </div>

                  {/* 4-Column Horizontal Info Cards Grid */}
                  <div className="spotlight-info-grid">
                    <div className="spotlight-info-cell">
                      <div className="info-cell-icon">
                        <Calendar size={18} color="#0284c7" />
                      </div>
                      <div className="info-cell-text">
                        <small>Jadwal Pelaksanaan</small>
                        <strong>
                          {new Date(featuredEvent.startsAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </strong>
                        <span>{featuredEvent.timeRange}</span>
                      </div>
                    </div>

                    <div className="spotlight-info-cell">
                      <div className="info-cell-icon">
                        <MapPin size={18} color="#16a34a" />
                      </div>
                      <div className="info-cell-text">
                        <small>Lokasi & Kota</small>
                        <strong>{featuredEvent.city}</strong>
                        <span>{featuredEvent.locationName}</span>
                      </div>
                    </div>

                    <div className="spotlight-info-cell">
                      <div className="info-cell-icon">
                        <Users size={18} color="#8b5cf6" />
                      </div>
                      <div className="info-cell-text">
                        <small>Penguji / Asesor</small>
                        <strong>{featuredEvent.instructor}</strong>
                        <span>LSP Standar BNSP</span>
                      </div>
                    </div>

                    <div className="spotlight-info-cell spotlight-fee-cell">
                      <div className="info-cell-icon">
                        <Zap size={18} color="#f59e0b" />
                      </div>
                      <div className="info-cell-text">
                        <small>Biaya Kontribusi</small>
                        <strong className="fee-highlight">
                          {featuredEvent.fee}
                        </strong>
                        <span>Subsidi Asosiasi</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Row: Quota Progress + Action CTA */}
                  <div className="spotlight-footer-row">
                    <div className="spotlight-quota-wrap">
                      <div className="quota-labels">
                        <span>
                          Kuota Pendaftaran:{" "}
                          <strong>{featuredEvent.enrolled}</strong> /{" "}
                          <strong>{featuredEvent.capacity}</strong> Kursi Terisi
                        </span>
                        <span className="quota-percent">
                          {Math.round(
                            (featuredEvent.enrolled /
                              featuredEvent.capacity) *
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

                    <div className="spotlight-cta-wrap">
                      <Link
                        href={`/events/${featuredEvent.slug}`}
                        className="button primary btn-spotlight-cta"
                      >
                        <UserCheck size={17} />
                        <span>Daftar Sekarang</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Events Cards Grid (Paginated) */}
              {paginatedEvents.length > 0 ? (
                <>
                  <div className="events-cards-grid">
                    {paginatedEvents.map((event) => {
                      const startDate = new Date(event.startsAt);
                      const isUpcoming = startDate.getTime() >= Date.now();
                      const remainingQuota = event.capacity - event.enrolled;

                      return (
                        <article key={event.id} className="event-modern-card">
                          {/* Card Top: Category Tag & SKP Badge */}
                          <div className="event-card-top-bar">
                            <span className="event-cat-tag">
                              {event.categoryLabel}
                            </span>
                            <span className="event-skp-pill">
                              <Award size={13} />
                              <span>+{event.skpPoints} SKP</span>
                            </span>
                          </div>

                          {/* Card Main: Title & Excerpt */}
                          <div className="event-card-main">
                            <h3 className="event-title">
                              <Link href={`/events/${event.slug}`}>
                                {event.title}
                              </Link>
                            </h3>
                            <p className="event-summary-text">
                              {event.summary}
                            </p>
                          </div>

                          {/* Clean Airy Metadata List */}
                          <div className="event-card-meta-list">
                            <div className="event-meta-line">
                              <CalendarDays
                                size={15}
                                className="meta-icon text-sky"
                              />
                              <span>
                                {startDate.toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}{" "}
                                · {event.timeRange}
                              </span>
                            </div>

                            <div className="event-meta-line">
                              <MapPin
                                size={15}
                                className="meta-icon text-emerald"
                              />
                              <span>
                                <strong>{event.city}</strong> ·{" "}
                                {event.locationName}
                              </span>
                            </div>

                            <div className="event-meta-line">
                              <Users
                                size={15}
                                className="meta-icon text-purple"
                              />
                              <span>{event.instructor}</span>
                            </div>
                          </div>

                          {/* Card Footer: Fee & Action CTA */}
                          <div className="event-card-footer">
                            <div className="event-footer-info">
                              <small>
                                {remainingQuota < 20
                                  ? `Sisa ${remainingQuota} Kursi`
                                  : "Biaya Kontribusi"}
                              </small>
                              <strong>{event.fee}</strong>
                            </div>

                            <Link
                              href={`/events/${event.slug}`}
                              className="btn-event-action"
                            >
                              <span>Lihat Agenda</span>
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Numbered Pagination Toolbar */}
                  {totalPages > 1 && (
                    <div className="stories-pagination-bar">
                      <div className="pagination-info">
                        <span>
                          Menampilkan{" "}
                          <strong>
                            {startIndex + 1} - {endIndex}
                          </strong>{" "}
                          dari <strong>{catalogEvents.length}</strong> Agenda
                          Pelatihan
                        </span>
                      </div>
                      <div className="pagination-controls">
                        <button
                          type="button"
                          className="page-nav-btn"
                          disabled={safeCurrentPage === 1}
                          onClick={() => handlePageChange(safeCurrentPage - 1)}
                        >
                          <ChevronLeft size={14} />
                          <span>Sebelumnya</span>
                        </button>

                        <div className="page-numbers-group">
                          {Array.from(
                            { length: totalPages },
                            (_, idx) => idx + 1,
                          ).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              className={`page-num-btn ${
                                pageNum === safeCurrentPage ? "active" : ""
                              }`}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="page-nav-btn"
                          disabled={safeCurrentPage === totalPages}
                          onClick={() => handlePageChange(safeCurrentPage + 1)}
                        >
                          <span>Selanjutnya</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <CalendarDays size={48} color="#94a3b8" />
                  <h3>Tidak Ada Agenda yang Sesuai</h3>
                  <p>
                    Coba ganti filter kategori atau kata kunci pencarian Anda.
                  </p>
                  <button
                    type="button"
                    className="button secondary mt-4"
                    onClick={() => {
                      handleCategorySelect("all");
                      handleSearchChange("");
                    }}
                  >
                    Reset Filter
                  </button>
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
