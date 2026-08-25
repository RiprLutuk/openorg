"use client";

import {
  Compass,
  Filter,
  MapPin,
  Search,
  Shuffle,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { NATIONAL_16_WORKSHOPS } from "@/components/home-featured-workshops";
import { PublicWorkshopCard, type PublicWorkshopData } from "@/components/public-workshop-card";

function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

function getStoredWorkshops(): PublicWorkshopData[] {
  try {
    let combined = [...NATIONAL_16_WORKSHOPS];
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("openorg_member_workshops_list");
      if (stored) {
        const parsed: PublicWorkshopData[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const memberNums = new Set(parsed.map((p) => p.memberNumber));
          const baseWithoutDuplicates = combined.filter((w) => !memberNums.has(w.memberNumber));
          combined = [...parsed, ...baseWithoutDuplicates];
        }
      }
    }
    return combined;
  } catch {
    return NATIONAL_16_WORKSHOPS;
  }
}

function WorkshopsPageContent() {
  const [workshops, setWorkshops] = useState<PublicWorkshopData[]>(NATIONAL_16_WORKSHOPS);
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [geoState, setGeoState] = useState<{
    status: "idle" | "requesting" | "active" | "denied";
    userLat?: number | undefined;
    userLng?: number | undefined;
    nearestCity?: string | undefined;
  }>({ status: "idle" });

  const applyLocationSort = (lat: number, lng: number, baseList: PublicWorkshopData[]) => {
    const withDistances: PublicWorkshopData[] = baseList.map((ws) => {
      const wsLat = ws.latitude ?? -6.2;
      const wsLng = ws.longitude ?? 106.8;
      const distanceKm = computeDistanceKm(lat, lng, wsLat, wsLng);
      return { ...ws, distanceKm };
    });

    withDistances.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    setWorkshops(withDistances);
    setGeoState({
      status: "active",
      userLat: lat,
      userLng: lng,
      nearestCity: withDistances[0]?.city ?? undefined,
    });
  };

  const requestUserLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoState({ status: "denied" });
      return;
    }

    setGeoState((prev) => ({ ...prev, status: "requesting" }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        applyLocationSort(latitude, longitude, getStoredWorkshops());
      },
      (err) => {
        console.warn("Geolocation permission not allowed or unavailable:", err.message);
        setGeoState({ status: "denied" });
        setWorkshops((prev) => shuffleArray(prev));
      },
      { timeout: 9000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    const combined = getStoredWorkshops();

    if (typeof window !== "undefined" && navigator.geolocation) {
      setGeoState({ status: "requesting" });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyLocationSort(pos.coords.latitude, pos.coords.longitude, combined);
        },
        (err) => {
          console.info("Geolocation not granted or timeout, using fair random rotation:", err.message);
          setGeoState({ status: "denied" });
          setWorkshops(shuffleArray(combined));
        },
        { timeout: 7000, enableHighAccuracy: false, maximumAge: 600000 }
      );
    } else {
      setWorkshops(shuffleArray(combined));
    }
  }, []);

  const handleShuffle = () => {
    setGeoState({ status: "idle" });
    const combined = getStoredWorkshops().map((w) => {
      const copy: PublicWorkshopData = { ...w };
      delete copy.distanceKm;
      return copy;
    });
    setWorkshops(shuffleArray(combined));
  };

  const provinces = Array.from(new Set(workshops.map((w) => w.province).filter(Boolean)));
  const categories = Array.from(new Set(workshops.map((w) => w.category).filter(Boolean)));

  const filtered = workshops.filter((ws) => {
    const matchSearch =
      !search ||
      ws.workshopName.toLowerCase().includes(search.toLowerCase()) ||
      ws.city.toLowerCase().includes(search.toLowerCase()) ||
      ws.province.toLowerCase().includes(search.toLowerCase()) ||
      ws.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      ws.services.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchProvince = selectedProvince === "all" || ws.province === selectedProvince;
    const matchCategory = selectedCategory === "all" || ws.category === selectedCategory;

    return matchSearch && matchProvince && matchCategory;
  });

  return (
    <div className="technicians-directory-page">
      <div className="technicians-hero-section">
        <div className="wrap">
          <div className="tech-hero-eyebrow">
            <Store size={14} className="text-sky-600" />
            <span>Bursa Usaha &amp; Mitra Terverifikasi</span>
          </div>
          <h1>Direktori Bengkel AC &amp; Toko Mitra Resmi</h1>
          <p>
            Temukan bengkel pendingin resmi, klinik reparasi modul PCB inverter, dan distributor suku cadang terdaftar di seluruh wilayah Indonesia.
          </p>

          <div className="tech-hero-stats">
            <div className="stat-pill">
              <strong>{workshops.length}+</strong>
              <span>Unit Usaha Terdaftar</span>
            </div>
            <div className="stat-pill">
              <strong>{provinces.length}</strong>
              <span>Provinsi Terjangkau</span>
            </div>
            <div className="stat-pill">
              <strong>100%</strong>
              <span>Teknisi Berlisensi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="technicians-main-content">
        <div className="wrap">
          {/* Search & Filter Toolbar */}
          <div className="tech-search-toolbar">
            <div className="tech-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Cari nama bengkel, toko, layanan, atau kota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="tech-search-input"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="search-clear-btn"
                  aria-label="Hapus pencarian"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="tech-filter-group">
              {/* Geolocation Button */}
              <button
                type="button"
                className={`tech-toggle-btn ${geoState.status === "active" ? "active" : ""}`}
                onClick={requestUserLocation}
                disabled={geoState.status === "requesting"}
                title="Deteksi lokasi saya untuk menampilkan bengkel terdekat"
              >
                <Compass size={13} className={geoState.status === "requesting" ? "animate-spin" : ""} />
                <span>{geoState.status === "active" ? "Lokasi Dekat ✓" : "Dekat Saya"}</span>
              </button>

              {provinces.length > 0 && (
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="tech-select-input"
                  aria-label="Filter berdasarkan provinsi"
                >
                  <option value="all">Semua Wilayah ({provinces.length} Provinsi)</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}

              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="tech-select-input"
                  aria-label="Filter berdasarkan kategori usaha"
                >
                  <option value="all">Semua Kategori ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                className="tech-toggle-btn"
                onClick={handleShuffle}
                title="Acak urutan tampilan agar adil bagi semua anggota"
              >
                <Shuffle size={13} />
                <span>Rotasi Acak</span>
              </button>
            </div>
          </div>

          {/* Member Registration CTA Banner */}
          <div className="workshop-member-cta-banner">
            <div className="banner-left">
              <Sparkles size={22} color="#0284c7" />
              <div>
                <strong>Punya Usaha Bengkel AC atau Toko Sparepart?</strong>
                <p>
                  Pasang iklan dan profil usaha Anda gratis di bursa direktori nasional ini.
                </p>
              </div>
            </div>
            <div className="banner-right">
              <Link href="/join" className="button primary">
                Daftar &amp; Pasang Iklan
              </Link>
            </div>
          </div>

          {/* Workshop Cards Grid */}
          <div className="home-workshops-grid-compact">
            {filtered.length > 0 ? (
              filtered.map((ws) => <PublicWorkshopCard key={ws.id} workshop={ws} />)
            ) : (
              <div className="no-tech-found">
                <Store size={44} className="text-muted" />
                <h3>Tidak ada bengkel/toko ditemukan</h3>
                <p>Coba sesuaikan kata kunci pencarian atau reset filter wilayah.</p>
                <button
                  type="button"
                  className="button secondary reset-filter-btn"
                  onClick={() => {
                    setSearch("");
                    setSelectedProvince("all");
                    setSelectedCategory("all");
                  }}
                >
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DynamicBottomCta
        guestTitle="Daftarkan Usaha Bengkel &amp; Toko Anda di Bursa Nasional"
        guestDescription="Raih pelanggan baru dari seluruh Indonesia dengan kredibilitas lisensi dan sertifikasi kompetensi resmi organisasi."
        guestPrimaryCta={{ label: "Daftar Jadi Anggota", href: "/join" }}
        guestSecondaryCta={{ label: "Verifikasi Anggota Resmi", href: "/verify" }}
      />
    </div>
  );
}

export default function WorkshopsPage() {
  return (
    <Suspense fallback={<div className="wrap" style={{ padding: "80px 0" }}>Memuat bursa bengkel &amp; toko...</div>}>
      <WorkshopsPageContent />
    </Suspense>
  );
}
