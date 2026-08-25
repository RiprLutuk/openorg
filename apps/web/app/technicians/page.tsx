"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Crown,
  ExternalLink,
  Filter,
  Globe,
  Loader2,
  LocateFixed,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  Shuffle,
  SlidersHorizontal,
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
import { Suspense, useEffect, useMemo, useState } from "react";
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
  distanceKm?: number | undefined;
}

export type MemberWorkshop = PublicWorkshopData;

const SEED_MEMBER_WORKSHOPS: MemberWorkshop[] = NATIONAL_16_WORKSHOPS;

const ITEMS_PER_PAGE_WORKSHOPS = 9;
const ITEMS_PER_PAGE_TECHS = 12;

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "jakarta": { lat: -6.2088, lng: 106.8456 },
  "jakarta selatan": { lat: -6.2615, lng: 106.8106 },
  "jakarta barat": { lat: -6.1683, lng: 106.7589 },
  "jakarta pusat": { lat: -6.1805, lng: 106.8284 },
  "jakarta timur": { lat: -6.2250, lng: 106.9004 },
  "jakarta utara": { lat: -6.1384, lng: 106.8640 },
  "bandung": { lat: -6.9175, lng: 107.6191 },
  "surabaya": { lat: -7.2575, lng: 112.7521 },
  "semarang": { lat: -6.9667, lng: 110.4167 },
  "yogyakarta": { lat: -7.7956, lng: 110.3695 },
  "jogja": { lat: -7.7956, lng: 110.3695 },
  "medan": { lat: 3.5952, lng: 98.6722 },
  "makassar": { lat: -5.1477, lng: 119.4327 },
  "denpasar": { lat: -8.6705, lng: 115.2126 },
  "bali": { lat: -8.6705, lng: 115.2126 },
  "palembang": { lat: -2.9761, lng: 104.7754 },
  "tangerang": { lat: -6.1783, lng: 106.6319 },
  "bekasi": { lat: -6.2383, lng: 106.9756 },
  "bogor": { lat: -6.5971, lng: 106.8060 },
  "depok": { lat: -6.4025, lng: 106.7942 },
  "malang": { lat: -7.9666, lng: 112.6326 },
  "balikpapan": { lat: -1.2379, lng: 116.8289 },
  "pekanbaru": { lat: 0.5071, lng: 101.4478 },
  "lampung": { lat: -5.4500, lng: 105.2667 },
  "bandar lampung": { lat: -5.4500, lng: 105.2667 },
  "batam": { lat: 1.1301, lng: 104.0529 },
  "banjarmasin": { lat: -3.3194, lng: 114.5908 },
  "samarinda": { lat: -0.5022, lng: 117.1536 },
  "manado": { lat: 1.4748, lng: 124.8428 },
  "padang": { lat: -0.9471, lng: 100.4172 },
  "pontianak": { lat: -0.0263, lng: 109.3425 },
  "solo": { lat: -7.5755, lng: 110.8243 },
  "surakarta": { lat: -7.5755, lng: 110.8243 },
  "cirebon": { lat: -6.7320, lng: 108.5523 },
  "sukabumi": { lat: -6.9277, lng: 106.9300 },
  "tasikmalaya": { lat: -7.3274, lng: 108.2207 },
};

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
  
  // URL-driven query states
  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const activeTab = (searchParams.get("tab") as "technicians" | "workshops") || "technicians";
  const search = searchParams.get("q") || "";
  const selectedProvince = searchParams.get("provinsi") || "all";
  const selectedCity = searchParams.get("kota") || "all";
  const selectedSkill = searchParams.get("keahlian") || "all";
  const selectedWorkshopCat = searchParams.get("kategori") || "all";
  const onlyBnsp = searchParams.get("bnsp") === "1" || searchParams.get("bnsp") === "true";
  const sortMode = searchParams.get("sort") || "default";

  // Client data states
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [workshops, setWorkshops] = useState<MemberWorkshop[]>(SEED_MEMBER_WORKSHOPS);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKta, setCopiedKta] = useState<string | null>(null);
  const [activeTechModal, setActiveTechModal] = useState<Technician | null>(null);

  // Geolocation states
  const [userGeo, setUserGeo] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      const pLat = parseFloat(lat);
      const pLng = parseFloat(lng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        return { lat: pLat, lng: pLng };
      }
    }
    return null;
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // URL State Updater (Server-Friendly URL Search Params)
  const updateUrl = (params: {
    tab?: "technicians" | "workshops";
    q?: string;
    provinsi?: string;
    kota?: string;
    keahlian?: string;
    kategori?: string;
    bnsp?: boolean;
    page?: number;
    sort?: string;
    lat?: string | null;
    lng?: string | null;
  }) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);

      const nextTab = params.tab ?? activeTab;
      if (nextTab !== "technicians") url.searchParams.set("tab", nextTab);
      else url.searchParams.delete("tab");

      const nextSearch = params.q !== undefined ? params.q : search;
      if (nextSearch.trim()) url.searchParams.set("q", nextSearch.trim());
      else url.searchParams.delete("q");

      const nextProv = params.provinsi !== undefined ? params.provinsi : selectedProvince;
      if (nextProv !== "all") url.searchParams.set("provinsi", nextProv);
      else url.searchParams.delete("provinsi");

      const nextKota = params.kota !== undefined ? params.kota : selectedCity;
      if (nextKota !== "all") url.searchParams.set("kota", nextKota);
      else url.searchParams.delete("kota");

      const nextSkill = params.keahlian !== undefined ? params.keahlian : selectedSkill;
      if (nextSkill !== "all") url.searchParams.set("keahlian", nextSkill);
      else url.searchParams.delete("keahlian");

      const nextCat = params.kategori !== undefined ? params.kategori : selectedWorkshopCat;
      if (nextCat !== "all") url.searchParams.set("kategori", nextCat);
      else url.searchParams.delete("kategori");

      const nextBnsp = params.bnsp !== undefined ? params.bnsp : onlyBnsp;
      if (nextBnsp) url.searchParams.set("bnsp", "1");
      else url.searchParams.delete("bnsp");

      const nextSort = params.sort !== undefined ? params.sort : sortMode;
      if (nextSort !== "default") url.searchParams.set("sort", nextSort);
      else url.searchParams.delete("sort");

      const nextPage = params.page !== undefined ? params.page : 1;
      if (nextPage > 1) url.searchParams.set("page", String(nextPage));
      else url.searchParams.delete("page");

      if (params.lat !== undefined && params.lng !== undefined) {
        if (params.lat && params.lng) {
          url.searchParams.set("lat", params.lat);
          url.searchParams.set("lng", params.lng);
        } else {
          url.searchParams.delete("lat");
          url.searchParams.delete("lng");
        }
      }

      window.history.replaceState(
        null,
        "",
        url.pathname + (url.search ? url.search : ""),
      );
    }
  };

  // GPS Geolocation Handler
  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Perangkat tidak mendukung geolokasi GPS.");
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserGeo(coords);
        setIsLocating(false);
        updateUrl({
          lat: coords.lat.toFixed(4),
          lng: coords.lng.toFixed(4),
          sort: "location",
          page: 1,
        });
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setIsLocating(false);
        setLocationError(
          "Izin akses GPS tidak diberikan atau tidak dapat dijangkau. Silakan pilih provinsi atau kota secara manual.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleClearLocation = () => {
    setUserGeo(null);
    setLocationError(null);
    updateUrl({ lat: null, lng: null, sort: "default", page: 1 });
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

  const provinces = useMemo(() => {
    return Array.from(
      new Set(
        activeTab === "technicians"
          ? technicians.map((t) => t.province).filter(Boolean)
          : workshops.map((w) => w.province).filter(Boolean),
      ),
    );
  }, [activeTab, technicians, workshops]);

  const availableCities = useMemo(() => {
    const pool = activeTab === "technicians" ? technicians : workshops;
    const filteredByProv =
      selectedProvince === "all"
        ? pool
        : pool.filter((item) => item.province === selectedProvince);
    return Array.from(new Set(filteredByProv.map((i) => i.city).filter(Boolean)));
  }, [activeTab, technicians, workshops, selectedProvince]);

  const skillLevels = useMemo(() => {
    return Array.from(new Set(technicians.map((t) => t.skillLevel).filter(Boolean)));
  }, [technicians]);

  const workshopCategories = useMemo(() => {
    return Array.from(new Set(workshops.map((w) => w.category).filter(Boolean)));
  }, [workshops]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedProvince !== "all") count++;
    if (selectedCity !== "all") count++;
    if (activeTab === "technicians") {
      if (selectedSkill !== "all") count++;
      if (onlyBnsp) count++;
    } else {
      if (selectedWorkshopCat !== "all") count++;
    }
    if (userGeo) count++;
    return count;
  }, [selectedProvince, selectedCity, selectedSkill, selectedWorkshopCat, onlyBnsp, userGeo, activeTab]);

  const handleCopyKta = (e: React.MouseEvent, kta: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(kta);
    setCopiedKta(kta);
    setTimeout(() => setCopiedKta(null), 2000);
  };

  // 1. Process Technicians (Enrich Distance & Filter)
  const filteredTechs = useMemo(() => {
    return technicians
      .map((t) => {
        let distanceKm: number | undefined = undefined;
        if (userGeo) {
          const cityLookup =
            CITY_COORDINATES[t.city?.toLowerCase()] ||
            CITY_COORDINATES[t.province?.toLowerCase()];
          if (cityLookup) {
            distanceKm = calculateDistanceKm(
              userGeo.lat,
              userGeo.lng,
              cityLookup.lat,
              cityLookup.lng,
            );
          }
        }
        return { ...t, distanceKm };
      })
      .filter((t) => {
        const matchSearch =
          !search ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.ktaNumber.toLowerCase().includes(search.toLowerCase()) ||
          t.city.toLowerCase().includes(search.toLowerCase()) ||
          t.workshopName?.toLowerCase().includes(search.toLowerCase());

        const matchProvince =
          selectedProvince === "all" || t.province === selectedProvince;

        const matchCity =
          selectedCity === "all" || t.city === selectedCity;

        const matchSkill =
          selectedSkill === "all" || t.skillLevel === selectedSkill;

        const matchBnsp = !onlyBnsp || t.certifiedBnsp;

        return matchSearch && matchProvince && matchCity && matchSkill && matchBnsp;
      })
      .sort((a, b) => {
        if (userGeo || sortMode === "location") {
          if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
            return a.distanceKm - b.distanceKm;
          }
        }
        return (parseFloat(b.rating || "0") || 0) - (parseFloat(a.rating || "0") || 0);
      });
  }, [technicians, userGeo, search, selectedProvince, selectedCity, selectedSkill, onlyBnsp, sortMode]);

  // 2. Process Workshops (Enrich Distance & Filter)
  const filteredWorkshops = useMemo(() => {
    return workshops
      .map((w) => {
        let distanceKm: number | undefined = undefined;
        if (userGeo) {
          const lat = w.latitude;
          const lng = w.longitude;
          if (lat && lng) {
            distanceKm = calculateDistanceKm(userGeo.lat, userGeo.lng, lat, lng);
          } else {
            const cityLookup =
              CITY_COORDINATES[w.city?.toLowerCase()] ||
              CITY_COORDINATES[w.province?.toLowerCase()];
            if (cityLookup) {
              distanceKm = calculateDistanceKm(
                userGeo.lat,
                userGeo.lng,
                cityLookup.lat,
                cityLookup.lng,
              );
            }
          }
        }
        return { ...w, distanceKm };
      })
      .filter((w) => {
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

        const matchCity =
          selectedCity === "all" || w.city === selectedCity;

        const matchCat =
          selectedWorkshopCat === "all" || w.category === selectedWorkshopCat;

        return matchSearch && matchProvince && matchCity && matchCat;
      })
      .sort((a, b) => {
        if (userGeo || sortMode === "location") {
          if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
            return a.distanceKm - b.distanceKm;
          }
        }
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [workshops, userGeo, search, selectedProvince, selectedCity, selectedWorkshopCat, sortMode]);

  // Pagination Math
  const itemsPerPage =
    activeTab === "workshops" ? ITEMS_PER_PAGE_WORKSHOPS : ITEMS_PER_PAGE_TECHS;
  const totalItems =
    activeTab === "workshops" ? filteredWorkshops.length : filteredTechs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedTechs = useMemo(() => {
    return filteredTechs.slice(startIndex, endIndex);
  }, [filteredTechs, startIndex, endIndex]);

  const paginatedWorkshops = useMemo(() => {
    return filteredWorkshops.slice(startIndex, endIndex);
  }, [filteredWorkshops, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateUrl({ page: newPage });
    if (typeof window !== "undefined") {
      const anchor = document.getElementById("directory-results-top");
      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="technicians-page-suite">
      {/* 1. Balanced 2-Column Hero Header */}
      <header className="tech-hero">
        <div className="wrap hero-split-grid">
          <div className="tech-hero-inner">
            <div className="tech-hero-pill">
              <Wrench size={14} />
              <span>DIREKTORI RESMI &amp; BURSA BENGKEL</span>
            </div>

            <h1 className="tech-hero-title">
              Direktori Teknisi &amp; Bengkel{" "}
              <span className="text-gradient">Terverifikasi</span>
            </h1>

            <p className="tech-hero-lead">
              Temukan teknisi tata udara (HVAC/R) dan bursa bengkel/toko
              berlisensi KTA resmi dengan sertifikasi BNSP, jaminan standar K3,
              serta pencarian berbasis radius lokasi terdekat dari posisi Anda.
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
                  <small>Mitra &amp; Toko Suku Cadang</small>
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
      <section className="tech-body section-space" id="directory-results-top">
        <div className="wrap">
          {/* Main Directory Tab Switcher */}
          <div className="directory-main-tabs">
            <button
              type="button"
              className={`dir-tab-btn ${activeTab === "technicians" ? "active" : ""}`}
              onClick={() => {
                updateUrl({ tab: "technicians", page: 1 });
              }}
            >
              <Users size={17} />
              <span>Direktori Teknisi Berlisensi ({technicians.length || 120})</span>
            </button>
            <button
              type="button"
              className={`dir-tab-btn ${activeTab === "workshops" ? "active" : ""}`}
              onClick={() => {
                updateUrl({ tab: "workshops", page: 1 });
              }}
            >
              <Store size={17} />
              <span>Bursa Bengkel &amp; Toko Resmi Anggota ({workshops.length})</span>
            </button>
          </div>

          {/* Compact Search & Filter Toolbar */}
          <div className="tech-compact-toolbar">
            {/* Search Input */}
            <div className="tech-search-box-unified">
              <Search size={16} className="search-icon" />
              <input
                id="technicians-search-input"
                name="techniciansSearch"
                type="text"
                placeholder={
                  activeTab === "technicians"
                    ? "Cari nama teknisi, KTA, kota, atau spesialisasi..."
                    : "Cari nama bengkel, sparepart, kota, layanan..."
                }
                value={search}
                onChange={(e) => updateUrl({ q: e.target.value, page: 1 })}
                aria-label="Pencarian direktori"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => updateUrl({ q: "", page: 1 })}
                  aria-label="Bersihkan pencarian"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* GPS Location Button */}
            <button
              type="button"
              className={`btn-toolbar-gps ${userGeo ? "active" : ""}`}
              onClick={userGeo ? handleClearLocation : handleDetectLocation}
              disabled={isLocating}
              title={userGeo ? "Nonaktifkan filter GPS" : "Cari di sekitar radius lokasi GPS Anda"}
            >
              {isLocating ? (
                <Loader2 size={14} className="animate-spin text-sky-600" />
              ) : (
                <LocateFixed size={14} className={userGeo ? "text-emerald-600 animate-pulse" : "text-sky-600"} />
              )}
              <span className="btn-toolbar-text">{userGeo ? "GPS Aktif" : "Dekat Saya"}</span>
            </button>

            {/* Filter Toggle Button */}
            <button
              type="button"
              className={`btn-toolbar-filter ${activeFiltersCount > 0 ? "has-filters" : ""}`}
              onClick={() => setIsFilterModalOpen(true)}
              aria-label="Buka filter lanjutan"
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="filter-count-badge">{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Active Filter Chips Bar (Only shown when filters are active) */}
          {activeFiltersCount > 0 && (
            <div className="active-filters-chips-bar">
              <span className="active-filters-label">Filter:</span>
              <div className="active-chips-scroll">
                {userGeo && (
                  <span className="active-filter-chip">
                    <LocateFixed size={11} className="text-emerald-600" />
                    <span>GPS Radius ({userGeo.lat.toFixed(1)}, {userGeo.lng.toFixed(1)})</span>
                    <button type="button" onClick={handleClearLocation} title="Hapus filter GPS">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {selectedProvince !== "all" && (
                  <span className="active-filter-chip">
                    <span>Prov: {selectedProvince}</span>
                    <button
                      type="button"
                      onClick={() => updateUrl({ provinsi: "all", kota: "all", page: 1 })}
                      title="Hapus filter provinsi"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {selectedCity !== "all" && (
                  <span className="active-filter-chip">
                    <span>Kota: {selectedCity}</span>
                    <button
                      type="button"
                      onClick={() => updateUrl({ kota: "all", page: 1 })}
                      title="Hapus filter kota"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {activeTab === "technicians" && selectedSkill !== "all" && (
                  <span className="active-filter-chip">
                    <span>{selectedSkill}</span>
                    <button
                      type="button"
                      onClick={() => updateUrl({ keahlian: "all", page: 1 })}
                      title="Hapus filter keahlian"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {activeTab === "technicians" && onlyBnsp && (
                  <span className="active-filter-chip">
                    <span>BNSP Certified</span>
                    <button
                      type="button"
                      onClick={() => updateUrl({ bnsp: false, page: 1 })}
                      title="Hapus filter BNSP"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {activeTab === "workshops" && selectedWorkshopCat !== "all" && (
                  <span className="active-filter-chip">
                    <span>{selectedWorkshopCat.replace(/^Bengkel\s+/i, "")}</span>
                    <button
                      type="button"
                      onClick={() => updateUrl({ kategori: "all", page: 1 })}
                      title="Hapus filter kategori"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  className="btn-clear-all-chips"
                  onClick={() => {
                    handleClearLocation();
                    updateUrl({
                      provinsi: "all",
                      kota: "all",
                      keahlian: "all",
                      kategori: "all",
                      bnsp: false,
                      page: 1,
                    });
                  }}
                >
                  Reset Semua
                </button>
              </div>
            </div>
          )}

          {/* Location Error Banner */}
          {locationError && (
            <div className="tech-location-error-banner">
              <MapPin size={15} className="text-amber-600 flex-shrink-0" />
              <span>{locationError}</span>
              <button
                type="button"
                className="btn-text-clear-gps"
                onClick={() => setLocationError(null)}
              >
                Tutup
              </button>
            </div>
          )}

          {/* Results Summary Bar */}
          <div className="directory-results-meta-bar">
            <span className="results-count-text">
              Menampilkan <strong>{totalItems > 0 ? startIndex + 1 : 0} – {endIndex}</strong> dari <strong>{totalItems}</strong> {activeTab === "workshops" ? "Bengkel Resmi" : "Teknisi Berlisensi"}
              {selectedProvince !== "all" && <span> di <em>{selectedProvince}</em></span>}
              {selectedCity !== "all" && <span>, <em>{selectedCity}</em></span>}
              {userGeo && <span className="text-sky-600 font-semibold"> (Urutan Berdasarkan Jarak Terdekat)</span>}
            </span>
            {totalPages > 1 && (
              <span className="results-page-indicator">
                Halaman <strong>{safePage}</strong> dari <strong>{totalPages}</strong>
              </span>
            )}
          </div>

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
                      updateUrl({ tab: "workshops", page: 1 });
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
                  {paginatedTechs.length > 0 ? (
                    paginatedTechs.map((tech) => (
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

                          {tech.distanceKm !== undefined && (
                            <span className="ws-pill-distance" title={`Jarak ke lokasi: ±${tech.distanceKm.toFixed(1)} km`}>
                              📍 {tech.distanceKm < 1 ? "< 1 km" : `±${Math.round(tech.distanceKm)} km`}
                            </span>
                          )}

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

                        {/* Card Footer: KTA Number + Quick Verification Link */}
                        <div className="tech-card-footer">
                          <button
                            type="button"
                            className="btn-copy-kta-code"
                            onClick={(e) => handleCopyKta(e, tech.ktaNumber)}
                            title="Salin nomor KTA ke clipboard"
                          >
                            <QrCode size={13} color="#0284c7" />
                            <span>{tech.ktaNumber}</span>
                            {copiedKta === tech.ktaNumber ? (
                              <span className="copy-state-icon text-emerald-600">
                                <Check size={11} />
                              </span>
                            ) : (
                              <span className="copy-state-icon">
                                <Copy size={11} />
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            className="btn-tech-detail-arrow"
                            onClick={() => setActiveTechModal(tech)}
                            title="Buka detail kredensial"
                          >
                            <span>Detail</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="tech-empty-state">
                      <Users size={44} color="#94a3b8" />
                      <h3>Tidak Ada Teknisi yang Sesuai</h3>
                      <p>
                        Coba sesuaikan kata kunci pencarian atau ubah filter jenjang
                        keahlian dan provinsi.
                      </p>
                      <button
                        type="button"
                        className="button secondary btn-reset-tech"
                        onClick={() => {
                          updateUrl({
                            q: "",
                            provinsi: "all",
                            kota: "all",
                            keahlian: "all",
                            bnsp: false,
                            page: 1,
                          });
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
            <>
              <div className="home-workshops-grid-compact">
                {paginatedWorkshops.length > 0 ? (
                  paginatedWorkshops.map((ws) => (
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
                        updateUrl({
                          q: "",
                          provinsi: "all",
                          kota: "all",
                          kategori: "all",
                          page: 1,
                        });
                      }}
                    >
                      Reset Filter Bengkel
                    </button>
                  </div>
                )}
              </div>

              {/* Callout Banner when on Workshops Tab - Placed Cleanly After Grid */}
              <div className="workshop-member-cta-banner" style={{ marginTop: "24px" }}>
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
                    Daftar Anggota &amp; Pasang Iklan
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* 3. Server-Side URL-Driven Pagination Bar (Swiss Design) */}
          {totalPages > 1 && (
            <nav
              className="stories-pagination-bar"
              aria-label="Navigasi Halaman Direktori"
            >
              <div className="pagination-info">
                Halaman <strong>{safePage}</strong> dari <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> data)
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft size={14} />
                  <span>Sebelumnya</span>
                </button>

                <div className="page-numbers-group">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      return (
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - safePage) <= 1
                      );
                    })
                    .map((p, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && p - prevPage > 1;

                      return (
                        <div key={p} style={{ display: "flex", alignItems: "center" }}>
                          {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                          <button
                            type="button"
                            className={`page-num-btn ${safePage === p ? "active" : ""}`}
                            onClick={() => handlePageChange(p)}
                            aria-label={`Buka Halaman ${p}`}
                            aria-current={safePage === p ? "page" : undefined}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage >= totalPages}
                  aria-label="Halaman Berikutnya"
                >
                  <span>Berikutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>

      {/* 4. Smart Conversion CTA */}
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

      {/* 5. Mobile & Desktop Filter Slide-Over Drawer / Modal */}
      {isFilterModalOpen && (
        <div
          className="dir-filter-modal-overlay"
          onClick={() => setIsFilterModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="dir-filter-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle Bar for touch/mobile */}
            <div className="filter-modal-handle-bar" />

            {/* Modal Header */}
            <div className="filter-modal-header">
              <div className="filter-modal-title">
                <SlidersHorizontal size={17} className="text-sky-600" />
                <h4>Filter Direktori &amp; Wilayah</h4>
                {activeFiltersCount > 0 && (
                  <span className="filter-header-count">{activeFiltersCount} Aktif</span>
                )}
              </div>
              <button
                type="button"
                className="filter-modal-close"
                onClick={() => setIsFilterModalOpen(false)}
                aria-label="Tutup Panel Filter"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="filter-modal-body">
              {/* Section 1: Radius & Lokasi GPS */}
              <div className="filter-group-block">
                <div className="filter-group-header">
                  <label className="filter-group-label">
                    <LocateFixed size={14} className="text-sky-600" />
                    <span>Lokasi GPS &amp; Radius Terdekat</span>
                  </label>
                  {userGeo && <span className="filter-status-on">● GPS Aktif</span>}
                </div>
                <button
                  type="button"
                  className={`filter-gps-card-btn ${userGeo ? "active" : ""}`}
                  onClick={() => {
                    if (userGeo) handleClearLocation();
                    else handleDetectLocation();
                  }}
                >
                  <LocateFixed
                    size={18}
                    className={userGeo ? "text-emerald-600 animate-pulse" : "text-sky-600"}
                  />
                  <div className="gps-card-text">
                    <strong>{userGeo ? "Radius GPS Aktif" : "Deteksi Lokasi Terdekat (GPS)"}</strong>
                    <small>
                      {userGeo
                        ? `Posisi: ${userGeo.lat.toFixed(2)}, ${userGeo.lng.toFixed(2)} (Hasil diurutkan dari jarak terdekat)`
                        : "Urutkan bengkel & teknisi dari yang paling dekat dengan lokasi Anda"}
                    </small>
                  </div>
                  {userGeo ? (
                    <span className="gps-pill-active">Aktif ✕</span>
                  ) : (
                    <span className="gps-pill-detect">Deteksi</span>
                  )}
                </button>
              </div>

              {/* Section 2: Quick Region Chips */}
              <div className="filter-group-block">
                <label className="filter-group-label">
                  <MapPin size={14} className="text-sky-600" />
                  <span>Pilihan Wilayah Cepat:</span>
                </label>
                <div className="filter-chips-grid">
                  {[
                    { label: "Semua Wilayah", prov: "all" },
                    { label: "DKI Jakarta", prov: "DKI Jakarta" },
                    { label: "Jawa Barat", prov: "Jawa Barat" },
                    { label: "Jawa Timur", prov: "Jawa Timur" },
                    { label: "Jawa Tengah", prov: "Jawa Tengah" },
                    { label: "Sumatera Utara", prov: "Sumatera Utara" },
                    { label: "Bali & Nusra", prov: "Bali" },
                  ].map((reg) => (
                    <button
                      key={reg.prov}
                      type="button"
                      className={`filter-chip-option ${selectedProvince === reg.prov && !userGeo ? "active" : ""}`}
                      onClick={() => {
                        handleClearLocation();
                        updateUrl({ provinsi: reg.prov, kota: "all", page: 1 });
                      }}
                    >
                      {reg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3: Provinsi & Kota Dropdown */}
              <div className="filter-group-block">
                <label className="filter-group-label">
                  <Building2 size={14} className="text-sky-600" />
                  <span>Provinsi &amp; Kota / Rayon:</span>
                </label>
                <div className="filter-selects-stack">
                  <select
                    value={selectedProvince}
                    onChange={(e) => updateUrl({ provinsi: e.target.value, kota: "all", page: 1 })}
                    className="filter-modal-select"
                    aria-label="Pilih Provinsi"
                  >
                    <option value="all">Semua Provinsi ({provinces.length})</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  {availableCities.length > 0 && (
                    <select
                      value={selectedCity}
                      onChange={(e) => updateUrl({ kota: e.target.value, page: 1 })}
                      className="filter-modal-select"
                      aria-label="Pilih Kota atau Rayon"
                    >
                      <option value="all">Semua Kota / Rayon ({availableCities.length})</option>
                      {availableCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Section 4: Tab Specific Controls */}
              {activeTab === "technicians" ? (
                <div className="filter-group-block">
                  <label className="filter-group-label">
                    <Award size={14} className="text-sky-600" />
                    <span>Kualifikasi SKKNI &amp; Sertifikasi:</span>
                  </label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => updateUrl({ keahlian: e.target.value, page: 1 })}
                    className="filter-modal-select"
                    aria-label="Pilih Jenjang Keahlian"
                  >
                    <option value="all">Semua Jenjang Keahlian</option>
                    {skillLevels.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className={`filter-modal-toggle-row ${onlyBnsp ? "active" : ""}`}
                    onClick={() => updateUrl({ bnsp: !onlyBnsp, page: 1 })}
                  >
                    <div className="toggle-row-left">
                      <Award size={16} className={onlyBnsp ? "text-emerald-600" : "text-slate-400"} />
                      <div>
                        <strong>Hanya Teknisi Bersertifikat BNSP</strong>
                        <small>Filter anggota yang telah lulus uji kompetensi resmi</small>
                      </div>
                    </div>
                    <div className={`switch-knob ${onlyBnsp ? "on" : "off"}`} />
                  </button>
                </div>
              ) : (
                <div className="filter-group-block">
                  <label className="filter-group-label">
                    <Store size={14} className="text-sky-600" />
                    <span>Kategori Usaha &amp; Pengurutan:</span>
                  </label>
                  <select
                    value={selectedWorkshopCat}
                    onChange={(e) => updateUrl({ kategori: e.target.value, page: 1 })}
                    className="filter-modal-select"
                    aria-label="Pilih Kategori Bengkel atau Toko"
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
                    className="filter-modal-shuffle-btn"
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
                  >
                    <Shuffle size={14} />
                    <span>Acak Rotasi Tampilan</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="filter-modal-footer">
              <button
                type="button"
                className="btn-filter-modal-reset"
                onClick={() => {
                  handleClearLocation();
                  updateUrl({
                    provinsi: "all",
                    kota: "all",
                    keahlian: "all",
                    kategori: "all",
                    bnsp: false,
                    page: 1,
                  });
                }}
              >
                Reset Filter
              </button>
              <button
                type="button"
                className="btn-filter-modal-apply"
                onClick={() => setIsFilterModalOpen(false)}
              >
                Terapkan Filter ({activeFiltersCount > 0 ? activeFiltersCount : "Semua"})
              </button>
            </div>
          </div>
        </div>
      )}

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
