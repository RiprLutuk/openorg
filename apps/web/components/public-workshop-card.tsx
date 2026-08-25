"use client";

import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
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
  Store,
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
    workshop.googleMapsUrl && workshop.googleMapsUrl.startsWith("http")
      ? workshop.googleMapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const cleanWhatsapp = workshop.whatsapp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Halo ${workshop.workshopName}, saya menemukan profil usaha Anda di Direktori Resmi APTI Indonesia. Saya ingin konsultasi / order layanan pendingin.`,
  )}`;

  const cleanWebUrl = workshop.website
    ? workshop.website.startsWith("http")
      ? workshop.website
      : `https://${workshop.website}`
    : undefined;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/bengkel?q=${encodeURIComponent(
      workshop.workshopName,
    )}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <article className="standard-workshop-card">
        {/* 1. Header: Kategori & Status Resmi */}
        <div className="ws-card-header-row">
          <span className="ws-cat-pill" title={workshop.category}>
            <Store size={12} className="text-sky-600 flex-shrink-0" />
            <span>
              {workshop.category
                .replace(/^Bengkel\s+/i, "")
                .replace(/& Manifold Digital/i, "& Manifold")}
            </span>
          </span>
          <div className="ws-badge-group">
            {is24h && <span className="ws-pill-24h">24 Jam</span>}
            <span className="ws-pill-verified" title="Mitra Resmi Terverifikasi">
              <ShieldCheck size={12} className="text-emerald-600 flex-shrink-0" />
              <span>Resmi</span>
            </span>
          </div>
        </div>

        {/* 2. Nama Bengkel & Tagline (Clickable to open Detail Dossier) */}
        <div
          className="ws-card-brand cursor-pointer group"
          onClick={() => setShowDetail(true)}
          title="Klik untuk melihat profil lengkap usaha"
        >
          <h4 className="ws-brand-title truncate group-hover:text-sky-600 transition-colors">
            {workshop.workshopName}
          </h4>
          <p className="ws-brand-tagline truncate">
            {workshop.tagline || `${workshop.category} di ${workshop.city}`}
          </p>
        </div>

        {/* 3. Lokasi & Jam Operasional */}
        <div className="ws-meta-box">
          <div className="ws-meta-item truncate">
            <MapPin size={13} className="text-sky-500 flex-shrink-0" />
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
          RICH DETAIL DOSSIER MODAL (Full, Professional, Unabridged Information)
          ========================================================================= */}
      {showDetail && (
        <div
          className="ws-detail-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDetail(false);
          }}
        >
          <div className="ws-detail-modal-card" role="dialog" aria-modal="true">
            {/* Modal Header */}
            <div className="ws-modal-header">
              <div className="ws-modal-header-badges">
                <span className="ws-modal-badge-verified">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Mitra Resmi Terdaftar Organisasi</span>
                </span>
                <span className="ws-modal-badge-kta">
                  NRA: <strong>{workshop.memberNumber}</strong>
                </span>
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

            {/* Modal Body */}
            <div className="ws-modal-scroll-body">
              {/* Business Name & Tagline */}
              <div className="ws-modal-brand-hero">
                <div className="ws-modal-brand-icon">
                  <Store size={26} className="text-sky-600" />
                </div>
                <div>
                  <h3 className="ws-modal-title">{workshop.workshopName}</h3>
                  <p className="ws-modal-tagline">{workshop.tagline}</p>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="ws-modal-info-grid">
                <div className="ws-modal-info-tile">
                  <span className="ws-tile-label">Kategori Usaha</span>
                  <strong className="ws-tile-val">{workshop.category}</strong>
                </div>
                <div className="ws-modal-info-tile">
                  <span className="ws-tile-label">Wilayah Jangkauan</span>
                  <strong className="ws-tile-val">{workshop.city}, {workshop.province}</strong>
                </div>
                <div className="ws-modal-info-tile">
                  <span className="ws-tile-label">Jam Layanan</span>
                  <strong className="ws-tile-val">{workshop.operatingHours}</strong>
                </div>
                <div className="ws-modal-info-tile">
                  <span className="ws-tile-label">Penanggung Jawab</span>
                  <strong className="ws-tile-val">{workshop.ownerName}</strong>
                </div>
              </div>

              {/* Full Description Section */}
              <div className="ws-modal-section">
                <h5 className="ws-modal-section-title">
                  <Building2 size={15} className="text-sky-600" />
                  <span>Tentang &amp; Profil Usaha</span>
                </h5>
                <p className="ws-modal-description-text">
                  {workshop.description ||
                    `${workshop.workshopName} adalah unit usaha teknik pendingin dan refrigerasi terdaftar di bawah naungan asosiasi resmi dengan standar mutu pelayanan prima, peralatan uji berkalibrasi, dan teknisi bersertifikat kompetensi nasional.`}
                </p>
              </div>

              {/* Full Services & Capabilities */}
              {workshop.services && workshop.services.length > 0 && (
                <div className="ws-modal-section">
                  <h5 className="ws-modal-section-title">
                    <Wrench size={15} className="text-sky-600" />
                    <span>Layanan Unggulan &amp; Spesialisasi Teknis</span>
                  </h5>
                  <div className="ws-modal-services-grid">
                    {workshop.services.map((service) => (
                      <div key={service} className="ws-modal-service-card">
                        <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location & Navigation */}
              <div className="ws-modal-section">
                <h5 className="ws-modal-section-title">
                  <MapPin size={15} className="text-sky-600" />
                  <span>Lokasi Bengkel / Toko</span>
                </h5>
                <div className="ws-modal-address-box">
                  <div className="ws-addr-detail">
                    <strong>{workshop.address}</strong>
                    <span>{workshop.city}, {workshop.province}</span>
                  </div>
                  <a
                    href={mapsDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button primary ws-btn-nav-modal"
                  >
                    <Navigation size={14} />
                    <span>Petunjuk Rute Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Technical Responsibility / Verifikasi KTA */}
              <div className="ws-modal-section ws-modal-tech-card">
                <div className="ws-tech-left">
                  <div className="ws-tech-avatar-box">
                    <UserCheck size={20} className="text-sky-700" />
                  </div>
                  <div>
                    <span className="ws-tech-role-label">Pimpinan / Master Teknisi:</span>
                    <strong className="ws-tech-name">{workshop.ownerName}</strong>
                    <span className="ws-tech-kta">No. Anggota: {workshop.memberNumber}</span>
                  </div>
                </div>
                <Link
                  href={`/technicians?q=${encodeURIComponent(workshop.ownerName)}`}
                  className="button secondary ws-btn-view-tech"
                >
                  <span>Lihat Portofolio Teknisi →</span>
                </Link>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="ws-modal-footer">
              <button
                type="button"
                className="button secondary ws-btn-share-modal"
                onClick={handleShare}
                title="Bagikan Tautan Profil"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                <span>{copied ? "Tersalin!" : "Bagikan"}</span>
              </button>

              {cleanWebUrl && (
                <a
                  href={cleanWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button secondary ws-btn-web-modal"
                >
                  <Globe size={14} />
                  <span>Website</span>
                </a>
              )}

              {workshop.phone && (
                <a
                  href={`tel:${workshop.phone.replace(/\D/g, "")}`}
                  className="button secondary ws-btn-phone-modal"
                >
                  <Phone size={14} />
                  <span>Telepon</span>
                </a>
              )}

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button primary ws-btn-wa-modal"
              >
                <MessageSquare size={15} />
                <span>Konsultasi WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
