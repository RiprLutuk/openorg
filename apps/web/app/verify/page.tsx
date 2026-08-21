import { BadgeCheck, Search, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { MembershipVerification } from "@/components/membership-verification";
import { getSite } from "@/lib/api";

export const metadata: Metadata = {
  title: "Verifikasi Kredensial & Kartu Anggota",
  description:
    "Layanan verifikasi keabsahan KTA digital, lisensi, dan sertifikat anggota secara transparan.",
};

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function VerifyPage({ searchParams }: Props) {
  const { code } = await searchParams;
  const site = await getSite();

  return (
    <div className="section-space">
      <div className="wrap">
        <div className="section-heading text-center">
          <span className="eyebrow">ComplyFlow · Verifikasi Publik</span>
          <h2>Verifikasi Keabsahan Kredensial & KTA</h2>
          <p>
            Masukkan nomor KTA atau kode kredensial untuk mengecek keaslian
            status keanggotaan dan sertifikasi di {site.organization.name}.
          </p>
        </div>

        <div className="verify-search-box">
          <form method="GET" action="/verify" className="verify-form">
            <div className="input-group">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                name="code"
                defaultValue={code ?? ""}
                placeholder="Masukkan Nomor KTA atau Kode Verifikasi..."
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              <BadgeCheck size={18} />
              <span>Verifikasi Now</span>
            </button>
          </form>
        </div>

        {code ? (
          <div className="verify-result-container">
            <MembershipVerification
              code={code}
              organization={site.organization.slug}
            />
          </div>
        ) : (
          <div className="verify-info-grid">
            <div className="verify-info-card">
              <ShieldCheck size={28} className="info-icon" />
              <h3>Terpercaya & Real-Time</h3>
              <p>
                Data terhubung langsung dengan database registri resmi{" "}
                {site.organization.name}.
              </p>
            </div>
            <div className="verify-info-card">
              <BadgeCheck size={28} className="info-icon" />
              <h3>Mencegah Pemalsuan</h3>
              <p>
                Setiap KTA digital dan sertifikat memiliki kode unik dan versi
                yang dapat diaudit publik.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
