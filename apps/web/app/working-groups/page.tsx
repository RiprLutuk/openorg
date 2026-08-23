"use client";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  FileText,
  Landmark,
  Mail,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

interface WorkingGroup {
  id: string;
  name: string;
  slug: string;
  chairName: string | null;
  category: string;
  description: string | null;
  memberCount: number;
}

const POKJA_DETAILS: Record<
  string,
  {
    iconType: string;
    focusAreas: string[];
    partnerInstitutions: string[];
    activePrograms: string[];
    leadEmail: string;
  }
> = {
  "pokja-kompetensi-k3": {
    iconType: "wrench",
    focusAreas: [
      "Penyusunan Kurikulum Uji Kompetensi BNSP Skema Teknisi Tata Udara Level 2, 3, dan 4",
      "Standar Prosedur Operasional K3 Penanganan Refrigeran Flammable (R32 & R290)",
      "Akreditasi Lembaga Pelatihan Vokasi & Balai Latihan Kerja (BLK) Mitra Daerah",
    ],
    partnerInstitutions: [
      "BNSP RI",
      "Kementerian Ketenagakerjaan (Kemenaker)",
      "LSP TPTU",
    ],
    activePrograms: [
      "Uji Sertifikasi 10.000 Teknisi Nasional 2026",
      "Penyusunan Modul Praktik Vakum Pipa <500 Micron",
    ],
    leadEmail: "pokja.k3@apti.or.id",
  },
  "pokja-advokasi-klhk": {
    iconType: "scale",
    focusAreas: [
      "Transisi Penggunaan Refrigeran Rendah GWP & Zero ODP Sesuai Protokol Montreal",
      "Advokasi Kebijakan Pajak & Insentif Peralatan Recovery Freon Ramah Lingkungan",
      "Kemitraan Regulasi Sertifikasi Teknisi Pengambil Freon bersama Direktorat Mitigasi Perubahan Iklim KLHK",
    ],
    partnerInstitutions: [
      "Kementerian Lingkungan Hidup dan Kehutanan (KLHK)",
      "Kementerian Perindustrian",
      "UNIDO / UNEP OzonAction",
    ],
    activePrograms: [
      "Program Bank Freon & Pusat Daur Ulang Nasional",
      "Pemberian Sertifikat Hijau untuk Bengkel Ramah Lingkungan",
    ],
    leadEmail: "pokja.advokasi@apti.or.id",
  },
  "pokja-etik-konsumen": {
    iconType: "shield",
    focusAreas: [
      "Pengelolaan Desk Pengaduan Konsumen & Whistleblowing JENDELA",
      "Mediasi Sengketa Pengerjaan Teknisi & Standar Garansi Minimum 30 Hari",
      "Penegakan Kode Etik Profesi dan Evaluasi Pembekuan Nomor KTA Pelanggar",
    ],
    partnerInstitutions: [
      "Badan Perlindungan Konsumen Nasional (BPKN)",
      "Yayasan Lembaga Konsumen Indonesia (YLKI)",
      "Dewan Etik DPP",
    ],
    activePrograms: [
      "Penerbitan Surat Peringatan Etik Berkala",
      "Standardisasi Kwitansi & Buku Servis Resmi Asosiasi",
    ],
    leadEmail: "dewan.etik@apti.or.id",
  },
};

export default function WorkingGroupsPage() {
  const [groups, setGroups] = useState<WorkingGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalPokja, setActiveModalPokja] = useState<WorkingGroup | null>(
    null,
  );

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiUrl}/v1/public/working-groups`);
        if (!res.ok) throw new Error("Gagal memuat data Pokja");
        const json = await res.json();
        setGroups(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) => {
    const matchCategory =
      selectedCategory === "all" ||
      g.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch =
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.chairName?.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categories = [
    { key: "all", label: "Semua Pokja" },
    { key: "Standardisasi", label: "Standardisasi & Sertifikasi" },
    { key: "Advokasi", label: "Advokasi & Regulatif" },
    { key: "Kode Etik", label: "Kode Etik & Konsumen" },
  ];

  return (
    <div className="working-groups-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero pokja-hero-master">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <Briefcase size={15} color="#38bdf8" />
            <span>ADVOCACY, STANDARD & SPECIAL COMMITTEES</span>
          </div>

          <h1 className="tech-hero-title">
            Kelompok Kerja (Pokja) &{" "}
            <span className="text-gradient">Komite Advokasi</span>
          </h1>

          <p className="tech-hero-lead">
            Wadah kolaborasi tenaga ahli, praktisi senior, dan perwakilan
            pengurus dalam merumuskan standar kompetensi SKKNI, naskah advokasi
            regulasi refrigeran ramah lingkungan, serta penegakan etika profesi
            nasional.
          </p>

          {/* Key Metrics Row */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <ShieldCheck size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>3 Pokja Strategis</strong>
                <small>Struktur DPP Resmi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Landmark size={22} color="#34d399" />
              </div>
              <div>
                <strong>Mitra BNSP & KLHK</strong>
                <small>Penyusun Regulasi Nasional</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <FileCheck2 size={22} color="#818cf8" />
              </div>
              <div>
                <strong>Standar SKKNI & K3</strong>
                <small>Pedoman Uji Kompetensi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Scale size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>Mediasi Konsumen</strong>
                <small>Desk Pengaduan JENDELA</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content & Directory Grid */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Controls Bar: Category Pills & Search */}
          <div className="directory-controls-row">
            <div className="directory-cat-pills">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`dir-cat-btn ${selectedCategory === cat.key ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="dir-search-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Cari nama pokja, ketua, atau topik..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch("")}
                  aria-label="Bersihkan pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Pokja Cards Grid */}
          <div className="pokja-cards-grid">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((pokja) => {
                const detail = POKJA_DETAILS[pokja.slug] || {
                  iconType: "briefcase",
                  focusAreas: [
                    "Pengembangan Program Sektoral",
                    "Koordinasi Anggota",
                  ],
                  partnerInstitutions: ["Kementerian / Lembaga Terkait"],
                  activePrograms: ["Agenda Rutin Pokja"],
                  leadEmail: "sekretariat@apti.or.id",
                };

                return (
                  <div key={pokja.id} className="pokja-modern-card slide-in-up">
                    <div className="pokja-card-header">
                      <span className="partner-cat-badge">
                        {pokja.category}
                      </span>
                      <span className="pokja-member-chip">
                        <Users size={13} />
                        <span>{pokja.memberCount} Anggota Tim</span>
                      </span>
                    </div>

                    <h3 className="pokja-title">{pokja.name}</h3>

                    {pokja.chairName && (
                      <div className="pokja-chair-row">
                        <div className="chair-avatar-icon">
                          <Users size={16} />
                        </div>
                        <div>
                          <small>Ketua Kelompok Kerja:</small>
                          <strong>{pokja.chairName}</strong>
                        </div>
                      </div>
                    )}

                    <p className="pokja-desc">{pokja.description}</p>

                    {/* Focus Highlights */}
                    <div className="pokja-focus-box">
                      <small>Fokus Utama Kerja:</small>
                      <ul>
                        {detail.focusAreas.slice(0, 2).map((item, idx) => (
                          <li key={idx}>
                            <CheckCircle2 size={13} color="#0284c7" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Bar */}
                    <div className="pokja-card-footer">
                      <button
                        type="button"
                        className="button secondary btn-pokja-detail"
                        onClick={() => setActiveModalPokja(pokja)}
                      >
                        <span>Lihat Program & Rekomendasi</span>
                        <ChevronRightIcon size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                <Users size={48} />
                <h3>Belum Ada Pokja Sesuai Pencarian</h3>
                <p>
                  Silakan gunakan kata kunci lain atau pilih kategori Semua
                  Pokja.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Interactive Detail Modal */}
      {activeModalPokja && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveModalPokja(null)}
        >
          <div
            className="modal-content pokja-detail-modal slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="partner-cat-badge">
                  {activeModalPokja.category}
                </span>
                <h2>{activeModalPokja.name}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveModalPokja(null)}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="pokja-chair-card-modal">
                <div className="chair-avatar-large">
                  <Users size={24} />
                </div>
                <div>
                  <small>Pimpinan Kelompok Kerja</small>
                  <h4>{activeModalPokja.chairName ?? "Pengurus DPP"}</h4>
                  <p>Koordinator Tim Ahli & Komite Tetap Asosiasi</p>
                </div>
              </div>

              <div className="modal-section-group">
                <h4>Ruang Lingkup & Fokus Kerja:</h4>
                <ul className="modal-check-list">
                  {(
                    POKJA_DETAILS[activeModalPokja.slug]?.focusAreas ?? [
                      "Perumusan standar regulasi industri.",
                    ]
                  ).map((area, i) => (
                    <li key={i}>
                      <CheckCircle2 size={15} color="#0284c7" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="modal-section-group">
                <h4>Lembaga & Mitra Strategis:</h4>
                <div className="partner-tags-row">
                  {(
                    POKJA_DETAILS[activeModalPokja.slug]
                      ?.partnerInstitutions ?? ["Kementerian & BNSP"]
                  ).map((inst, i) => (
                    <span key={i} className="inst-badge">
                      <Landmark size={13} />
                      <span>{inst}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-section-group">
                <h4>Program Kerja Berjalan (2026):</h4>
                <ul className="modal-program-list">
                  {(
                    POKJA_DETAILS[activeModalPokja.slug]?.activePrograms ?? [
                      "Koordinasi berkala pengurus.",
                    ]
                  ).map((prog, i) => (
                    <li key={i}>
                      <Sparkles size={14} color="#f59e0b" />
                      <span>{prog}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <a
                href={`mailto:${POKJA_DETAILS[activeModalPokja.slug]?.leadEmail ?? "sekretariat@apti.or.id"}?subject=Pertanyaan Mengenai ${encodeURIComponent(activeModalPokja.name)}`}
                className="button primary"
              >
                <Mail size={15} />
                <span>Hubungi Sekretariat Pokja</span>
              </a>
              <button
                type="button"
                className="button secondary"
                onClick={() => setActiveModalPokja(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom CTA */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Ingin Bergabung dalam Komite Ahli & Pokja?"
        guestDescription="Praktisi, akademisi, dan tenaga ahli pendingin ber-KTA aktif dipersilakan mengajukan diri untuk memperkuat komite standardisasi asosiasi."
        guestPrimaryCta={{ label: "Daftar Anggota Teknisi", href: "/join" }}
        guestSecondaryCta={{
          label: "Konsultasi Regulasi",
          href: "/regulations",
        }}
        memberTitle="Akses Notula Rapat & Draf Kebijakan Pokja"
        memberDescription="Anggota komite dapat mengunduh naskah akademik, draf SKKNI, dan jadwal sidang komite di portal pengurus."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{
          label: "Pusat Pengaduan JENDELA",
          href: "/complaints",
        }}
      />
    </div>
  );
}

function ChevronRightIcon({ size }: { size: number }) {
  return <ArrowRight size={size} />;
}
