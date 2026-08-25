"use client";

import {
  Briefcase,
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
          REFACTORED CLEAN & INFORMATIVE WORKSHOP DOSSIER MODAL
          ========================================================================= */}
      {showDetail && (
        <div
          className="ws-detail-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDetail(false);
          }}
        >
          <div className="ws-detail-modal-card" role="dialog" aria-modal="true">
            {/* Mobile Sheet Drag Indicator */}
            <div className="ws-modal-mobile-handle-bar" aria-hidden="true" />

            {/* Modal Top Bar */}
            <div className="ws-modal-header">
              <div className="ws-modal-header-main">
                <div className="ws-modal-header-top-row">
                  <span className="ws-modal-badge-verified">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Mitra Resmi Terverifikasi</span>
                  </span>
                  <button
                    type="button"
                    className="ws-modal-close-btn"
                    onClick={() => setShowDetail(false)}
                    aria-label="Tutup Dialog"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="ws-modal-header-sub-row">
                  <span className="ws-modal-badge-kta">
                    NRA: <strong>{workshop.memberNumber}</strong>
                  </span>
                  {workshop.distanceKm !== undefined && (
                    <span className="ws-modal-badge-distance">
                      📍 {workshop.distanceKm < 1 ? "< 1 km" : `±${Math.round(workshop.distanceKm)} km`}
                    </span>
                  )}
                  <span className="ws-modal-badge-rating">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span>{workshop.rating ? workshop.rating.toFixed(2) : "4.95"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="ws-modal-scroll-body">
              {/* Brand Hero */}
              <div className="ws-modal-brand-hero">
                <div className="ws-modal-brand-icon">
                  <Store size={26} className="text-sky-600" />
                </div>
                <div className="ws-modal-brand-info">
                  <h3 className="ws-modal-title">{workshop.workshopName}</h3>
                  <p className="ws-modal-tagline">{workshop.tagline}</p>
                </div>
              </div>

              {/* 4-Cell Bento Attribute Grid */}
              <div className="ws-modal-bento-grid">
                <div className="ws-bento-tile">
                  <div className="ws-bento-icon-box">
                    <Tag size={14} className="text-sky-600" />
                  </div>
                  <div>
                    <span className="ws-bento-label">Kategori Usaha</span>
                    <strong className="ws-bento-value">{workshop.category}</strong>
                  </div>
                </div>

                <div className="ws-bento-tile">
                  <div className="ws-bento-icon-box">
                    <MapPin size={14} className="text-sky-600" />
                  </div>
                  <div>
                    <span className="ws-bento-label">Wilayah Kota</span>
                    <strong className="ws-bento-value">{workshop.city}, {workshop.province}</strong>
                  </div>
                </div>

                <div className="ws-bento-tile">
                  <div className="ws-bento-icon-box">
                    <Clock size={14} className="text-sky-600" />
                  </div>
                  <div>
                    <span className="ws-bento-label">Jam Operasional</span>
                    <strong className="ws-bento-value">{workshop.operatingHours}</strong>
                  </div>
                </div>

                <div className="ws-bento-tile">
                  <div className="ws-bento-icon-box">
                    <User size={14} className="text-sky-600" />
                  </div>
                  <div>
                    <span className="ws-bento-label">Penanggung Jawab</span>
                    <strong className="ws-bento-value">{workshop.ownerName}</strong>
                  </div>
                </div>
              </div>

              {/* Editorial Description */}
              <div className="ws-modal-section">
                <div className="ws-section-header-clean">
                  <Building2 size={15} className="text-sky-600" />
                  <span>Tentang &amp; Profil Usaha</span>
                </div>
                <div className="ws-modal-editorial-box">
                  <p>
                    {workshop.description ||
                      `${workshop.workshopName} adalah unit usaha spesialis tata udara & refrigerasi berlisensi resmi di bawah naungan asosiasi dengan standar operasional prosedur mutu SKKNI, instrumen diagnostik terkalibrasi, dan garansi layanan transparan.`}
                  </p>
                </div>
              </div>

              {/* Clean Services Tags Cloud */}
              {workshop.services && workshop.services.length > 0 && (
                <div className="ws-modal-section">
                  <div className="ws-section-header-clean">
                    <Wrench size={15} className="text-sky-600" />
                    <span>Layanan Unggulan &amp; Spesialisasi Teknis ({workshop.services.length})</span>
                  </div>
                  <div className="ws-modal-services-wrap">
                    {workshop.services.map((service) => (
                      <div key={service} className="ws-service-chip">
                        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clean Location & Navigation Card */}
              <div className="ws-modal-section">
                <div className="ws-section-header-clean">
                  <MapPin size={15} className="text-sky-600" />
                  <span>Lokasi Bengkel &amp; Akses Rute</span>
                </div>
                <div className="ws-modal-map-card">
                  <div className="ws-map-card-text">
                    <strong>{workshop.address}</strong>
                    <span>{workshop.city}, {workshop.province}</span>
                  </div>
                  <a
                    href={mapsDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button primary ws-btn-nav-action"
                  >
                    <Navigation size={13} />
                    <span>Buka Rute Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Master Technician Credential Block */}
              <div className="ws-modal-master-tech-card">
                <div className="ws-master-left">
                  <div className="ws-master-avatar">
                    <UserCheck size={20} className="text-sky-600" />
                  </div>
                  <div className="ws-master-info">
                    <span className="ws-master-role">Pimpinan / Master Teknisi:</span>
                    <strong className="ws-master-name">{workshop.ownerName}</strong>
                    <span className="ws-master-kta">No. KTA: {workshop.memberNumber} · Terverifikasi</span>
                  </div>
                </div>
                <Link
                  href={`/technicians?q=${encodeURIComponent(workshop.ownerName)}`}
                  className="button secondary ws-btn-master-profile"
                >
                  <span>Portofolio Teknisi →</span>
                </Link>
              </div>
            </div>

            {/* Modal Sticky Bottom Action Bar */}
            <div className="ws-modal-footer">
              <div className="ws-modal-footer-sub-actions">
                <button
                  type="button"
                  className="button secondary ws-btn-footer-secondary"
                  onClick={handleShare}
                  title="Bagikan Tautan Profil"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
                  <span>{copied ? "Tersalin!" : "Bagikan"}</span>
                </button>

                {cleanWebUrl && (
                  <a
                    href={cleanWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button secondary ws-btn-footer-secondary"
                  >
                    <Globe size={13} />
                    <span>Website</span>
                  </a>
                )}

                {workshop.phone && (
                  <a
                    href={`tel:${workshop.phone.replace(/\D/g, "")}`}
                    className="button secondary ws-btn-footer-secondary"
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
                className="button primary ws-btn-footer-primary"
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
