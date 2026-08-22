import type { Metadata } from "next";
import { getPublicSite } from "../../lib/api";
import { Flag, ShieldCheck, MapPin, Users } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Direktori Klub & Tanda Terdaftar (TKT) - ${site.organization.name}`,
    description: "Direktori klub terdaftar resmi, tanda keanggotaan terverifikasi (TKT), dan jaringan pengurus daerah.",
  };
}

interface Club {
  id: string;
  clubName: string;
  codeTkt: string;
  province: string;
  category: string;
  chairName: string | null;
  activeMembers: number;
  status: string;
}

async function getClubs(): Promise<Club[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/v1/public/clubs`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ClubsPage() {
  const site = await getPublicSite();
  const clubsList = await getClubs();

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="clubs-hero">
        <div className="wrap">
          <div className="hero-pill">
            <Flag size={14} />
            <span>Official Registered Clubs Registry</span>
          </div>
          <h1>Direktori Klub & Tanda Klub Terdaftar (TKT)</h1>
          <p className="hero-lead">
            Daftar resmi komunitas dan klub yang memegang Tanda Klub Terdaftar (TKT) resmi dari pengurus daerah setempat.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="clubs-body">
        <div className="wrap">
          <div className="club-grid">
            {clubsList.length > 0 ? (
              clubsList.map((club) => (
                <div key={club.id} className="club-card">
                  <div className="club-tkt-badge">
                    <ShieldCheck size={13} /> {club.codeTkt}
                  </div>
                  <h2>{club.clubName}</h2>
                  <p className="club-location">
                    <MapPin size={14} /> {club.province}
                  </p>
                  {club.chairName && <p className="club-chair">Ketua Klub: {club.chairName}</p>}
                  <div className="club-card-footer">
                    <span className="club-members">
                      <Users size={14} /> {club.activeMembers} Anggota Terdaftar
                    </span>
                    <span className="badge-verified">Verified</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Flag size={48} />
                <h3>Belum Ada Klub Terdaftar</h3>
                <p>Klub terdaftar TKT sedang diperbarui oleh pengurus daerah.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
