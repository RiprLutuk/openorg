import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HomeCtaBanner } from "@/components/home-cta-banner";
import { HomeHeroInteractive } from "@/components/home-hero-interactive";
import { InteractiveBentoServices } from "@/components/interactive-bento-services";
import { SmartImage } from "@/components/smart-image";
import { getContents, getEvents, getSite, getStructure } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `${site.organization.name} · Platform Resmi Organisasi & Kredensial`,
    description:
      site.organization.description ??
      "Platform terpadu keanggotaan, tata kelola organisasi, kredit akademi SKP/CPD, dan verifikasi kredensial.",
  };
}

export default async function HomePage() {
  const [site, events, structure, stories] = await Promise.all([
    getSite(),
    getEvents(3, false),
    getStructure(),
    getContents("news", 3),
  ]);

  return (
    <div className="home-page-container">
      {/* 1. Interactive High-Precision Hero Section */}
      <HomeHeroInteractive
        site={site}
        unitCount={structure.units.length}
        eventCount={events.length}
      />

      {/* 2. Core 4-Pillar Ecosystem Bento Grid */}
      <InteractiveBentoServices />

      {/* 3. Upcoming Training & Events Highlight */}
      {events.length > 0 && (
        <section className="section-space home-events-section">
          <div className="wrap">
            <div className="section-heading">
              <Link href="/events" className="eyebrow-cta-link">
                <span>Lihat Semua Agenda</span>
                <ArrowRight size={12} />
              </Link>
              <h2>Pelatihan & Sertifikasi</h2>
              <p>
                Program pengembangan kompetensi teknis dan perolehan kredit SKP
                resmi.
              </p>
            </div>

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
          </div>
        </section>
      )}

      {/* 4. Latest News & Articles Highlight */}
      {stories.length > 0 && (
        <section className="section-space home-stories-section">
          <div className="wrap">
            <div className="section-heading">
              <Link href="/stories" className="eyebrow-cta-link">
                <span>Lihat Semua Berita</span>
                <ArrowRight size={12} />
              </Link>
              <h2>Publikasi & Berita</h2>
              <p>
                Pembaruan regulasi profesi, kegiatan daerah, dan kabar
                organisasi.
              </p>
            </div>

            <div className="story-grid-refined">
              {stories.map((story) => (
                <article className="story-card-refined" key={story.id}>
                  <div className="story-cover-wrap">
                    <SmartImage
                      src={story.coverUrl}
                      alt={story.title}
                      fallbackType="news"
                    />
                  </div>
                  <div className="story-card-body">
                    <span className="story-date-chip">
                      {new Date(
                        story.publishedAt ?? story.updatedAt,
                      ).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <h3>{story.title}</h3>
                    {story.excerpt && (
                      <p className="story-excerpt">{story.excerpt}</p>
                    )}
                    <Link
                      href={`/stories/${story.slug}`}
                      className="story-read-link"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Clean Dynamic CTA Banner */}
      <HomeCtaBanner organizationName={site.organization.name} />
    </div>
  );
}
