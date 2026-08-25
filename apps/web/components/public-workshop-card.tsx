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
    `Halo ${workshop.workshopName}, saya ingin konsultasi/order layanan melalui direktori resmi organisasi.`,
  )}`;

  const cleanWebUrl = workshop.website
    ? workshop.website.startsWith("http")
      ? workshop.website
      : `https://${workshop.website}`
    : undefined;

  return (
    <article className="clean-workshop-card">
      {/* 1. Header: Kategori & Status Resmi */}
      <div className="card-top-bar">
        <span className="card-cat-pill">
          <Store size={11} className="text-sky-600" />
          <span className="truncate">{workshop.category}</span>
        </span>
        <div className="card-badge-group">
          {is24h && <span className="pill-24h">24 Jam</span>}
          <span className="pill-verified" title="Mitra Resmi Terverifikasi">
            <ShieldCheck size={11} className="text-emerald-600" />
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

      {/* 3. Lokasi & Jam Operasional */}
      <div className="card-meta-chips">
        <span className="meta-chip location-chip" title={`${workshop.address}, ${workshop.city}`}>
          <MapPin size={11} className="text-sky-500 flex-shrink-0" />
          <span className="truncate">{workshop.city}, {workshop.province}</span>
        </span>
        <span className="meta-chip hours-chip">
          <Clock size={11} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{workshop.operatingHours}</span>
        </span>
      </div>

      {/* 4. Compact Google Maps Preview */}
      <div className="card-map-box">
        <iframe
          title={`Peta Lokasi ${workshop.workshopName}`}
          src={mapsEmbedUrl}
          width="100%"
          height="85"
          loading="lazy"
          style={{ border: 0, display: "block" }}
          allowFullScreen={false}
        />
        <a
          href={mapsDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="map-overlay-btn"
          title="Buka Navigasi Rute Maps"
        >
          <Navigation size={10} />
          <span>Rute</span>
        </a>
      </div>

      {/* 5. Layanan Spesialisasi */}
      {workshop.services && workshop.services.length > 0 && (
        <div className="card-services-cloud">
          {workshop.services.slice(0, 2).map((srv) => (
            <span key={srv} className="service-mini-tag truncate">
              <Wrench size={9} className="text-sky-500 flex-shrink-0" />
              <span>{srv}</span>
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
            title={`KTA: ${workshop.memberNumber}`}
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
