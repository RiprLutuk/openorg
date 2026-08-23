import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";
import { getEvent, getPublicSite } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug).catch(() => null);
  return event
    ? {
        title: `${event.title} · Agenda Pelatihan & Sertifikasi`,
        description: event.description ?? undefined,
      }
    : {};
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const [site, event] = await Promise.all([
    getPublicSite(),
    getEvent(slug).catch(() => null),
  ]);

  if (!event) notFound();

  const startsAt = new Date(event.startsAt);
  const isUpcoming = startsAt.getTime() >= Date.now();

  return (
    <article className="event-detail-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero event-detail-master-hero">
        <div className="wrap tech-hero-inner">
          <div className="event-back-row">
            <Link className="back-link-chip" href="/events">
              <ArrowLeft size={14} />
              <span>Kembali ke Semua Agenda</span>
            </Link>
          </div>

          <div className="tech-hero-pill">
            <Award size={15} color="#38bdf8" />
            <span>AKADEMI & SERTIFIKASI KOMPETENSI · +4 SKP RESMI</span>
          </div>

          <h1 className="tech-hero-title">{event.title}</h1>

          <div className="event-hero-meta-grid">
            <div className="event-hero-meta-item">
              <CalendarDays size={16} color="#38bdf8" />
              <div>
                <small>Waktu Pelaksanaan</small>
                <strong>
                  {startsAt.toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </strong>
              </div>
            </div>

            {event.locationName && (
              <div className="event-hero-meta-item">
                <MapPin size={16} color="#34d399" />
                <div>
                  <small>Lokasi / Venue</small>
                  <strong>{event.locationName}</strong>
                </div>
              </div>
            )}

            {event.capacity && (
              <div className="event-hero-meta-item">
                <Users size={16} color="#818cf8" />
                <div>
                  <small>Kapasitas Kuota</small>
                  <strong>Maksimum {event.capacity} Peserta</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content & Sidebar Grid */}
      <section className="tech-body section-space">
        <div className="wrap event-detail-two-col-grid">
          {/* Main Article Body */}
          <div className="event-main-content">
            <div className="event-overview-box">
              <h2>Rincian & Silabus Pelatihan</h2>
              <div className="event-prose-body">
                <p>
                  {event.description ??
                    "Pelatihan ini ditujukan bagi teknisi refrigerasi dan tata udara dalam meningkatkan pemahaman teori serta keahlian praktik langsung (hands-on) berstandar SKKNI dan K3 nasional."}
                </p>

                <h3>Materi Pokok & Kompetensi:</h3>
                <ul className="event-curriculum-list">
                  <li>
                    <CheckCircle2 size={15} color="#0284c7" />
                    <span>
                      Dasar Termodinamika & Karakteristik Freon Generasi Baru
                      (R32 / R290 / R410A)
                    </span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} color="#0284c7" />
                    <span>
                      Prosedur Pengelasan (Brazing) Pipa Tembaga Menggunakan
                      Nitrogen Purging (N2)
                    </span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} color="#0284c7" />
                    <span>
                      SOP Pemvakuman Sistem &lt;500 Micron dengan Manifold
                      Digital Presisi
                    </span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} color="#0284c7" />
                    <span>
                      Troubleshooting Kelistrikan Inverter, PCB Modul, & Kode
                      Eror Sensor
                    </span>
                  </li>
                </ul>

                <h3>Fasilitas & Manfaat Peserta:</h3>
                <div className="event-benefits-grid">
                  <div className="benefit-card">
                    <Award size={18} color="#16a34a" />
                    <strong>Sertifikat Resmi</strong>
                    <small>Diterbitkan DPP APTI & Kredit SKP</small>
                  </div>
                  <div className="benefit-card">
                    <BookOpen size={18} color="#0284c7" />
                    <strong>Modul Panduan</strong>
                    <small>Buku Saku Servis Standar BNSP</small>
                  </div>
                  <div className="benefit-card">
                    <Wrench size={18} color="#f59e0b" />
                    <strong>Hands-on Praktik</strong>
                    <small>Unit AC Inverter & Manifold</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <aside className="event-detail-sidebar">
            <div className="event-register-card">
              <div className="register-header">
                <div className="status-badge-open">
                  <span className="status-dot active" />
                  <span>
                    {isUpcoming ? "Pendaftaran Dibuka" : "Kegiatan Selesai"}
                  </span>
                </div>
                <span className="event-skp-chip">+4 SKP CPD</span>
              </div>

              <div className="event-sidebar-details">
                {event.address && (
                  <div className="sidebar-info-row">
                    <MapPin size={16} color="#0284c7" />
                    <div>
                      <small>Alamat Lengkap Venue:</small>
                      <p>{event.address}</p>
                    </div>
                  </div>
                )}

                <div className="sidebar-info-row">
                  <Clock size={16} color="#0284c7" />
                  <div>
                    <small>Zona Waktu Acara:</small>
                    <p>{event.timezone}</p>
                  </div>
                </div>
              </div>

              <div className="register-actions-group">
                {event.registrationUrl ? (
                  <a
                    className="button primary btn-register-big"
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Daftar Sekarang</span>
                    <ExternalLink size={15} />
                  </a>
                ) : (
                  <Link
                    href="/member/login"
                    className="button primary btn-register-big"
                  >
                    <span>Daftar via Portal Anggota</span>
                    <ExternalLink size={15} />
                  </Link>
                )}

                {event.meetingUrl && (
                  <a
                    className="button secondary btn-meeting-link"
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Tautan Pertemuan Online</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <DynamicBottomCta
        organizationName={site.organization.name}
        guestTitle="Ingin Mengikuti Agenda Sertifikasi Lainnya?"
        guestDescription="Jadilah bagian dari ekosistem teknisi terverifikasi dan raih sertifikasi kompetensi profesi standar nasional."
        guestPrimaryCta={{ label: "Lihat Semua Agenda", href: "/events" }}
        guestSecondaryCta={{
          label: "Daftar Anggota KTA",
          href: "/join",
        }}
        memberTitle="Poin SKP Terintegrasi dengan Akun KTA Anda"
        memberDescription="Setelah menyelesaikan workshop, poin SKP dan e-sertifikat akan otomatis masuk ke dalam riwayat kredensial Anda."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{ label: "Verifikasi Kredensial", href: "/verify" }}
      />
    </article>
  );
}
