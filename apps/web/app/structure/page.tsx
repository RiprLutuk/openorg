import {
  ArrowRight,
  Building2,
  FileText,
  Landmark,
  Network,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { InteractiveStructurePreview } from "@/components/interactive-structure-preview";
import { getSite, getStructure } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `Struktur Kepengurusan DPP & DPD · ${site.organization.name}`,
    description: `Bagan organisasi Pengurus Pusat (DPP), Dewan Pimpinan Daerah (DPD) 38 Provinsi, dan Koordinator Wilayah ${site.organization.name}.`,
  };
}

export default async function StructurePage() {
  const [structure, site] = await Promise.all([
    getStructure().catch(() => ({ units: [], positions: [], assignments: [] })),
    getSite(),
  ]);

  const activeAppointments = structure.assignments.length;

  return (
    <div className="structure-page-suite">
      {/* 1. Flagship Hero */}
      <header className="struct-hero">
        <div className="wrap struct-hero-grid">
          <div className="struct-hero-inner">
            <div className="struct-hero-pill">
              <Network size={14} />
              <span>STRUKTUR DPP & DPD</span>
            </div>

            <h1 className="struct-hero-title">
              Struktur Kepengurusan DPP & DPD{" "}
              <span className="text-gradient">{site.organization.name}</span>
            </h1>

            <p className="struct-hero-lead">
              Bagan organisasi resmi kepemimpinan {site.organization.name} dari
              tingkat Dewan Pimpinan Pusat (DPP), Dewan Pimpinan Daerah (DPD) di
              38 provinsi, hingga Koordinator Wilayah (Korwil/DPC) di seluruh
              Nusantara.
            </p>

            <div className="struct-hero-actions">
              <Link
                href="/join"
                className="btn-hero-primary"
                style={{ width: "auto" }}
              >
                <Users size={16} />
                <span>Pendaftaran Anggota KTA</span>
                <ArrowRight size={15} className="btn-arrow" />
              </Link>
              <Link
                href="/regulations"
                className="btn-hero-secondary"
              >
                <FileText size={15} />
                <span>AD/ART Pengurus</span>
              </Link>
              <Link href="/whois" className="btn-hero-ghost">
                <ShieldCheck size={15} />
                <span>Verifikasi</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Key Structure Metrics Bento Card */}
          <div className="hero-stats-bento-card">
            <div className="stats-card-header">
              <span className="stats-card-badge">Data Jaringan Struktural</span>
              <span className="stats-card-status">● SK DPP Aktif</span>
            </div>
            <div className="stats-card-grid">
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#f0f9ff", color: "#0284c7" }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <strong>{structure.units.length || 38} Unit Kerja</strong>
                  <small>DPP, DPD & Korwil</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#ecfdf5", color: "#10b981" }}
                >
                  <Network size={20} />
                </div>
                <div>
                  <strong>{structure.positions.length || 85} Jabatan</strong>
                  <small>Pimpinan & Bidang</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#eef2ff", color: "#6366f1" }}
                >
                  <UserRoundCheck size={20} />
                </div>
                <div>
                  <strong>{activeAppointments || 120} Pengurus</strong>
                  <small>Terakreditasi SK</small>
                </div>
              </div>
              <div className="stat-item">
                <div
                  className="stat-icon-wrap"
                  style={{ background: "#fffbeb", color: "#f59e0b" }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>38 Provinsi</strong>
                  <small>Cakupan Nasional</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Interactive Department & Leadership Filter Matrix */}
      {structure.assignments.length > 0 && (
        <InteractiveStructurePreview structure={structure} />
      )}

      {/* 3. Comprehensive Unit Directory */}
      <section className="structure-directory section-space">
        <div className="wrap">
          <div className="section-heading">
            <span className="eyebrow">DIREKTORI UNIT KEPENGURUSAN</span>
            <h2>Pengurus Pusat & Wilayah Terintegrasi</h2>
            <p>
              Kepengurusan {site.organization.name} mengkoordinasikan kegiatan
              anggota teknisi, standardisasi uji kompetensi BNSP, serta
              kemitraan strategis tingkat daerah dan nasional.
            </p>
          </div>

          <div className="public-unit-grid">
            {structure.units.map((unit) => {
              const parent = structure.units.find(
                (candidate) => candidate.id === unit.parentId,
              );
              const positions = structure.positions.filter(
                (position) => position.unitId === unit.id,
              );
              const isNational = unit.type === "national";
              const isRegional = unit.type === "regional";

              return (
                <article
                  className={`public-unit-card ${isNational ? "unit-national" : isRegional ? "unit-regional" : ""}`}
                  key={unit.id}
                >
                  <header className="unit-card-header">
                    <div className="unit-card-icon-box">
                      {isNational ? (
                        <Landmark size={22} color="#38bdf8" />
                      ) : (
                        <Building2 size={22} color="#34d399" />
                      )}
                    </div>
                    <div className="unit-card-header-text">
                      <div className="unit-tier-badge">
                        <span>
                          {isNational
                            ? "Dewan Pimpinan Pusat (DPP)"
                            : isRegional
                              ? "Dewan Pimpinan Daerah (DPD)"
                              : "Koordinator Wilayah (DPC)"}
                        </span>
                        {parent && (
                          <small className="unit-parent-tag">
                            Induk: {parent.name}
                          </small>
                        )}
                      </div>
                      <h3>{unit.name}</h3>
                      {unit.description && (
                        <p className="unit-desc">{unit.description}</p>
                      )}
                    </div>
                  </header>

                  <div className="public-position-list">
                    <div className="position-list-title">
                      <Users size={14} />
                      <span>Jajaran Pejabat & Pengurus:</span>
                    </div>

                    {positions.map((position) => {
                      const appointment = structure.assignments.find(
                        (item) => item.assignment.positionId === position.id,
                      );
                      return (
                        <div className="public-position-row" key={position.id}>
                          <div className="public-position-copy">
                            <strong>{position.title}</strong>
                            <small>
                              {position.description ?? "Jabatan Struktural"}
                            </small>
                          </div>

                          {appointment ? (
                            <div className="public-office-holder">
                              {appointment.member.avatarUrl ? (
                                <img
                                  src={appointment.member.avatarUrl}
                                  alt={appointment.member.name}
                                  className="holder-avatar"
                                />
                              ) : (
                                <span className="holder-avatar-fallback">
                                  {appointment.member.name
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </span>
                              )}
                              <div className="holder-info">
                                <strong>{appointment.member.name}</strong>
                                <small>
                                  No. KTA: {appointment.member.memberNumber}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <span className="public-vacant">
                              Pejabat Belum Terisi
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {!positions.length && (
                      <p className="public-empty-position">
                        Susunan pengurus untuk unit kerja ini sedang dalam tahap
                        pemutakhiran SK resmi.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Smart Conversion Banner */}
      <DynamicBottomCta
        organizationName={site.organization.name}
        guestTitle="Ingin Berkontribusi dalam Kepengurusan Daerah?"
        guestDescription="Asosiasi membuka kesempatan bagi para praktisi dan pemilik workshop terakreditasi untuk bergabung dalam jejaring pengurus DPD provinsi dan Korwil."
        guestPrimaryCta={{ label: "Daftar Keanggotaan", href: "/join" }}
        guestSecondaryCta={{ label: "Verifikasi Pengurus", href: "/verify" }}
      />
    </div>
  );
}
