import type { Metadata } from "next";
import { getPublicSite } from "../../lib/api";
import { Trophy, Award, Medal, Flag, Star } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Klasemen Kejuaraan & Skill Contest - ${site.organization.name}`,
    description: "Papan peringkat klasemen kejuaraan teknisi pendingin nasional, kontes keterampilan K3, dan pencapaian kontestan.",
  };
}

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

async function getChampionships(): Promise<ChampionshipStanding[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/v1/public/championships`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ChampionshipsPage() {
  const site = await getPublicSite();
  const standings = await getChampionships();

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
            Papan skor resmi kompetisi teknisi pendingin Indonesia. Penghargaan tinggi atas akurasi diagnosis, waktu kerja vakum, dan kepatuhan K3 keselamatan kerja.
          </p>
        </div>
      </section>

      {/* Leaderboard Table Grid */}
      <section className="championships-body">
        <div className="wrap">
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <div className="header-title">
                <Flag size={20} />
                <h2>Klasemen Nasional Musim 2026</h2>
              </div>
              <span className="season-badge">Musim 2026</span>
            </div>

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
                  {standings.length > 0 ? (
                    standings.map((row) => (
                      <tr key={row.id} className={`rank-row rank-${row.rank}`}>
                        <td className="rank-cell">
                          {row.rank === 1 && <Medal className="icon-gold" size={20} />}
                          {row.rank === 2 && <Medal className="icon-silver" size={20} />}
                          {row.rank === 3 && <Medal className="icon-bronze" size={20} />}
                          <span className="rank-num">#{row.rank}</span>
                        </td>
                        <td className="participant-cell">
                          <strong>{row.participantName}</strong>
                          {row.unitName && <span className="unit-tag">{row.unitName}</span>}
                        </td>
                        <td>{row.teamName ?? "-"}</td>
                        <td className="points-cell">
                          <Star size={14} className="icon-star" />
                          <strong>{row.points} Pts</strong>
                        </td>
                        <td className="achievement-cell">{row.achievements ?? "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="empty-td">
                        Belum ada data klasemen kejuaraan yang dipublikasikan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
