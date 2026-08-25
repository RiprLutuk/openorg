"use client";

import {
  Building2,
  Calendar,
  CheckCircle2,
  Crown,
  Flag,
  Gauge,
  Loader2,
  MapPin,
  Medal,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { ServerPagination } from "@/components/server-pagination";

interface ChampionshipStanding {
  id: string;
  seasonYear: number;
  category: string;
  participantName: string;
  teamName: string | null;
  unitName: string | null;
  points: number;
  rank: number;
  achievements: string | null;
}

export const FALLBACK_CHAMPIONSHIPS: ChampionshipStanding[] = [
  // Musim 2026 (16 Kontestan Nasional)
  {
    id: "champ-2026-01",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Budi Kurniawan",
    teamName: "APTI DPD DKI Jakarta - Team Alpha",
    unitName: "DPD DKI Jakarta",
    points: 480,
    rank: 1,
    achievements:
      "Juara 1 Troubleshooting Inverter AC & Waktu Vakum Tercepat (08:42 menit)",
  },
  {
    id: "champ-2026-02",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Agus Pratama",
    teamName: "APTI DPD Jawa Barat - Bandung Technicians",
    unitName: "DPD Jawa Barat",
    points: 445,
    rank: 2,
    achievements: "Juara 2 K3 Safety & Prosedur Brazing Tembaga Tanpa Oksidasi",
  },
  {
    id: "champ-2026-03",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Dewi Lestari",
    teamName: "APTI DPD Jawa Tengah - Semarang Cold Chain",
    unitName: "DPD Jawa Tengah",
    points: 410,
    rank: 3,
    achievements: "Juara 3 Perancangan Cold Room Industri Farmasi",
  },
  {
    id: "champ-2026-04",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Rian Hidayat",
    teamName: "APTI DPD Jawa Timur - Surabaya Cool Team",
    unitName: "DPD Jawa Timur",
    points: 395,
    rank: 4,
    achievements:
      "Juara 4 Instalasi VRF Multi-Split & Setting Centralized Controller",
  },
  {
    id: "champ-2026-05",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Fajar Nugroho",
    teamName: "APTI DPD DI Yogyakarta - Jogja HVAC Squad",
    unitName: "DPD DI Yogyakarta",
    points: 380,
    rank: 5,
    achievements:
      "Juara 5 Evakuasi & Recovery Refrigerant Ramah Lingkungan R32",
  },
  {
    id: "champ-2026-06",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Muhammad Farhan",
    teamName: "APTI DPD Banten - Tangerang Industrial Pro",
    unitName: "DPD Banten",
    points: 365,
    rank: 6,
    achievements:
      "Juara 6 Uji Kebocoran Tekanan Tinggi Nitrogen Kering 500 PSI",
  },
  {
    id: "champ-2026-07",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "I Wayan Sudarma",
    teamName: "APTI DPD Bali - Denpasar Hospitality Cool",
    unitName: "DPD Bali",
    points: 350,
    rank: 7,
    achievements: "Juara 7 Kalibrasi Thermostat Smart Inverter & Sensor Suhu",
  },
  {
    id: "champ-2026-08",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Hendra Saputra",
    teamName: "APTI DPD Sumatera Utara - Medan Cool Engineering",
    unitName: "DPD Sumatera Utara",
    points: 340,
    rank: 8,
    achievements: "Juara 8 Flaring & Swaging Pipa Tembaga Presisi Tanpa Retak",
  },
  {
    id: "champ-2026-09",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Andi Wijaya",
    teamName: "APTI DPD Sulawesi Selatan - Makassar Refrigerasi",
    unitName: "DPD Sulawesi Selatan",
    points: 325,
    rank: 9,
    achievements: "Juara 9 Pengelasan Perak 45% Pipa Suction Chiller Industri",
  },
  {
    id: "champ-2026-10",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Rizky Ramadhan",
    teamName: "APTI DPD Riau - Pekanbaru Aircon Tech",
    unitName: "DPD Riau",
    points: 315,
    rank: 10,
    achievements: "Finalis Uji Teori Termodinamika & Diagram Psikrometrik",
  },
  {
    id: "champ-2026-11",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Eko Prasetyo",
    teamName: "APTI DPD Kalimantan Timur - Balikpapan Energy Cool",
    unitName: "DPD Kalimantan Timur",
    points: 300,
    rank: 11,
    achievements: "Finalis Uji Praktik Wiring Kelistrikan 3-Phase Kompresor",
  },
  {
    id: "champ-2026-12",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Dedi Hermanto",
    teamName: "APTI DPD Sumatera Selatan - Palembang Cooling Pro",
    unitName: "DPD Sumatera Selatan",
    points: 290,
    rank: 12,
    achievements: null,
  },
  {
    id: "champ-2026-13",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Anton Setiawan",
    teamName: "APTI DPD Lampung - Bandar Lampung Service",
    unitName: "DPD Lampung",
    points: 280,
    rank: 13,
    achievements: null,
  },
  {
    id: "champ-2026-14",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Ilham Maulana",
    teamName: "APTI DPD NTB - Mataram Cold Solution",
    unitName: "DPD Nusa Tenggara Barat",
    points: 270,
    rank: 14,
    achievements: null,
  },
  {
    id: "champ-2026-15",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Surya Darmawan",
    teamName: "APTI DPD Kalimantan Barat - Pontianak Aircon",
    unitName: "DPD Kalimantan Barat",
    points: 260,
    rank: 15,
    achievements: null,
  },
  {
    id: "champ-2026-16",
    seasonYear: 2026,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
    participantName: "Ahmad Zulkarnain",
    teamName: "APTI DPD Aceh - Serambi HVAC Team",
    unitName: "DPD Aceh",
    points: 250,
    rank: 16,
    achievements: null,
  },

  // Musim 2025 (10 Kontestan Historis)
  {
    id: "champ-2025-01",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "Agus Pratama",
    teamName: "APTI DPD Jawa Barat - Bandung Technicians",
    unitName: "DPD Jawa Barat",
    points: 490,
    rank: 1,
    achievements: "Juara 1 Nasional Skill Contest 2025 & Best K3 Award",
  },
  {
    id: "champ-2025-02",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "Budi Kurniawan",
    teamName: "APTI DPD DKI Jakarta - Team Alpha",
    unitName: "DPD DKI Jakarta",
    points: 475,
    rank: 2,
    achievements: "Juara 2 Kategori Troubleshooting VRV & Chillers",
  },
  {
    id: "champ-2025-03",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "Rian Hidayat",
    teamName: "APTI DPD Jawa Timur - Surabaya Cool Team",
    unitName: "DPD Jawa Timur",
    points: 430,
    rank: 3,
    achievements: "Juara 3 Kategori Pengelasan Brazing Bebas Oksidasi",
  },
  {
    id: "champ-2025-04",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "Dewi Lestari",
    teamName: "APTI DPD Jawa Tengah - Semarang Cold Chain",
    unitName: "DPD Jawa Tengah",
    points: 415,
    rank: 4,
    achievements: "Juara Harapan 1 Desain Cold Storage",
  },
  {
    id: "champ-2025-05",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "Hendra Saputra",
    teamName: "APTI DPD Sumatera Utara - Medan Cool Engineering",
    unitName: "DPD Sumatera Utara",
    points: 390,
    rank: 5,
    achievements: "Juara Harapan 2 Retrofit Refrigerant",
  },
  {
    id: "champ-2025-06",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "I Wayan Sudarma",
    teamName: "APTI DPD Bali - Denpasar Hospitality Cool",
    unitName: "DPD Bali",
    points: 370,
    rank: 6,
    achievements: null,
  },
  {
    id: "champ-2025-07",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "Fajar Nugroho",
    teamName: "APTI DPD DI Yogyakarta - Jogja HVAC Squad",
    unitName: "DPD DI Yogyakarta",
    points: 355,
    rank: 7,
    achievements: null,
  },
  {
    id: "champ-2025-08",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "Muhammad Farhan",
    teamName: "APTI DPD Banten - Tangerang Industrial Pro",
    unitName: "DPD Banten",
    points: 340,
    rank: 8,
    achievements: null,
  },
  {
    id: "champ-2025-09",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "Andi Wijaya",
    teamName: "APTI DPD Sulawesi Selatan - Makassar Refrigerasi",
    unitName: "DPD Sulawesi Selatan",
    points: 320,
    rank: 9,
    achievements: null,
  },
  {
    id: "champ-2025-10",
    seasonYear: 2025,
    category:
      "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2025)",
    participantName: "Eko Prasetyo",
    teamName: "APTI DPD Kalimantan Timur - Balikpapan Energy Cool",
    unitName: "DPD Kalimantan Timur",
    points: 305,
    rank: 10,
    achievements: null,
  },
];

const ITEMS_PER_PAGE_CHAMPIONSHIPS = 8;

export function ChampionshipsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [standings, setStandings] = useState<ChampionshipStanding[]>(
    FALLBACK_CHAMPIONSHIPS,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(
    FALLBACK_CHAMPIONSHIPS.length,
  );

  // URL-driven query parameters
  const pageParam = searchParams.get("page");
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const searchParam = searchParams.get("q") ?? "";
  const seasonParam = searchParams.get("season");
  const selectedSeason = seasonParam ? parseInt(seasonParam, 10) : 2026;

  const [search, setSearch] = useState(searchParam);

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (
        val === null ||
        val === "" ||
        (key === "page" && val === "1") ||
        (key === "season" && val === "2026")
      ) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleSeasonChange = (season: number) => {
    updateQueryParams({ season: season.toString(), page: "1" });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateQueryParams({ q: val ? val : null, page: "1" });
  };

  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
        const res = await fetch(`${apiUrl}/v1/public/championships?limit=100`);
        if (!res.ok) throw new Error("Gagal memuat data kejuaraan");
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          setStandings(json.data);
          setTotalCount(json.data.length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchChampionships();
  }, []);

  const filtered = standings.filter((row) => {
    const matchSeason = !row.seasonYear || row.seasonYear === selectedSeason;
    if (!matchSeason) return false;

    if (!searchParam) return true;
    const q = searchParam.toLowerCase();
    return (
      row.participantName.toLowerCase().includes(q) ||
      row.unitName?.toLowerCase().includes(q) ||
      row.teamName?.toLowerCase().includes(q) ||
      row.category?.toLowerCase().includes(q) ||
      row.achievements?.toLowerCase().includes(q)
    );
  });

  const totalFilteredCount = filtered.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredCount / ITEMS_PER_PAGE_CHAMPIONSHIPS),
  );
  const paginatedRows = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE_CHAMPIONSHIPS,
    currentPage * ITEMS_PER_PAGE_CHAMPIONSHIPS,
  );

  const topPodium = filtered.slice(0, 3);

  return (
    <div className="championships-page-suite">
      {/* 1. Flagship 2-Column Split Hero Header */}
      <header className="tech-hero">
        <div className="wrap hero-split-grid">
          <div className="tech-hero-inner">
            <div className="tech-hero-pill trophy">
              <Trophy size={14} color="#f59e0b" />
              <span>NATIONAL HVAC/R SKILL COMPETITION 2026</span>
            </div>

            <h1 className="tech-hero-title">
              Klasemen Kejuaraan &{" "}
              <span className="text-gradient">Skill Contest Teknisi</span>
            </h1>

            <p className="tech-hero-lead">
              Papan peringkat resmi kontes keterampilan refrigerasi dan tata
              udara tingkat nasional. Pengujian ketat akurasi sambungan brazing
              nitrogen, kecepatan uji vakum &lt;500µ, serta presisi diagnosis
              modul inverter.
            </p>
          </div>

          {/* Right Column: Hero Metrics Bento Card */}
          <div className="hero-stats-bento-card">
            <div className="stats-card-header">
              <span className="stats-card-badge">WorldSkills Standard</span>
              <span className="stats-card-status">● Live Leaderboard</span>
            </div>
            <div className="stats-card-grid">
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{
                    background: "rgba(245, 158, 11, 0.12)",
                    color: "#f59e0b",
                  }}
                >
                  <Trophy size={20} />
                </div>
                <div>
                  <strong>WorldSkills</strong>
                  <small>Uji Presisi Sektoral</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{
                    background: "rgba(2, 132, 199, 0.12)",
                    color: "#38bdf8",
                  }}
                >
                  <Gauge size={20} />
                </div>
                <div>
                  <strong>&lt; 500 Micron</strong>
                  <small>Uji Vakum K3</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#34d399",
                  }}
                >
                  <Flag size={20} />
                </div>
                <div>
                  <strong>38 DPD Kontingen</strong>
                  <small>Juara Nasional</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "#818cf8",
                  }}
                >
                  <Star size={20} />
                </div>
                <div>
                  <strong>Poin KTA</strong>
                  <small>Kredit Prestasi</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content & Leaderboard Section */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Controls Bar: Season Pills & Search */}
          <div className="directory-controls-row">
            <div className="directory-cat-pills">
              <button
                type="button"
                className={`dir-cat-btn ${selectedSeason === 2026 ? "active" : ""}`}
                onClick={() => handleSeasonChange(2026)}
              >
                <Trophy size={14} />
                <span>Musim 2026 (Aktif)</span>
              </button>
              <button
                type="button"
                className={`dir-cat-btn ${selectedSeason === 2025 ? "active" : ""}`}
                onClick={() => handleSeasonChange(2025)}
              >
                <Calendar size={14} />
                <span>Musim 2025</span>
              </button>
            </div>

            <div className="dir-search-wrap">
              <Search size={16} />
              <input
                id="championships-search-input"
                name="championshipsSearch"
                type="text"
                placeholder="Cari kontestan, kontingen DPD, atau bengkel..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Cari kontestan, kontingen DPD, atau bengkel"
              />
              {search && (
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

          {/* Top 3 Champion Podium Cards */}
          {topPodium.length > 0 && !searchParam && currentPage === 1 && (
            <div className="podium-grid slide-in-up mb-8">
              {topPodium.map((pod) => {
                const isGold = pod.rank === 1;
                const isSilver = pod.rank === 2;
                const rankLabel = isGold
                  ? "JUARA 1 NASIONAL"
                  : isSilver
                    ? "RUNNER-UP #2"
                    : "PERINGKAT #3";

                const initials = pod.participantName
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <article
                    key={pod.id}
                    className={`podium-card rank-${pod.rank} ${isGold ? "champion-card" : ""}`}
                  >
                    {/* Top Metallic Accent Line */}
                    <div className="podium-accent-line" />

                    {/* Background Watermark Crest */}
                    <div className="podium-watermark" aria-hidden="true">
                      {isGold ? (
                        <Crown size={110} />
                      ) : isSilver ? (
                        <Medal size={110} />
                      ) : (
                        <Trophy size={110} />
                      )}
                    </div>

                    {/* Header Rank Badge */}
                    <div className="podium-card-header">
                      <div className="podium-rank-badge">
                        {isGold ? <Crown size={15} /> : <Medal size={15} />}
                        <span>{rankLabel}</span>
                      </div>
                      <span className="podium-season-tag">
                        Musim {pod.seasonYear}
                      </span>
                    </div>

                    {/* Champion Avatar Frame */}
                    <div className="podium-avatar-wrapper">
                      <div className="podium-avatar">
                        <span className="podium-avatar-initials">
                          {initials}
                        </span>
                      </div>
                      <span className="podium-avatar-rank-pill">
                        #{pod.rank}
                      </span>
                    </div>

                    {/* Identity & Team Name */}
                    <div className="podium-identity-block">
                      <h3 className="podium-name">{pod.participantName}</h3>
                      {pod.teamName && (
                        <div className="podium-team-badge" title={pod.teamName}>
                          <Building2 size={12} className="flex-shrink-0" />
                          <span>{pod.teamName}</span>
                        </div>
                      )}
                    </div>

                    {/* Score & Points Bento Display */}
                    <div className="podium-score-bento">
                      <div className="score-icon-wrap">
                        {isGold ? (
                          <Trophy size={17} color="#d97706" />
                        ) : (
                          <Star size={17} color="#0284c7" />
                        )}
                      </div>
                      <div className="score-text-wrap">
                        <span className="score-num">{pod.points}</span>
                        <span className="score-unit">POIN</span>
                      </div>
                      <span className="score-category-chip">
                        {pod.category || "HVAC/R"}
                      </span>
                    </div>

                    {/* Citation / Official Achievement Box */}
                    {pod.achievements && (
                      <div className="podium-achievement-box">
                        <div className="achievement-icon">
                          <Sparkles size={14} />
                        </div>
                        <p className="achievement-text">{pod.achievements}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* Full Leaderboard Card Table */}
          <div
            className="leaderboard-table-card slide-in-up"
            style={{ marginTop: "2.25rem" }}
          >
            <div className="leaderboard-table-header">
              <div className="table-header-title">
                <Flag size={18} color="#0284c7" />
                <h3>Papan Skor Nasional Musim {selectedSeason}</h3>
              </div>
              <span className="partner-cat-badge">
                {totalFilteredCount} Kontestan Tercatat
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 size={32} className="animate-spin text-muted" />
              </div>
            ) : (
              <>
                {/* 1. Desktop Table View (Visible >= 641px) */}
                <div className="table-responsive leaderboard-desktop-view">
                  <table className="leaderboard-custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: "90px" }}>Posisi</th>
                        <th>Nama Kontestan &amp; Bengkel</th>
                        <th>Kontingen DPD / Tim</th>
                        <th style={{ width: "140px" }}>Total Poin</th>
                        <th>Kualifikasi &amp; Keunggulan Uji</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.length > 0 ? (
                        paginatedRows.map((row) => (
                          <tr
                            key={row.id}
                            className={`leaderboard-row row-rank-${row.rank}`}
                          >
                            <td className="rank-td">
                              <span
                                className={`rank-chip rank-chip-${row.rank}`}
                              >
                                #{row.rank}
                              </span>
                            </td>
                            <td className="contestant-td">
                              <div className="contestant-info">
                                <strong className="contestant-name">
                                  {row.participantName}
                                </strong>
                                {row.unitName && (
                                  <span className="workshop-chip">
                                    {row.unitName}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="team-td">
                              <div className="team-cell">
                                <MapPin size={13} color="#64748b" />
                                <span>{row.teamName ?? "Mandiri"}</span>
                              </div>
                            </td>
                            <td className="points-td">
                              <div className="points-wrap">
                                <Star
                                  size={13}
                                  color="#f59e0b"
                                  fill="#f59e0b"
                                />
                                <strong>{row.points} Pts</strong>
                              </div>
                            </td>
                            <td className="achievement-td">
                              {row.achievements ? (
                                <div className="achievement-clean-badge">
                                  <CheckCircle2
                                    size={13}
                                    color="#16a34a"
                                    style={{ flexShrink: 0 }}
                                  />
                                  <span>{row.achievements}</span>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="empty-table-cell">
                            <Trophy
                              size={36}
                              color="#94a3b8"
                              style={{ margin: "0 auto 8px" }}
                            />
                            <p>
                              Tidak ada kontestan yang sesuai dengan kriteria
                              pencarian.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 2. Mobile Cards View (Visible <= 640px) */}
                <div className="leaderboard-mobile-list">
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row) => (
                      <div
                        key={row.id}
                        className={`leaderboard-mobile-card rank-${row.rank}`}
                      >
                        <div className="mobile-card-top-row">
                          <div className="mobile-rank-badge-wrap">
                            <span className={`rank-chip rank-chip-${row.rank}`}>
                              #{row.rank}
                            </span>
                            <span className="mobile-contestant-name">
                              {row.participantName}
                            </span>
                          </div>
                          <div className="mobile-points-badge">
                            <Star
                              size={12}
                              color="#f59e0b"
                              fill="#f59e0b"
                              style={{ flexShrink: 0 }}
                            />
                            <span>{row.points} Pts</span>
                          </div>
                        </div>

                        <div className="mobile-card-meta-row">
                          <div className="mobile-meta-item">
                            <MapPin
                              size={12}
                              className="text-slate-400 flex-shrink-0"
                            />
                            <span>{row.teamName ?? "Mandiri"}</span>
                          </div>
                          {row.unitName && (
                            <div className="mobile-meta-item">
                              <Building2
                                size={12}
                                className="text-slate-400 flex-shrink-0"
                              />
                              <span>{row.unitName}</span>
                            </div>
                          )}
                        </div>

                        {row.achievements && (
                          <div className="mobile-card-achievement">
                            <CheckCircle2
                              size={12}
                              className="text-emerald-600 flex-shrink-0"
                            />
                            <span>{row.achievements}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-table-cell">
                      <Trophy
                        size={32}
                        color="#94a3b8"
                        style={{ margin: "0 auto 8px" }}
                      />
                      <p>
                        Tidak ada kontestan yang sesuai dengan kriteria
                        pencarian.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Server-Side Pagination Bar */}
          <ServerPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFilteredCount}
            pageSize={ITEMS_PER_PAGE_CHAMPIONSHIPS}
            itemName="Kontestan"
          />
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Ingin Mewakili Daerah Anda di Kontes Keterampilan 2026?"
        guestDescription="Ikuti seleksi daerah melalui DPD dan buktikan keahlian teknis Anda di panggung kompetisi nasional."
        guestPrimaryCta={{ label: "Daftar Anggota Teknisi", href: "/join" }}
        guestSecondaryCta={{
          label: "Jadwal Workshop & Uji",
          href: "/events",
        }}
        memberTitle="Poin Kejuaraan Menambah Reputasi KTA Anda"
        memberDescription="Peringkat dan medali kejuaraan akan disematkan secara resmi pada profil KTA digital Anda di direktori publik."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{ label: "Verifikasi KTA", href: "/verify" }}
      />
    </div>
  );
}

export default function ChampionshipsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-32">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      }
    >
      <ChampionshipsPageContent />
    </Suspense>
  );
}
