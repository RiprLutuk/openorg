"use client";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ExternalLink,
  Flag,
  Loader2,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

interface Club {
  id: string;
  clubName: string;
  codeTkt: string;
  province: string;
  category: string;
  chairName: string | null;
  activeMembers: number;
  status: string;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeClubModal, setActiveClubModal] = useState<Club | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiUrl}/v1/public/clubs`);
        if (!res.ok) throw new Error("Failed to load clubs");
        const json = await res.json();
        setClubs(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchClubs();
  }, []);

  const provinces = Array.from(
    new Set(clubs.map((c) => c.province).filter(Boolean)),
  );
  const categories = Array.from(
    new Set(clubs.map((c) => c.category).filter(Boolean)),
  );

  const filtered = clubs.filter((c) => {
    const matchSearch =
      !search ||
      c.clubName.toLowerCase().includes(search.toLowerCase()) ||
      c.codeTkt.toLowerCase().includes(search.toLowerCase()) ||
      c.chairName?.toLowerCase().includes(search.toLowerCase());

    const matchProvince =
      selectedProvince === "all" || c.province === selectedProvince;

    const matchCategory =
      selectedCategory === "all" || c.category === selectedCategory;

    return matchSearch && matchProvince && matchCategory;
  });

  return (
    <div className="clubs-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero clubs-hero-refined">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <Flag size={15} color="#38bdf8" />
            <span>REGISTRI RESMI TANDA KLUB TERDAFTAR (TKT)</span>
          </div>

          <h1 className="tech-hero-title">
            Direktori Komunitas & Klub{" "}
            <span className="text-gradient">Terakreditasi</span>
          </h1>

          <p className="tech-hero-lead">
            Daftar resmi paguyuban bengkel, komunitas teknisi, dan klub profesi
            pendingin yang memegang Tanda Klub Terdaftar (TKT) resmi dari
            pengurus daerah setempat.
          </p>

          {/* Impact Metrics Bar */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Flag size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>{clubs.length || 45}+ Klub Resmi</strong>
                <small>TKT Terverifikasi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Users size={22} color="#34d399" />
              </div>
              <div>
                <strong>
                  {clubs.reduce((acc, c) => acc + (c.activeMembers || 0), 0) ||
                    1200}
                  + Anggota
                </strong>
                <small>Jejaring Solid</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Building2 size={22} color="#818cf8" />
              </div>
              <div>
                <strong>38 DPD Pengampu</strong>
                <small>Seluruh Indonesia</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <ShieldCheck size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>100% SK Sah</strong>
                <small>Legalitas Organisasi</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Directory Body & Interactive Search Controls */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Controls Bar */}
          <div className="tech-controls-bar">
            {/* Search Input */}
            <div className="tech-search-box">
              <Search size={17} className="search-icon" />
              <input
                type="text"
                placeholder="Cari nama klub, kode TKT, atau nama ketua..."
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

            {/* Filters Row */}
            <div className="tech-filters-group">
              {/* Province Select */}
              {provinces.length > 0 && (
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="tech-select-input"
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

              {/* Category Select */}
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="tech-select-input"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="tech-loading-state">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p>Memuat direktori klub terdaftar...</p>
            </div>
          ) : (
            <div className="tech-cards-grid">
              {filtered.length > 0 ? (
                filtered.map((club) => (
                  <article className="tech-card-modern club-card" key={club.id}>
                    {/* Top Bar: TKT Pill & Category */}
                    <div className="tech-card-top">
                      <span className="club-tkt-badge">
                        <CheckCircle2 size={12} color="#16a34a" />
                        <span>{club.codeTkt}</span>
                      </span>

                      <span className="tech-skill-badge">
                        <span>{club.category || "Komunitas"}</span>
                      </span>
                    </div>

                    {/* Profile Header Button */}
                    <button
                      type="button"
                      className="tech-profile-btn"
                      onClick={() => setActiveClubModal(club)}
                    >
                      <div className="tech-avatar-frame club-avatar">
                        <Flag size={24} color="#0284c7" />
                      </div>

                      <div className="tech-profile-copy">
                        <h4>{club.clubName}</h4>
                        {club.chairName && (
                          <p className="tech-workshop-text">
                            Ketua: {club.chairName}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Meta Row: Members & Location */}
                    <div className="club-meta-grid">
                      <div className="tech-location-row">
                        <MapPin size={13} color="#64748b" />
                        <span>{club.province}</span>
                      </div>
                      <div className="club-members-count">
                        <Users size={13} color="#0284c7" />
                        <span>{club.activeMembers || 0} Anggota</span>
                      </div>
                    </div>

                    {/* Footer Row: Actions */}
                    <div className="tech-card-footer">
                      <span className="club-status-chip">
                        <CheckCircle2 size={11} color="#16a34a" />
                        <span>Status Aktif</span>
                      </span>

                      <button
                        type="button"
                        className="tech-detail-btn"
                        onClick={() => setActiveClubModal(club)}
                      >
                        <span>Detail Klub</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="tech-empty-state">
                  <Flag size={44} color="#94a3b8" />
                  <h3>Tidak Ada Klub Sesuai Pencarian</h3>
                  <p>
                    Coba sesuaikan kata kunci nama klub, kode TKT, atau ubah
                    filter wilayah.
                  </p>
                  <button
                    type="button"
                    className="button secondary btn-reset-tech"
                    onClick={() => {
                      setSearch("");
                      setSelectedProvince("all");
                      setSelectedCategory("all");
                    }}
                  >
                    Reset Filter Pencarian
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
        guestTitle="Ingin Mendaftarkan Komunitas Anda Mendapat TKT?"
        guestDescription="Dapatkan nomor Tanda Klub Terdaftar (TKT) resmi dari pengurus DPD/DPP untuk pengakuan legalitas, akses pelatihan bersama, dan advokasi profesi."
        guestPrimaryCta={{ label: "Ajukan Registrasi Klub", href: "/join" }}
        guestSecondaryCta={{ label: "Kontak Pengurus DPD", href: "/structure" }}
        memberTitle="Daftarkan Komunitas atau Bengkel Anda"
        memberDescription="Sebagai anggota aktif, Anda dapat membentuk dan mendaftarkan klub binaan daerah untuk mendapatkan nomor TKT resmi."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{
          label: "Struktur Kepengurusan",
          href: "/structure",
        }}
      />

      {/* 4. Interactive Detail Modal */}
      {activeClubModal && (
        <div
          className="leader-modal-overlay"
          onClick={() => setActiveClubModal(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveClubModal(null);
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div className="leader-modal-card" role="document">
            <div className="leader-modal-header">
              <div className="modal-title-wrap">
                <Flag size={20} color="#38bdf8" />
                <h3>Detail Tanda Klub Terdaftar (TKT)</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveClubModal(null)}
                aria-label="Tutup detail modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="leader-modal-body">
              <div className="modal-profile-hero">
                <div className="modal-avatar-frame club-modal-avatar">
                  <Flag size={28} color="#0284c7" />
                </div>

                <div className="modal-profile-copy">
                  <span className="modal-tier-badge">
                    {activeClubModal.category || "Komunitas Terdaftar"}
                  </span>
                  <h4>{activeClubModal.clubName}</h4>
                  {activeClubModal.chairName && (
                    <p className="modal-role">
                      Ketua Pengurus: {activeClubModal.chairName}
                    </p>
                  )}
                </div>
              </div>

              <div className="modal-data-grid">
                <div className="modal-data-item">
                  <small>Nomor TKT Resmi</small>
                  <strong>{activeClubModal.codeTkt}</strong>
                </div>
                <div className="modal-data-item">
                  <small>Status Legalitas</small>
                  <span className="modal-status-pill">
                    <CheckCircle2 size={12} /> SK DPD Terverifikasi
                  </span>
                </div>
                <div className="modal-data-item">
                  <small>Wilayah Kepengurusan</small>
                  <strong>{activeClubModal.province}</strong>
                </div>
                <div className="modal-data-item">
                  <small>Jumlah Anggota Aktif</small>
                  <strong style={{ color: "#0284c7" }}>
                    {activeClubModal.activeMembers || 0} Anggota
                  </strong>
                </div>
              </div>

              <div className="modal-actions-row">
                <Link
                  href={`/whois?q=${encodeURIComponent(activeClubModal.codeTkt)}`}
                  className="button primary btn-modal-action"
                  onClick={() => setActiveClubModal(null)}
                >
                  <ExternalLink size={15} />
                  <span>Audit Kredensial di Registri</span>
                </Link>
                <button
                  type="button"
                  className="button secondary btn-modal-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(activeClubModal.codeTkt);
                  }}
                >
                  <QrCode size={15} />
                  <span>Salin No. TKT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
