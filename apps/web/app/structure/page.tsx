import { Building2, Network, UserRoundCheck } from "lucide-react";
import type { Metadata } from "next";
import { InteractiveStructurePreview } from "@/components/interactive-structure-preview";
import { getSite, getStructure } from "@/lib/api";

export const metadata: Metadata = {
  title: "Struktur Pengurus DPP & DPD ASISI Indonesia",
  description:
    "Bagan organisasi Pengurus Pusat (DPP), Pengurus Daerah (DPD) Provinsi, dan Koordinator Wilayah (Korwil/DPC) ASISI Indonesia.",
};

export default async function StructurePage() {
  const [structure, site] = await Promise.all([getStructure(), getSite()]);
  const activeAppointments = structure.assignments.length;
  return (
    <>
      <section className="structure-hero">
        <div className="wrap structure-hero-grid">
          <div className="structure-hero-copy">
            <p className="eyebrow light">Tata Kelola Organisasi Mandiri</p>
            <h1>Struktur Kepengurusan DPP & DPD ASISI Indonesia</h1>
            <p className="structure-hero-description">
              Struktur resmi kepengurusan {site.organization.name} dari tingkat
              Dewan Pimpinan Pusat (DPP), Dewan Pimpinan Daerah (DPD) Provinsi,
              hingga Koordinator Wilayah (Korwil/DPC) di seluruh Nusantara.
            </p>
          </div>
          <div className="structure-summary">
            <span>
              <Building2 size={20} />
              <strong>{structure.units.length}</strong>
              <small>Unit DPP / DPD / DPC</small>
            </span>
            <span>
              <Network size={20} />
              <strong>{structure.positions.length}</strong>
              <small>Jabatan Pengurus</small>
            </span>
            <span>
              <UserRoundCheck size={20} />
              <strong>{activeAppointments}</strong>
              <small>Pengurus Aktif</small>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Department & Leadership Filter Matrix */}
      {structure.assignments.length > 0 && (
        <InteractiveStructurePreview structure={structure} />
      )}

      <section className="structure-directory section-space">
        <div className="wrap">
          <div className="section-heading structure-heading">
            <div>
              <p className="eyebrow">Peta Kepengurusan ASISI</p>
              <h2>Pengurus Pusat & Daerah Terintegrasi</h2>
              <p>
                Kepengurusan ASISI mengkoordinasikan kegiatan anggota teknisi,
                pelatihan kompetensi BNSP, serta kemitraan produsen HVAC/R
                tingkat daerah dan nasional.
              </p>
            </div>
          </div>
          <div className="public-unit-grid">
            {structure.units.map((unit) => {
              const parent = structure.units.find(
                (candidate) => candidate.id === unit.parentId,
              );
              const positions = structure.positions.filter(
                (position) => position.unitId === unit.id,
              );
              return (
                <article className="public-unit-card" key={unit.id}>
                  <header>
                    <span>
                      <Building2 size={20} />
                    </span>
                    <div>
                      <small>
                        {unit.type === "national"
                          ? "Dewan Pimpinan Pusat (DPP)"
                          : unit.type === "regional"
                            ? "Dewan Pimpinan Daerah (DPD)"
                            : "Koordinator Wilayah (DPC)"}
                        {parent
                          ? ` · Terhubung ke ${parent.name}`
                          : " · Tingkat Pusat"}
                      </small>
                      <h2>{unit.name}</h2>
                      {unit.description && <p>{unit.description}</p>}
                    </div>
                  </header>
                  <div className="public-position-list">
                    {positions.map((position) => {
                      const appointment = structure.assignments.find(
                        (item) => item.assignment.positionId === position.id,
                      );
                      return (
                        <div className="public-position" key={position.id}>
                          <div className="public-position-copy">
                            <strong>{position.title}</strong>
                            <small>
                              {position.description ?? "Jabatan Pengurus"}
                            </small>
                          </div>
                          {appointment ? (
                            <div className="public-office-holder">
                              {appointment.member.avatarUrl ? (
                                <img
                                  src={appointment.member.avatarUrl}
                                  alt=""
                                />
                              ) : (
                                <span>
                                  {appointment.member.name
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </span>
                              )}
                              <div>
                                <strong>{appointment.member.name}</strong>
                                <small>{appointment.member.memberNumber}</small>
                              </div>
                            </div>
                          ) : (
                            <span className="public-vacant">
                              Jabatan Kosong
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {!positions.length && (
                      <p className="public-empty-position">
                        Daftar pengurus unit ini akan ditampilkan di sini.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
