"use client";

import {
  Flag,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

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

  const filtered = clubs.filter((c) => {
    const matchSearch =
      !search ||
      c.clubName.toLowerCase().includes(search.toLowerCase()) ||
      c.codeTkt.toLowerCase().includes(search.toLowerCase()) ||
      c.chairName?.toLowerCase().includes(search.toLowerCase());

    const matchProvince =
      selectedProvince === "all" || c.province === selectedProvince;

    return matchSearch && matchProvince;
  });

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="clubs-hero">
        <div className="wrap">
          <div className="hero-pill">
            <Flag size={14} />
            <span>Official Registered Clubs Registry</span>
          </div>
          <h1>Direktori Klub & Tanda Klub Terdaftar (TKT)</h1>
          <p className="hero-lead">
            Daftar resmi komunitas dan klub yang memegang Tanda Klub Terdaftar
            (TKT) resmi dari pengurus daerah setempat.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="clubs-body">
        <div className="wrap">
          {/* Filter Bar */}
          <div className="directory-filter-bar mb-6">
            <div className="search-input-wrap flex-1">
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari nama klub, kode TKT, atau nama ketua..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="directory-search-input"
              />
            </div>
            {provinces.length > 0 && (
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="directory-select"
              >
                <option value="all">Semua Provinsi</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={32} className="animate-spin text-muted" />
            </div>
          ) : (
            <div className="club-grid">
              {filtered.length > 0 ? (
                filtered.map((club) => (
                  <div key={club.id} className="club-card">
                    <div className="club-tkt-badge">
                      <ShieldCheck size={13} /> {club.codeTkt}
                    </div>
                    <h2>{club.clubName}</h2>
                    <p className="club-location">
                      <MapPin size={14} /> {club.province}
                    </p>
                    {club.chairName && (
                      <p className="club-chair">Ketua Klub: {club.chairName}</p>
                    )}
                    <div className="club-card-footer">
                      <span className="club-members">
                        <Users size={14} /> {club.activeMembers} Anggota
                        Terdaftar
                      </span>
                      <span className="badge-verified">Verified</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Flag size={48} />
                  <h3>Tidak Ada Klub Ditemukan</h3>
                  <p>
                    Coba sesuaikan kata kunci pencarian atau pilih provinsi
                    lain.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
