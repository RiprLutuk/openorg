"use client";

import {
  ArrowRight,
  Clock,
  Filter,
  MapPin,
  MessageSquare,
  Navigation,
  Search,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Store,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { NATIONAL_16_WORKSHOPS } from "@/components/home-featured-workshops";
import { PublicWorkshopCard, type PublicWorkshopData } from "@/components/public-workshop-card";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

function WorkshopsPageContent() {
  const [workshops, setWorkshops] = useState<PublicWorkshopData[]>(NATIONAL_16_WORKSHOPS);
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    try {
      let combined = [...NATIONAL_16_WORKSHOPS];
      const stored = localStorage.getItem("openorg_member_workshops_list");
      if (stored) {
        const parsed: PublicWorkshopData[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const memberNums = new Set(parsed.map((p) => p.memberNumber));
          const baseWithoutDuplicates = combined.filter((w) => !memberNums.has(w.memberNumber));
          combined = [...parsed, ...baseWithoutDuplicates];
        }
      }
      setWorkshops(shuffleArray(combined));
    } catch {
      setWorkshops(shuffleArray(NATIONAL_16_WORKSHOPS));
    }
  }, []);

  const handleShuffle = () => {
    setWorkshops((prev) => shuffleArray(prev));
  };

  const provinces = Array.from(new Set(workshops.map((w) => w.province).filter(Boolean)));
  const categories = Array.from(new Set(workshops.map((w) => w.category).filter(Boolean)));

  const filtered = workshops.filter((w) => {
    const matchSearch =
      !search ||
      w.workshopName.toLowerCase().includes(search.toLowerCase()) ||
      w.tagline.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase()) ||
      w.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      w.memberNumber.toLowerCase().includes(search.toLowerCase()) ||
      w.services.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchProvince = selectedProvince === "all" || w.province === selectedProvince;
    const matchCategory = selectedCategory === "all" || w.category === selectedCategory;

    return matchSearch && matchProvince && matchCategory;
  });

  return (
    <div className="technicians-page-suite bengkel-page-suite">
      {/* 1. Hero Header */}
      <header className="tech-hero">
        <div className="wrap hero-split-grid">
          <div className="tech-hero-inner">
            <div className="tech-hero-pill">
              <Store size={14} color="#0284c7" />
              <span>BURSA BENGKEL &amp; TOKO RESMI NASIONAL</span>
            </div>

            <h1 className="tech-hero-title">
              Direktori Bengkel AC &amp; Toko Suku Cadang{" "}
              <span className="text-gradient">Terverifikasi</span>
            </h1>

            <p className="tech-hero-lead">
              Temukan {workshops.length}+ bengkel AC resmi, klinik modul inverter, dan penyedia suku cadang mitra anggota terdaftar di seluruh Indonesia.
            </p>
          </div>

          <div className="tech-hero-stats-panel">
            <div className="hero-stat-box">
              <strong>{workshops.length}+</strong>
              <small>Bengkel &amp; Toko Resmi</small>
            </div>
            <div className="hero-stat-box">
              <strong>{provinces.length || 38}</strong>
              <small>Cakupan Provinsi</small>
            </div>
            <div className="hero-stat-box">
              <strong>100%</strong>
              <small>KTA Anggota Sah</small>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Directory Suite */}
      <main className="tech-directory-main section-space">
        <div className="wrap">
          {/* Search & Filter Bar */}
          <div className="tech-controls-wrapper">
            <div className="tech-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Cari nama bengkel, keahlian PCB/inverter, kota, atau nomor KTA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Cari bengkel atau toko"
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

            <div className="tech-filters-group">
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
      </main>

      <DynamicBottomCta
        guestTitle="Daftarkan Bengkel &amp; Toko Resmi Anda Sekarang"
        guestDescription="Nikmati benefit promosi bursa direktori nasional, sertifikasi BNSP, dan akses jaringan kerja sama proyek."
        guestPrimaryCta={{ label: "Gabung Jadi Anggota", href: "/join" }}
        guestSecondaryCta={{ label: "Pelajari Regulasi", href: "/regulations" }}
        memberTitle="Promosikan Bengkel &amp; Toko Anda ke Seluruh Indonesia"
        memberDescription="Perbarui profil bengkel, titik maps, dan kontak WhatsApp Anda langsung melalui portal anggota."
        memberPrimaryCta={{ label: "Kelola Iklan Bengkel", href: "/member" }}
      />
    </div>
  );
}

export default function BengkelPage() {
  return (
    <Suspense fallback={<div className="wrap section-space"><p>Memuat direktori bengkel...</p></div>}>
      <WorkshopsPageContent />
    </Suspense>
  );
}
