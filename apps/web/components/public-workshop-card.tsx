"use client";

import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Info,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Tag,
  User,
  UserCheck,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface PublicWorkshopData {
  id: string;
  workshopName: string;
  tagline: string;
  category: string;
  city: string;
  province: string;
  address: string;
  whatsapp: string;
  phone?: string | undefined;
  website?: string | undefined;
  googleMapsUrl?: string | undefined;
  operatingHours: string;
  description: string;
  services: string[];
  ownerName: string;
  memberNumber: string;
  isPublished: boolean;
  rating?: number | undefined;
  completedJobs?: number | undefined;
  distanceKm?: number | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
}

export function PublicWorkshopCard({
  workshop,
  compact = false,
}: {
  workshop: PublicWorkshopData;
  compact?: boolean;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const [copied, setCopied] = useState(false);

  const is24h =
    workshop.operatingHours?.toLowerCase().includes("24 jam") ||
    workshop.operatingHours?.toLowerCase().includes("24h");

  const mapsQuery = encodeURIComponent(
    workshop.googleMapsUrl ||
      `${workshop.address}, ${workshop.city}, ${workshop.province}, Indonesia`,
  );

  const mapsDirectUrl =
    workshop.googleMapsUrl &&
    (workshop.googleMapsUrl.startsWith("http://") ||
      workshop.googleMapsUrl.startsWith("https://"))
      ? workshop.googleMapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const cleanPhone = workshop.whatsapp.replace(/\D/g, "");
  const waNumber = cleanPhone.startsWith("0")
    ? `62${cleanPhone.slice(1)}`
    : cleanPhone.startsWith("62")
      ? cleanPhone
      : `62${cleanPhone}`;

  const waMessage = encodeURIComponent(
    `Halo ${workshop.workshopName}, saya melihat profil bengkel/toko Anda di Direktori Resmi APTI Indonesia. Saya ingin konsultasi & pemesanan layanan pendingin/sparepart.`,
  );

  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/bengkel?q=${encodeURIComponent(workshop.workshopName)}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const cleanWebUrl = workshop.website
    ? workshop.website.startsWith("http://") ||
      workshop.website.startsWith("https://")
      ? workshop.website
      : `https://${workshop.website}`
    : null;

  return (
    <>
      <article className={`public-workshop-card ${compact ? "compact" : ""}`}>
        {/* 1. Header Badges */}
        <div className="ws-card-header">
          <div className="ws-badge-group">
            <span
              className="ws-cat-pill truncate"
              title={workshop.category}
            >
              {workshop.category.replace(/^Bengkel\s+/i, "")}
            </span>
            {is24h && <span className="ws-pill-24h">24 Jam</span>}
            {workshop.distanceKm !== undefined && (
              <span className="ws-pill-distance" title={`Jarak ke lokasi Anda: ±${workshop.distanceKm.toFixed(1)} km`}>
                📍 {workshop.distanceKm < 1 ? "< 1 km" : `±${Math.round(workshop.distanceKm)} km`}
              </span>
            )}
          </div>
          <div className="ws-verified-badge" title="Unit Usaha Mitra Resmi Anggota Berlisensi">
            <ShieldCheck size={14} className="text-sky-600 flex-shrink-0" />
            <span className="truncate">Mitra Resmi</span>
          </div>
        </div>

        {/* 2. Nama Bengkel & Tagline */}
        <div className="ws-title-section">
          <h4 className="ws-name truncate" title={workshop.workshopName}>
            {workshop.workshopName}
          </h4>
          <p className="ws-tagline line-clamp-2" title={workshop.tagline}>
            {workshop.tagline}
          </p>
        </div>

        {/* 3. Meta: Lokasi & Jam Buka */}
        <div className="ws-meta-row">
          <div className="ws-meta-item truncate">
            <MapPin size={13} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {workshop.city}, {workshop.province}
            </span>
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
              <button
                type="button"
                className="ws-service-tag ws-more-tag"
                onClick={() => setShowDetail(true)}
                title="Lihat semua spesialisasi"
              >
                +{workshop.services.length - 2} lagi
              </button>
            )}
          </div>
        )}

        {/* 6. Footer: Owner KTA, Detail Button, & WhatsApp Action */}
        <div className="ws-card-footer">
          <div className="ws-owner-block">
            <small className="ws-owner-label">Penanggung Jawab:</small>
            <Link
              href={`/technicians?q=${encodeURIComponent(workshop.ownerName)}`}
              className="ws-owner-link truncate"
              title={`No. KTA: ${workshop.memberNumber}`}
            >
              <strong>{workshop.ownerName}</strong>
            </Link>
          </div>

          <div className="ws-actions-group">
            <button
              type="button"
              className="ws-btn-detail"
              onClick={() => setShowDetail(true)}
              title="Lihat Detail Profil & Layanan Lengkap"
            >
              <Info size={13} />
              <span>Detail</span>
            </button>
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

      {/* =========================================================================
          AIRY, MODERN, SCANNABLE PLACE DOSSIER MODAL
          ========================================================================= */}
      {showDetail && (
        <div
          className="ws-detail-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDetail(false);
          }}
        >
          <div className="ws-detail-modal-card" role="dialog" aria-modal="true">
            {/* Mobile Sheet Drag Handle */}
            <div className="ws-modal-mobile-handle-bar" aria-hidden="true" />

            {/* Modal Minimal Header */}
            <div className="ws-modal-header-simple">
              <div className="ws-modal-header-tag">
                <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                <span>Mitra Resmi Organisasi · NRA: {workshop.memberNumber}</span>
              </div>
              <button
                type="button"
                className="ws-modal-close-btn"
                onClick={() => setShowDetail(false)}
                aria-label="Tutup Dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="ws-modal-scroll-body">
              {/* Title & Tagline */}
              <div className="ws-modal-hero-clean">
                <h3 className="ws-modal-hero-title">{workshop.workshopName}</h3>
                <p className="ws-modal-hero-tagline">{workshop.tagline}</p>
                
                {/* One-Line Meta Highlights */}
                <div className="ws-modal-quick-meta-row">
                  <span className="ws-meta-pill-highlight">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <strong>{workshop.rating ? workshop.rating.toFixed(2) : "4.95"}</strong>
                  </span>
                  {workshop.distanceKm !== undefined && (
                    <span className="ws-meta-pill-highlight">
                      <MapPin size={12} className="text-sky-600" />
                      <span>{workshop.distanceKm < 1 ? "< 1 km" : `±${Math.round(workshop.distanceKm)} km`}</span>
                    </span>
                  )}
                  <span className="ws-meta-pill-highlight">
                    <Clock size={12} className="text-slate-500" />
                    <span>{workshop.operatingHours}</span>
                  </span>
                  <span className="ws-meta-pill-highlight">
                    <Tag size={12} className="text-slate-500" />
                    <span>{workshop.category.replace(/^Bengkel\s+/i, "")}</span>
                  </span>
                </div>
              </div>

              {/* Layanan Unggulan Chips */}
              {workshop.services && workshop.services.length > 0 && (
                <div className="ws-modal-section-clean">
                  <h5 className="ws-clean-section-label">Layanan Unggulan:</h5>
                  <div className="ws-clean-chips-wrap">
                    {workshop.services.map((service) => (
                      <span key={service} className="ws-clean-service-chip">
                        <Check size={12} className="text-emerald-600" />
                        <span>{service}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ringkasan Profil Singkat */}
              <div className="ws-modal-section-clean">
                <p className="ws-clean-desc-text">
                  {workshop.description ||
                    `${workshop.workshopName} melayani perbaikan, instalasi, dan pemeliharaan AC bergaransi resmi dengan teknisi berlisensi SKKNI.`}
                </p>
              </div>

              {/* Unified Clean Info Card (Lokasi & Teknisi) */}
              <div className="ws-unified-info-card">
                {/* Row 1: Lokasi & Maps CTA */}
                <div className="ws-unified-row">
                  <div className="ws-unified-icon">
                    <MapPin size={16} className="text-sky-600" />
                  </div>
                  <div className="ws-unified-content">
                    <span className="ws-unified-label">Lokasi Bengkel / Toko</span>
                    <strong className="ws-unified-title">{workshop.address}</strong>
                    <span className="ws-unified-sub">{workshop.city}, {workshop.province}</span>
                  </div>
                  <a
                    href={mapsDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button secondary ws-btn-row-action"
                    title="Buka Navigasi Google Maps"
                  >
                    <Navigation size={12} />
                    <span>Rute Maps ↗</span>
                  </a>
                </div>

                <div className="ws-unified-divider" />

                {/* Row 2: Pimpinan & Portofolio */}
                <div className="ws-unified-row">
                  <div className="ws-unified-icon">
                    <UserCheck size={16} className="text-sky-600" />
                  </div>
                  <div className="ws-unified-content">
                    <span className="ws-unified-label">Pimpinan / Master Teknisi</span>
                    <strong className="ws-unified-title">{workshop.ownerName}</strong>
                    <span className="ws-unified-sub">No. KTA: {workshop.memberNumber} · Terverifikasi</span>
                  </div>
                  <Link
                    href={`/technicians?q=${encodeURIComponent(workshop.ownerName)}`}
                    className="button secondary ws-btn-row-action"
                    title="Lihat Portofolio Lengkap"
                  >
                    <span>Portofolio →</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA Bar */}
            <div className="ws-modal-bottom-bar">
              <div className="ws-modal-sub-actions">
                <button
                  type="button"
                  className="button secondary ws-btn-action-pill"
                  onClick={handleShare}
                  title="Bagikan Tautan"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
                  <span>{copied ? "Tersalin" : "Bagikan"}</span>
                </button>

                {cleanWebUrl && (
                  <a
                    href={cleanWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button secondary ws-btn-action-pill"
                  >
                    <Globe size={13} />
                    <span>Website</span>
                  </a>
                )}

                {workshop.phone && (
                  <a
                    href={`tel:${workshop.phone.replace(/\D/g, "")}`}
                    className="button secondary ws-btn-action-pill"
                  >
                    <Phone size={13} />
                    <span>Telepon</span>
                  </a>
                )}
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button primary ws-btn-whatsapp-main"
              >
                <MessageSquare size={15} />
                <span>Konsultasi &amp; Pesan WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
