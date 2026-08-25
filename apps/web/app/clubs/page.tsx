"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Cpu,
  ExternalLink,
  Flag,
  Flame,
  Globe,
  Loader2,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { ServerPagination } from "@/components/server-pagination";

const ITEMS_PER_PAGE_CLUBS = 8;

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

interface ClubCategoryMeta {
  label: string;
  shortLabel: string;
  icon: any;
  color: string;
  bgClass: string;
  description: string;
}

function getClubCategoryMeta(category: string): ClubCategoryMeta {
  const lower = (category || "").toLowerCase();

  if (
    lower.includes("workshop") ||
    lower.includes("bengkel") ||
    lower.includes("teknisi")
  ) {
    return {
      label: "Komunitas Teknisi & Workshop",
      shortLabel: "Workshop",
      icon: Wrench,
      color: "#0284c7",
      bgClass: "club-category-workshop",
      description:
        "Paguyuban praktisi tata udara, asosiasi bengkel mandiri, dan jejaring teknisi lapangan.",
    };
  }

  if (
    lower.includes("spesialis") ||
    lower.includes("chiller") ||
    lower.includes("vrf") ||
    lower.includes("riset")
  ) {
    return {
      label: "Spesialisasi HVAC/R",
      shortLabel: "Spesialis HVAC",
      icon: Cpu,
      color: "#d97706",
      bgClass: "club-category-specialist",
      description:
        "Komunitas pakar sistem sentral, VRV/VRF, cold storage, dan retrofit refrigeran ramah lingkungan.",
    };
  }

  if (
    lower.includes("korwil") ||
    lower.includes("rayon") ||
    lower.includes("daerah")
  ) {
    return {
      label: "Paguyuban Wilayah & Rayon",
      shortLabel: "Korwil Daerah",
      icon: Compass,
      color: "#16a34a",
      bgClass: "club-category-region",
      description:
        "Forum koordinasi wilayah tingkat kota/kabupaten binaan Pengurus Daerah setempat.",
    };
  }

  if (
    lower.includes("hobi") ||
    lower.includes("olahraga") ||
    lower.includes("touring")
  ) {
    return {
      label: "Klub Hobi & Rekreasi",
      shortLabel: "Hobi & Sosial",
      icon: Flame,
      color: "#6366f1",
      bgClass: "club-category-hobby",
      description:
        "Klub kebersamaan anggota mencakup olahraga, rekreasi, dan kegiatan sosial kemasyarakatan.",
    };
  }

  return {
    label: category || "Komunitas Terdaftar",
    shortLabel: category || "Komunitas",
    icon: Flag,
    color: "#0284c7",
    bgClass: "club-category-workshop",
    description:
      "Klub profesi terakreditasi di bawah koordinasi pengurus wilayah.",
  };
}

function ClubsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedProvince, setSelectedProvince] = useState(
    searchParams.get("provinsi") || "all",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("kategori") || "all",
  );
  const [copiedTkt, setCopiedTkt] = useState<string | null>(null);
  const [activeClubModal, setActiveClubModal] = useState<Club | null>(null);

  const pageParam = searchParams.get("page");
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const handleCopyTkt = (e: React.MouseEvent, tkt: string) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(tkt);
      setCopiedTkt(tkt);
      setTimeout(() => setCopiedTkt(null), 2500);
    }
  };

  const updateUrl = (
    newSearch: string,
    newProvince: string,
    newCategory: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSearch.trim()) params.set("q", newSearch.trim());
    else params.delete("q");

    if (newProvince !== "all") params.set("provinsi", newProvince);
    else params.delete("provinsi");

    if (newCategory !== "all") params.set("kategori", newCategory);
    else params.delete("kategori");

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
        const res = await fetch(`${apiUrl}/v1/public/clubs?limit=100`);
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
      c.chairName?.toLowerCase().includes(search.toLowerCase()) ||
      c.province.toLowerCase().includes(search.toLowerCase());

    const matchProvince =
      selectedProvince === "all" || c.province === selectedProvince;

    const matchCategory =
      selectedCategory === "all" || c.category === selectedCategory;

    return matchSearch && matchProvince && matchCategory;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ITEMS_PER_PAGE_CLUBS),
  );
  const paginatedRows = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE_CLUBS,
    currentPage * ITEMS_PER_PAGE_CLUBS,
  );

  const totalMembers =
    clubs.reduce((acc, c) => acc + (c.activeMembers || 0), 0) || 1250;

  return (
    <div className="clubs-page-suite">
      {/* 1. Flagship 2-Column Split Hero Header */}
      <header className="tech-hero">
        <div className="wrap hero-split-grid">
          <div className="tech-hero-inner">
            <div className="tech-hero-pill">
              <Flag size={14} />
              <span>REGISTRI RESMI TANDA KLUB TERDAFTAR (TKT)</span>
            </div>

            <h1 className="tech-hero-title">
              Direktori Komunitas & Klub{" "}
              <span className="text-gradient">Terakreditasi</span>
            </h1>

            <p className="tech-hero-lead">
              Daftar resmi paguyuban bengkel, komunitas praktisi, dan klub
              profesi pendingin yang memegang Tanda Klub Terdaftar (TKT) resmi
              di bawah koordinasi Dewan Pimpinan Daerah (DPD).
            </p>
          </div>

          {/* Right Column: Hero Metrics Bento Card */}
          <div className="hero-stats-bento-card">
            <div className="stats-card-header">
              <span className="stats-card-badge">Registri Komunitas TKT</span>
              <span className="stats-card-status">● Terakreditasi DPD</span>
            </div>
            <div className="stats-card-grid">
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{
                    background: "rgba(2, 132, 199, 0.12)",
                    color: "#38bdf8",
                  }}
                >
                  <Flag size={20} />
                </div>
                <div>
                  <strong>{clubs.length || 45}+ Klub</strong>
                  <small>TKT Terverifikasi</small>
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
                  <Users size={20} />
                </div>
                <div>
                  <strong>{totalMembers}+ Anggota</strong>
                  <small>Jejaring Praktisi</small>
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
                  <Building2 size={20} />
                </div>
                <div>
                  <strong>{provinces.length || 38} DPD Wilayah</strong>
                  <small>Seluruh Indonesia</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{
                    background: "rgba(245, 158, 11, 0.12)",
                    color: "#f59e0b",
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>100% Sah</strong>
                  <small>Legalitas Organisasi</small>
                </div>
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
                id="clubs-search-input"
                name="clubsSearch"
                type="text"
                placeholder="Cari nama klub, kode TKT, atau nama ketua..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateUrl(e.target.value, selectedProvince, selectedCategory);
                }}
                aria-label="Cari nama klub, kode TKT, atau nama ketua"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearch("");
                    updateUrl("", selectedProvince, selectedCategory);
                  }}
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
                  id="clubs-province-select"
                  name="clubsProvince"
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    updateUrl(search, e.target.value, selectedCategory);
                  }}
                  className="tech-select-input"
                  aria-label="Filter berdasarkan provinsi klub"
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
                  id="clubs-category-select"
                  name="clubsCategory"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    updateUrl(search, selectedProvince, e.target.value);
                  }}
                  className="tech-select-input"
                  aria-label="Filter berdasarkan kategori paguyuban"
                >
                  <option value="all">
                    Semua Kategori ({categories.length})
                  </option>
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
            <>
              <div className="tech-cards-grid">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((club) => {
                    const catMeta = getClubCategoryMeta(club.category);
                    const CatIcon = catMeta.icon;

                    return (
                      <article
                        className="tech-card-modern club-card"
                        key={club.id}
                      >
                        {/* Top Bar: TKT Badge & Category (Exact 26px Level Height) */}
                        <div className="tech-card-top">
                          <button
                            type="button"
                            className="club-tkt-badge"
                            onClick={(e) => handleCopyTkt(e, club.codeTkt)}
                            title={
                              copiedTkt === club.codeTkt
                                ? "Nomor TKT Tersalin!"
                                : "Klik untuk menyalin nomor TKT"
                            }
                            aria-label={`Salin nomor TKT ${club.codeTkt}`}
                          >
                            {copiedTkt === club.codeTkt ? (
                              <Check size={12} color="#16a34a" />
                            ) : (
                              <CheckCircle2 size={12} color="#16a34a" />
                            )}
                            <span>{club.codeTkt}</span>
                          </button>

                          <span
                            className={`club-category-badge ${catMeta.bgClass}`}
                            title={catMeta.label}
                          >
                            <CatIcon size={12} />
                            <span>{catMeta.shortLabel}</span>
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

                        {/* Footer Row: Clean Status & Single Detail CTA */}
                        <div className="tech-card-footer">
                          <span className="club-status-chip">
                            <CheckCircle2 size={11} color="#16a34a" />
                            <span>SK DPD Sah</span>
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
                    );
                  })
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
                        updateUrl("", "all", "all");
                      }}
                    >
                      Reset Filter Pencarian
                    </button>
                  </div>
                )}
              </div>

              {/* Server-Side Pagination Bar */}
              <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={ITEMS_PER_PAGE_CLUBS}
                itemName="Klub & Paguyuban"
              />
            </>
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
            {/* Modal Header */}
            <div className="leader-modal-header">
              <div className="modal-title-wrap">
                <Flag size={20} color="#0284c7" />
                <h3>Kredensial Tanda Klub Terdaftar (TKT)</h3>
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

            {/* Modal Body */}
            <div className="leader-modal-body">
              {(() => {
                const catMeta = getClubCategoryMeta(activeClubModal.category);
                const CatIcon = catMeta.icon;

                return (
                  <>
                    <div className="modal-profile-hero">
                      <div
                        className="tech-avatar-frame club-avatar"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "16px",
                          fontSize: "18px",
                        }}
                      >
                        <Flag size={26} color="#0284c7" />
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
                            className={`club-category-badge ${catMeta.bgClass}`}
                            style={{ fontSize: "11px" }}
                          >
                            <CatIcon size={12} />
                            <span>{catMeta.label}</span>
                          </span>

                          <span className="club-status-chip">
                            <CheckCircle2 size={11} color="#16a34a" />
                            <span>SK DPD Sah</span>
                          </span>
                        </div>

                        <h4
                          style={{
                            fontSize: "18px",
                            fontWeight: 800,
                            margin: "0 0 3px",
                            color: "#0f172a",
                          }}
                        >
                          {activeClubModal.clubName}
                        </h4>
                        {activeClubModal.chairName && (
                          <p
                            className="modal-role"
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#64748b",
                            }}
                          >
                            Ketua Pengurus: {activeClubModal.chairName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* TKT Legal Certificate Showcase Box */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, #f8fafc 100%)",
                        border: "1px solid rgba(2, 132, 199, 0.25)",
                        borderRadius: "16px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "rgba(2, 132, 199, 0.12)",
                            color: "#0284c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <ShieldCheck size={18} />
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
                            Surat Tanda Klub Terdaftar (TKT)
                          </strong>
                          <small
                            style={{
                              color: "#0284c7",
                              fontWeight: 700,
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "0.4px",
                            }}
                          >
                            Registrasi Resmi Pengurus Wilayah DPD
                          </small>
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
                          Fokus & Ruang Lingkup Paguyuban
                        </small>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12.5px",
                            lineHeight: "1.55",
                            color: "#334155",
                          }}
                        >
                          {catMeta.description}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Data Grid */}
              <div className="modal-data-grid">
                <div className="modal-data-item">
                  <small>Nomor TKT Resmi</small>
                  <strong className="font-mono">
                    {activeClubModal.codeTkt}
                  </strong>
                </div>
                <div className="modal-data-item">
                  <small>Status Legalitas</small>
                  <span className="modal-status-pill">
                    <CheckCircle2 size={12} />
                    <span>SK DPD Terverifikasi Sah</span>
                  </span>
                </div>
                <div className="modal-data-item">
                  <small>Wilayah Kepengurusan</small>
                  <strong>{activeClubModal.province}</strong>
                </div>
                <div className="modal-data-item">
                  <small>Jumlah Anggota Aktif</small>
                  <strong style={{ color: "#0284c7" }}>
                    {activeClubModal.activeMembers || 0} Anggota Terdata
                  </strong>
                </div>
              </div>

              {/* Actions Row */}
              <div className="modal-actions-row">
                <Link
                  href={`/whois?q=${encodeURIComponent(activeClubModal.codeTkt)}`}
                  className="button primary btn-modal-action"
                  onClick={() => setActiveClubModal(null)}
                >
                  <ExternalLink size={15} />
                  <span>Audit di Registri Publik</span>
                </Link>
                <button
                  type="button"
                  className="button secondary btn-modal-copy"
                  onClick={(e) => handleCopyTkt(e, activeClubModal.codeTkt)}
                >
                  <Copy size={15} />
                  <span>
                    {copiedTkt === activeClubModal.codeTkt
                      ? "TKT Tersalin!"
                      : "Salin No. TKT"}
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

export default function ClubsPage() {
  return (
    <Suspense
      fallback={
        <div className="tech-loading-state" style={{ minHeight: "50vh" }}>
          <Loader2 size={36} className="animate-spin text-primary" />
          <p>Memuat direktori klub terdaftar...</p>
        </div>
      }
    >
      <ClubsContent />
    </Suspense>
  );
}
