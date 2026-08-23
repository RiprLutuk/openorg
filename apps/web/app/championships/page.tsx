"use client";

import {
  Award,
  Calendar,
  Compass,
  Crown,
  Flag,
  Flame,
  Gauge,
  Loader2,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

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

export default function ChampionshipsPage() {
  const [standings, setStandings] = useState<ChampionshipStanding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number>(2026);

  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiUrl}/v1/public/championships`);
        if (!res.ok) throw new Error("Gagal memuat data kejuaraan");
        const json = await res.json();
        setStandings(json.data ?? []);
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

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      row.participantName.toLowerCase().includes(q) ||
      row.unitName?.toLowerCase().includes(q) ||
      row.teamName?.toLowerCase().includes(q) ||
      row.category?.toLowerCase().includes(q) ||
      row.achievements?.toLowerCase().includes(q)
    );
  });

  const topPodium = filtered.slice(0, 3);

  return (
    <div className="championships-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero champ-hero-master">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill trophy">
            <Trophy size={15} color="#f59e0b" />
            <span>NATIONAL HVAC/R SKILL COMPETITION 2026</span>
          </div>

          <h1 className="tech-hero-title">
            Klasemen Kejuaraan &{" "}
            <span className="text-gradient">Skill Contest Teknisi</span>
          </h1>

          <p className="tech-hero-lead">
            Papan peringkat resmi kontes keterampilan refrigerasi dan tata udara
            tingkat nasional. Pengujian ketat akurasi sambungan brazing
            nitrogen, kecepatan uji vakum &lt;500µ, serta presisi diagnosis
            modul inverter.
          </p>

          {/* Key Metrics Row */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Trophy size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>Standar WorldSkills</strong>
                <small>Uji Presisi Sektoral</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Gauge size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>Vakum &lt;500 Micron</strong>
                <small>Pengujian Ketat K3</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Flag size={22} color="#34d399" />
              </div>
              <div>
                <strong>Kontingen 38 DPD</strong>
                <small>Juara Daerah & Nasional</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Star size={22} color="#818cf8" />
              </div>
              <div>
                <strong>Poin Akumulasi KTA</strong>
                <small>Kredit Prestasi Master</small>
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
                onClick={() => setSelectedSeason(2026)}
              >
                <Trophy size={14} />
                <span>Musim 2026 (Aktif)</span>
              </button>
              <button
                type="button"
                className={`dir-cat-btn ${selectedSeason === 2025 ? "active" : ""}`}
                onClick={() => setSelectedSeason(2025)}
              >
                <Calendar size={14} />
                <span>Musim 2025</span>
              </button>
            </div>

            <div className="dir-search-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Cari kontestan, kontingen DPD, atau bengkel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch("")}
                  aria-label="Bersihkan pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Top 3 Podium Cards */}
          {topPodium.length > 0 && !search && (
            <div className="podium-grid slide-in-up mb-8">
              {topPodium.map((pod, idx) => (
                <div
                  key={pod.id}
                  className={`podium-card rank-${pod.rank} ${pod.rank === 1 ? "champion-card" : ""}`}
                >
                  <div className="podium-rank-badge">
                    {pod.rank === 1 ? (
                      <Crown size={20} color="#f59e0b" />
                    ) : pod.rank === 2 ? (
                      <Medal size={20} color="#94a3b8" />
                    ) : (
                      <Medal size={20} color="#b45309" />
                    )}
                    <span>Peringkat #{pod.rank}</span>
                  </div>

                  <div className="podium-avatar">
                    <Users size={28} />
                  </div>

                  <h3 className="podium-name">{pod.participantName}</h3>
                  {pod.teamName && (
                    <p className="podium-team">{pod.teamName}</p>
                  )}

                  <div className="podium-points-chip">
                    <Star size={14} />
                    <span>{pod.points} Total Poin</span>
                  </div>

                  {pod.achievements && (
                    <div className="podium-achievement-box">
                      <Sparkles size={13} color="#f59e0b" />
                      <span>{pod.achievements}</span>
                    </div>
                  )}
                </div>
              ))}
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
                {filtered.length} Kontestan Tercatat
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 size={32} className="animate-spin text-muted" />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="leaderboard-custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: "90px" }}>Posisi</th>
                      <th>Nama Kontestan & Bengkel</th>
                      <th>Kontingen DPD / Tim</th>
                      <th style={{ width: "140px" }}>Total Poin</th>
                      <th>Kualifikasi & Keunggulan Uji</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((row) => (
                        <tr
                          key={row.id}
                          className={`leaderboard-row row-rank-${row.rank}`}
                        >
                          <td className="rank-td">
                            <span className={`rank-chip rank-chip-${row.rank}`}>
                              #{row.rank}
                            </span>
                          </td>
                          <td className="contestant-td">
                            <strong>{row.participantName}</strong>
                            {row.unitName && (
                              <span className="workshop-chip">
                                {row.unitName}
                              </span>
                            )}
                          </td>
                          <td className="team-td">
                            <span className="team-pill">
                              {row.teamName ?? "Mandiri"}
                            </span>
                          </td>
                          <td className="points-td">
                            <div className="points-wrap">
                              <Star size={13} color="#f59e0b" />
                              <strong>{row.points} Pts</strong>
                            </div>
                          </td>
                          <td className="achievement-td">
                            {row.achievements ? (
                              <span className="achievement-badge">
                                {row.achievements}
                              </span>
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
            )}
          </div>
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
