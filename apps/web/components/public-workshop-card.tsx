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

  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const cleanWhatsapp = workshop.whatsapp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Halo ${workshop.workshopName}, saya menemukan profil usaha Anda di Direktori Resmi APTI Indonesia. Saya ingin bertanya tentang layanan Anda.`,
  )}`;

  const cleanWebUrl = workshop.website
    ? workshop.website.startsWith("http")
      ? workshop.website
      : `https://${workshop.website}`
    : undefined;

  return (
    <article className={`public-showcase-workshop-card ${compact ? "compact-card" : ""}`}>
      {/* Top Bar: Category pill & Verified Seal */}
      <div className="showcase-card-header">
        <span className="showcase-cat-badge">
          <Store size={12} color="#0284c7" />
          <span>{workshop.category}</span>
        </span>
        <div className="showcase-header-right">
          {is24h && <span className="showcase-24h-badge">🚨 24 Jam</span>}
          <span className="showcase-verified-badge" title="Mitra Resmi Terdaftar Organisasi">
            <ShieldCheck size={12} color="#10b981" />
            <span>Mitra Resmi</span>
          </span>
        </div>
      </div>

      {/* Main Title & Tagline */}
      <div className="showcase-brand-block">
        <h3 className="showcase-title">{workshop.workshopName}</h3>
        {workshop.tagline && <p className="showcase-tagline">{workshop.tagline}</p>}
      </div>

      {/* Meta Location & Hours */}
      <div className="showcase-meta-box">
        <div className="showcase-meta-item">
          <MapPin size={12} color="#0284c7" className="meta-icon" />
          <span title={`${workshop.address}, ${workshop.city}, ${workshop.province}`}>
            {[workshop.city, workshop.province].filter(Boolean).join(", ") || workshop.address}
          </span>
        </div>
        <div className="showcase-meta-item">
          <Clock size={12} color="#64748b" className="meta-icon" />
          <span>{workshop.operatingHours}</span>
        </div>
        {cleanWebUrl && (
          <div className="showcase-meta-item">
            <Globe size={12} color="#0284c7" className="meta-icon" />
            <a
              href={cleanWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="showcase-meta-link"
            >
              <span>{workshop.website?.replace(/^https?:\/\//, "")}</span>
              <ExternalLink size={10} />
            </a>
          </div>
        )}
      </div>

      {/* Interactive Map Embed */}
      {!compact && (
        <div className="showcase-map-wrapper">
          <div className="showcase-map-header">
            <small>
              <MapPin size={11} color="#0284c7" />
              <span>Titik Operasional</span>
            </small>
            <a
              href={mapsDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="showcase-map-nav-btn"
              title="Buka Navigasi Rute Maps"
            >
              <Navigation size={10} />
              <span>Buka Rute</span>
            </a>
          </div>
          <div className="showcase-map-frame">
            <iframe
              title={`Peta Lokasi ${workshop.workshopName}`}
              src={mapsEmbedUrl}
              width="100%"
              height="115"
              loading="lazy"
              style={{ border: 0, display: "block" }}
              allowFullScreen={false}
            />
          </div>
        </div>
      )}

      {/* Description Snippet */}
      {workshop.description && (
        <p className="showcase-description">{workshop.description}</p>
      )}

      {/* Services Tag Cloud */}
      {workshop.services && workshop.services.length > 0 && (
        <div className="showcase-services-cloud">
          {workshop.services.slice(0, compact ? 2 : 3).map((srv) => (
            <span key={srv} className="showcase-service-pill">
              <Wrench size={10} color="#0284c7" />
              <span>{srv}</span>
            </span>
          ))}
          {workshop.services.length > (compact ? 2 : 3) && (
            <span className="showcase-service-pill more-pill">
              +{workshop.services.length - (compact ? 2 : 3)} lainnya
            </span>
          )}
        </div>
      )}

      {/* Card Footer: Owner Info & Direct Action CTAs */}
      <div className="showcase-card-footer">
        <div className="showcase-owner-cell">
          <small>Penanggung Jawab:</small>
          <Link
            href={`/verify?code=${encodeURIComponent(workshop.memberNumber)}`}
            className="showcase-owner-link"
            title="Verifikasi KTA Resmi"
          >
            <strong>{workshop.ownerName}</strong>
            <span className="showcase-kta-chip">{workshop.memberNumber}</span>
          </Link>
        </div>

        <div className="showcase-actions-group">
          {cleanWebUrl && (
            <a
              href={cleanWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="showcase-btn-ghost web"
              title="Kunjungi Website Resmi"
            >
              <Globe size={13} />
            </a>
          )}
          <a
            href={mapsDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="showcase-btn-ghost map"
            title="Buka Navigasi Rute Maps"
          >
            <Navigation size={13} />
            <span>Rute</span>
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="showcase-btn-whatsapp"
            title="Chat Pemesanan via WhatsApp"
          >
            <MessageSquare size={13} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}
