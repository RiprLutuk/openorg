import type { Metadata } from "next";
import { getPublicSite } from "../../lib/api";
import { ShieldAlert, CheckCircle2, Search, FileText, Send, AlertTriangle } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Layanan Pengaduan Etik & Konsultasi - ${site.organization.name}`,
    description: "Portal resmi pelaporan pelanggaran kode etik, klaim garansi servis teknisi KTA, dan perlindungan konsumen.",
  };
}

export default async function ComplaintsPage() {
  const site = await getPublicSite();

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="complaints-hero">
        <div className="wrap">
          <div className="hero-pill warning">
            <ShieldAlert size={14} />
            <span>Desks Kode Etik & Perlindungan Konsumen</span>
          </div>
          <h1>Layanan Pengaduan Etik & Klaim Teknisi</h1>
          <p className="hero-lead">
            Sarana resmi bagi publik dan konsumen untuk melaporkan kendala pengerjaan teknisi bersertifikat KTA, dugaan pelanggaran kode etik, maupun klaim garansi.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="complaints-body">
        <div className="wrap">
          <div className="complaints-grid">
            {/* Form Filing Panel */}
            <div className="complaint-form-panel">
              <div className="panel-header">
                <FileText size={20} />
                <h2>Formulir Pengaduan Resmi</h2>
              </div>
              <form className="complaint-form" action="#" method="POST">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="complainantName">Nama Lengkap Pelapor *</label>
                    <input
                      type="text"
                      id="complainantName"
                      name="complainantName"
                      placeholder="Masukkan nama sesuai KTP"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="complainantEmail">Email Pelapor *</label>
                    <input
                      type="email"
                      id="complainantEmail"
                      name="complainantEmail"
                      placeholder="nama@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="complainantPhone">Nomor WhatsApp / HP</label>
                    <input
                      type="tel"
                      id="complainantPhone"
                      name="complainantPhone"
                      placeholder="0812xxxxxxx"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="targetType">Subjek Terlaporkan *</label>
                    <select id="targetType" name="targetType" required defaultValue="technician">
                      <option value="technician">Teknisi AC (Pemegang KTA)</option>
                      <option value="member">Perusahaan Anggota APTI</option>
                      <option value="lender">Mitra Penyedia Suku Cadang</option>
                      <option value="company">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="targetIdentifier">Nama / Nomor KTA Terlaporkan *</label>
                  <input
                    type="text"
                    id="targetIdentifier"
                    name="targetIdentifier"
                    placeholder="Contoh: Budi Kurniawan / APTI-2026-0004"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Kategori Pengaduan *</label>
                  <select id="category" name="category" required defaultValue="kode_etik">
                    <option value="kode_etik">Pelanggaran Kode Etik Organisasi</option>
                    <option value="layanan_teknisi">Klaim Garansi & Hasil Kerja Teknisi</option>
                    <option value="penagihan">Penetapan Biaya Tidak Sesuai SOP</option>
                    <option value="sengketa">Sengketa Garansi Produk</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Detail Kronologi Pengaduan *</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    placeholder="Jelaskan secara rinci waktu kejadian, lokasi, serta kendala yang dialami..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit-complaint">
                  <Send size={16} /> Submit Pengaduan Resmi
                </button>
              </form>
            </div>

            {/* Sidebar Track Ticket Panel */}
            <div className="complaint-track-panel">
              <div className="track-card">
                <h3>Cek Status Tiket Pengaduan</h3>
                <p>Masukkan nomor tiket resmi (contoh: CMP-2026-0081) untuk memantau progres tindakan sekretariat.</p>
                <div className="track-input-group">
                  <input
                    type="text"
                    placeholder="Masukkan Nomor Tiket..."
                    className="track-input"
                  />
                  <button type="button" className="btn-track">
                    <Search size={16} /> Cek Status
                  </button>
                </div>
              </div>

              <div className="ethics-guarantee-card">
                <AlertTriangle size={24} className="icon-warning" />
                <h4>Komitmen Etik & Proteksi Consumer</h4>
                <ul>
                  <li><CheckCircle2 size={14} /> Setiap pengaduan diproses maksimal 2x24 jam kerja.</li>
                  <li><CheckCircle2 size={14} /> Kerahasiaan data pelapor dijamin oleh Tim Etik DPP.</li>
                  <li><CheckCircle2 size={14} /> Media mediasi resmi mempertemukan konsumen & teknisi KTA.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
