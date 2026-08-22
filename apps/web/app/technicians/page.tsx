"use client";

import {
  Loader2,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Technician {
  id: string;
  name: string;
  ktaNumber: string;
  skillLevel: string;
  province: string;
  city: string;
  phone: string | null;
  workshopName: string | null;
  rating: string | null;
  certifiedBnsp: boolean;
  isAvailable: boolean;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiUrl}/v1/public/technicians`);
        if (!res.ok) throw new Error("Failed to load technicians");
        const json = await res.json();
        setTechnicians(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchTechs();
  }, []);

  const provinces = Array.from(
    new Set(technicians.map((t) => t.province).filter(Boolean)),
  );

  const filtered = technicians.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.ktaNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase()) ||
      t.workshopName?.toLowerCase().includes(search.toLowerCase());

    const matchProvince =
      selectedProvince === "all" || t.province === selectedProvince;

    return matchSearch && matchProvince;
  });

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="technicians-hero">
        <div className="wrap">
          <div className="hero-pill">
            <Wrench size={14} />
            <span>Direktori Teknisi KTA Terverifikasi</span>
          </div>
          <h1>Cari Teknisi AC & Pendingin Resmi</h1>
          <p className="hero-lead">
            Gunakan mesin pencari terpadu untuk menemukan teknisi bersertifikat
            kompetensi BNSP dengan garansi layanan dan reputasi terpercaya.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="technicians-body">
        <div className="wrap">
          {/* Filter Bar */}
          <div className="directory-filter-bar mb-6">
            <div className="search-input-wrap flex-1">
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari nama teknisi, KTA, kota, atau nama workshop..."
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
            <div className="tech-list-grid">
              {filtered.length > 0 ? (
                filtered.map((tech) => (
                  <div key={tech.id} className="tech-card">
                    <div className="tech-card-header">
                      <div className="tech-avatar">
                        {tech.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3>{tech.name}</h3>
                        <span className="tech-kta">
                          <ShieldCheck size={13} /> {tech.ktaNumber}
                        </span>
                      </div>
                    </div>

                    <div className="tech-details">
                      <p className="tech-skill">{tech.skillLevel}</p>
                      {tech.workshopName && (
                        <p className="tech-workshop">{tech.workshopName}</p>
                      )}
                      <p className="tech-location">
                        <MapPin size={14} /> {tech.city}, {tech.province}
                      </p>
                    </div>

                    <div className="tech-card-footer">
                      {tech.rating && (
                        <div className="tech-rating">
                          <Star size={14} className="star-icon" />{" "}
                          <span>{tech.rating}</span>
                        </div>
                      )}
                      {tech.phone ? (
                        <a
                          href={`https://wa.me/${tech.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-contact-tech"
                        >
                          <Phone size={14} /> WhatsApp
                        </a>
                      ) : (
                        <span className="btn-disabled">Kontak Melalui DPD</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Wrench size={48} />
                  <h3>Tidak Ada Teknisi Ditemukan</h3>
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
