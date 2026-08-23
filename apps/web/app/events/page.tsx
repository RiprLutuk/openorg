import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  Compass,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { getEvents, getPublicSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Agenda Workshop, Pelatihan & Sertifikasi BNSP · ${site.organization.name}`,
    description:
      "Jadwal pelatihan vokasi refrigerasi, workshop instalasi inverter VRV, sertifikasi kompetensi BNSP, dan musyawarah daerah asosiasi.",
  };
}

export default async function EventsPage() {
  const [site, events] = await Promise.all([
    getPublicSite(),
    getEvents(100, false),
  ]);

  return (
    <div className="events-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero events-hero-master">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <GraduationCap size={15} color="#38bdf8" />
            <span>
              AKADEMI VOKASI & PENGEMBANGAN PROFESI BERKELANJUTAN (CPD)
            </span>
          </div>

          <h1 className="tech-hero-title">
            Agenda Pelatihan, Workshop &{" "}
            <span className="text-gradient">Sertifikasi BNSP</span>
          </h1>

          <p className="tech-hero-lead">
            Tingkatkan keterampilan teknis melalui pelatihan intensif
            bersertifikat nasional: teknologi inverter, tata udara sentral
            VRV/VRF, keselamatan kerja freon R290, serta sertifikasi resmi BNSP.
          </p>

          {/* Impact Metrics Bar */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Award size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>Akreditasi BNSP</strong>
                <small>Lisensi Standar SKKNI</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Zap size={22} color="#34d399" />
              </div>
              <div>
                <strong>Kredit Poin SKP / CPD</strong>
                <small>Perpanjangan KTA Otomatis</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Wrench size={22} color="#818cf8" />
              </div>
              <div>
                <strong>80% Praktik Hands-On</strong>
                <small>Unit Asli & Manifold Digital</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Compass size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>38 DPD Se-Indonesia</strong>
                <small>Pelatihan Rutin Daerah</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Events Cards Grid Section */}
      <section className="tech-body section-space">
        <div className="wrap">
          <div className="section-head-bar mb-8">
            <div>
              <span className="eyebrow">JADWAL RESMI ASOSIASI</span>
              <h2>Agenda Pelatihan Mendatang</h2>
            </div>
            <span className="events-count-pill">
              {events.length} Agenda Tersedia
            </span>
          </div>

          {events.length > 0 ? (
            <div className="events-cards-grid">
              {events.map((event) => {
                const startDate = new Date(event.startsAt);
                const isUpcoming = startDate.getTime() >= Date.now();

                return (
                  <article
                    key={event.id}
                    className="event-modern-card slide-in-up"
                  >
                    <div className="event-card-header-row">
                      <div className="event-date-badge">
                        <CalendarDays size={13} />
                        <span>
                          {startDate.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <span className="event-skp-pill">
                        <Award size={13} />
                        <span>+4 SKP CPD</span>
                      </span>
                    </div>

                    <div className="event-card-body">
                      <h3 className="event-title">{event.title}</h3>

                      {event.locationName && (
                        <div className="event-location-row">
                          <MapPin size={14} color="#0284c7" />
                          <span>{event.locationName}</span>
                        </div>
                      )}

                      {event.description && (
                        <p className="event-summary-text">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="event-card-footer">
                      <div className="event-quota-status">
                        <span
                          className={`status-dot ${isUpcoming ? "active" : "closed"}`}
                        />
                        <span>
                          {isUpcoming ? "Pendaftaran Terbuka" : "Selesai"}
                        </span>
                      </div>

                      <Link
                        href={`/events/${event.slug}`}
                        className="button secondary btn-event-detail"
                      >
                        <span>Rincian Agenda</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <CalendarDays size={48} />
              <h3>Belum Ada Agenda Pelatihan Aktif</h3>
              <p>
                Jadwal workshop dan sertifikasi baru sedang dipersiapkan oleh
                Dewan Pengurus Pusat.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <DynamicBottomCta
        organizationName={site.organization.name}
        guestTitle="Ingin Menyelenggarakan Sertifikasi di Kota Anda?"
        guestDescription="DPD dan Komunitas Bengkel dapat mengajukan permohonan pelaksanaan pelatihan dan uji kompetensi BNSP di daerah masing-masing."
        guestPrimaryCta={{ label: "Daftar Anggota Teknisi", href: "/join" }}
        guestSecondaryCta={{
          label: "Lihat Standar Regulasi",
          href: "/regulations",
        }}
        memberTitle="Kumpulkan Poin SKP untuk Perpanjangan KTA"
        memberDescription="Periksa riwayat sertifikat pelatihan dan jumlah kredit SKP aktif Anda secara langsung di portal anggota."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{
          label: "Klasemen Kejuaraan",
          href: "/championships",
        }}
      />
    </div>
  );
}
