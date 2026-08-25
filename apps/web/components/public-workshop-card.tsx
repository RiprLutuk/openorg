"use client";

import {
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  MessageSquare,
  Navigation,
  ShieldCheck,
  Store,
  Wrench,
} from "lucide-react";
import Link from "next/link";

export interface PublicWorkshopData {
  id: string;
  workshopName: string;
  tagline: string;
  category: string;
  city: string;
  province: string;
  address: string;
  whatsapp: string;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  operatingHours: string;
  description: string;
  services: string[];
  ownerName: string;
  memberNumber: string;
  isPublished: boolean;
  rating?: number;
  completedJobs?: number;
}

export function PublicWorkshopCard({
  workshop,
  compact = false,
}: {
  workshop: PublicWorkshopData;
  compact?: boolean;
}) {
  const is24h =
    workshop.operatingHours?.toLowerCase().includes("24 jam") ||
    workshop.operatingHours?.toLowerCase().includes("24h");

  const mapsQuery = encodeURIComponent(
    workshop.googleMapsUrl ||
      `${workshop.address}, ${workshop.city}, ${workshop.province}, Indonesia`,
  );

  const mapsDirectUrl =
    workshop.googleMapsUrl && workshop.googleMapsUrl.startsWith("http")
      ? workshop.googleMapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const cleanWhatsapp = workshop.whatsapp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Halo ${workshop.workshopName}, saya menemukan profil workshop Anda di Direktori Resmi APTI Indonesia.`,
  )}`;

  const cleanWebUrl = workshop.website
    ? workshop.website.startsWith("http")
      ? workshop.website
      : `https://${workshop.website}`
    : undefined;

  return (
    <article className="clean-workshop-card">
      {/* 1. Top Bar: Kategori & Status */}
      <div className="card-top-bar">
        <span className="card-cat-pill">
          <Store size={10.5} className="text-sky-600 flex-shrink-0" />
          <span className="truncate">{workshop.category}</span>
        </span>
        <div className="card-badge-group">
          {is24h && <span className="pill-24h">24J</span>}
          <span className="pill-verified" title="Mitra Resmi Terverifikasi">
            <ShieldCheck size={10} className="text-emerald-600 flex-shrink-0" />
            <span>Resmi</span>
          </span>
        </div>
      </div>

      {/* 2. Nama Bengkel & Tagline Ringkas */}
      <div className="card-brand">
        <h4 className="card-title truncate" title={workshop.workshopName}>
          {workshop.workshopName}
        </h4>
        <p className="card-tagline truncate" title={workshop.tagline}>
          {workshop.tagline || `${workshop.category} di ${workshop.city}`}
        </p>
      </div>

      {/* 3. Lokasi & Jam Operasional Ringkas */}
      <div className="card-meta-chips">
        <div className="meta-line truncate">
          <MapPin size={11} className="text-sky-500 flex-shrink-0" />
          <span className="truncate">{workshop.city}, {workshop.province}</span>
        </div>
        <div className="meta-line truncate">
          <Clock size={11} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{workshop.operatingHours}</span>
        </div>
      </div>

      {/* 4. Styled Visual Map Card with Direct Navigation */}
      <a
        href={mapsDirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="card-map-banner"
        title="Buka Navigasi Rute Google Maps"
      >
        <div className="map-banner-grid-backdrop" />
        <div className="map-banner-pin-pulse">
          <MapPin size={16} className="pin-icon" />
          <span className="pulse-ring" />
        </div>
        <div className="map-banner-info">
          <span className="map-addr-text truncate">{workshop.address || workshop.city}</span>
          <span className="map-nav-action">
            <Navigation size={10} />
            <span>Buka Rute Maps</span>
          </span>
        </div>
      </a>

      {/* 5. Layanan Spesialisasi */}
      {workshop.services && workshop.services.length > 0 && (
        <div className="card-services-cloud">
          {workshop.services.slice(0, 2).map((srv) => (
            <span key={srv} className="service-mini-tag truncate">
              <Wrench size={9} className="text-sky-500 flex-shrink-0" />
              <span className="truncate">{srv}</span>
            </span>
          ))}
          {workshop.services.length > 2 && (
            <span className="service-mini-tag more-tag">
              +{workshop.services.length - 2}
            </span>
          )}
        </div>
      )}

      {/* 6. Footer: Owner KTA & WhatsApp Action */}
      <div className="card-bottom-row">
        <div className="owner-info">
          <small className="owner-lbl">Penanggung Jawab:</small>
          <Link
            href={`/verify?code=${encodeURIComponent(workshop.memberNumber)}`}
            className="owner-name-link truncate"
            title={`No. KTA: ${workshop.memberNumber}`}
          >
            <strong>{workshop.ownerName}</strong>
          </Link>
        </div>

        <div className="card-cta-group">
          {cleanWebUrl && (
            <a
              href={cleanWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-card-web"
              title="Kunjungi Website Resmi"
            >
              <Globe size={12} />
            </a>
          )}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-card-wa"
            title="Chat & Order via WhatsApp"
          >
            <MessageSquare size={12} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}
