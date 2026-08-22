import type { Metadata } from "next";
import { getPublicSite } from "../../lib/api";
import { BarChart3, TrendingUp, ShieldCheck, Activity, Users, Globe2, Layers } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Statistik Industri & Indikator Sektor - ${site.organization.name}`,
    description: "Dashboard publik indikator perkembangan sektor, sebaran teknisi BNSP, volume servis terverifikasi, dan metrik kepercayaan publik.",
  };
}

interface IndustryStatistic {
  id: string;
  metricKey: string;
  metricLabel: string;
  metricValue: string;
  metricUnit: string | null;
  trendDirection: "up" | "down" | "stable" | null;
  trendPercentage: string | null;
  category: string;
  period: string | null;
}

async function getStatistics(): Promise<IndustryStatistic[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/v1/public/statistics`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function StatisticsPage() {
  const site = await getPublicSite();
  const statsList = await getStatistics();

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="statistics-hero">
        <div className="wrap">
          <div className="hero-pill chart">
            <BarChart3 size={14} />
            <span>Real-time Industry Data Center</span>
          </div>
          <h1>Statistik Industri & Indikator Performa Sektor</h1>
          <p className="hero-lead">
            Metrik data nasional pertumbuhan jumlah teknisi bersertifikat, sebaran kepengurusan DPD 38 Provinsi, serta indeks kepuasan publik terhadap layanan terverifikasi.
          </p>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="statistics-body">
        <div className="wrap">
          <div className="stats-metric-grid">
            {statsList.length > 0 ? (
              statsList.map((stat) => (
                <div key={stat.id} className="stat-metric-card">
                  <div className="stat-card-top">
                    <span className="stat-category-pill">{stat.category}</span>
                    {stat.period && <span className="stat-period-tag">{stat.period}</span>}
                  </div>
                  <h3 className="stat-label">{stat.metricLabel}</h3>
                  <div className="stat-value-wrap">
                    <span className="stat-value">{stat.metricValue}</span>
                    {stat.metricUnit && <span className="stat-unit">{stat.metricUnit}</span>}
                  </div>
                  {stat.trendPercentage && (
                    <div className={`stat-trend trend-${stat.trendDirection}`}>
                      <TrendingUp size={14} />
                      <span>{stat.trendPercentage} dari kuartal sebelumnya</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Activity size={48} />
                <h3>Belum Ada Data Statistik</h3>
                <p>Metrik data industri akan dipublikasikan secara berkala oleh sekretariat pusat.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
