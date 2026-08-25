"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  ExternalLink,
  Filter,
  Globe,
  Loader2,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Star,
  Store,
  Tag,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { NATIONAL_16_WORKSHOPS } from "@/components/home-featured-workshops";
import { PublicWorkshopCard, type PublicWorkshopData } from "@/components/public-workshop-card";

interface Technician {
  id: string;
  name: string;
  ktaNumber: string;
  skillLevel: string;
  province: string;
  city: string;
  phone: string | null;
  workshopName: string | null;
  rating: string | null;
  certifiedBnsp: boolean;
  isAvailable: boolean;
}

export type MemberWorkshop = PublicWorkshopData;

const SEED_MEMBER_WORKSHOPS: MemberWorkshop[] = NATIONAL_16_WORKSHOPS;

interface SkillTierInfo {
  levelNumber: number;
  shortBadge: string;
  fullName: string;
  skkniLevel: string;
  scopeDescription: string;
  color: string;
  bgClass: string;
  icon: any;
}

function parseSkillLevel(rawLevel: string): SkillTierInfo {
  const lower = (rawLevel || "").toLowerCase();

  if (
    lower.includes("4") ||
    lower.includes("chiller") ||
    lower.includes("central") ||
    lower.includes("vrv") ||
    lower.includes("vrf") ||
    lower.includes("master") ||
    lower.includes("utama")
  ) {
    return {
      levelNumber: 4,
      shortBadge: "Level 4 · Master",
      fullName: "Teknisi Utama & Ahli Sentral (Level IV)",
      skkniLevel: "Kualifikasi Level IV SKKNI / BNSP",
      scopeDescription:
        "Sistem tata udara sentral, Chiller industri, VRV/VRF multi-inverter komersial, perancangan ducting, dan cold storage kapasitas besar.",
      color: "#d97706",
      bgClass: "tier-level-4",
      icon: Crown,
    };
  }

  if (
    lower.includes("3") ||
    lower.includes("madya") ||
    lower.includes("komersial") ||
    lower.includes("senior")
  ) {
    return {
      levelNumber: 3,
      shortBadge: "Level 3 · Madya",
      fullName: "Teknisi Madya / Senior HVAC (Level III)",
      skkniLevel: "Kualifikasi Level III SKKNI / BNSP",
      scopeDescription:
        "Instalasi dan perbaikan AC cassette, standing floor komersial, multi-split inverter, dan prosedur recovery refrigeran standar K3.",
      color: "#0284c7",
      bgClass: "tier-level-3",
      icon: ShieldCheck,
    };
  }

  if (
    lower.includes("2") ||
    lower.includes("pratama") ||
    lower.includes("residensial") ||
    lower.includes("split")
  ) {
    return {
      levelNumber: 2,
      shortBadge: "Level 2 · Pratama",
      fullName: "Teknisi Pratama Tata Udara (Level II)",
      skkniLevel: "Kualifikasi Level II SKKNI / BNSP",
      scopeDescription:
        "Pemasangan unit baru AC split residensial, cuci servis berkala, pengujian kebocoran tekanan pipa tembaga, dan proses vakum pompa.",
      color: "#16a34a",
      bgClass: "tier-level-2",
      icon: Wrench,
    };
  }

  return {
    levelNumber: 1,
    shortBadge: "Level 1 · Muda",
    fullName: "Teknisi Muda / Asisten Teknisi (Level I)",
    skkniLevel: "Kualifikasi Level I SKKNI / BNSP",
    scopeDescription:
      "Pemeliharaan preventif dasar, pembersihan filter indoor/outdoor unit, dan asisten teknisi pada instalasi lapangan.",
    color: "#6366f1",
    bgClass: "tier-level-1",
    icon: Sparkles,
  };
}

function getTechWorkshop(tech: Technician, wsList: MemberWorkshop[]): MemberWorkshop {
  const match = wsList.find(
    (w) =>
      (tech.ktaNumber && w.memberNumber && w.memberNumber.toLowerCase() === tech.ktaNumber.toLowerCase()) ||
      (tech.name && w.ownerName && w.ownerName.toLowerCase().includes(tech.name.toLowerCase())) ||
      (tech.name && w.workshopName && w.workshopName.toLowerCase().includes(tech.name.toLowerCase())) ||
      (tech.workshopName && w.workshopName && w.workshopName.toLowerCase().includes(tech.workshopName.toLowerCase())),
  );

  if (match) return match;

  return {
    id: `ws-auto-${tech.id}`,
    workshopName: tech.workshopName || `Bengkel AC & Pendingin ${tech.name}`,
    tagline: `Pusat Layanan Servis & Instalasi Pendingin Resmi Terdaftar`,
    category: tech.skillLevel.includes("4") || tech.skillLevel.toLowerCase().includes("vrv") || tech.skillLevel.toLowerCase().includes("chiller")
      ? "Bengkel Spesialis AC Komersial (VRV/VRF/Chiller)"
      : "Bengkel Servis AC Residensial & Rumah Tangga",
    city: tech.city,
    province: tech.province,
    address: `${tech.city}, ${tech.province}`,
    whatsapp: tech.phone || "081234567890",
    phone: tech.phone || "081234567890",
    operatingHours: "Senin - Sabtu: 08.00 - 17.30 | Siap 24 Jam",
    description: `Bengkel dan pusat layanan tata udara resmi bergaransi di bawah tanggung jawab ${tech.name} (KTA: ${tech.ktaNumber}). Menerapkan SOP vakum wajib dan SOP recovery freon standar organisasi.`,
    services: [
      "Cuci AC Inverter Bebas Bau",
      "Vakum Standar SKKNI (Dua Tahap)",
      "Recovery Freon R32 / R410A",
      "Uji Tekanan Nitrogen K3",
    ],
    ownerName: tech.name,
    memberNumber: tech.ktaNumber,
    isPublished: true,
    rating: Number(tech.rating) || 4.9,
    googleMapsUrl: `${tech.city}, ${tech.province}`,
  };
}

function TechniciansContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"technicians" | "workshops">(
    (searchParams.get("tab") as "technicians" | "workshops") || "technicians",
  );
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [workshops, setWorkshops] = useState<MemberWorkshop[]>(SEED_MEMBER_WORKSHOPS);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedProvince, setSelectedProvince] = useState(
    searchParams.get("provinsi") || "all",
  );
  const [selectedSkill, setSelectedSkill] = useState(
    searchParams.get("keahlian") || "all",
  );
  const [selectedWorkshopCat, setSelectedWorkshopCat] = useState<string>("all");
  const [onlyBnsp, setOnlyBnsp] = useState(
    searchParams.get("bnsp") === "1" || searchParams.get("bnsp") === "true",
  );
  const [copiedKta, setCopiedKta] = useState<string | null>(null);
  const [activeTechModal, setActiveTechModal] = useState<Technician | null>(
    null,
  );

  const updateUrl = (
    newSearch: string,
    newProvince: string,
    newSkill: string,
    newBnsp: boolean,
    newTab: "technicians" | "workshops" = activeTab,
  ) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newTab !== "technicians") url.searchParams.set("tab", newTab);
      else url.searchParams.delete("tab");

      if (newSearch.trim()) url.searchParams.set("q", newSearch.trim());
      else url.searchParams.delete("q");

      if (newProvince !== "all") url.searchParams.set("provinsi", newProvince);
      else url.searchParams.delete("provinsi");

      if (newSkill !== "all") url.searchParams.set("keahlian", newSkill);
      else url.searchParams.delete("keahlian");

      if (newBnsp) url.searchParams.set("bnsp", "1");
      else url.searchParams.delete("bnsp");

      window.history.replaceState(
        null,
        "",
        url.pathname + (url.search ? url.search : ""),
      );
    }
  };

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
        const res = await fetch(`${apiUrl}/v1/public/technicians`);
        if (!res.ok) throw new Error("Failed to load technicians");
        const json = await res.json();
        setTechnicians(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchTechs();

    try {
      const stored = localStorage.getItem("openorg_member_workshops_list");
      if (stored) {
        const parsed: MemberWorkshop[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorkshops((prev) => {
            const memberNums = new Set(parsed.map((p) => p.memberNumber));
            const baseWithoutDuplicates = prev.filter(
              (w) => !memberNums.has(w.memberNumber),
            );
            return [...parsed, ...baseWithoutDuplicates];
          });
        }
      }
    } catch {
    }
  }, []);

  const provinces = Array.from(
    new Set(
      activeTab === "technicians"
        ? technicians.map((t) => t.province).filter(Boolean)
        : workshops.map((w) => w.province).filter(Boolean),
    ),
  );

  const skillLevels = Array.from(
    new Set(technicians.map((t) => t.skillLevel).filter(Boolean)),
  );

  const workshopCategories = Array.from(
    new Set(workshops.map((w) => w.category).filter(Boolean)),
  );

  const handleCopyKta = (e: React.MouseEvent, kta: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(kta);
    setCopiedKta(kta);
    setTimeout(() => setCopiedKta(null), 2000);
  };

  const filteredTechs = technicians.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.ktaNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase()) ||
      t.workshopName?.toLowerCase().includes(search.toLowerCase());

    const matchProvince =
      selectedProvince === "all" || t.province === selectedProvince;

    const matchSkill =
      selectedSkill === "all" || t.skillLevel === selectedSkill;

    const matchBnsp = !onlyBnsp || t.certifiedBnsp;

    return matchSearch && matchProvince && matchSkill && matchBnsp;
  });

  const filteredWorkshops = workshops.filter((w) => {
    const matchSearch =
      !search ||
      w.workshopName.toLowerCase().includes(search.toLowerCase()) ||
      w.tagline.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase()) ||
      w.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      w.memberNumber.toLowerCase().includes(search.toLowerCase()) ||
      w.services.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchProvince =
      selectedProvince === "all" || w.province === selectedProvince;

    const matchCat =
      selectedWorkshopCat === "all" || w.category === selectedWorkshopCat;

    return matchSearch && matchProvince && matchCat;
  });

  return (
    <div className="technicians-page-suite">
      {/* 1. Balanced 2-Column Hero Header */}
      <header className="tech-hero">
        <div className="wrap hero-split-grid">
          <div className="tech-hero-inner">
            <div className="tech-hero-pill">
              <Wrench size={14} />
              <span>DIREKTORI NASIONAL RESMI</span>
            </div>

            <h1 className="tech-hero-title">
              Direktori Teknisi & Bengkel Pendingin{" "}
              <span className="text-gradient">Terverifikasi</span>
            </h1>

            <p className="tech-hero-lead">
              Temukan teknisi tata udara (HVAC/R) dan bursa bengkel/toko
              berlisensi KTA resmi dengan sertifikasi BNSP, jaminan standar K3,
              dan reputasi terpercaya di seluruh Indonesia.
            </p>
          </div>

          {/* Right Column: Hero Metrics Bento Card */}
          <div className="hero-stats-bento-card">
            <div className="stats-card-header">
              <span className="stats-card-badge">Data Jaringan Terakreditasi</span>
              <span className="stats-card-status">● Live Audit QR</span>
            </div>
            <div className="stats-card-grid">
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#f0f9ff", color: "#0284c7" }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <strong>{technicians.length || 120}+ Teknisi</strong>
                  <small>38 DPD Provinsi</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#ecfdf5", color: "#10b981" }}
                >
                  <Store size={20} />
                </div>
                <div>
                  <strong>{workshops.length}+ Bengkel Resmi</strong>
                  <small>Mitra & Toko Suku Cadang</small>
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
                  <strong>Standar BNSP</strong>
                  <small>Uji SKKNI Resmi</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#fffbeb", color: "#f59e0b" }}
                >
                  <Star size={20} />
                </div>
                <div>
                  <strong>4.92 / 5.0</strong>
                  <small>Rating Kepuasan</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Directory Body & Interactive Search Controls */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Main Directory Tab Switcher */}
          <div className="directory-main-tabs">
            <button
              type="button"
              className={`dir-tab-btn ${activeTab === "technicians" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("technicians");
                updateUrl(search, selectedProvince, selectedSkill, onlyBnsp, "technicians");
              }}
            >
              <Users size={17} />
              <span>Direktori Teknisi Berlisensi ({technicians.length || 120})</span>
            </button>
            <button
              type="button"
              className={`dir-tab-btn ${activeTab === "workshops" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("workshops");
                updateUrl(search, selectedProvince, selectedSkill, onlyBnsp, "workshops");
              }}
            >
              <Store size={17} />
              <span>Bursa Bengkel & Toko Resmi Anggota ({workshops.length})</span>
            </button>
          </div>

          {/* Controls Bar */}
          <div className="tech-controls-bar">
            {/* Search Input */}
            <div className="tech-search-box">
              <Search size={17} className="search-icon" />
              <input
                id="technicians-search-input"
                name="techniciansSearch"
                type="text"
                placeholder={
                  activeTab === "technicians"
                    ? "Cari nama teknisi, nomor KTA, kota, atau nama bengkel..."
                    : "Cari nama bengkel/toko, keahlian, kota, atau nomor KTA pemilik..."
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateUrl(
                    e.target.value,
                    selectedProvince,
                    selectedSkill,
                    onlyBnsp,
                    activeTab,
                  );
                }}
                aria-label="Pencarian direktori"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearch("");
                    updateUrl("", selectedProvince, selectedSkill, onlyBnsp, activeTab);
                  }}
                  aria-label="Bersihkan pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="tech-filters-group">
              {/* Province Select */}
              {provinces.length > 0 && (
                <select
                  id="technicians-province-select"
                  name="techniciansProvince"
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    updateUrl(search, e.target.value, selectedSkill, onlyBnsp, activeTab);
                  }}
                  className="tech-select-input"
                  aria-label="Filter berdasarkan provinsi"
                >
                  <option value="all">
                    Semua Provinsi ({provinces.length})
                  </option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}

              {/* Tab-Specific Filters */}
              {activeTab === "technicians" ? (
                <>
                  {skillLevels.length > 0 && (
                    <select
                      id="technicians-skill-select"
                      name="techniciansSkill"
                      value={selectedSkill}
                      onChange={(e) => {
                        setSelectedSkill(e.target.value);
                        updateUrl(
                          search,
                          selectedProvince,
                          e.target.value,
                          onlyBnsp,
                          activeTab,
                        );
                      }}
                      className="tech-select-input"
                      aria-label="Filter berdasarkan tingkat keahlian SKKNI"
                    >
                      <option value="all">Semua Jenjang Keahlian</option>
                      {skillLevels.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* BNSP Toggle */}
                  <button
                    type="button"
                    className={`tech-toggle-btn ${onlyBnsp ? "active" : ""}`}
                    onClick={() => {
                      const nextBnsp = !onlyBnsp;
                      setOnlyBnsp(nextBnsp);
                      updateUrl(search, selectedProvince, selectedSkill, nextBnsp, activeTab);
                    }}
                  >
                    <Award size={14} />
                    <span>Hanya BNSP Certified</span>
                  </button>
                </>
              ) : (
                <>
                  <select
                    value={selectedWorkshopCat}
                    onChange={(e) => setSelectedWorkshopCat(e.target.value)}
                    className="tech-select-input"
                    aria-label="Filter berdasarkan kategori bengkel/toko"
                  >
                    <option value="all">Semua Kategori ({workshopCategories.length})</option>
                    {workshopCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="tech-toggle-btn"
                    onClick={() => {
                      setWorkshops((prev) => {
                        const copy = [...prev];
                        for (let i = copy.length - 1; i > 0; i--) {
                          const j = Math.floor(Math.random() * (i + 1));
                          [copy[i], copy[j]] = [copy[j]!, copy[i]!];
                        }
                        return copy;
                      });
                    }}
                    title="Acak urutan tampilan agar adil bagi semua anggota"
                  >
                    <Shuffle size={13} />
                    <span>Rotasi Acak</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Callout Banner when on Workshops Tab */}
          {activeTab === "workshops" && (
            <div className="workshop-member-cta-banner">
              <div className="banner-left">
                <Sparkles size={24} color="#0284c7" />
                <div>
                  <strong>Punya Bengkel AC, Toko Sparepart, atau Jasa Pendingin?</strong>
                  <p>
                    Pasang profil usaha Anda secara gratis di bursa direktori resmi
                    APTI untuk meningkatkan kredibilitas dan jangkauan order pelanggan.
                  </p>
                </div>
              </div>
              <div className="banner-right">
                <Link href="/join" className="button primary">
                  Daftar Anggota & Pasang Iklan
                </Link>
              </div>
            </div>
          )}

          {/* Results Grid: Tab 1 (Technicians) */}
          {activeTab === "technicians" && (
            <>
              {search.trim() && filteredTechs.length > 0 && (
                <div className="search-match-smart-banner">
                  <div className="smart-banner-copy">
                    <Sparkles size={16} color="#0284c7" />
                    <span>
                      Ditemukan <strong>{filteredTechs.length} teknisi resmi</strong> untuk kata kunci <em>&quot;{search}&quot;</em>. Klik kartu untuk melihat profil lengkap bengkel &amp; peta operasional.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-switch-workshop-tab"
                    onClick={() => {
                      setActiveTab("workshops");
                      updateUrl(search, selectedProvince, selectedSkill, onlyBnsp, "workshops");
                    }}
                  >
                    <Store size={13} />
                    <span>Lihat Bursa Bengkel</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="tech-loading-state">
                  <Loader2 size={36} className="animate-spin text-primary" />
                  <p>Memuat direktori teknisi resmi...</p>
                </div>
              ) : (
                <div className="tech-cards-grid">
                  {filteredTechs.length > 0 ? (
                    filteredTechs.map((tech) => (
                      <article className="tech-card-modern" key={tech.id}>
                        {/* Top Bar: Compact Skill Level Badge & BNSP/Rating */}
                        <div className="tech-card-top">
                          {(() => {
                            const tier = parseSkillLevel(tech.skillLevel);
                            const TierIcon = tier.icon;
                            return (
                              <span
                                className={`tech-level-badge-compact ${tier.bgClass}`}
                                title={`Jenjang: ${tier.fullName}`}
                              >
                                <TierIcon size={12} />
                                <span>{tier.shortBadge}</span>
                              </span>
                            );
                          })()}

                          {tech.certifiedBnsp && (
                            <span className="tech-bnsp-badge">
                              <Award size={11} />
                              <span>BNSP</span>
                            </span>
                          )}

                          {tech.rating && (
                            <span className="tech-rating-chip">
                              <Star size={11} color="#f59e0b" fill="#f59e0b" />
                              <span>{tech.rating}</span>
                            </span>
                          )}
                        </div>

                        {/* Profile Header Button */}
                        <button
                          type="button"
                          className="tech-profile-btn"
                          onClick={() => setActiveTechModal(tech)}
                        >
                          <div className="tech-avatar-frame">
                            <span>
                              {tech.name
                                .split(" ")
                                .map((n) => n[0])
                                .filter(Boolean)
                                .slice(0, 2)
                                .join("")
                                .toUpperCase() || "TK"}
                            </span>
                          </div>

                          <div className="tech-profile-info">
                            <h3 className="tech-name">{tech.name}</h3>
                            <div className="tech-location-row">
                              <MapPin size={13} color="#64748b" />
                              <span>
                                {tech.city}, {tech.province}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Workshop & Business Profile Pill */}
                        {(() => {
                          const ws = getTechWorkshop(tech, workshops);
                          return (
                            <div
                              className="tech-workshop-box-enhanced"
                              onClick={() => setActiveTechModal(tech)}
                              title="Buka profil lengkap & peta lokasi bengkel resmi"
                            >
                              <div className="ws-box-header">
                                <Store size={12} color="#0284c7" />
                                <strong className="ws-box-name truncate">
                                  {ws.workshopName}
                                </strong>
                              </div>
                              <div className="ws-box-footer">
                                <span className="ws-cat-subtag truncate">{ws.category}</span>
                                <span className="ws-view-link">
                                  <span>Detail Usaha</span>
                                  <ArrowRight size={10} />
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* SKKNI Scope Description */}
                        {(() => {
                          const tier = parseSkillLevel(tech.skillLevel);
                          return (
                            <p className="tech-scope-summary">
                              {tier.scopeDescription}
                            </p>
                          );
                        })()}

                        {/* Footer Row: KTA Number + Actions */}
                        <div className="tech-card-footer">
                          <span className="tech-kta-chip">
                            <QrCode size={12} color="#0284c7" />
                            <span>{tech.ktaNumber}</span>
                          </span>

                          <div className="tech-actions-quick">
                            {tech.phone && (
                              <a
                                href={`https://wa.me/${tech.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-quick-wa"
                                title="Hubungi via WhatsApp"
                              >
                                <Phone size={13} />
                                <span>Kontak</span>
                              </a>
                            )}
                            <button
                              type="button"
                              className="tech-detail-btn"
                              onClick={() => setActiveTechModal(tech)}
                            >
                              <span>Detail</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="tech-empty-state">
                      <Wrench size={44} color="#94a3b8" />
                      <h3>Tidak Ada Teknisi yang Sesuai</h3>
                      <p>
                        Coba sesuaikan kata kunci nama, nomor KTA, atau ubah filter
                        wilayah dan jenjang keahlian.
                      </p>
                      <button
                        type="button"
                        className="button secondary btn-reset-tech"
                        onClick={() => {
                          setSearch("");
                          setSelectedProvince("all");
                          setSelectedSkill("all");
                          setOnlyBnsp(false);
                          updateUrl("", "all", "all", false, "technicians");
                        }}
                      >
                        Reset Filter Pencarian
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Results Grid: Tab 2 (Member Workshops & Stores) */}
          {activeTab === "workshops" && (
            <div className="home-workshops-grid-compact">
              {filteredWorkshops.length > 0 ? (
                filteredWorkshops.map((ws) => (
                  <PublicWorkshopCard key={ws.id} workshop={ws} />
                ))
              ) : (
                <div className="tech-empty-state">
                  <Store size={44} color="#94a3b8" />
                  <h3>Tidak Ada Bengkel / Toko yang Sesuai</h3>
                  <p>
                    Coba sesuaikan kata kunci pencarian atau ubah filter kategori
                    dan provinsi.
                  </p>
                  <button
                    type="button"
                    className="button secondary btn-reset-tech"
                    onClick={() => {
                      setSearch("");
                      setSelectedProvince("all");
                      setSelectedWorkshopCat("all");
                    }}
                  >
                    Reset Filter Bengkel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Smart Conversion CTA */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Anda Teknisi Pendingin dan Belum Memiliki KTA?"
        guestDescription="Daftarkan keahlian Anda sekarang untuk terdaftar di direktori resmi nasional, mendapatkan sertifikasi BNSP, dan kredit SKP profesi."
        guestPrimaryCta={{ label: "Daftar Keanggotaan", href: "/join" }}
        guestSecondaryCta={{ label: "Cek Validitas KTA", href: "/verify" }}
        memberTitle="Perbarui Portofolio & Keahlian Anda"
        memberDescription="Pastikan data bengkel dan nomor kontak WhatsApp Anda selalu mutakhir di direktori publik untuk kemudahan order pelanggan."
        memberPrimaryCta={{ label: "Buka Portal & KTA Saya", href: "/member" }}
        memberSecondaryCta={{ label: "Audit KTA Saya", href: "/whois" }}
      />

      {/* 4. Interactive Detail Modal */}
      {activeTechModal && (
        <div
          className="leader-modal-overlay"
          onClick={() => setActiveTechModal(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveTechModal(null);
          }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="leader-modal-card"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            tabIndex={0}
            role="document"
          >
            {/* Modal Header */}
            <div className="leader-modal-header">
              <div className="modal-title-wrap">
                <ShieldCheck size={20} color="#0284c7" />
                <h3>Kredensial & Profil Teknisi Resmi</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveTechModal(null)}
                aria-label="Tutup detail modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="leader-modal-body">
              {/* Profile Hero Header */}
              {(() => {
                const tier = parseSkillLevel(activeTechModal.skillLevel);
                const TierIcon = tier.icon;
                return (
                  <>
                    <div className="modal-profile-hero">
                      <div
                        className="tech-avatar-frame"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "16px",
                          fontSize: "18px",
                        }}
                      >
                        <span>
                          {activeTechModal.name
                            .split(" ")
                            .map((n) => n[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "TK"}
                        </span>
                      </div>

                      <div className="modal-profile-copy" style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className={`tech-level-badge-compact ${tier.bgClass}`}
                            style={{ fontSize: "11px" }}
                          >
                            <TierIcon size={12} />
                            <span>{tier.shortBadge}</span>
                          </span>

                          {activeTechModal.certifiedBnsp && (
                            <span className="tech-bnsp-badge">
                              <Award size={11} />
                              <span>BNSP Certified</span>
                            </span>
                          )}

                          {activeTechModal.rating && (
                            <span className="tech-rating-chip">
                              <Star size={11} color="#f59e0b" fill="#f59e0b" />
                              <span>{activeTechModal.rating}</span>
                            </span>
                          )}
                        </div>

                        <h4
                          style={{
                            fontSize: "18px",
                            fontWeight: 800,
                            margin: "0 0 3px",
                            color: "#0f172a",
                          }}
                        >
                          {activeTechModal.name}
                        </h4>
                        <p
                          className="modal-role"
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          {activeTechModal.workshopName ||
                            "Praktisi / Workshop Mandiri Terdaftar"}
                        </p>
                      </div>
                    </div>

                    {/* Competency Leveling Box */}
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${tier.color}0a 0%, #f8fafc 100%)`,
                        border: `1px solid ${tier.color}35`,
                        borderRadius: "16px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              background: `${tier.color}18`,
                              color: tier.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <TierIcon size={18} />
                          </div>
                          <div>
                            <strong
                              style={{
                                fontSize: "14.5px",
                                fontWeight: 800,
                                color: "#0f172a",
                                display: "block",
                              }}
                            >
                              {tier.fullName}
                            </strong>
                            <small
                              style={{
                                color: tier.color,
                                fontWeight: 700,
                                fontSize: "11px",
                                textTransform: "uppercase",
                                letterSpacing: "0.4px",
                              }}
                            >
                              {tier.skkniLevel}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #f1f5f9",
                          borderRadius: "10px",
                          padding: "10px 12px",
                        }}
                      >
                        <small
                          style={{
                            display: "block",
                            fontSize: "10.5px",
                            fontWeight: 800,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "4px",
                          }}
                        >
                          Ruang Lingkup Pengerjaan & Kapasitas Alat
                        </small>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12.5px",
                            lineHeight: "1.55",
                            color: "#334155",
                          }}
                        >
                          {tier.scopeDescription}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Data Grid */}
              <div className="modal-data-grid">
                <div className="modal-data-item">
                  <small>Nomor KTA Nasional</small>
                  <strong className="font-mono">
                    {activeTechModal.ktaNumber}
                  </strong>
                </div>
                <div className="modal-data-item">
                  <small>Wilayah Penugasan</small>
                  <strong>
                    {activeTechModal.city}, {activeTechModal.province}
                  </strong>
                </div>
                <div className="modal-data-item">
                  <small>Sertifikasi BNSP</small>
                  <span className="modal-status-pill">
                    <CheckCircle2 size={12} />
                    <span>
                      {activeTechModal.certifiedBnsp
                        ? "Terlisensi BNSP Sah"
                        : "Asesmen Kompetensi"}
                    </span>
                  </span>
                </div>
                <div className="modal-data-item">
                  <small>Status Ketersediaan</small>
                  <strong style={{ color: "#16a34a" }}>✓ Siap Melayani</strong>
                </div>
              </div>

              {/* Workshop / Business Profile Dossier Box */}
              {(() => {
                const ws = getTechWorkshop(activeTechModal, workshops);
                const mapsQuery = encodeURIComponent(
                  ws.googleMapsUrl || `${ws.address}, ${ws.city}, ${ws.province}, Indonesia`,
                );
                const mapsDirectUrl =
                  ws.googleMapsUrl && ws.googleMapsUrl.startsWith("http")
                    ? ws.googleMapsUrl
                    : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

                const cleanWa = (ws.whatsapp || activeTechModal.phone || "").replace(/\D/g, "");
                const waOrderUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
                  `Halo ${ws.workshopName} / Pak ${activeTechModal.name}, saya menemukan profil workshop Anda di Direktori Resmi APTI Indonesia. Saya ingin konsultasi/order servis.`,
                )}`;

                return (
                  <div className="modal-tech-workshop-section">
                    <div className="modal-workshop-section-header">
                      <div className="section-title-left">
                        <Store size={16} color="#0284c7" />
                        <strong>Profil Usaha & Workshop Resmi</strong>
                      </div>
                      <span className="showcase-verified-badge">
                        <ShieldCheck size={11} color="#10b981" />
                        <span>Mitra Terverifikasi</span>
                      </span>
                    </div>

                    <div className="modal-workshop-card-inner">
                      <div className="inner-brand-row">
                        <h5 className="modal-ws-title">{ws.workshopName}</h5>
                        {ws.tagline && <p className="modal-ws-tagline">{ws.tagline}</p>}
                      </div>

                      <div className="inner-meta-grid">
                        <div className="meta-cell">
                          <MapPin size={12} color="#0284c7" />
                          <span>{ws.address || `${ws.city}, ${ws.province}`}</span>
                        </div>
                        <div className="meta-cell">
                          <Clock size={12} color="#64748b" />
                          <span>{ws.operatingHours}</span>
                        </div>
                        {ws.website && (
                          <div className="meta-cell">
                            <Globe size={12} color="#0284c7" />
                            <a
                              href={ws.website.startsWith("http") ? ws.website : `https://${ws.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="modal-ws-web-link"
                            >
                              <span>{ws.website.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Map Embed in Modal */}
                      <div className="modal-workshop-map-box">
                        <div className="map-top-bar">
                          <small>
                            <MapPin size={10} color="#0284c7" />
                            <span>Titik Operasional: {ws.city}</span>
                          </small>
                          <a
                            href={mapsDirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="map-nav-link"
                          >
                            <Navigation size={10} />
                            <span>Buka Navigasi Rute Maps</span>
                          </a>
                        </div>
                        <iframe
                          title={`Peta Lokasi ${ws.workshopName}`}
                          src={`https://maps.google.com/maps?q=${mapsQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          width="100%"
                          height="110"
                          loading="lazy"
                          style={{ border: 0, display: "block", borderRadius: "8px" }}
                          allowFullScreen={false}
                        />
                      </div>

                      {/* Services Cloud */}
                      {ws.services && ws.services.length > 0 && (
                        <div className="modal-ws-services-wrap">
                          <small>Spesialisasi Bengkel & Alat Kerja:</small>
                          <div className="services-chips-row">
                            {ws.services.map((srv) => (
                              <span key={srv} className="showcase-service-pill">
                                <Wrench size={10} color="#0284c7" />
                                <span>{srv}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Actions Row */}
              <div className="modal-actions-row">
                {activeTechModal.phone ? (
                  <a
                    href={`https://wa.me/${activeTechModal.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Halo ${activeTechModal.name} (${activeTechModal.workshopName || "Teknisi Resmi"}), saya menemukan profil Anda di Direktori Resmi APTI Indonesia.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button primary btn-modal-action"
                  >
                    <MessageSquare size={15} />
                    <span>Hubungi Workshop via WhatsApp</span>
                  </a>
                ) : (
                  <Link
                    href={`/whois?q=${encodeURIComponent(activeTechModal.ktaNumber)}`}
                    className="button primary btn-modal-action"
                    onClick={() => setActiveTechModal(null)}
                  >
                    <ExternalLink size={15} />
                    <span>Audit di Registri Publik</span>
                  </Link>
                )}
                <button
                  type="button"
                  className="button secondary btn-modal-copy"
                  onClick={(e) => handleCopyKta(e, activeTechModal.ktaNumber)}
                >
                  <Copy size={15} />
                  <span>
                    {copiedKta === activeTechModal.ktaNumber
                      ? "KTA Tersalin!"
                      : "Salin No. KTA"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TechniciansPage() {
  return (
    <Suspense
      fallback={
        <div className="tech-loading-state" style={{ minHeight: "50vh" }}>
          <Loader2 size={36} className="animate-spin text-primary" />
          <p>Memuat direktori teknisi resmi...</p>
        </div>
      }
    >
      <TechniciansContent />
    </Suspense>
  );
}
