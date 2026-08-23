"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Landmark,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PublicStructure } from "@/lib/api";

type Props = {
  structure: PublicStructure;
};

function formatUnitBadge(name?: string, type?: string) {
  if (!name) return "DPP Pusat";
  if (type === "national" || name.toLowerCase().includes("pusat")) {
    return "DPP Pusat";
  }
  return name
    .replace(/APTI\s+/gi, "")
    .replace(/ASISI\s+/gi, "")
    .trim();
}

export function InteractiveStructurePreview({ structure }: Props) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedKta, setCopiedKta] = useState<string | null>(null);
  const [activeLeaderModal, setActiveLeaderModal] = useState<{
    member: {
      id: string;
      name: string;
      avatarUrl: string | null;
      memberNumber: string;
    };
    position: {
      title: string;
      description: string | null;
    } | null;
    unit: {
      name: string;
      type: string;
    } | null;
    startsAt: string | null;
    endsAt: string | null;
  } | null>(null);

  const units = structure.units;
  const assignments = structure.assignments;

  const filteredAssignments = assignments.filter((item) => {
    const pos = structure.positions.find(
      (p) => p.id === item.assignment.positionId,
    );
    const unit = structure.units.find((u) => u.id === pos?.unitId);

    const matchesUnit =
      selectedUnitId === "all" || pos?.unitId === selectedUnitId;
    const matchesSearch =
      !searchQuery ||
      item.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pos?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.member.memberNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesUnit && matchesSearch;
  });

  const handleCopyKta = (e: React.MouseEvent, ktaNumber: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ktaNumber);
    setCopiedKta(ktaNumber);
    setTimeout(() => setCopiedKta(null), 2000);
  };

  return (
    <section className="section-space home-leadership-section">
      <div className="wrap">
        {/* Section Header & Subtitle */}
        <div className="section-heading-flex">
          <div>
            <div className="leader-section-badge">
              <Sparkles size={14} color="#38bdf8" />
              <span>DEWAN PIMPINAN & EKSEKUTIF</span>
            </div>
            <h2>Struktur Kepengurusan Aktif</h2>
            <p>
              Pimpinan resmi yang mengkoordinasikan kegiatan anggota teknisi,
              standardisasi kompetensi BNSP, dan kemitraan industri nasional.
            </p>
          </div>

          {/* Search Box */}
          <div className="leader-quick-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Cari nama, jabatan, KTA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Bersihkan pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills with Counts */}
        <div className="structure-filter-pills-bar">
          <button
            type="button"
            className={`filter-pill-modern ${selectedUnitId === "all" ? "active" : ""}`}
            onClick={() => setSelectedUnitId("all")}
          >
            <span>Semua Pimpinan</span>
            <span className="pill-count">{assignments.length}</span>
          </button>
          {units.slice(0, 5).map((unit) => {
            const count = assignments.filter((a) => {
              const pos = structure.positions.find(
                (p) => p.id === a.assignment.positionId,
              );
              return pos?.unitId === unit.id;
            }).length;

            return (
              <button
                key={unit.id}
                type="button"
                className={`filter-pill-modern ${
                  selectedUnitId === unit.id ? "active" : ""
                }`}
                onClick={() => setSelectedUnitId(unit.id)}
              >
                <span>{formatUnitBadge(unit.name, unit.type)}</span>
                {count > 0 && <span className="pill-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Leaders Grid */}
        <div className="leaders-grid-refined">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((item) => {
              const pos = structure.positions.find(
                (p) => p.id === item.assignment.positionId,
              );
              const unit = structure.units.find((u) => u.id === pos?.unitId);
              const isNational =
                unit?.type === "national" ||
                unit?.name?.toLowerCase().includes("pusat");

              return (
                <article
                  className={`leader-card-refined ${isNational ? "is-national" : ""}`}
                  key={item.assignment.id}
                >
                  {/* Top Bar: Unit Badge & Verified SK */}
                  <div className="leader-card-top-bar">
                    <span
                      className={`leader-badge-pill ${isNational ? "badge-national" : "badge-regional"}`}
                    >
                      {isNational ? (
                        <Landmark size={12} />
                      ) : (
                        <ShieldCheck size={12} />
                      )}
                      <span>{formatUnitBadge(unit?.name, unit?.type)}</span>
                    </span>

                    <span className="leader-sk-badge">
                      <CheckCircle2 size={11} color="#16a34a" />
                      <span>SK DPP Terverifikasi</span>
                    </span>
                  </div>

                  {/* Profile Header: Avatar & Info */}
                  <button
                    type="button"
                    className="leader-profile-btn"
                    onClick={() =>
                      setActiveLeaderModal({
                        member: item.member,
                        position: pos
                          ? {
                              title: pos.title,
                              description: pos.description ?? null,
                            }
                          : null,
                        unit: unit
                          ? { name: unit.name, type: unit.type }
                          : null,
                        startsAt: item.assignment.startsAt,
                        endsAt: item.assignment.endsAt,
                      })
                    }
                  >
                    <div className="leader-avatar-frame">
                      {item.member.avatarUrl ? (
                        <img
                          src={item.member.avatarUrl}
                          alt={item.member.name}
                          className="leader-img"
                        />
                      ) : (
                        <span className="leader-avatar-placeholder">
                          {item.member.name
                            .split(" ")
                            .map((n) => n[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "AP"}
                        </span>
                      )}
                    </div>

                    <div className="leader-card-info">
                      <h4 title={item.member.name}>{item.member.name}</h4>
                      <p className="leader-position">
                        {pos?.title ?? "Pengurus Organisasi"}
                      </p>
                    </div>
                  </button>

                  {/* Card Footer: KTA Number + Quick Action */}
                  <div className="leader-card-bottom-row">
                    <button
                      type="button"
                      className="leader-id-btn"
                      onClick={(e) =>
                        handleCopyKta(e, item.member.memberNumber)
                      }
                      title="Klik untuk menyalin nomor KTA"
                    >
                      <QrCode size={12} />
                      <span>{item.member.memberNumber}</span>
                      {copiedKta === item.member.memberNumber ? (
                        <span className="copy-indicator success">
                          <Check size={11} /> Salin!
                        </span>
                      ) : (
                        <span className="copy-indicator">
                          <Copy size={11} />
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      className="leader-detail-btn"
                      onClick={() =>
                        setActiveLeaderModal({
                          member: item.member,
                          position: pos
                            ? {
                                title: pos.title,
                                description: pos.description ?? null,
                              }
                            : null,
                          unit: unit
                            ? { name: unit.name, type: unit.type }
                            : null,
                          startsAt: item.assignment.startsAt,
                          endsAt: item.assignment.endsAt,
                        })
                      }
                    >
                      <span>Detail</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-filter-state">
              <UserCheck size={36} color="#94a3b8" />
              <h4>Tidak Ada Pengurus Sesuai Pencarian</h4>
              <p>
                Coba sesuaikan kata kunci nama, nomor KTA, atau ubah filter unit
                kerja.
              </p>
              <button
                type="button"
                className="button secondary btn-sm"
                onClick={() => {
                  setSelectedUnitId("all");
                  setSearchQuery("");
                }}
              >
                Reset Filter & Pencarian
              </button>
            </div>
          )}
        </div>

        {/* Centered Action Button */}
        <div className="leadership-action-center">
          <Link href="/structure" className="btn-leadership-action">
            <span>Buka Direktori Struktur & Unit Lengkap</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Interactive Leader Detail Modal */}
      {activeLeaderModal && (
        <div
          className="leader-modal-overlay"
          onClick={() => setActiveLeaderModal(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveLeaderModal(null);
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div className="leader-modal-card" role="document">
            {/* Modal Header */}
            <div className="leader-modal-header">
              <div className="modal-title-wrap">
                <ShieldCheck size={20} color="#38bdf8" />
                <h3>Profil & Kredensial Pengurus</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveLeaderModal(null)}
                aria-label="Tutup detail modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Profile Hero */}
            <div className="leader-modal-body">
              <div className="modal-profile-hero">
                <div className="modal-avatar-frame">
                  {activeLeaderModal.member.avatarUrl ? (
                    <img
                      src={activeLeaderModal.member.avatarUrl}
                      alt={activeLeaderModal.member.name}
                      className="modal-avatar-img"
                    />
                  ) : (
                    <span className="modal-avatar-fallback">
                      {activeLeaderModal.member.name
                        .split(" ")
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "AP"}
                    </span>
                  )}
                </div>

                <div className="modal-profile-copy">
                  <span className="modal-tier-badge">
                    {activeLeaderModal.unit?.name ?? "Pengurus Pusat"}
                  </span>
                  <h4>{activeLeaderModal.member.name}</h4>
                  <p className="modal-role">
                    {activeLeaderModal.position?.title ?? "Pejabat Organisasi"}
                  </p>
                </div>
              </div>

              {/* Credential Data Grid */}
              <div className="modal-data-grid">
                <div className="modal-data-item">
                  <small>Nomor KTA Digital</small>
                  <strong>{activeLeaderModal.member.memberNumber}</strong>
                </div>
                <div className="modal-data-item">
                  <small>Status Jabatan</small>
                  <span className="modal-status-pill">
                    <CheckCircle2 size={12} /> Terakreditasi Aktif
                  </span>
                </div>
                <div className="modal-data-item">
                  <small>Tingkat Unit</small>
                  <strong>
                    {activeLeaderModal.unit?.type === "national"
                      ? "Dewan Pimpinan Pusat (DPP)"
                      : activeLeaderModal.unit?.type === "regional"
                        ? "Dewan Pimpinan Daerah (DPD)"
                        : "Koordinator Wilayah (DPC)"}
                  </strong>
                </div>
                <div className="modal-data-item">
                  <small>Masa Bakti SK</small>
                  <strong>2024 &ndash; 2029 (5 Tahun)</strong>
                </div>
              </div>

              {/* Verification & Action Buttons */}
              <div className="modal-actions-row">
                <Link
                  href={`/whois?q=${encodeURIComponent(activeLeaderModal.member.memberNumber)}`}
                  className="button primary btn-modal-action"
                  onClick={() => setActiveLeaderModal(null)}
                >
                  <ExternalLink size={15} />
                  <span>Verifikasi di Registri Publik</span>
                </Link>
                <button
                  type="button"
                  className="button secondary btn-modal-copy"
                  onClick={(e) =>
                    handleCopyKta(e, activeLeaderModal.member.memberNumber)
                  }
                >
                  <Copy size={15} />
                  <span>
                    {copiedKta === activeLeaderModal.member.memberNumber
                      ? "Nomor KTA Tersalin!"
                      : "Salin No. KTA"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
