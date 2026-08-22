import type { Metadata } from "next";
import { getPublicSite } from "../../lib/api";
import { ShieldCheck, Search, Building2, CheckCircle2, ExternalLink } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Verifikasi Platform Fintech & Pembiayaan Berizin - ${site.organization.name}`,
    description: "Mesin pencarian publik untuk memverifikasi keabsahan izin Otoritas Jasa Keuangan (OJK) dan status keanggotaan platform fintech pendanaan.",
  };
}

interface Lender {
  id: string;
  brandName: string;
  companyName: string;
  licenseNumber: string;
  sectorType: string;
  ojkStatus: string;
  websiteUrl: string | null;
  isAfpiMember: boolean;
}

async function getLenders(): Promise<Lender[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/v1/public/lenders`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function LendersPage() {
  const site = await getPublicSite();
  const lendersList = await getLenders();

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="lenders-hero">
        <div className="wrap">
          <div className="hero-pill">
            <ShieldCheck size={14} />
            <span>Portal Proteksi Konsumen & Verifikasi Izin OJK</span>
          </div>
          <h1>Cek Legalitas Platform Fintech & Pembiayaan</h1>
          <p className="hero-lead">
            Pastikan entitas fintech pendanaan dan pembiayaan yang Anda gunakan telah memiliki izin resmi Otoritas Jasa Keuangan (OJK) serta patuh pada Kode Etik Asosiasi.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="lenders-body">
        <div className="wrap">
          <div className="lender-grid">
            {lendersList.length > 0 ? (
              lendersList.map((lender) => (
                <div key={lender.id} className="lender-card">
                  <div className="lender-header">
                    <Building2 size={24} className="lender-icon" />
                    <div>
                      <h2>{lender.brandName}</h2>
                      <span className="company-sub">{lender.companyName}</span>
                    </div>
                  </div>

                  <div className="lender-license-badge">
                    <CheckCircle2 size={14} /> {lender.ojkStatus} ({lender.licenseNumber})
                  </div>

                  <p className="sector-tag">{lender.sectorType}</p>

                  <div className="lender-card-footer">
                    {lender.isAfpiMember && <span className="member-status-pill">Anggota Resmi</span>}
                    {lender.websiteUrl && (
                      <a
                        href={lender.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-visit-site"
                      >
                        Kunjungi Situs <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Building2 size={48} />
                <h3>Belum Ada Data Platform</h3>
                <p>Data entitas berizin sedang disinkronkan dengan registri asosiasi.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
