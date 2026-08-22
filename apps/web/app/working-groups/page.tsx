import type { Metadata } from "next";
import { getPublicSite } from "../../lib/api";
import { Users, Briefcase, ChevronRight, Scale, ShieldCheck } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Kelompok Kerja (Pokja) Advokasi & Komite - ${site.organization.name}`,
    description: "Portal Kelompok Kerja (Pokja) tematik advokasi kebijakan, standardisasi kompetensi, dan komite etik organisasi.",
  };
}

interface WorkingGroup {
  id: string;
  name: string;
  slug: string;
  chairName: string | null;
  category: string;
  description: string | null;
  memberCount: number;
}

async function getWorkingGroups(): Promise<WorkingGroup[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/v1/public/working-groups`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function WorkingGroupsPage() {
  const site = await getPublicSite();
  const groupsList = await getWorkingGroups();

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="working-groups-hero">
        <div className="wrap">
          <div className="hero-pill">
            <Users size={14} />
            <span>Advocacy & Special Committees</span>
          </div>
          <h1>Kelompok Kerja (Pokja) & Komite Tematik</h1>
          <p className="hero-lead">
            Wadah kerja spesifik pengurus dan tenaga ahli dalam merumuskan naskah advokasi, standar kompetensi K3, serta mediasi etika organisasi.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="working-groups-body">
        <div className="wrap">
          <div className="pokja-grid">
            {groupsList.length > 0 ? (
              groupsList.map((pokja) => (
                <div key={pokja.id} className="pokja-card">
                  <div className="pokja-category-pill">{pokja.category}</div>
                  <h2>{pokja.name}</h2>
                  {pokja.chairName && (
                    <p className="pokja-chair">
                      <Briefcase size={14} /> Ketua: <strong>{pokja.chairName}</strong>
                    </p>
                  )}
                  {pokja.description && <p className="pokja-desc">{pokja.description}</p>}
                  <div className="pokja-card-footer">
                    <span className="pokja-members">
                      <Users size={14} /> {pokja.memberCount} Anggota Komite
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <h3>Belum Ada Pokja Aktif</h3>
                <p>Kelompok kerja tematik sedang disusun oleh Dewan Pimpinan Pusat.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
