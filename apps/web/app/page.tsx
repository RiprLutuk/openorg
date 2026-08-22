import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MapPin,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicContactForm } from "@/components/public-form";
import { getEvents, getSite, getStructure } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: `${site.organization.name} · Platform Resmi Organisasi`,
    description:
      site.organization.description ??
      "Platform terpadu keanggotaan, tata kelola organisasi, kredit akademi SKP/CPD, dan verifikasi kredensial.",
  };
}

export default async function HomePage() {
  const [site, events, structure] = await Promise.all([
    getSite(),
    getEvents(3, true).catch(() => []),
    getStructure().catch(() => ({ units: [], positions: [], assignments: [] })),
  ]);

  const activeLeaders = structure.assignments.slice(0, 4);

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="wrap home-hero-inner">
          <span className="badge-pill">
            <ShieldCheck size={14} className="badge-icon" />
            <span>Platform Terpadu Organisasi & Komunitas</span>
          </span>

          <h1 className="home-hero-title">
            Mewujudkan Tata Kelola Organisasi Mandiri, Transparan, & Terpercaya.
          </h1>

          <p className="home-hero-description">
            Selamat datang di portal resmi{" "}
            <strong>{site.organization.name}</strong>. Satu sistem terintegrasi
            untuk manajemen keanggotaan, pengembangan kompetensi akademi,
            perolehan kredit SKP/CPD, serta verifikasi kredensial publik.
          </p>

          <div className="home-hero-actions">
            <Link href="/join" className="btn-primary">
              <UserPlus size={18} />
              <span>Daftar Keanggotaan</span>
            </Link>
            <Link href="/member/login" className="btn-secondary">
              <CreditCard size={18} />
              <span>Portal Anggota</span>
            </Link>
            <Link href="/structure" className="btn-ghost">
              <span>Struktur Pengurus</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="home-hero-stats">
            <div className="stat-card">
              <span className="stat-number">
                {structure.units.length || "10+"}
              </span>
              <span className="stat-label">Unit Pengurus</span>
            </div>
            <div className="stat-card-divider" />
            <div className="stat-card">
              <span className="stat-number">{events.length || "100+"}</span>
              <span className="stat-label">Program & Akademi</span>
            </div>
            <div className="stat-card-divider" />
            <div className="stat-card">
              <span className="stat-number">100%</span>
              <span className="stat-label">Tervalidasi Digital</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Business Pillars */}
      <section className="section-space home-pillars">
        <div className="wrap">
          <div className="section-heading text-center">
            <span className="eyebrow">Fitur & Layanan Utama</span>
            <h2>Layanan Terpadu untuk Anggota & Publik</h2>
            <p>
              Semua sistem pengoperasian organisasi tersedia dalam satu portal
              mandiri.
            </p>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-box blue">
                <Users size={24} />
              </div>
              <h3>Manajemen Keanggotaan</h3>
              <p>
                Pendaftaran online mandiri, profil keanggotaan terverifikasi,
                serta Kartu Tanda Anggota (KTA) digital.
              </p>
              <Link href="/join" className="pillar-link">
                Pendaftaran Anggota <ChevronRight size={16} />
              </Link>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box green">
                <BookOpen size={24} />
              </div>
              <h3>Akademi & Kredit SKP / CPD</h3>
              <p>
                Pelatihan profesional, pendaftaran kegiatan, presensi otomatis,
                dan penerbitan kredit kompetensi.
              </p>
              <Link href="/events" className="pillar-link">
                Lihat Agenda Kegiatan <ChevronRight size={16} />
              </Link>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box purple">
                <Building2 size={24} />
              </div>
              <h3>GovernOS · Tata Kelola</h3>
              <p>
                Transparansi struktur organisasi dari unit pusat hingga daerah,
                peta jabatan pengurus, dan masa bakti.
              </p>
              <Link href="/structure" className="pillar-link">
                Peta Pengurus <ChevronRight size={16} />
              </Link>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box amber">
                <BadgeCheck size={24} />
              </div>
              <h3>ComplyFlow · Verifikasi</h3>
              <p>
                Pemeriksaan keabsahan sertifikat, lisensi, dan kredensial
                anggota oleh publik secara instan.
              </p>
              <Link href="/verify" className="pillar-link">
                Cek Kredensial <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      {events.length > 0 && (
        <section className="section-space home-events-section">
          <div className="wrap">
            <div className="section-heading">
              <span className="eyebrow">Agenda Terbaru</span>
              <h2>Kegiatan & Pelatihan Akademi</h2>
              <p>
                Ikuti workshop teknis, seminar regulasi, dan sertifikasi BNSP terstandarisasi untuk meningkatkan kompetensi profesional Anda.
              </p>
            </div>

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
                  <div className="event-card-content">
                    <span className="card-meta">
                      <CalendarDays size={14} />{" "}
                      {new Date(event.startsAt).toLocaleDateString("id-ID", {
                        dateStyle: "long",
                      })}
                    </span>
                    <h3>{event.title}</h3>
                    {event.locationName && (
                      <p className="event-location">
                        <MapPin size={14} /> {event.locationName}
                      </p>
                    )}
                    <Link href={`/events/${event.slug}`} className="btn-event-detail">
                      Detail Agenda <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="section-action-center">
              <Link href="/events" className="btn-secondary-action">
                Lihat Semua Agenda Pelatihan <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Governance Officers Leadership Preview */}
      {activeLeaders.length > 0 && (
        <section className="section-space home-leadership-section">
          <div className="wrap">
            <div className="section-heading">
              <span className="eyebrow">Tata Kelola Organisasi</span>
              <h2>Struktur Kepengurusan Pusat & Daerah</h2>
              <p>
                Susunan dewan pimpinan pengurus pusat (DPP), dewan pimpinan daerah (DPD), dan korwil nusantara yang memimpin organisasi.
              </p>
            </div>

            <div className="leaders-grid">
              {activeLeaders.map((item) => {
                const pos = structure.positions.find(
                  (p) => p.id === item.assignment.positionId,
                );
                const unit = structure.units.find((u) => u.id === pos?.unitId);
                return (
                  <div className="leader-card" key={item.assignment.id}>
                    <div className="leader-avatar">
                      {item.member.avatarUrl ? (
                        <img
                          src={item.member.avatarUrl}
                          alt={item.member.name}
                        />
                      ) : (
                        <span>
                          {item.member.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="leader-info">
                      <h4>{item.member.name}</h4>
                      <p className="leader-title">{pos?.title ?? "Pengurus"}</p>
                      <small className="leader-unit">
                        {unit?.name ?? "Pusat"}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-action-center">
              <Link href="/structure" className="btn-secondary-action">
                Lihat Struktur Pengurus Lengkap <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Public Contact Form Section */}
      <section className="section-space home-contact-section">
        <div className="wrap">
          <div className="section-heading">
            <span className="eyebrow">Hubungi Sekretariat</span>
            <h2>Ada Pertanyaan Seputar Keanggotaan atau Pelatihan?</h2>
            <p>
              Tim sekretariat {site.organization.name} siap memberikan pendampingan pendaftaran anggota, jadwal pelatihan, dan verifikasi sertifikasi.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-info">
              <h3>Layanan Sekretariat Terpadu</h3>
              <p>
                Gunakan formulir atau kontak resmi kami untuk konsultasi keanggotaan dan sertifikasi profesi.
              </p>
              <ul className="contact-features">
                <li>
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>Respon cepat sekretariat jam kerja</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>Pendampingan proses verifikasi KTA & BNSP</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>Informasi transparansi agenda kegiatan</span>
                </li>
              </ul>
            </div>
            <div className="contact-form-card">
              <PublicContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Join Banner */}
      <section className="home-cta-banner">
        <div className="wrap cta-banner-inner">
          <h2>Bergabung Menjadi Bagian dari {site.organization.name}</h2>
          <p>
            Dapatkan keanggotaan resmi, akses pelatihan bersertifikat SKP/CPD,
            serta jejaring profesional secara nasional.
          </p>
          <div className="cta-banner-buttons">
            <Link href="/join" className="btn-primary-inverse">
              <UserPlus size={18} />
              <span>Daftar Sekarang</span>
            </Link>
            <Link href="/member/login" className="btn-secondary-inverse">
              <span>Masuk Portal Anggota</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
