"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Network,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemberAuth } from "@/lib/use-member-auth";

export function InteractiveBentoServices() {
  const { isLoggedIn } = useMemberAuth();

  return (
    <section className="section-space home-bento-section">
      <div className="wrap">
        <div className="section-heading text-center">
          <span className="eyebrow">Layanan Utama</span>
          <h2>Ekosistem Terintegrasi Organisasi</h2>
          <p>
            Infrastruktur digital mandiri untuk tata kelola keanggotaan,
            pengembangan kompetensi, dan transparansi publik.
          </p>
        </div>

        <div className="bento-grid-modern">
          {/* Card 1: Membership & KTA */}
          <div className="bento-card card-large">
            <div className="bento-card-header">
              <div className="bento-icon-box">
                <Users size={22} />
              </div>
              <span className="bento-badge">Mandiri & Real-time</span>
            </div>

            <div className="bento-card-content">
              <h3>Keanggotaan & KTA Digital</h3>
              <p>
                Registrasi mandiri, verifikasi berkas instan, dan penerbitan
                Kartu Tanda Anggota ber-QR Code anti-pemalsuan.
              </p>

              {/* Visual Micro-Widget: Mini KTA Stack Preview */}
              <div className="bento-widget-kta">
                <div className="mini-kta-preview">
                  <div className="mini-kta-top">
                    <span className="mini-chip" />
                    <span className="mini-status">● AKTIF</span>
                  </div>
                  <div className="mini-kta-mid">
                    <div className="mini-avatar">AN</div>
                    <div>
                      <strong>Ahmad Nurhadi, S.T.</strong>
                      <small>KTA-2026-09142</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bento-card-footer">
                {isLoggedIn ? (
                  <Link href="/member" className="bento-action-link">
                    <span>Buka KTA Digital Saya</span>
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <>
                    <Link href="/join" className="bento-action-link">
                      <span>Daftar Anggota</span>
                      <ArrowRight size={15} />
                    </Link>
                    <Link href="/member/login" className="bento-sub-link">
                      Portal Anggota →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Academy SKP & CPD */}
          <div className="bento-card card-medium">
            <div className="bento-card-header">
              <div className="bento-icon-box">
                <BookOpen size={22} />
              </div>
              <span className="bento-badge">Terakreditasi BNSP</span>
            </div>

            <div className="bento-card-content">
              <h3>Akademi & Kredit SKP</h3>
              <p>
                Pelatihan vokasi terstandarisasi dan pencatatan kredit
                kompetensi otomatis dalam buku log digital anggota.
              </p>

              {/* Visual Micro-Widget: Progress Bar */}
              <div className="bento-widget-skp">
                <div className="skp-progress-header">
                  <small>Target Resertifikasi CPD</small>
                  <strong>18 / 25 SKP (72%)</strong>
                </div>
                <div className="skp-progress-bar">
                  <div className="skp-progress-fill" style={{ width: "72%" }} />
                </div>
                <div className="skp-tags">
                  <span>+4 SKP Workshop HVAC</span>
                  <span>+2 SKP Uji Emisi</span>
                </div>
              </div>

              <div className="bento-card-footer">
                <Link href="/events" className="bento-action-link">
                  <span>Jadwal Agenda</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: GovernOS Structure */}
          <div className="bento-card card-medium">
            <div className="bento-card-header">
              <div className="bento-icon-box">
                <Network size={22} />
              </div>
              <span className="bento-badge">Pusat & Daerah</span>
            </div>

            <div className="bento-card-content">
              <h3>GovernOS · Struktur Wilayah</h3>
              <p>
                Transparansi hierarki kepengurusan dari Dewan Pimpinan Pusat
                (DPP) hingga DPD Provinsi dan Korwil.
              </p>

              {/* Visual Micro-Widget: Hierarchy Nodes */}
              <div className="bento-widget-hierarchy">
                <div className="node-item dpp">
                  <span className="node-dot" />
                  <span>DPP PUSAT · Dewan Pengurus</span>
                </div>
                <div className="node-line" />
                <div className="node-branches">
                  <div className="node-item dpd">
                    <span className="node-dot" />
                    <span>DPD JAWA BARAT</span>
                  </div>
                  <div className="node-item dpd">
                    <span className="node-dot" />
                    <span>DPD JAWA TIMUR</span>
                  </div>
                </div>
              </div>

              <div className="bento-card-footer">
                <Link href="/structure" className="bento-action-link">
                  <span>Struktur Lengkap</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4: ComplyFlow Verification */}
          <div className="bento-card card-large">
            <div className="bento-card-header">
              <div className="bento-icon-box">
                <ShieldCheck size={22} />
              </div>
              <span className="bento-badge">Zero Trust Validation</span>
            </div>

            <div className="bento-card-content">
              <h3>ComplyFlow · Verifikasi Publik</h3>
              <p>
                Audit instan keabsahan KTA aktif, sertifikat keahlian, dan
                lisensi profesi teknisi di lapangan secara transparan.
              </p>

              {/* Visual Micro-Widget: QR Scanner & Seal Preview */}
              <div className="bento-widget-audit">
                <div className="audit-scanner-box">
                  <QrCode size={30} className="qr-icon" />
                  <div className="audit-details">
                    <span className="audit-title">
                      Kredensial Resmi Terdaftar
                    </span>
                    <strong className="audit-hash">
                      ID: CERT-BNSP-2026-0941
                    </strong>
                    <span className="audit-status">
                      <CheckCircle2 size={13} /> Diaudit & Valid Terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              <div className="bento-card-footer">
                <Link href="/verify" className="bento-action-link">
                  <span>Verifikasi KTA</span>
                  <ArrowRight size={15} />
                </Link>
                <Link href="/technicians" className="bento-sub-link">
                  Cari Teknisi →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
