"use client";

import {
  ArrowRight,
  BookOpen,
  Download,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Regulation {
  id: string;
  title: string;
  slug: string;
  category:
    | "regulasi_pemerintah"
    | "se_organisasi"
    | "ad_art"
    | "posisi_kebijakan";
  number: string | null;
  issuedDate: string | null;
  fileUrl: string | null;
  summary: string | null;
  downloadCount: number;
}

const categoryLabels: Record<string, { label: string; badgeClass: string }> = {
  regulasi_pemerintah: {
    label: "Regulasi Pemerintah",
    badgeClass: "badge-gov",
  },
  se_organisasi: { label: "Surat Edaran (SE)", badgeClass: "badge-se" },
  ad_art: { label: "AD / ART", badgeClass: "badge-adart" },
  posisi_kebijakan: { label: "Naskah Kebijakan", badgeClass: "badge-policy" },
};

const tabs = [
  { key: "all", label: "Semua Dokumen" },
  { key: "ad_art", label: "AD / ART" },
  { key: "se_organisasi", label: "Surat Edaran" },
  { key: "regulasi_pemerintah", label: "Regulasi Pemerintah" },
  { key: "posisi_kebijakan", label: "Naskah Kebijakan" },
];

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiUrl}/v1/public/regulations`);
        if (!res.ok) throw new Error("Failed to load regulations");
        const json = await res.json();
        setRegulations(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchRegulations();
  }, []);

  const filtered = regulations.filter((item) => {
    const matchTab = activeTab === "all" || item.category === activeTab;
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.number?.toLowerCase().includes(search.toLowerCase()) ||
      item.summary?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

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
            Akses resmi dokumen Anggaran Dasar & Rumah Tangga (AD/ART), Surat
            Edaran Pengurus Pusat, Peraturan Pemerintah sektor terkait, serta
            Naskah Posisi Kebijakan.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="regulations-body">
        <div className="wrap">
          {/* Controls Bar */}
          <div className="regulations-controls mb-8">
            <div className="category-pills">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`pill-btn ${activeTab === tab.key ? "active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="search-input-wrap reg-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Cari judul dokumen atau nomor surat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={32} className="animate-spin text-muted" />
            </div>
          ) : (
            <div className="regulations-grid">
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  const cat = categoryLabels[item.category] ?? {
                    label: item.category,
                    badgeClass: "badge-gov",
                  };
                  return (
                    <article key={item.id} className="regulation-card">
                      <div className="card-header">
                        <span className={`reg-badge ${cat.badgeClass}`}>
                          {cat.label}
                        </span>
                        {item.number && (
                          <span className="reg-number">{item.number}</span>
                        )}
                      </div>
                      <h2>{item.title}</h2>
                      {item.summary && (
                        <p className="reg-summary">{item.summary}</p>
                      )}
                      <div className="card-footer">
                        <span className="download-count">
                          <Download size={14} />{" "}
                          {item.downloadCount.toLocaleString()} Unduhan
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
                <div className="empty-state col-span-2">
                  <FileText size={48} />
                  <h3>Tidak Ada Dokumen Sesuai Filter</h3>
                  <p>
                    Coba ubah tab kategori atau sesuaikan kata kunci pencarian.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
