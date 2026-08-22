"use client";

import { ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PublicStructure } from "@/lib/api";

type Props = {
  structure: PublicStructure;
};

export function InteractiveStructurePreview({ structure }: Props) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all");

  const units = structure.units;
  const assignments = structure.assignments;

  const filteredAssignments =
    selectedUnitId === "all"
      ? assignments.slice(0, 6)
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
            <span className="eyebrow">Tata Kelola Organisasi</span>
            <h2>Dewan Pimpinan & Struktur Kepengurusan</h2>
            <p>
              Pimpinan organisasi yang mengkoordinasikan kegiatan anggota,
              pelatihan profesi, serta kemitraan strategis nasional.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="structure-filter-pills">
            <button
              type="button"
              className={`filter-pill ${selectedUnitId === "all" ? "active" : ""}`}
              onClick={() => setSelectedUnitId("all")}
            >
              Semua Pengurus
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
                {unit.name}
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

              return (
                <div className="leader-card-refined" key={item.assignment.id}>
                  <div className="leader-card-top">
                    <div className="leader-avatar-frame">
                      {item.member.avatarUrl ? (
                        <img
                          src={item.member.avatarUrl}
                          alt={item.member.name}
                          className="leader-img"
                        />
                      ) : (
                        <span className="leader-avatar-placeholder">
                          {item.member.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span className="avatar-status-dot" />
                    </div>

                    <div className="leader-badge-pill">
                      <ShieldCheck size={12} />
                      <span>{unit?.name ?? "Pusat"}</span>
                    </div>
                  </div>

                  <div className="leader-card-info">
                    <h4>{item.member.name}</h4>
                    <p className="leader-position">
                      {pos?.title ?? "Pengurus"}
                    </p>
                    <small className="leader-id">
                      No. KTA: {item.member.memberNumber}
                    </small>
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

        <div className="section-action-center">
          <Link href="/structure" className="btn-secondary-action">
            <span>Lihat Bagan Struktur Pengurus Lengkap</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
