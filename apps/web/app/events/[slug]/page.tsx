import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { type EventItem, getEvent, getPublicSite } from "@/lib/api";

const FALLBACK_EVENTS: Record<string, EventItem> = {
  "uji-kompetensi-sertifikasi-bnsp-2026": {
    id: "0d5bd3f9-c232-4643-a277-484a97ee48a2",
    slug: "uji-kompetensi-sertifikasi-bnsp-2026",
    title: "Uji Kompetensi & Sertifikasi Teknisi Pendingin BNSP 2026",
    description:
      "Sertifikasi kompetensi resmi LSP-HVAC dan BNSP untuk teknisi AC Split, VRV/VRF, dan Cold Storage. Peserta yang lulus berhak mendapatkan sertifikat BNSP dan KTA Digital APTI.",
    locationName: "Gedung Balai Latihan Kerja (BLK) Pusat, Jakarta",
    address: "Jl. Raya Bekasi Km. 23, Cakung, Jakarta Timur",
    capacity: 100,
    startsAt: "2026-09-04T08:00:00.000Z",
    endsAt: "2026-09-04T17:00:00.000Z",
    timezone: "Asia/Jakarta",
    registrationUrl: "/join",
    meetingUrl: null,
    coverUrl: null,
    publishedAt: "2026-08-23T04:52:20.792Z",
    updatedAt: "2026-08-23T04:52:20.792Z",
  },
  "workshop-flammable-refrigerant-r290-r32": {
    id: "fff3f73a-0373-4431-a9af-bee89bce56b8",
    slug: "workshop-flammable-refrigerant-r290-r32",
    title:
      "Workshop Penanganan Flammable Refrigerant (R290 & R32) dan K3 Kerja",
    description:
      "Bimbingan teknis penggunaan freon ramah lingkungan R32 dan Hydrocarbon R290 dengan standar keselamatan K3 tinggi untuk mencegah risiko kecelakaan kerja.",
    locationName: "Hotel Santika Premiere Surabaya & Hybrid Zoom",
    address: "Jl. Raya Gubeng No. 54, Surabaya, Jawa Timur",
    capacity: 250,
    startsAt: "2026-09-12T08:30:00.000Z",
    endsAt: "2026-09-12T15:30:00.000Z",
    timezone: "Asia/Jakarta",
    registrationUrl: "/join",
    meetingUrl: "https://zoom.us",
    coverUrl: null,
    publishedAt: "2026-08-23T04:52:20.792Z",
    updatedAt: "2026-08-23T04:52:20.792Z",
  },
  "masterclass-troubleshooting-inverter-vrv": {
    id: "vrv-inverter-masterclass-2026",
    slug: "masterclass-troubleshooting-inverter-vrv",
    title:
      "Masterclass Troubleshooting Modul Inverter PCB & Sistem Tata Udara VRV/VRF",
    description:
      "Pelatihan komprehensif pembacaan kode error, penggantian IPM/IGBT modul outdoor inverter, kalkulasi pipa cabang refnet VRV, dan teknik commissioning digital.",
    locationName: "Training Center Daikin-APTI, Bandung",
    address: "Jl. Soekarno Hatta No. 518, Bandung, Jawa Barat",
    capacity: 60,
    startsAt: "2026-09-26T09:00:00.000Z",
    endsAt: "2026-09-26T16:30:00.000Z",
    timezone: "Asia/Jakarta",
    registrationUrl: "/join",
    meetingUrl: null,
    coverUrl: null,
    publishedAt: "2026-08-23T04:52:20.792Z",
    updatedAt: "2026-08-23T04:52:20.792Z",
  },
  "munas-rakernas-apti-indonesia-2026": {
    id: "0e209bb5-6b61-4f1c-9b6e-fe58ea1a1f97",
    slug: "munas-rakernas-apti-indonesia-2026",
    title: "Musyawarah Nasional (MUNAS) & Rakernas APTI Indonesia 2026",
    description:
      "Pertemuan akbar seluruh Pengurus DPP, DPD 38 Provinsi, dan Korwil Cabang APTI Indonesia untuk menyusun arah kebijakan dan kemitraan dengan produsen AC terkemuka.",
    locationName: "Grand Ballroom Hotel Patra, Semarang",
    address: "Jl. Sisingamangaraja, Candisari, Semarang, Jawa Tengah",
    capacity: 500,
    startsAt: "2026-10-07T08:00:00.000Z",
    endsAt: "2026-10-09T17:00:00.000Z",
    timezone: "Asia/Jakarta",
    registrationUrl: "/member",
    meetingUrl: null,
    coverUrl: null,
    publishedAt: "2026-08-23T04:52:20.792Z",
    updatedAt: "2026-08-23T04:52:20.792Z",
  },
  "pelatihan-cold-storage-chiller-medan": {
    id: "chiller-cold-chain-medan",
    slug: "pelatihan-cold-storage-chiller-medan",
    title:
      "Pelatihan Sistem Cold Storage Industri & Pemeliharaan Chiller Water-Cooled",
    description:
      "Teknik instalasi evaporator blast freezer, setting ekspansi thermostatic/electronic (TXV/EEV), serta penanganan oli kompresor semi-hermetic.",
    locationName: "Politeknik Negeri Medan (Lab Refrigerasi)",
    address: "Jl. Almamater No. 1, Kampus USU, Medan, Sumatera Utara",
    capacity: 80,
    startsAt: "2026-10-20T08:30:00.000Z",
    endsAt: "2026-10-20T16:30:00.000Z",
    timezone: "Asia/Jakarta",
    registrationUrl: "/join",
    meetingUrl: null,
    coverUrl: null,
    publishedAt: "2026-08-23T04:52:20.792Z",
    updatedAt: "2026-08-23T04:52:20.792Z",
  },
  "uji-kompetensi-bnsp-bali-nusra": {
    id: "bnsp-level2-bali",
    slug: "uji-kompetensi-bnsp-bali-nusra",
    title: "Uji Sertifikasi BNSP Teknisi Madya Komersial (Bali & Nusra)",
    description:
      "Asesmen kompetensi teknisi pendingin komersial hotel, villa, dan gedung bertingkat wilayah Bali, NTB, dan NTT bersertifikat Garuda Emas BNSP.",
    locationName: "TUK Balai Vokasi Denpasar, Bali",
    address: "Jl. Gurita Raya No. 18, Sesetan, Denpasar Selatan, Bali",
    capacity: 75,
    startsAt: "2026-11-05T08:00:00.000Z",
    endsAt: "2026-11-05T17:00:00.000Z",
    timezone: "Asia/Makassar",
    registrationUrl: "/join",
    meetingUrl: null,
    coverUrl: null,
    publishedAt: "2026-08-23T04:52:20.792Z",
    updatedAt: "2026-08-23T04:52:20.792Z",
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dbEvent = await getEvent(slug).catch(() => null);
  const event = dbEvent ?? FALLBACK_EVENTS[slug];
  return event
    ? {
        title: `${event.title} · Agenda Pelatihan & Sertifikasi`,
        description: event.description ?? undefined,
      }
    : {};
}

import { EventDetailClient } from "@/components/event-detail-client";

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const [site, dbEvent] = await Promise.all([
    getPublicSite(),
    getEvent(slug).catch(() => null),
  ]);

  const event = dbEvent ?? FALLBACK_EVENTS[slug];

  if (!event) notFound();

  return <EventDetailClient event={event} site={site} />;
}
