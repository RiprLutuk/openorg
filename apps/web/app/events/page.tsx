import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getEvents } from "@/lib/api";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda kegiatan, pertemuan, dan program organisasi.",
};

export default async function EventsPage() {
  const events = await getEvents(100, false);
  return (
    <>
      <section className="archive-hero event-archive-hero">
        <div className="wrap archive-hero-copy">
          <span className="eyebrow light">Agenda bersama</span>
          <h1>Bertemu, belajar, dan menghasilkan dampak nyata.</h1>
          <p>Temukan kegiatan organisasi dan simpan tanggalnya.</p>
        </div>
      </section>
      <section className="section-space archive-section">
        <div className="wrap">
          {events.length ? (
            <div className="card-grid archive-event-grid">
              {events.map((event) => (
                <article className="event-card" key={event.id}>
                  <div className="date-block">
                    <strong>{new Date(event.startsAt).getDate()}</strong>
                    <span>
                      {new Date(event.startsAt).toLocaleString("id-ID", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="card-meta">
                      <CalendarDays size={14} />{" "}
                      {new Date(event.startsAt).toLocaleDateString("id-ID", {
                        dateStyle: "long",
                      })}
                    </span>
                    <h2>{event.title}</h2>
                    {event.locationName && (
                      <p>
                        <MapPin size={14} /> {event.locationName}
                      </p>
                    )}
                    <Link href={`/events/${event.slug}`}>
                      Detail agenda <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="archive-empty">
              Belum ada agenda yang dipublikasikan.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
