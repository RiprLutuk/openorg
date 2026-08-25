"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe,
  MapPin,
  Pause,
  Play,
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
    latitude: -6.2615,
    longitude: 106.8106,
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
    latitude: -6.1683,
    longitude: 106.7589,
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
    latitude: -7.2575,
    longitude: 112.7521,
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
    latitude: -6.9175,
    longitude: 107.6191,
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
    latitude: 3.5952,
    longitude: 98.6722,
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
    latitude: -6.9667,
    longitude: 110.4167,
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
    latitude: -5.1477,
    longitude: 119.4327,
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
    latitude: -8.6705,
    longitude: 115.2126,
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
    latitude: -7.7956,
    longitude: 110.3695,
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
    latitude: -2.9761,
    longitude: 104.7754,
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
    latitude: -1.2379,
    longitude: 116.8289,
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
    latitude: -6.2383,
    longitude: 106.9756,
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
    latitude: -6.1783,
    longitude: 106.6319,
  },
  {
    id: "ws-14",
    workshopName: "Malang Cold Clinic",
    tagline: "Spesialis Servis Chiller Hasil Kebun, Buah Apel & Pendingin Hunian",
    category: "Bengkel Servis AC Residensial",
    city: "Malang",
    province: "Jawa Timur",
    address: "Jl. Soekarno Hatta No. 78, Lowokwaru",
    whatsapp: "08133445566",
    phone: "0341489123",
    googleMapsUrl: "Jl. Soekarno Hatta No. 78, Lowokwaru, Malang",
    operatingHours: "08.00 - 18.00",
    description: "Klinik pendingin hasil bumi dan servis pendingin perkantoran wilayah Malang Raya.",
    services: ["Chiller Buah", "Servis Residensial", "Recovery Freon"],
    ownerName: "Bagus Prasetyo",
    memberNumber: "APTI-2024-0301",
    isPublished: true,
    rating: 4.9,
    latitude: -7.9666,
    longitude: 112.6326,
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
    latitude: -7.5755,
    longitude: 110.8243,
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
    latitude: 1.1301,
    longitude: 104.0529,
  },
];

// Maximum distance in KM considered "nearby" (e.g. within same metropolitan/regional cluster)
const MAX_NEARBY_RADIUS_KM = 180;

// Helper to compute Haversine distance in KM
function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to shuffle array fairly
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

function getStoredWorkshops(): PublicWorkshopData[] {
  try {
    let combined = [...NATIONAL_16_WORKSHOPS];
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("openorg_member_workshops_list");
      if (stored) {
        const parsed: PublicWorkshopData[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const memberNums = new Set(parsed.map((p) => p.memberNumber));
          const baseWithoutDuplicates = combined.filter((w) => !memberNums.has(w.memberNumber));
          combined = [...parsed, ...baseWithoutDuplicates];
        }
      }
    }
    return combined;
  } catch {
    return NATIONAL_16_WORKSHOPS;
  }
}

export function HomeFeaturedWorkshops() {
  const [workshops, setWorkshops] = useState<PublicWorkshopData[]>(NATIONAL_16_WORKSHOPS);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [onlyNearby, setOnlyNearby] = useState<boolean>(true);
  const [geoState, setGeoState] = useState<{
    status: "idle" | "requesting" | "active" | "denied";
    userLat?: number | undefined;
    userLng?: number | undefined;
    nearestCity?: string | undefined;
    source?: "gps" | "ip" | undefined;
  }>({ status: "idle" });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Apply location sorting
  const applyLocationSort = (
    lat: number,
    lng: number,
    baseList: PublicWorkshopData[],
    source: "gps" | "ip" = "gps",
    customCityName?: string,
  ) => {
    const withDistances: PublicWorkshopData[] = baseList.map((ws) => {
      const wsLat = ws.latitude ?? -6.2;
      const wsLng = ws.longitude ?? 106.8;
      const distanceKm = computeDistanceKm(lat, lng, wsLat, wsLng);
      return { ...ws, distanceKm };
    });

    withDistances.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    setWorkshops(withDistances);
    setGeoState({
      status: "active",
      userLat: lat,
      userLng: lng,
      nearestCity: customCityName || withDistances[0]?.city || undefined,
      source,
    });
    setOnlyNearby(true);
  };

  // Direct User-Gesture Trigger for Browser GPS
  const requestUserLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoState({ status: "denied" });
      return;
    }

    setGeoState((prev) => ({ ...prev, status: "requesting" }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const combined = getStoredWorkshops();
        applyLocationSort(latitude, longitude, combined, "gps");
      },
      (err) => {
        console.warn("Browser GPS permission not granted or timeout:", err.message);
        // Fallback to IP geolocation
        detectLocationFromIp(getStoredWorkshops());
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const detectLocationFromIp = (combined: PublicWorkshopData[]) => {
    fetch("https://ipwho.is/")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.latitude && data?.longitude) {
          applyLocationSort(data.latitude, data.longitude, combined, "ip", data.city || data.region);
        } else {
          setWorkshops(shuffleArray(combined));
        }
      })
      .catch(() => {
        setWorkshops(shuffleArray(combined));
      });
  };

  // On mount: Automatic IP Geolocation & Check existing GPS permissions
  useEffect(() => {
    const combined = getStoredWorkshops();

    if (typeof window !== "undefined" && navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                applyLocationSort(pos.coords.latitude, pos.coords.longitude, combined, "gps");
              },
              () => {
                detectLocationFromIp(combined);
              }
            );
          } else {
            detectLocationFromIp(combined);
          }
        })
        .catch(() => {
          detectLocationFromIp(combined);
        });
    } else {
      detectLocationFromIp(combined);
    }
  }, []);

  const handleShuffle = () => {
    setGeoState({ status: "idle" });
    const combined = getStoredWorkshops().map((w) => {
      const copy: PublicWorkshopData = { ...w };
      delete copy.distanceKm;
      return copy;
    });
    setWorkshops(shuffleArray(combined));
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -370 : 370;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Count how many workshops fall strictly in nearby range
  const nearbyWorkshops = workshops.filter(
    (w) => w.distanceKm !== undefined && w.distanceKm <= MAX_NEARBY_RADIUS_KM
  );
  const nearbyCount = nearbyWorkshops.length;

  // Filter list: If location active & onlyNearby is true, strictly show nearby workshops!
  const filtered = workshops.filter((w) => {
    // 1. Category match
    if (selectedCat !== "all" && w.category !== selectedCat) {
      return false;
    }

    // 2. Strict Nearby Proximity Filtering
    if (geoState.status === "active" && onlyNearby && w.distanceKm !== undefined) {
      // If we have at least 1 workshop within radius, strictly exclude faraway ones
      if (nearbyCount > 0) {
        return w.distanceKm <= MAX_NEARBY_RADIUS_KM;
      }
      // If none under 180km (e.g. remote area), take the nearest 4
      const indexInSorted = workshops.findIndex((item) => item.id === w.id);
      return indexInSorted < 4;
    }

    return true;
  });

  const categories = Array.from(
    new Set(
      (geoState.status === "active" && onlyNearby && nearbyCount > 0 ? nearbyWorkshops : workshops)
        .map((w) => w.category)
        .filter(Boolean)
    )
  );

  // Auto-scroll loop effect (pauses on hover or touch)
  useEffect(() => {
    if (!isAutoPlay || isHovered) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const step = 370; // 1 card slide width + gap

        if (el.scrollLeft >= maxScroll - 15) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: step, behavior: "smooth" });
        }
      }
    }, 3400);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, filtered.length]);

  return (
    <section className="section-space home-workshops-showcase-section">
      <div className="wrap">
        {/* Section Heading: 100% Left Aligned */}
        <div className="section-heading">
          <Link href="/bengkel" className="eyebrow-cta-link">
            <Store size={13} className="text-sky-600" />
            <span>Bursa Bengkel &amp; Toko Resmi</span>
            <ArrowRight size={12} />
          </Link>
          <h2>Jaringan Bengkel &amp; Toko Mitra Anggota</h2>
          <p>
            {geoState.status === "active" ? (
              <span className="ws-geo-active-text">
                📍 Menampilkan {filtered.length} bengkel &amp; toko resmi di sekitar {geoState.nearestCity || "lokasi Anda"}
                {onlyNearby && nearbyCount > 0 ? ` (Radius < ${MAX_NEARBY_RADIUS_KM} km)` : " (Seluruh Indonesia)"}.
              </span>
            ) : (
              `${workshops.length}+ bengkel AC resmi, klinik modul inverter & penyedia suku cadang berlisensi di seluruh Indonesia.`
            )}
          </p>
        </div>

        {/* Dedicated Toolbar: Category Filter Chips on Left + Controls on Right */}
        <div className="ws-showcase-toolbar">
          <div className="ws-category-chips-row">
            <button
              type="button"
              className={`ws-cat-filter-btn ${selectedCat === "all" ? "active" : ""}`}
              onClick={() => setSelectedCat("all")}
            >
              Semua ({filtered.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`ws-cat-filter-btn ${selectedCat === cat ? "active" : ""}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat.replace(/^Bengkel\s+/i, "").replace(/& Manifold Digital/i, "& Manifold")}
              </button>
            ))}
          </div>

          <div className="ws-carousel-controls-group">
            {/* Geolocation / Nearby Scope Toggle */}
            {geoState.status === "active" ? (
              <button
                type="button"
                className={`btn-geo-location ${onlyNearby ? "active" : ""}`}
                onClick={() => setOnlyNearby((prev) => !prev)}
                title={
                  onlyNearby
                    ? "Sedang menampilkan bengkel terdekat. Klik untuk melihat seluruh Indonesia."
                    : "Sedang menampilkan seluruh Indonesia. Klik untuk menyaring bengkel terdekat saja."
                }
              >
                <MapPin size={13} />
                <span>
                  {onlyNearby
                    ? `📍 Wilayah Anda (${nearbyCount || filtered.length})`
                    : "🌐 Seluruh Indonesia (16)"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-geo-location"
                onClick={requestUserLocation}
                disabled={geoState.status === "requesting"}
                title="Deteksi lokasi saya untuk menampilkan bengkel terdekat di wilayah Anda"
              >
                <Compass size={13} className={geoState.status === "requesting" ? "animate-spin" : ""} />
                <span>{geoState.status === "requesting" ? "Mendeteksi..." : "📍 Dekat Saya"}</span>
              </button>
            )}

            {/* Fair Shuffle */}
            <button
              type="button"
              className={`btn-shuffle-fair ${geoState.status === "idle" ? "active-shuffle" : ""}`}
              onClick={handleShuffle}
              title="Acak urutan tampilan agar rotasi promosi adil bagi semua anggota"
            >
              <Shuffle size={13} />
              <span>Acak</span>
            </button>

            {/* Auto-Scroll Toggle */}
            <button
              type="button"
              className={`carousel-autoplay-btn ${isAutoPlay ? "active" : ""}`}
              onClick={() => setIsAutoPlay((prev) => !prev)}
              title={isAutoPlay ? "Jeda Auto-Scroll" : "Mulai Auto-Scroll Otomatis"}
              aria-label="Toggle Auto-Scroll"
            >
              {isAutoPlay ? <Pause size={13} /> : <Play size={13} />}
              <span>{isAutoPlay ? "Auto" : "Jeda"}</span>
            </button>

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

            <Link href="/bengkel" className="button primary btn-view-all-hero">
              <span>Bursa Lengkap</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Horizontal Swipeable / Scrollable Carousel with Auto-Scroll */}
        <div
          className="ws-carousel-track-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <div className="ws-horizontal-carousel" ref={scrollContainerRef}>
            {filtered.map((ws) => (
              <div key={ws.id} className="ws-carousel-slide">
                <PublicWorkshopCard workshop={ws} />
              </div>
            ))}
          </div>
        </div>

        {/* Standard Benefit Banner for Members */}
        <div className="ws-member-acquisition-banner">
          <div className="ws-acq-copy">
            <div className="ws-acq-icon-box">
              <Sparkles size={20} className="text-sky-600" />
            </div>
            <div>
              <strong>Punya Usaha Bengkel AC atau Toko Sparepart?</strong>
              <p>
                Daftarkan profil usaha Anda untuk mendapatkan promosi nasional di bursa direktori resmi organisasi.
              </p>
            </div>
          </div>
          <Link href="/join" className="button primary ws-btn-acq">
            Daftar &amp; Pasang Iklan →
          </Link>
        </div>
      </div>
    </section>
  );
}
