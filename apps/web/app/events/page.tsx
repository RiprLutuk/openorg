import { ArrowRight, BookOpen, CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getEvents } from "@/lib/api";

export const metadata: Metadata = {
  title: "Agenda Kegiatan & Pelatihan Profesi",
  description:
    "Jadwal pelatihan vokasi, workshop sertifikasi BNSP, seminar regulasi, dan musyawarah daerah organisasi.",
};

export default async function EventsPage() {
  const events = await getEvents(100, false);
  return (
    <div className="page-shell">
      <section className="events-archive-hero">
        <div className="wrap">
          <div className="hero-pill">
            <BookOpen size={14} />
            <span>Akademi & Pengembangan Profesi</span>
          </div>
          <h1>Agenda Pelatihan & Sertifikasi Kompetensi</h1>
          <p className="hero-lead">
            Ikuti program pelatihan terstandarisasi, kumpulkan kredit SKP/CPD
            resmi, dan perluas jejaring profesional di seluruh Indonesia.
          </p>
        </div>
      </section>

      <section className="section-space">
        <div className="wrap">
          {events.length ? (
            <div className="events-grid-refined">
              {events.map((event) => (
                <article className="event-card-refined" key={event.id}>
                  <div className="event-card-header-row">
                    <div className="event-date-chip">
                      <CalendarDays size={13} />
                      <span>
                        {new Date(event.startsAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="event-skp-badge">+4 SKP</span>
                  </div>

                  <div className="event-card-content">
                    <h3>{event.title}</h3>
                    {event.locationName && (
                      <p className="event-location-text">
                        <MapPin size={13} />
                        <span>{event.locationName}</span>
                      </p>
                    )}
                  </div>

                  <div className="event-card-footer-row">
                    <span className="event-status-indicator">
                      <span className="dot" /> Pendaftaran Dibuka
                    </span>
                    <Link
                      href={`/events/${event.slug}`}
                      className="event-card-link"
                    >
                      <span>Detail</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CalendarDays size={48} />
              <h3>Belum Ada Agenda Aktif</h3>
              <p>
                Jadwal pelatihan dan seminar baru akan segera diumumkan oleh
                Dewan Pengurus Pusat.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
