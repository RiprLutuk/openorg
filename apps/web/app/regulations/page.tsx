import type { Metadata } from "next";
import Link from "next/link";
import { getPublicSite } from "../../lib/api";
import { FileText, Download, ShieldCheck, BookOpen, Search, ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Regulasi & Posisi Kebijakan - ${site.organization.name}`,
    description: "Pusat repository dokumen regulasi pemerintah, AD/ART, Surat Edaran Organisasi, dan naskah advokasi kebijakan.",
  };
}

interface Regulation {
  id: string;
  title: string;
  slug: string;
  category: "regulasi_pemerintah" | "se_organisasi" | "ad_art" | "posisi_kebijakan";
  number: string | null;
  issuedDate: string | null;
  fileUrl: string | null;
  summary: string | null;
  downloadCount: number;
}

const categoryLabels: Record<string, { label: string; badgeClass: string }> = {
  regulasi_pemerintah: { label: "Regulasi Pemerintah", badgeClass: "badge-gov" },
  se_organisasi: { label: "Surat Edaran (SE)", badgeClass: "badge-se" },
  ad_art: { label: "AD / ART", badgeClass: "badge-adart" },
  posisi_kebijakan: { label: "Naskah Kebijakan", badgeClass: "badge-policy" },
};

async function getRegulations(): Promise<Regulation[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/v1/public/regulations`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function RegulationsPage() {
  const site = await getPublicSite();
  const regulationsList = await getRegulations();

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="regulations-hero">
        <div className="wrap">
          <div className="hero-pill">
            <BookOpen size={14} />
            <span>Repository Legal & Advocacy</span>
          </div>
          <h1>Regulasi & Posisi Kebijakan Organisasi</h1>
          <p className="hero-lead">
            Akses resmi dokumen Anggaran Dasar & Rumah Tangga (AD/ART), Surat Edaran Pengurus Pusat, Peraturan Pemerintah sektor terkait, serta Naskah Posisi Kebijakan.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="regulations-body">
        <div className="wrap">
          <div className="regulations-grid">
            {regulationsList.length > 0 ? (
              regulationsList.map((item) => {
                const cat = categoryLabels[item.category] ?? { label: item.category, badgeClass: "badge-gov" };
                return (
                  <article key={item.id} className="regulation-card">
                    <div className="card-header">
                      <span className={`reg-badge ${cat.badgeClass}`}>{cat.label}</span>
                      {item.number && <span className="reg-number">{item.number}</span>}
                    </div>
                    <h2>{item.title}</h2>
                    {item.summary && <p className="reg-summary">{item.summary}</p>}
                    <div className="card-footer">
                      <span className="download-count">
                        <Download size={14} /> {item.downloadCount.toLocaleString()} Unduhan
                      </span>
                      {item.fileUrl ? (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-download"
                        >
                          Unduh PDF <ArrowRight size={14} />
                        </a>
                      ) : (
                        <span className="btn-disabled">Dokumen Fisik</span>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-state">
                <FileText size={48} />
                <h3>Belum Ada Dokumen Regulasi</h3>
                <p>Dokumen regulasi dan AD/ART akan segera diunggah oleh pihak sekretariat.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
