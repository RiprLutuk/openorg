"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Sparkles,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PublicWorkshopCard, type PublicWorkshopData } from "./public-workshop-card";

export const NATIONAL_16_WORKSHOPS: PublicWorkshopData[] = [
  {
    id: "ws-1",
    workshopName: "CV Surya Mandiri Teknik",
    tagline: "Spesialis AC Inverter, Multi-Split & VRV Komersial Bergaransi",
    category: "Bengkel Spesialis AC Komersial",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    address: "Jl. RS Fatmawati Raya No. 45, Cilandak",
    whatsapp: "081289123456",
    phone: "02175901234",
    website: "https://suryamandiriteknik.com",
    googleMapsUrl: "Jl. Fatmawati Raya No. 45, Cilandak, Jakarta Selatan",
    operatingHours: "08.00 - 18.00 | Siap 24 Jam",
    description: "Bengkel resmi spesialis pendingin gedung perkantoran & multi-inverter VRV.",
    services: ["Cuci Inverter", "Vakum SKKNI", "Recovery R32/R410A"],
    ownerName: "Bambang Sudiro",
    memberNumber: "APTI-2024-0012",
    isPublished: true,
    rating: 4.95,
  },
  {
    id: "ws-2",
    workshopName: "Jakarta Aircon Service Center",
    tagline: "Pusat Servis & Diagnostik Modul Inverter Bergaransi Resmi",
    category: "Bengkel Spesialis AC Komersial",
    city: "Jakarta Barat",
    province: "DKI Jakarta",
    address: "Jl. Kebon Jeruk Raya No. 18",
    whatsapp: "081234567890",
    phone: "081234567890",
    website: "https://jakarta-aircon.co.id",
    googleMapsUrl: "Jl. Kebon Jeruk Raya No. 18, Jakarta Barat",
    operatingHours: "08.00 - 18.00 | Siap 24 Jam",
    description: "Klinik perbaikan modul PCB inverter dan instalasi AC cassette standing.",
    services: ["Reparasi PCB", "Vakum 2 Tahap", "Servis Chiller"],
    ownerName: "Budi Kurniawan",
    memberNumber: "APTI-2026-0004",
    isPublished: true,
    rating: 4.98,
  },
  {
    id: "ws-3",
    workshopName: "Toko Suku Cadang Berkah Refrigerasi",
    tagline: "Distributor Sparepart Asli, Pipa ASTM B280 & Freon Ramah Lingkungan",
    category: "Toko Sparepart & Freon",
    city: "Surabaya",
    province: "Jawa Timur",
    address: "Jl. Ngagel Jaya Selatan No. 88, Gubeng",
    whatsapp: "081334567890",
    phone: "0315021234",
    website: "https://berkahrefrigerasi.com",
    googleMapsUrl: "Jl. Ngagel Jaya Selatan No. 88, Gubeng, Surabaya",
    operatingHours: "08.00 - 17.00",
    description: "Penyedia suku cadang original kompresor inverter dan freon R32/R290.",
    services: ["Sparepart Asli", "Manifold Digital", "Pipa Tembaga"],
    ownerName: "H. Ridwan Santoso",
    memberNumber: "APTI-2024-0038",
    isPublished: true,
    rating: 4.9,
  },
  {
    id: "ws-4",
    workshopName: "Nusantara Cold & HVAC Clinic",
    tagline: "Klinik Perbaikan PCB Inverter & Cuci Servis Rumah Tangga",
    category: "Bengkel Servis AC Residensial",
    city: "Bandung",
    province: "Jawa Barat",
    address: "Jl. Soekarno-Hatta No. 312, Buahbatu",
    whatsapp: "081223456781",
    phone: "0227311234",
    website: "https://nusantaracold.id",
    googleMapsUrl: "Jl. Soekarno-Hatta No. 312, Buahbatu, Bandung",
    operatingHours: "07.30 - 19.00",
    description: "Layanan servis cepat pendingin rumah tangga & apartemen bergaransi.",
    services: ["Cuci Bebas Bau", "Bongkar Pasang", "Reparasi Modul"],
    ownerName: "Asep Sunandar",
    memberNumber: "APTI-2024-0084",
    isPublished: true,
    rating: 4.88,
  },
  {
    id: "ws-5",
    workshopName: "Sentral Instrument & Tools Refrigerasi",
    tagline: "Rental & Kalibrasi Pompa Vakum Dua Tahap & Manifold Digital",
    category: "Rental Alat & Manifold Digital",
    city: "Medan",
    province: "Sumatera Utara",
    address: "Jl. Gatot Subroto KM 6.5 No. 19",
    whatsapp: "08116543210",
    phone: "0618451234",
    website: "https://sentralinstrument.com",
    googleMapsUrl: "Jl. Gatot Subroto KM 6.5 No. 19, Medan",
    operatingHours: "08.00 - 17.30",
    description: "Penyedia rental alat ukur berstandar SKKNI dan recovery machine bersertifikat.",
    services: ["Rental Manifold", "Pompa Vakum", "Recovery Freon"],
    ownerName: "Tengku Iskandar",
    memberNumber: "APTI-2024-0105",
    isPublished: true,
    rating: 4.92,
  },
  {
    id: "ws-6",
    workshopName: "Semarang Industrial HVAC",
    tagline: "Rekayasa Tata Udara Chiller Industri & Cold Storage Jawa Tengah",
    category: "Bengkel Spesialis AC Komersial",
    city: "Semarang",
    province: "Jawa Tengah",
    address: "Jl. Pemuda No. 88, Semarang Tengah",
    whatsapp: "081311223344",
    phone: "081311223344",
    website: "https://semaranghvac.com",
    googleMapsUrl: "Jl. Pemuda No. 88, Semarang Tengah",
    operatingHours: "08.00 - 17.30 | Siap 24 Jam",
    description: "Pusat overhaul kompresor Chiller, water cooled & perakitan cold storage.",
    services: ["Servis Chiller", "Cold Storage", "Uji Nitrogen K3"],
    ownerName: "Dewi Lestari",
    memberNumber: "APTI-2026-0006",
    isPublished: true,
    rating: 4.92,
  },
  {
    id: "ws-7",
    workshopName: "Makassar Multi Pendingin",
    tagline: "Pusat Instalasi AC Cassette, Ducted & VRV Gedung Perkantoran",
    category: "Bengkel Spesialis AC Komersial",
    city: "Makassar",
    province: "Sulawesi Selatan",
    address: "Jl. Urip Sumoharjo No. 142, Panakkukang",
    whatsapp: "081241123456",
    phone: "0411876543",
    googleMapsUrl: "Jl. Urip Sumoharjo No. 142, Makassar",
    operatingHours: "08.00 - 18.00",
    description: "Kontraktor dan teknisi resmi pendingin ruang komersial Sulawesi Selatan.",
    services: ["AC Cassette", "Ducting Udara", "Perawatan Berkala"],
    ownerName: "Andi Mappanyukki",
    memberNumber: "APTI-2024-0142",
    isPublished: true,
    rating: 4.91,
  },
  {
    id: "ws-8",
    workshopName: "Bali Cool Pro Solutions",
    tagline: "Pemeliharaan Tata Udara Resor, Villa & Restoran Standar Pariwisata",
    category: "Bengkel Servis AC Residensial",
    city: "Denpasar",
    province: "Bali",
    address: "Jl. Bypass Ngurah Rai No. 210, Sanur",
    whatsapp: "081338765432",
    phone: "0361287654",
    website: "https://balicoolpro.com",
    googleMapsUrl: "Jl. Bypass Ngurah Rai No. 210, Sanur, Denpasar",
    operatingHours: "08.00 - 20.00 | Siap 24 Jam",
    description: "Spesialis perawatan pendingin ramah lingkungan untuk villa & perhotelan Bali.",
    services: ["Servis Villa/Hotel", "Vakum Standar", "Anti Bau Organik"],
    ownerName: "I Wayan Sudarma",
    memberNumber: "APTI-2024-0177",
    isPublished: true,
    rating: 4.96,
  },
  {
    id: "ws-9",
    workshopName: "Jogja Inverter Diagnostic Center",
    tagline: "Diagnosa Komputer Modul Inverter, Sensor Thermistor & Error Code",
    category: "Bengkel Servis AC Residensial",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    address: "Jl. Ring Road Utara No. 55, Sleman",
    whatsapp: "081227123456",
    phone: "0274889123",
    googleMapsUrl: "Jl. Ring Road Utara No. 55, Sleman, Yogyakarta",
    operatingHours: "08.30 - 17.30",
    description: "Pusat rujukan penanganan kerusakan error code AC multi-inverter di DIY.",
    services: ["Scan Diagnosa", "Reparasi Modul", "Uji Tekanan"],
    ownerName: "Raden Mas Suryo",
    memberNumber: "APTI-2024-0195",
    isPublished: true,
    rating: 4.9,
  },
  {
    id: "ws-10",
    workshopName: "Sriwijaya Mega Refrigerasi",
    tagline: "Pabrikasi Cold Storage Ikan/Daging & Pemasangan Pipa Tembaga ASTM",
    category: "Bengkel Spesialis AC Komersial",
    city: "Palembang",
    province: "Sumatera Selatan",
    address: "Jl. Kolonel H. Burlian KM 7 No. 34",
    whatsapp: "081273456789",
    phone: "0711412345",
    googleMapsUrl: "Jl. Kolonel H. Burlian KM 7, Palembang",
    operatingHours: "08.00 - 17.00 | Siap 24 Jam",
    description: "Rekayasa ruang pendingin industri dan distributor pipa pendingin ASTM.",
    services: ["Cold Storage", "Insulasi Pipa", "Recovery Emisi"],
    ownerName: "M. Zulkarnain",
    memberNumber: "APTI-2024-0210",
    isPublished: true,
    rating: 4.89,
  },
  {
    id: "ws-11",
    workshopName: "Borneo Aircon Engineering",
    tagline: "Servis Pendingin Fasilitas Tambang, Rig Lepas Pantai & Kantor IKN",
    category: "Bengkel Spesialis AC Komersial",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    address: "Jl. MT Haryono No. 99, Ring Road",
    whatsapp: "081347123456",
    phone: "0542876123",
    website: "https://borneoaircon.id",
    googleMapsUrl: "Jl. MT Haryono No. 99, Balikpapan",
    operatingHours: "07.30 - 18.00 | Siap 24 Jam",
    description: "Teknisi K3 bersertifikat industri tambang dan tata udara proyek kawasan IKN.",
    services: ["HVAC Industri", "K3 Bersertifikat", "Overhaul Chiller"],
    ownerName: "Fajar Nugroho",
    memberNumber: "APTI-2024-0233",
    isPublished: true,
    rating: 4.94,
  },
  {
    id: "ws-12",
    workshopName: "Bekasi Prima AC Sentosa",
    tagline: "Solusi Cepat Cuci AC Rumah Tangga, Isi Freon & Pasang Unit Baru",
    category: "Bengkel Servis AC Residensial",
    city: "Bekasi",
    province: "Jawa Barat",
    address: "Jl. Ahmad Yani No. 60, Bekasi Selatan",
    whatsapp: "081288990011",
    phone: "0218899001",
    googleMapsUrl: "Jl. Ahmad Yani No. 60, Bekasi",
    operatingHours: "08.00 - 20.00",
    description: "Layanan servis panggilan perumahan Bekasi dengan SOP vakum wajib.",
    services: ["Cuci AC Rumah", "Isi Freon R32", "Pasang Baru"],
    ownerName: "Dedi Suhendar",
    memberNumber: "APTI-2024-0256",
    isPublished: true,
    rating: 4.87,
  },
  {
    id: "ws-13",
    workshopName: "Tangerang HVAC Service Lab",
    tagline: "Uji Tekanan Nitrogen K3, Vakum Dua Tahap & Pemulihan Freon Ramah Lingkungan",
    category: "Rental Alat & Manifold Digital",
    city: "Tangerang",
    province: "Banten",
    address: "Jl. MH Thamrin No. 45, Cikokol",
    whatsapp: "081299887766",
    phone: "0215577889",
    googleMapsUrl: "Jl. MH Thamrin No. 45, Cikokol, Tangerang",
    operatingHours: "08.00 - 17.30",
    description: "Pusat kalibrasi alat ukur refrigerasi dan pelatihan SOP vakum teknisi.",
    services: ["Uji Nitrogen", "Kalibrasi Alat", "Pelatihan SOP"],
    ownerName: "Hendrik Gunawan",
    memberNumber: "APTI-2024-0280",
    isPublished: true,
    rating: 4.93,
  },
  {
    id: "ws-14",
    workshopName: "Malang Cold Clinic",
    tagline: "Spesialis Servis Chiller Hasil Kebun, Buah Apel & Pendingin Hunian",
    category: "Bengkel Servis AC Residensial",
    city: "Malang",
    province: "Jawa Timur",
    address: "Jl. Soekarno Hatta No. 78, Lowokwaru",
    whatsapp: "081333445566",
    phone: "0341489123",
    googleMapsUrl: "Jl. Soekarno Hatta No. 78, Lowokwaru, Malang",
    operatingHours: "08.00 - 18.00",
    description: "Klinik pendingin hasil bumi dan servis pendingin perkantoran wilayah Malang Raya.",
    services: ["Chiller Buah", "Servis Residensial", "Recovery Freon"],
    ownerName: "Bagus Prasetyo",
    memberNumber: "APTI-2024-0301",
    isPublished: true,
    rating: 4.9,
  },
  {
    id: "ws-15",
    workshopName: "Solo Rejeki Pendingin",
    tagline: "Penyedia Kompresor Asli, Flaring Hidrolik & Alat Kerja Teknisi Resmi",
    category: "Toko Sparepart & Freon",
    city: "Surakarta",
    province: "Jawa Tengah",
    address: "Jl. Slamet Riyadi No. 240, Laweyan",
    whatsapp: "081226554433",
    phone: "0271712345",
    googleMapsUrl: "Jl. Slamet Riyadi No. 240, Laweyan, Surakarta",
    operatingHours: "08.30 - 17.00",
    description: "Toko suku cadang terpercaya rekanan teknisi Soloraya & sekitarnya.",
    services: ["Kompresor Asli", "Flaring Hidrolik", "Freon R32/R410A"],
    ownerName: "Joko Wibowo",
    memberNumber: "APTI-2024-0325",
    isPublished: true,
    rating: 4.89,
  },
  {
    id: "ws-16",
    workshopName: "Batam Marine HVAC Support",
    tagline: "Servis Pendingin Kapal Laut, Galangan Shipyard & Industri Elektronik",
    category: "Bengkel Spesialis AC Komersial",
    city: "Batam",
    province: "Kepulauan Riau",
    address: "Jl. Duyung No. 12, Batu Ampar",
    whatsapp: "081177665544",
    phone: "0778451234",
    googleMapsUrl: "Jl. Duyung No. 12, Batu Ampar, Batam",
    operatingHours: "08.00 - 17.00 | Siap 24 Jam",
    description: "Layanan teknik refrigerasi kapal kargo, tugboat, dan clean room semikonduktor.",
    services: ["HVAC Kapal Laut", "Clean Room", "Chiller Marine"],
    ownerName: "Rudi Hamsah",
    memberNumber: "APTI-2024-0350",
    isPublished: true,
    rating: 4.95,
  },
];

// Helper to shuffle array fairly
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

export function HomeFeaturedWorkshops() {
  const [workshops, setWorkshops] = useState<PublicWorkshopData[]>(NATIONAL_16_WORKSHOPS);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Shuffle on mount for fair randomized rotation ("tidak saling iri")
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

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const categories = Array.from(new Set(workshops.map((w) => w.category).filter(Boolean)));

  const filtered = workshops.filter((w) => {
    if (selectedCat === "all") return true;
    return w.category === selectedCat;
  });

  return (
    <section className="home-workshops-showcase-section">
      <div className="wrap">
        {/* Section Header: Compact & High-Impact */}
        <div className="showcase-header-compact">
          <div className="header-text-block">
            <div className="pill-badge-eyebrow">
              <Store size={12} className="text-sky-600" />
              <span>BURSA BENGKEL &amp; TOKO RESMI</span>
            </div>
            <h2 className="section-title-compact">
              Jaringan Bengkel &amp; Toko Mitra Anggota
            </h2>
            <p className="section-subtitle-compact">
              {workshops.length}+ bengkel AC resmi, klinik modul inverter &amp; toko suku cadang berlisensi di seluruh Indonesia.
            </p>
          </div>

          <div className="header-actions-block">
            {/* Fair Rotation Shuffle Button */}
            <button
              type="button"
              className="btn-shuffle-fair"
              onClick={handleShuffle}
              title="Acak urutan tampilan agar rotasi promosi adil bagi semua anggota"
            >
              <Shuffle size={13} />
              <span>Rotasi Acak</span>
            </button>

            {/* Scroll Navigation Arrows */}
            <div className="carousel-arrows-pair">
              <button
                type="button"
                className="carousel-arrow-btn"
                onClick={() => handleScroll("left")}
                aria-label="Geser ke kiri"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="carousel-arrow-btn"
                onClick={() => handleScroll("right")}
                aria-label="Geser ke kanan"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <Link href="/bengkel" className="btn-view-all-compact">
              <span>Semua Bengkel</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="category-scroll-chips">
            <button
              type="button"
              className={`filter-chip ${selectedCat === "all" ? "active" : ""}`}
              onClick={() => setSelectedCat("all")}
            >
              Semua ({workshops.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-chip ${selectedCat === cat ? "active" : ""}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Horizontal Swipeable / Scrollable Carousel */}
        <div className="carousel-track-wrapper">
          <div className="horizontal-workshop-carousel" ref={scrollContainerRef}>
            {filtered.map((ws) => (
              <div key={ws.id} className="carousel-item-slide">
                <PublicWorkshopCard workshop={ws} />
              </div>
            ))}
          </div>
        </div>

        {/* Compact Strip Banner for Members */}
        <div className="compact-member-promo-strip">
          <div className="promo-strip-text">
            <Sparkles size={16} className="text-sky-600 flex-shrink-0" />
            <span>
              <strong>Punya Usaha Bengkel AC atau Toko Sparepart?</strong> Daftarkan profil usaha Anda gratis untuk mendapatkan promosi nasional di bursa direktori ini.
            </span>
          </div>
          <Link href="/join" className="btn-promo-join">
            Daftar &amp; Pasang Iklan →
          </Link>
        </div>
      </div>
    </section>
  );
}
