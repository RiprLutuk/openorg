"use client";

import { ArrowRight, Sparkles, Store, Wrench } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicWorkshopCard, type PublicWorkshopData } from "./public-workshop-card";

const DEFAULT_FEATURED_WORKSHOPS: PublicWorkshopData[] = [
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
      "Bengkel resmi rekanan spesialis tata udara komersial perkantoran, multi-inverter VRV/VRF, dan cold storage industri. Dilengkapi teknisi BNSP Level IV.",
    services: [
      "Cuci AC Inverter Bebas Bau",
      "Vakum Standar SKKNI (Dua Tahap)",
      "Recovery Freon R32 / R410A",
      "Servis Chiller & VRV Komersial",
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
      "Menyediakan suku cadang asli segala merk: kompresor inverter, sensor thermistor, manifold digital, dan freon ramah lingkungan R32 / R290.",
    services: [
      "Penyedia Sparepart & Freon Asli",
      "Rental Alat Ukur & Manifold Digital",
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
      "Layanan servis cepat pendingin rumah tangga dan apartemen. Mengutamakan SOP vakum wajib dan SOP recovery freon tanpa buang emisi ke udara.",
    services: [
      "Cuci AC Inverter Bebas Bau",
      "Bongkar Pasang AC Split",
      "Perbaikan Modul PCB Inverter",
    ],
    ownerName: "Asep Sunandar",
    memberNumber: "APTI-2024-0084",
    isPublished: true,
    rating: 4.88,
  },
];

export function HomeFeaturedWorkshops() {
  const [workshops, setWorkshops] = useState<PublicWorkshopData[]>(DEFAULT_FEATURED_WORKSHOPS);
  const [selectedCat, setSelectedCat] = useState<string>("all");

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

  const categories = Array.from(new Set(workshops.map((w) => w.category).filter(Boolean)));

  const filtered = workshops.filter((w) => {
    if (selectedCat === "all") return true;
    return w.category === selectedCat;
  });

  return (
    <section className="section-space home-workshops-showcase-section">
      <div className="wrap">
        <div className="section-heading-split">
          <div className="heading-left">
            <div className="section-eyebrow-pill">
              <Store size={13} color="#0284c7" />
              <span>BURSA BENGKEL & TOKO RESMI ANGGOTA</span>
            </div>
            <h2>Jaringan Bengkel & Toko Pendingin Terpercaya</h2>
            <p>
              Temukan bengkel AC resmi, klinik servis modul inverter, dan toko suku cadang mitra
              anggota di kota Anda dengan jaminan standar profesi.
            </p>
          </div>
          <div className="heading-right">
            <Link href="/technicians?tab=workshops" className="button primary view-all-workshops-btn">
              <span>Buka Direktori Lengkap</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="home-workshops-category-pills">
            <button
              type="button"
              className={`cat-pill-btn ${selectedCat === "all" ? "active" : ""}`}
              onClick={() => setSelectedCat("all")}
            >
              Semua Kategori ({workshops.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-pill-btn ${selectedCat === cat ? "active" : ""}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 3-Column Uniform Workshop Cards */}
        <div className="home-workshops-grid">
          {filtered.slice(0, 6).map((ws) => (
            <PublicWorkshopCard key={ws.id} workshop={ws} />
          ))}
        </div>

        {/* Member Benefit Callout Strip */}
        <div className="home-workshop-benefit-strip">
          <div className="benefit-strip-copy">
            <Sparkles size={20} color="#0284c7" />
            <div>
              <strong>Punya Usaha Bengkel AC atau Toko Sparepart?</strong>
              <p>
                Daftar sebagai anggota resmi dan nikmati ruang promosi iklan gratis di halaman utama
                serta direktori nasional ini.
              </p>
            </div>
          </div>
          <div className="benefit-strip-action">
            <Link href="/join" className="button secondary">
              Daftar Anggota & Pasang Profil
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
