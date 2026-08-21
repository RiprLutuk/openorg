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

      {/* Core Business Pillars - Bento Grid */}
      <section className="section-space home-pillars">
        <div className="wrap">
          <div className="section-heading text-center">
            <span className="eyebrow">Fitur & Layanan Utama</span>
            <h2>Layanan Terpadu untuk Anggota & Publik</h2>
            <p>
              Semua sistem pengoperasian organisasi tersedia dalam satu portal mandiri.
            </p>
          </div>

          <div className="bento-grid">
            <div className="bento-card bento-col-8 dark">
              <div className="bento-icon-badge">
                <Users size={24} />
              </div>
              <span className="badge-glow" style={{ background: "rgba(255, 255, 255, 0.1)", color: "#E2E8F0", borderColor: "rgba(255, 255, 255, 0.2)", marginBottom: "12px" }}>
                KTA DIGITAL REAL-TIME
              </span>
              <h3 style={{ fontSize: "22px", fontWeight: 700, margin: "8px 0" }}>
                Manajemen Keanggotaan & KTA Digital Ber-QR Code
              </h3>
              <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.6, maxWidth: "540px" }}>
                Pendaftaran mandiri teknisi HVAC/R, pemutakhiran profil, Kartu Tanda Anggota (KTA) digital dengan sertifikasi BNSP, serta verifikasi keabsahan otomatis oleh publik.
              </p>
              <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link href="/join" className="btn-primary" style={{ padding: "10px 18px", fontSize: "14px" }}>
                  Pendaftaran Anggota Baru <ChevronRight size={16} />
                </Link>
                <Link href="/verify" className="btn-secondary" style={{ padding: "10px 18px", fontSize: "14px", background: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>
                  Cek Keabsahan KTA <BadgeCheck size={16} />
                </Link>
              </div>
            </div>

            <div className="bento-card bento-col-4">
              <div className="bento-icon-badge">
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "6px 0" }}>
                Akademi & Kredit SKP / CPD
              </h3>
              <p style={{ color: "#64748B", fontSize: "13px", lineHeight: 1.5 }}>
                Pelatihan profesional HVAC/R, presensi otomatis, dan perolehan kredit kompetensi SKP.
              </p>
              <Link href="/events" className="pillar-link" style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: "#0B3B60" }}>
                Agenda Kegiatan <ChevronRight size={16} />
              </Link>
            </div>

            <div className="bento-card bento-col-6">
              <div className="bento-icon-badge">
                <Building2 size={24} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "6px 0" }}>
                Tata Kelola & Peta Pengurus (DPP/DPD/DPC)
              </h3>
              <p style={{ color: "#64748B", fontSize: "13px", lineHeight: 1.5 }}>
                Struktur kepengurusan transparan dari tingkat pusat hingga daerah, pilar jabatan, dan transparansi organisasi.
              </p>
              <Link href="/structure" className="pillar-link" style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: "#0B3B60" }}>
                Lihat Peta Pengurus <ChevronRight size={16} />
              </Link>
            </div>

            <div className="bento-card bento-col-6">
              <div className="bento-icon-badge">
                <BadgeCheck size={24} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "6px 0" }}>
                Verifikasi Kredensial & Lisensi Publik
              </h3>
              <p style={{ color: "#64748B", fontSize: "13px", lineHeight: 1.5 }}>
                Verifikasi publik transparan untuk mengecek keaslian lisensi, sertifikat keahlian, dan status KTA aktif secara instan.
              </p>
              <Link href="/verify" className="pillar-link" style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: "#0B3B60" }}>
                Verifikasi Sekarang <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      {events.length > 0 && (
        <section className="section-space home-events-section">
          <div className="wrap">
            <div className="section-heading-flex">
              <div>
                <span className="eyebrow">Agenda Terbaru</span>
                <h2>Kegiatan & Pelatihan Akademi</h2>
              </div>
              <Link href="/events" className="btn-link">
                Lihat Semua Agenda <ArrowRight size={16} />
              </Link>
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
                      Detail Agenda <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Governance Officers Leadership Preview */}
      {activeLeaders.length > 0 && (
        <section className="section-space home-leadership-section">
          <div className="wrap">
            <div className="section-heading-flex">
              <div>
                <span className="eyebrow">Tata Kelola Organisasi</span>
                <h2>Struktur Kepengurusan</h2>
              </div>
              <Link href="/structure" className="btn-link">
                Struktur Lengkap <ArrowRight size={16} />
              </Link>
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
          </div>
        </section>
      )}

      {/* Public Contact Form Section */}
      <section className="section-space home-contact-section">
        <div className="wrap contact-grid">
          <div className="contact-info">
            <span className="eyebrow">Hubungi Kami</span>
            <h2>Ada Pertanyaan Seputar Keanggotaan atau Kegiatan?</h2>
            <p>
              Tim sekretariat {site.organization.name} siap membantu memberikan
              informasi terkait pendaftaran anggota, pendaftaran pelatihan,
              maupun verifikasi sertifikat.
            </p>
            <ul className="contact-features">
              <li>
                <CheckCircle2 size={18} className="icon-check" />
                <span>Respon cepat sekretariat</span>
              </li>
              <li>
                <CheckCircle2 size={18} className="icon-check" />
                <span>Pendampingan proses pendaftaran</span>
              </li>
              <li>
                <CheckCircle2 size={18} className="icon-check" />
                <span>Informasi transparansi kegiatan</span>
              </li>
            </ul>
          </div>
          <div className="contact-form-card">
            <PublicContactForm />
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
