import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug).catch(() => null);
  return event
    ? { title: event.title, description: event.description ?? undefined }
    : {};
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug).catch(() => null);
  if (!event) notFound();
  const startsAt = new Date(event.startsAt);
  return (
    <article>
      <header className="detail-hero event-detail-hero">
        <div className="wrap detail-wrap">
          <Link className="back-link" href="/events">
            <ArrowLeft size={16} /> Semua agenda
          </Link>
          <span className="eyebrow light">Agenda organisasi</span>
          <h1>{event.title}</h1>
          <div className="event-facts">
            <span>
              <CalendarDays size={18} />
              {startsAt.toLocaleString("id-ID", {
                dateStyle: "full",
                timeStyle: "short",
                timeZone: event.timezone,
              })}
            </span>
            {event.locationName && (
              <span>
                <MapPin size={18} />
                {event.locationName}
              </span>
            )}
            {event.capacity && (
              <span>
                <Users size={18} />
                Kapasitas {event.capacity} peserta
              </span>
            )}
          </div>
        </div>
      </header>
      {event.coverUrl && (
        <div className="wrap detail-cover">
          <img src={event.coverUrl} alt="" />
        </div>
      )}
      <div className="wrap event-detail-grid">
        <div className="detail-body event-description">
          <h2>Tentang agenda</h2>
          <p>
            {event.description ??
              "Informasi lengkap akan diumumkan oleh penyelenggara."}
          </p>
        </div>
        <aside className="event-sidebar">
          <h2>Informasi kegiatan</h2>
          {event.address && (
            <p>
              <MapPin size={17} /> <span>{event.address}</span>
            </p>
          )}
          {event.registrationUrl && (
            <a
              className="button primary"
              href={event.registrationUrl}
              target="_blank"
              rel="noreferrer"
            >
              Daftar kegiatan <ExternalLink size={15} />
            </a>
          )}
          {event.meetingUrl && (
            <a
              className="text-link"
              href={event.meetingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Tautan pertemuan <ExternalLink size={15} />
            </a>
          )}
        </aside>
      </div>
    </article>
  );
}
