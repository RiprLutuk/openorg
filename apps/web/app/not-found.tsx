import {
  ArrowRight,
  CalendarDays,
  FileText,
  Home,
  Newspaper,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="error-screen-suite">
      <section className="tech-body section-space">
        <div className="wrap error-wrap-inner">
          <div className="error-main-card not-found-variant">
            <div className="error-pill-badge blue">
              <Search size={15} color="#0284c7" />
              <span>STATUS 404 • HALAMAN TIDAK DITEMUKAN</span>
            </div>

            <h1 className="error-heading-title">Halaman Tidak Ditemukan</h1>

            <p className="error-lead-desc">
              Tautan yang Anda tuju mungkin telah diperbarui alamatnya,
              dipindahkan ke menu baru, atau konten belum dipublikasikan oleh
              dewan redaksi organisasi.
            </p>

            <div className="error-cta-row">
              <Link href="/" className="button primary btn-error-primary">
                <Home size={15} />
                <span>Kembali ke Beranda</span>
              </Link>

              <Link
                href="/stories"
                className="button secondary btn-error-secondary"
              >
                <Newspaper size={15} />
                <span>Jelajahi Pusat Warta</span>
              </Link>
            </div>
          </div>

          <div className="error-recovery-grid">
            <Link href="/verify" className="recovery-nav-card">
              <div className="recovery-icon-box blue">
                <ShieldCheck size={20} />
              </div>
              <div className="recovery-card-body">
                <h3>Verifikasi KTA & Lisensi</h3>
                <p>
                  Validasi nomor registrasi anggota, teknisi bersertifikat BNSP,
                  dan sertifikat resmi.
                </p>
                <span className="recovery-link-label">
                  <span>Buka Verifikator</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>

            <Link href="/events" className="recovery-nav-card">
              <div className="recovery-icon-box emerald">
                <CalendarDays size={20} />
              </div>
              <div className="recovery-card-body">
                <h3>Agenda & Pelatihan Vokasi</h3>
                <p>
                  Cari jadwal sertifikasi keahlian, workshop AC inverter, dan
                  program SKP.
                </p>
                <span className="recovery-link-label">
                  <span>Lihat Agenda</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>

            <Link href="/regulations" className="recovery-nav-card">
              <div className="recovery-icon-box violet">
                <FileText size={20} />
              </div>
              <div className="recovery-card-body">
                <h3>Regulasi & AD/ART</h3>
                <p>
                  Pelajari aturan organisasi, standar tata kerja K3, dan surat
                  edaran resmi.
                </p>
                <span className="recovery-link-label">
                  <span>Buka Regulasi</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
