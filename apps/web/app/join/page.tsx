import type { Metadata } from "next";
import { MembershipRegistration } from "@/components/membership-registration";
import { getSite } from "@/lib/api";

export const metadata: Metadata = {
  title: "Pendaftaran Keanggotaan Baru",
  description:
    "Formulir registrasi mandiri anggota baru, verifikasi berkas digital, dan penerbitan KTA resmi.",
};

export default async function JoinPage() {
  const site = await getSite();
  return (
    <section className="member-page-shell">
      <div className="wrap member-page-grid">
        <div className="member-page-intro">
          <p className="eyebrow light">Registrasi Mandiri & Digital</p>
          <h1>Bergabung Bersama Komunitas Profesional Terdepan.</h1>
          <p>
            Daftarkan diri atau badan usaha Anda secara online, pantau status
            verifikasi berkas, dan dapatkan Kartu Tanda Anggota (KTA) digital
            resmi ber-QR Code anti-pemalsuan.
          </p>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Pengisian Formulir Mandiri</strong>
                <small>
                  Data tersimpan aman di database terpusat{" "}
                  {site.organization.name}.
                </small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Verifikasi Berkas & Pengurus Daerah</strong>
                <small>
                  Validasi dokumen oleh pengurus DPD/DPP secara transparan.
                </small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Aktivasi KTA Digital & Kredit SKP</strong>
                <small>
                  Akses instan portal anggota, cetak KTA, dan ikuti pelatihan
                  berkredit CPD.
                </small>
              </div>
            </li>
          </ol>
        </div>
        <MembershipRegistration organizationName={site.organization.name} />
      </div>
    </section>
  );
}
