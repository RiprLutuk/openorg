import { Building2, Network, UserRoundCheck } from "lucide-react";
import type { Metadata } from "next";
import { getSite, getStructure } from "@/lib/api";

export const metadata: Metadata = {
  title: "Organization structure",
  description: "Organization units, governance positions, and office holders.",
};

export default async function StructurePage() {
  const [structure, site] = await Promise.all([getStructure(), getSite()]);
  const activeAppointments = structure.assignments.length;
  return (
    <>
      <section className="structure-hero">
        <div className="wrap structure-hero-grid">
          <div className="structure-hero-copy">
            <p className="eyebrow light">Governance in the open</p>
            <h1>One organization, clearly accountable.</h1>
            <p className="structure-hero-description">
              Explore how {site.organization.name} is organized, who holds each
              office, and where every unit sits in the wider structure.
            </p>
          </div>
          <div className="structure-summary">
            <span>
              <Building2 size={20} />
              <strong>{structure.units.length}</strong>
              <small>Active units</small>
            </span>
            <span>
              <Network size={20} />
              <strong>{structure.positions.length}</strong>
              <small>Positions</small>
            </span>
            <span>
              <UserRoundCheck size={20} />
              <strong>{activeAppointments}</strong>
              <small>Office holders</small>
            </span>
          </div>
        </div>
      </section>
      <section className="structure-directory section-space">
        <div className="wrap">
          <div className="section-heading structure-heading">
            <div>
              <p className="eyebrow">Organization map</p>
              <h2>Leadership from national to local.</h2>
              <p>
                Unit names and levels are configurable, so the same structure
                works for a council, DPP–DPD network, regional chapter, or
                specialist committee.
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
                        {unit.type}
                        {parent ? ` · under ${parent.name}` : " · root unit"}
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
                              {position.description ?? "Governance office"}
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
                              Position vacant
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {!positions.length && (
                      <p className="public-empty-position">
                        Positions for this unit will be published here.
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
