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
  Sparkles,
  Store,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { PublicWorkshopCard, type PublicWorkshopData } from "@/components/public-workshop-card";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

const SEED_WORKSHOPS: PublicWorkshopData[] = [
  {
    id: "ws-1",
    workshopName: "CV Surya Mandiri Teknik",
    tagline: "Spesialis Servis AC Inverter & VRV Komersial Bergaransi",
    category: "Bengkel Spesialis AC Komersial (VRV/VRF/Chiller)",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    address: "Jl. Fatmawati Raya No. 45, Cilandak",
    whatsapp: "081289123456",
    phone: "02175901234",
    website: "https://suryamandiriteknik.com",
    googleMapsUrl: "Jl. Fatmawati Raya No. 45, Cilandak, Jakarta Selatan",
    operatingHours: "Senin - Sabtu: 08.00 - 18.00 | Siap 24 Jam",
    description:
      "Bengkel resmi rekanan APTI spesialis tata udara komersial perkantoran, multi-inverter VRV/VRF, dan cold storage industri. Dilengkapi teknisi BNSP Level IV.",
    services: [
      "Cuci AC Inverter Bebas Bau",
      "Vakum Standar SKKNI (Dua Tahap)",
      "Recovery Freon R32 / R410A",
      "Servis Chiller & VRV Komersial",
      "Instalasi AC Cassette / Standing",
    ],
    ownerName: "Bambang Sudiro",
    memberNumber: "APTI-2024-0012",
    isPublished: true,
    rating: 4.95,
  },
  {
    id: "ws-2",
    workshopName: "Toko Suku Cadang & Freon Berkah Refrigerasi",
    tagline: "Distributor Resmi Sparepart AC, Pipa Tembaga & Freon Ramah Lingkungan",
    category: "Toko Sparepart & Freon Ramah Lingkungan",
    city: "Surabaya",
    province: "Jawa Timur",
    address: "Jl. Ngagel Jaya Selatan No. 88, Gubeng",
    whatsapp: "081334567890",
    phone: "0315021234",
    website: "https://berkahrefrigerasi.com",
    googleMapsUrl: "Jl. Ngagel Jaya Selatan No. 88, Gubeng, Surabaya",
    operatingHours: "Senin - Sabtu: 08.00 - 17.00",
    description:
      "Menyediakan suku cadang asli segala merk: kompresor inverter, sensor thermistor, kapasitor original, pipa ASTM B280, manifold digital, dan freon ramah lingkungan R32 / R290.",
    services: [
      "Penyedia Sparepart & Freon Asli",
      "Rental Alat Ukur & Manifold Digital",
      "Uji Tekanan Nitrogen K3",
      "Pengadaan Pipa Tembaga Standar",
    ],
    ownerName: "H. Ridwan Santoso",
    memberNumber: "APTI-2024-0038",
    isPublished: true,
    rating: 4.9,
  },
  {
    id: "ws-3",
    workshopName: "Nusantara Cold & HVAC Clinic",
    tagline: "Pusat Perbaikan Modul PCB Inverter & Instalasi Residensial Terpercaya",
    category: "Bengkel Servis AC Residensial & Rumah Tangga",
    city: "Bandung",
    province: "Jawa Barat",
    address: "Jl. Soekarno-Hatta No. 312, Buahbatu",
    whatsapp: "081223456781",
    phone: "0227311234",
    website: "https://nusantaracold.id",
    googleMapsUrl: "Jl. Soekarno-Hatta No. 312, Buahbatu, Bandung",
    operatingHours: "Setiap Hari: 07.30 - 19.00",
    description:
      "Layanan servis cepat pendingin rumah tangga dan apartemen. Mengutamakan SOP vakum wajib dan SOP recovery freon tanpa buang emisi ke udara bebas.",
    services: [
      "Cuci AC Inverter Bebas Bau",
      "Bongkar Pasang AC Split",
      "Perbaikan Modul PCB Inverter",
      "Uji Tekanan Nitrogen K3",
    ],
    ownerName: "Asep Sunandar",
    memberNumber: "APTI-2024-0084",
    isPublished: true,
    rating: 4.88,
  },
  {
    id: "ws-4",
    workshopName: "Sentral Instrument & Tools Refrigerasi",
    tagline: "Rental & Kalibrasi Pompa Vakum Dua Tahap & Manifold Digital",
    category: "Rental Alat Ukur & Manifold Digital",
    city: "Medan",
    province: "Sumatera Utara",
    address: "Jl. Gatot Subroto KM 6.5 No. 19",
    whatsapp: "08116543210",
    phone: "0618451234",
    website: "https://sentralinstrument.com",
    googleMapsUrl: "Jl. Gatot Subroto KM 6.5 No. 19, Medan",
    operatingHours: "Senin - Sabtu: 08.00 - 17.30",
    description:
      "Mitra penyedia rental peralatan instalasi berstandar SKKNI: manifold digital Testo/Fieldpiece, recovery machine Promax, flaring kit hidrolik, dan tabung recovery bersertifikat.",
    services: [
      "Rental Alat Ukur & Manifold Digital",
      "Vakum Standar SKKNI (Dua Tahap)",
      "Recovery Freon R32 / R410A",
      "Penyedia Sparepart & Freon Asli",
    ],
    ownerName: "Tengku Iskandar",
    memberNumber: "APTI-2024-0105",
    isPublished: true,
    rating: 4.92,
  },
];

function WorkshopsPageContent() {
  const [workshops, setWorkshops] = useState<PublicWorkshopData[]>(SEED_WORKSHOPS);
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("openorg_member_workshops_list");
      if (stored) {
        const parsed: PublicWorkshopData[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorkshops((prev) => {
            const memberNums = new Set(parsed.map((p) => p.memberNumber));
            const baseWithoutDuplicates = prev.filter((w) => !memberNums.has(w.memberNumber));
            return [...parsed, ...baseWithoutDuplicates];
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

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
              <span>BURSA BENGKEL & TOKO RESMI NASIONAL</span>
            </div>

            <h1 className="tech-hero-title">
              Direktori Bengkel AC & Toko Suku Cadang{" "}
              <span className="text-gradient">Terverifikasi</span>
            </h1>

            <p className="tech-hero-lead">
              Temukan bengkel AC resmi, sentra perbaikan modul inverter, dan penyedia suku cadang/freon
              mitra anggota terpercaya dengan jaminan mutu dan SOP standar profesi di seluruh Indonesia.
            </p>
          </div>

          <div className="tech-hero-stats-panel">
            <div className="hero-stat-box">
              <strong>{workshops.length}+</strong>
              <small>Bengkel & Toko Resmi</small>
            </div>
            <div className="hero-stat-box">
              <strong>38</strong>
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
                placeholder="Cari nama bengkel/toko, keahlian, kota, atau nomor KTA pemilik..."
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
                  <option value="all">Semua Kategori Usaha ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Member Registration CTA Banner */}
          <div className="workshop-member-cta-banner">
            <div className="banner-left">
              <Sparkles size={24} color="#0284c7" />
              <div>
                <strong>Punya Usaha Bengkel AC atau Toko Sparepart?</strong>
                <p>
                  Pasang iklan dan profil usaha Anda secara gratis di bursa direktori resmi organisasi
                  untuk menjangkau ribuan pelanggan di seluruh Indonesia.
                </p>
              </div>
            </div>
            <div className="banner-right">
              <Link href="/join" className="button primary">
                Daftar Anggota & Pasang Iklan
              </Link>
            </div>
          </div>

          {/* Workshop Cards Grid */}
          <div className="home-workshops-grid">
            {filtered.length > 0 ? (
              filtered.map((ws) => <PublicWorkshopCard key={ws.id} workshop={ws} />)
            ) : (
              <div className="no-tech-found">
                <Store size={44} className="text-muted" />
                <h3>Tidak ada bengkel/toko ditemukan</h3>
                <p>Coba gunakan kata kunci pencarian yang lebih umum atau sesuaikan filter wilayah.</p>
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
        guestTitle="Daftarkan Bengkel & Toko Resmi Anda Sekarang"
        guestDescription="Nikmati benefit eksklusif promosi bursa direktori nasional, sertifikasi BNSP, dan akses jaringan kerja sama proyek."
        guestPrimaryCta={{ label: "Gabung Jadi Anggota", href: "/join" }}
        guestSecondaryCta={{ label: "Pelajari Syarat & Regulasi", href: "/regulations" }}
        memberTitle="Promosikan Bengkel & Toko Anda ke Seluruh Indonesia"
        memberDescription="Perbarui informasi profil bengkel, foto workshop, titik maps, dan kontak WhatsApp Anda langsung melalui portal anggota."
        memberPrimaryCta={{ label: "Kelola Iklan Bengkel Saya", href: "/member" }}
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
