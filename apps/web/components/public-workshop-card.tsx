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
    `Halo ${workshop.workshopName}, saya menemukan profil usaha Anda di Direktori Resmi APTI Indonesia.`,
  )}`;

  const cleanWebUrl = workshop.website
    ? workshop.website.startsWith("http")
      ? workshop.website
      : `https://${workshop.website}`
    : undefined;

  return (
    <article className="standard-workshop-card">
      {/* 1. Header: Kategori & Status Resmi */}
      <div className="ws-card-header-row">
        <span className="ws-cat-pill">
          <Store size={12} className="text-sky-600 flex-shrink-0" />
          <span className="truncate">{workshop.category}</span>
        </span>
        <div className="ws-badge-group">
          {is24h && <span className="ws-pill-24h">24 Jam</span>}
          <span className="ws-pill-verified" title="Mitra Resmi Terverifikasi">
            <ShieldCheck size={12} className="text-emerald-600 flex-shrink-0" />
            <span>Resmi</span>
          </span>
        </div>
      </div>

      {/* 2. Nama Bengkel & Tagline */}
      <div className="ws-card-brand">
        <h4 className="ws-brand-title truncate" title={workshop.workshopName}>
          {workshop.workshopName}
        </h4>
        <p className="ws-brand-tagline truncate" title={workshop.tagline}>
          {workshop.tagline || `${workshop.category} di ${workshop.city}`}
        </p>
      </div>

      {/* 3. Lokasi & Jam Operasional */}
      <div className="ws-meta-box">
        <div className="ws-meta-item truncate">
          <MapPin size={13} className="text-sky-500 flex-shrink-0" />
          <span className="truncate">{workshop.city}, {workshop.province}</span>
        </div>
        <div className="ws-meta-item truncate">
          <Clock size={13} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{workshop.operatingHours}</span>
        </div>
      </div>

      {/* 4. Styled Visual Map Card with Direct Navigation */}
      <a
        href={mapsDirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ws-map-banner"
        title="Buka Navigasi Rute Google Maps"
      >
        <div className="ws-map-grid-pattern" />
        <div className="ws-pin-pulse-box">
          <MapPin size={16} />
        </div>
        <div className="ws-map-info-copy">
          <span className="ws-addr-text truncate">{workshop.address || workshop.city}</span>
          <span className="ws-nav-cta">
            <Navigation size={11} />
            <span>Buka Rute Maps</span>
          </span>
        </div>
      </a>

      {/* 5. Layanan Spesialisasi */}
      {workshop.services && workshop.services.length > 0 && (
        <div className="ws-services-cloud">
          {workshop.services.slice(0, 2).map((srv) => (
            <span key={srv} className="ws-service-tag truncate">
              <Wrench size={11} className="text-sky-500 flex-shrink-0" />
              <span className="truncate">{srv}</span>
            </span>
          ))}
          {workshop.services.length > 2 && (
            <span className="ws-service-tag ws-more-tag">
              +{workshop.services.length - 2}
            </span>
          )}
        </div>
      )}

      {/* 6. Footer: Owner KTA & WhatsApp Action */}
      <div className="ws-card-footer">
        <div className="ws-owner-block">
          <small className="ws-owner-label">Penanggung Jawab:</small>
          <Link
            href={`/verify?code=${encodeURIComponent(workshop.memberNumber)}`}
            className="ws-owner-link truncate"
            title={`No. KTA: ${workshop.memberNumber}`}
          >
            <strong>{workshop.ownerName}</strong>
          </Link>
        </div>

        <div className="ws-actions-group">
          {cleanWebUrl && (
            <a
              href={cleanWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ws-btn-web"
              title="Kunjungi Website Resmi"
            >
              <Globe size={14} />
            </a>
          )}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ws-btn-whatsapp"
            title="Chat & Order via WhatsApp"
          >
            <MessageSquare size={13} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}
