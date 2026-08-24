"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  Download,
  FileSpreadsheet,
  Globe2,
  LineChart,
  Percent,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

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

const STATS_EXPLANATIONS: Record<string, { desc: string; benchmark: string }> =
  {
    certified_technicians: {
      desc: "Jumlah teknisi aktif yang telah memegang sertifikat uji kompetensi LSP TPTU / BNSP RI dan teregistrasi dalam KTA digital.",
      benchmark: "Target Nasional 2026: 10.000 Teknisi Tersertifikasi",
    },
    dpd_coverage: {
      desc: "Cakupan kepengurusan Dewan Pimpinan Daerah (DPD) tingkat provinsi di seluruh wilayah Republik Indonesia.",
      benchmark: "100% Wilayah Indonesia Terlayani",
    },
    serviced_units_volume: {
      desc: "Estimasi total unit pendingin udara (AC Split, VRV, Chiller, Cold Storage) yang ditangani oleh teknisi ber-KTA sah setiap bulan.",
      benchmark: "Pertumbuhan Kuartalan Konsisten di atas 20%",
    },
    public_satisfaction_rate: {
      desc: "Hasil survei kepuasan konsumen terhadap kualitas servis, kejujuran takaran freon, dan kejelasan kwitansi bergaransi resmi.",
      benchmark: "Standar Mutu Nasional: Minimum 95.0%",
    },
  };

export default function StatisticsPage() {
  const [statsList, setStatsList] = useState<IndustryStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
        const res = await fetch(`${apiUrl}/v1/public/statistics`);
        if (!res.ok) throw new Error("Gagal memuat data statistik");
        const json = await res.json();
        setStatsList(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchStats();
  }, []);

  const categories = [
    { key: "all", label: "Semua Metrik" },
    { key: "Keanggotaan", label: "Keanggotaan & Sertifikasi" },
    { key: "Organisasi", label: "Sebaran Organisasi" },
    { key: "Layanan", label: "Volume Servis Unit" },
    { key: "Kualitas", label: "Indeks Kepuasan" },
  ];

  const filteredStats = statsList.filter((s) => {
    const matchCategory =
      selectedCategory === "all" ||
      s.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch =
      !search ||
      s.metricLabel.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="statistics-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero stats-hero-master">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <BarChart3 size={15} color="#38bdf8" />
            <span>NATIONAL HVAC/R INDUSTRY DATA CENTER</span>
          </div>

          <h1 className="tech-hero-title">
            Statistik Industri &{" "}
            <span className="text-gradient">Indikator Sektor Sektoral</span>
          </h1>

          <p className="tech-hero-lead">
            Pusat transparansi data pertumbuhan teknisi bersertifikat BNSP,
            sebaran Dewan Pimpinan Daerah (DPD) 38 Provinsi, serta indikator
            kepuasan publik terhadap mutu pengerjaan terverifikasi.
          </p>

          {/* Quick Stat Highlights */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Users size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>8.450+ Teknisi</strong>
                <small>Tersertifikasi BNSP</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Globe2 size={22} color="#34d399" />
              </div>
              <div>
                <strong>38 DPD Provinsi</strong>
                <small>100% Nasional</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Wrench size={22} color="#818cf8" />
              </div>
              <div>
                <strong>142.800 Unit/Bln</strong>
                <small>Servis Terverifikasi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <ShieldCheck size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>98.4% Indeks Kepuasan</strong>
                <small>Garansi KTA Terjamin</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Stats Workspace */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Filter Bar */}
          <div className="directory-controls-row">
            <div className="directory-cat-pills">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`dir-cat-btn ${selectedCategory === cat.key ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="dir-search-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Cari indikator statistik..."
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

          {/* Metric Cards Grid */}
          <div className="stats-modern-grid">
            {filteredStats.length > 0 ? (
              filteredStats.map((stat) => {
                const info = STATS_EXPLANATIONS[stat.metricKey] || {
                  desc: "Indikator kinerja resmi yang dicatat secara berkala oleh sekretariat jenderal asosiasi.",
                  benchmark: "Standar Kualitas Pelayanan Publik",
                };

                return (
                  <div key={stat.id} className="stat-modern-card slide-in-up">
                    <div className="stat-card-top-row">
                      <span className="partner-cat-badge">{stat.category}</span>
                      {stat.period && (
                        <span className="stat-period-badge">
                          <Calendar size={12} />
                          <span>{stat.period}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="stat-card-title">{stat.metricLabel}</h3>

                    <div className="stat-number-display">
                      <span className="stat-big-value">{stat.metricValue}</span>
                      {stat.metricUnit && (
                        <span className="stat-unit-label">
                          {stat.metricUnit}
                        </span>
                      )}
                    </div>

                    {/* Trend Pill */}
                    {stat.trendPercentage && (
                      <div
                        className={`stat-trend-pill ${stat.trendDirection === "up" ? "trend-positive" : stat.trendDirection === "down" ? "trend-negative" : "trend-neutral"}`}
                      >
                        {stat.trendDirection === "up" ? (
                          <ArrowUpRight size={14} />
                        ) : stat.trendDirection === "down" ? (
                          <ArrowDownRight size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        <span>
                          {stat.trendPercentage} vs Periode Sebelumnya
                        </span>
                      </div>
                    )}

                    <p className="stat-card-desc">{info.desc}</p>

                    <div className="stat-card-benchmark">
                      <Sparkles size={13} color="#0284c7" />
                      <span>{info.benchmark}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                <Activity size={48} />
                <h3>Tidak Ada Data Statistik Sesuai Kriteria</h3>
                <p>Silakan gunakan kata kunci pencarian yang lain.</p>
              </div>
            )}
          </div>

          {/* Factsheet & Methodology Assurance Banner */}
          <div
            className="stats-assurance-banner slide-in-up"
            style={{ marginTop: "2rem" }}
          >
            <div className="stats-banner-text">
              <div className="banner-badge">
                <ShieldCheck size={16} />
                <span>INTEGRITAS DATA TERVERIFIKASI</span>
              </div>
              <h3>Metodologi Pengumpulan Data & Buku Besar Digital</h3>
              <p>
                Setiap metrik dihimpun melalui sistem ComplyFlow dari pelaporan
                mandiri 38 DPD, database uji kompetensi LSP TPTU, serta
                transaksi KTA digital yang diaudit secara berkala.
              </p>
            </div>
            <div className="stats-banner-action">
              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  alert("Mengunduh Laporan Statistik Tahunan HVAC/R 2026...")
                }
              >
                <Download size={15} />
                <span>Unduh Lembar Fakta (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Ingin Berkontribusi dalam Pertumbuhan Industri?"
        guestDescription="Daftarkan diri Anda sebagai teknisi bersertifikat resmi atau bergabunglah bersama mitra industri kami."
        guestPrimaryCta={{ label: "Daftar Anggota KTA", href: "/join" }}
        guestSecondaryCta={{
          label: "Cari Teknisi Terdekat",
          href: "/technicians",
        }}
        memberTitle="Akses Dashboard Analitik Wilayah DPD"
        memberDescription="Pengurus DPD dan Pokja dapat mengakses data spasial teknisi dan statistik sertifikasi wilayah di portal pengurus."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{
          label: "Direktori Klub & Workshop",
          href: "/clubs",
        }}
      />
    </div>
  );
}
