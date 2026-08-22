import type { Metadata } from "next";
import { getPublicSite } from "../../lib/api";
import { Wrench, ShieldCheck, MapPin, Phone, Star, CheckCircle, Search } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Cari Teknisi AC Terverifikasi KTA - ${site.organization.name}`,
    description: "Direktori pencarian teknisi AC dan pendingin terverifikasi KTA resmi dengan sertifikasi BNSP per wilayah kota dan provinsi.",
  };
}

interface Technician {
  id: string;
  name: string;
  ktaNumber: string;
  skillLevel: string;
  province: string;
  city: string;
  phone: string | null;
  workshopName: string | null;
  rating: string | null;
  certifiedBnsp: boolean;
  isAvailable: boolean;
}

async function getTechnicians(): Promise<Technician[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/v1/public/technicians`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function TechniciansPage() {
  const site = await getPublicSite();
  const techniciansList = await getTechnicians();

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="technicians-hero">
        <div className="wrap">
          <div className="hero-pill">
            <Wrench size={14} />
            <span>Direktori Teknisi KTA Terverifikasi</span>
          </div>
          <h1>Cari Teknisi AC & Pendingin Resmi</h1>
          <p className="hero-lead">
            Gunakan mesin pencari terpadu untuk menemukan teknisi bersertifikat kompetensi BNSP dengan garansi layanan dan reputasi terpercaya.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="technicians-body">
        <div className="wrap">
          <div className="tech-list-grid">
            {techniciansList.length > 0 ? (
              techniciansList.map((tech) => (
                <div key={tech.id} className="tech-card">
                  <div className="tech-card-header">
                    <div className="tech-avatar">
                      {tech.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3>{tech.name}</h3>
                      <span className="tech-kta"><ShieldCheck size={13} /> {tech.ktaNumber}</span>
                    </div>
                  </div>

                  <div className="tech-details">
                    <p className="tech-skill">{tech.skillLevel}</p>
                    {tech.workshopName && <p className="tech-workshop">{tech.workshopName}</p>}
                    <p className="tech-location">
                      <MapPin size={14} /> {tech.city}, {tech.province}
                    </p>
                  </div>

                  <div className="tech-card-footer">
                    {tech.rating && (
                      <div className="tech-rating">
                        <Star size={14} className="star-icon" /> <span>{tech.rating}</span>
                      </div>
                    )}
                    {tech.phone ? (
                      <a
                        href={`https://wa.me/${tech.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-contact-tech"
                      >
                        <Phone size={14} /> WhatsApp
                      </a>
                    ) : (
                      <span className="btn-disabled">Kontak Melalui DPD</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Wrench size={48} />
                <h3>Belum Ada Data Teknisi</h3>
                <p>Direktori teknisi terverifikasi KTA sedang diperbarui oleh sekretariat daerah.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
