"use client";

import {
  ArrowRight,
  CheckCircle2,
  Landmark,
  QrCode,
  ShieldCheck,
  UserCheck,
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

  const units = structure.units;
  const assignments = structure.assignments;

  const filteredAssignments =
    selectedUnitId === "all"
      ? assignments.slice(0, 8)
      : assignments.filter((item) => {
          const pos = structure.positions.find(
            (p) => p.id === item.assignment.positionId,
          );
          return pos?.unitId === selectedUnitId;
        });

  return (
    <section className="section-space home-leadership-section">
      <div className="wrap">
        <div className="section-heading-flex">
          <div>
            <span className="eyebrow">DEWAN PIMPINAN & EKSEKUTIF</span>
            <h2>Struktur Kepengurusan Aktif</h2>
            <p>
              Jajaran pimpinan yang mengemban amanah koordinasi anggota teknisi,
              standardisasi uji kompetensi BNSP, dan kemitraan industri
              nasional.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="structure-filter-pills">
            <button
              type="button"
              className={`filter-pill ${selectedUnitId === "all" ? "active" : ""}`}
              onClick={() => setSelectedUnitId("all")}
            >
              Semua Pimpinan
            </button>
            {units.slice(0, 4).map((unit) => (
              <button
                key={unit.id}
                type="button"
                className={`filter-pill ${
                  selectedUnitId === unit.id ? "active" : ""
                }`}
                onClick={() => setSelectedUnitId(unit.id)}
              >
                {formatUnitBadge(unit.name, unit.type)}
              </button>
            ))}
          </div>
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
                <div
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
                      <span>SK DPP</span>
                    </span>
                  </div>

                  {/* Profile Header: Avatar & Info */}
                  <div className="leader-profile-row">
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
                  </div>

                  {/* Card Footer: KTA Number */}
                  <div className="leader-card-bottom-row">
                    <span className="leader-id-tag">
                      <QrCode size={12} />
                      <span>{item.member.memberNumber}</span>
                    </span>
                    <span className="leader-active-tag">Pengurus Aktif</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-filter-state">
              <UserCheck size={32} />
              <p>Belum ada daftar pengurus aktif pada unit ini.</p>
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
    </section>
  );
}
