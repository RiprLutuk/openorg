"use client";

import { Flag, Loader2, Medal, Search, Star, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiUrl}/v1/public/championships`);
        if (!res.ok) throw new Error("Failed to load championships");
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
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      row.participantName.toLowerCase().includes(q) ||
      row.unitName?.toLowerCase().includes(q) ||
      row.teamName?.toLowerCase().includes(q) ||
      row.achievements?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="championships-hero">
        <div className="wrap">
          <div className="hero-pill trophy">
            <Trophy size={14} />
            <span>National Skill Competition Standings 2026</span>
          </div>
          <h1>Klasemen Kejuaraan & Kontes Keterampilan</h1>
          <p className="hero-lead">
            Papan skor resmi kompetisi teknisi pendingin Indonesia. Penghargaan
            tinggi atas akurasi diagnosis, waktu kerja vakum, dan kepatuhan K3
            keselamatan kerja.
          </p>
        </div>
      </section>

      {/* Leaderboard Table Grid */}
      <section className="championships-body">
        <div className="wrap">
          {/* Search Bar */}
          <div className="directory-filter-bar mb-6">
            <div className="search-input-wrap flex-1">
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari nama kontestan, DPD kontingen, atau kategori prestasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="directory-search-input"
              />
            </div>
          </div>

          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <div className="header-title">
                <Flag size={20} />
                <h2>Klasemen Nasional Musim 2026</h2>
              </div>
              <span className="season-badge">Musim 2026</span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 size={32} className="animate-spin text-muted" />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Peringkat</th>
                      <th>Nama Kontestan</th>
                      <th>Tim / Kontingon DPD</th>
                      <th>Total Poin</th>
                      <th>Pencapaian Prestasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((row) => (
                        <tr
                          key={row.id}
                          className={`rank-row rank-${row.rank}`}
                        >
                          <td className="rank-cell">
                            {row.rank === 1 && (
                              <Medal className="icon-gold" size={20} />
                            )}
                            {row.rank === 2 && (
                              <Medal className="icon-silver" size={20} />
                            )}
                            {row.rank === 3 && (
                              <Medal className="icon-bronze" size={20} />
                            )}
                            <span className="rank-num">#{row.rank}</span>
                          </td>
                          <td className="participant-cell">
                            <strong>{row.participantName}</strong>
                            {row.unitName && (
                              <span className="unit-tag">{row.unitName}</span>
                            )}
                          </td>
                          <td>{row.teamName ?? "-"}</td>
                          <td className="points-cell">
                            <Star size={14} className="icon-star" />
                            <strong>{row.points} Pts</strong>
                          </td>
                          <td className="achievement-cell">
                            {row.achievements ?? "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="empty-td">
                          {search
                            ? "Tidak ada kontestan yang sesuai pencarian."
                            : "Belum ada data klasemen kejuaraan yang dipublikasikan."}
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
    </div>
  );
}
