"use client";

import {
  ArrowRight,
  CalendarDays,
  Home,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error) {
      console.error("Platform application error captured:", error);
    }
  }, [error]);

  return (
    <div className="error-screen-suite">
      <section className="tech-body section-space">
        <div className="wrap error-wrap-inner">
          {/* Main Error Hero Card */}
          <div className="error-main-card">
            <div className="error-pill-badge">
              <ShieldAlert size={15} color="#e11d48" />
              <span>TERJADI KENDALA SISTEM</span>
            </div>

            <h1 className="error-heading-title">Halaman Belum Dapat Dimuat</h1>

            <p className="error-lead-desc">
              Sistem mendeteksi adanya keterlambatan koneksi server atau
              sinkronisasi data yang sedang berlangsung. Silakan muat ulang
              halaman ini atau gunakan navigasi pintas di bawah.
            </p>

            {/* Actions Group */}
            <div className="error-cta-row">
              <button
                type="button"
                className="button primary btn-error-primary"
                onClick={reset}
              >
                <RefreshCw size={15} />
                <span>Muat Ulang Halaman</span>
              </button>

              <Link href="/" className="button secondary btn-error-secondary">
                <Home size={15} />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>

            {/* Diagnostic Details Strip */}
            {error?.digest && (
              <div className="error-digest-strip">
                <small>
                  Kode Diagnostik Referensi: <code>{error.digest}</code>
                </small>
              </div>
            )}
          </div>

          {/* Quick Shortcuts Grid (3 Clean Cards) */}
          <div className="error-recovery-grid">
            <Link href="/verify" className="recovery-nav-card">
              <div className="recovery-icon-box blue">
                <ShieldCheck size={20} />
              </div>
              <div className="recovery-card-body">
                <h3>Verifikasi KTA & Lisensi</h3>
                <p>
                  Cek keaslian nomor registrasi teknisi, sertifikat BNSP, atau
                  mitra distributor resmi.
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
                <h3>Agenda & Uji Kompetensi</h3>
                <p>
                  Lihat jadwal workshop teknis terdekat, pelatihan inverter, dan
                  sertifikasi BNSP.
                </p>
                <span className="recovery-link-label">
                  <span>Lihat Jadwal</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>

            <Link href="/complaints" className="recovery-nav-card">
              <div className="recovery-icon-box violet">
                <MessageCircle size={20} />
              </div>
              <div className="recovery-card-body">
                <h3>Pusat Bantuan & Pengaduan</h3>
                <p>
                  Hubungi sekretariat atau laporkan kendala operasional ke posko
                  resmi JENDELA.
                </p>
                <span className="recovery-link-label">
                  <span>Hubungi Sekretariat</span>
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
