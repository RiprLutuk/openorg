"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Gavel,
  Globe,
  Handshake,
  HeartHandshake,
  Landmark,
  Leaf,
  Lock,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

interface ArticleClause {
  articleNumber: string;
  title: string;
  clauses: string[];
}

interface ChapterData {
  id: string;
  type: "AD" | "ART";
  chapter: string;
  title: string;
  summary: string;
  color: string;
  icon: any;
  articles: ArticleClause[];
}

const adChaptersData: ChapterData[] = [
  {
    id: "ad-bab-1",
    type: "AD",
    chapter: "BAB I",
    title: "Nama, Waktu, Asas & Kedudukan",
    summary:
      "Menetapkan identitas yuridis organisasi, status badan hukum perkumpulan, dan sekretariat pusat serta wilayah 38 provinsi.",
    color: "#38bdf8",
    icon: Landmark,
    articles: [
      {
        articleNumber: "Pasal 1",
        title: "Nama & Identitas Organisasi",
        clauses: [
          "(1) Organisasi ini bernama Asosiasi Pengusaha & Teknisi Pendingin Indonesia, disingkat APTI.",
          "(2) APTI adalah organisasi profesi dan kemitraan usaha berbadan hukum nirlaba yang menghimpun praktisi tata udara dan refrigerasi di Indonesia.",
        ],
      },
      {
        articleNumber: "Pasal 2",
        title: "Waktu & Landasan Hukum",
        clauses: [
          "(1) Organisasi didirikan untuk jangka waktu yang tidak ditentukan terhitung sejak tanggal deklarasi nasional.",
          "(2) Berbadan hukum resmi melalui Keputusan Menteri Hukum dan HAM RI Nomor AHU-0012948.AH.01.07.TAHUN 2024.",
        ],
      },
      {
        articleNumber: "Pasal 3",
        title: "Kedudukan & Wilayah Kerja",
        clauses: [
          "(1) Dewan Pimpinan Pusat (DPP) berkedudukan di Ibukota Negara Republik Indonesia.",
          "(2) Dewan Pimpinan Daerah (DPD) berkedudukan di Ibukota Provinsi dan dapat membentuk Koordinator Wilayah (Korwil) di tingkat Kabupaten/Kota.",
        ],
      },
    ],
  },
  {
    id: "ad-bab-2",
    type: "AD",
    chapter: "BAB II",
    title: "Visi, Misi, Asas & Tujuan Pokok",
    summary:
      "Berasaskan Pancasila dan UUD 1945, bertujuan mewujudkan ekosistem refrigerasi yang berstandar kompetensi tinggi dan ramah iklim.",
    color: "#34d399",
    icon: Scale,
    articles: [
      {
        articleNumber: "Pasal 4",
        title: "Asas & Kedaulatan",
        clauses: [
          "(1) Organisasi berasaskan Pancasila dan Undang-Undang Dasar Negara Republik Indonesia 1945.",
          "(2) Kedaulatan tertinggi organisasi berada di tangan anggota dan dilaksanakan sepenuhnya melalui Musyawarah Nasional (Munas).",
        ],
      },
      {
        articleNumber: "Pasal 5",
        title: "Tujuan Pokok Organisasi",
        clauses: [
          "(1) Menstandarisasi keahlian teknisi pendingin melalui sertifikasi kompetensi kerja berstandar SKKNI dan BNSP.",
          "(2) Mendorong perlindungan hak konsumen melalui standarisasi garansi kerja dan transparansi tarif perbaikan.",
          "(3) Mendukung komitmen nasional mitigasi pemanasan global melalui penanganan refrigeran rendah GWP & zero ODS.",
        ],
      },
    ],
  },
  {
    id: "ad-bab-3",
    type: "AD",
    chapter: "BAB III",
    title: "Keanggotaan & Kualifikasi Profesi",
    summary:
      "Mengatur klasifikasi anggota biasa, luar biasa, dan kehormatan serta tata cara registrasi KTA Digital resmi.",
    color: "#818cf8",
    icon: Users,
    articles: [
      {
        articleNumber: "Pasal 6",
        title: "Klasifikasi Anggota",
        clauses: [
          "(1) Anggota Biasa: Praktisi teknisi mandiri atau pemilik workshop pendingin yang telah lulus verifikasi kredensial.",
          "(2) Anggota Luar Biasa: Akademisi, instruktur vokasi, dan perwakilan prinsipal/distributor mesin refrigerasi.",
          "(3) Anggota Kehormatan: Tokoh masyarakat atau pakar industri yang berjasa luar biasa bagi kemajuan profesi pendingin.",
        ],
      },
      {
        articleNumber: "Pasal 7",
        title: "Hak & Kewajiban Anggota",
        clauses: [
          "(1) Setiap anggota berhak memperoleh KTA Digital resmi ber-QR Code anti-pemalsuan dan akses pelatihan bersubsidi.",
          "(2) Setiap anggota wajib mematuhi AD/ART, menjunjung 9 Butir Pakta Integritas, dan membayar iuran tahunan.",
        ],
      },
    ],
  },
  {
    id: "ad-bab-4",
    type: "AD",
    chapter: "BAB IV",
    title: "Struktur Organisasi & Musyawarah",
    summary:
      "Hierarki kepengurusan DPP, DPD, Rapat Kerja Nasional (Rakernas), serta Musyawarah Nasional 5 tahunan.",
    color: "#f59e0b",
    icon: Building2,
    articles: [
      {
        articleNumber: "Pasal 8",
        title: "Musyawarah Nasional (Munas)",
        clauses: [
          "(1) Munas adalah pemegang kekuasaan tertinggi organisasi yang diselenggarakan sekali dalam 5 (lima) tahun.",
          "(2) Munas berwenang menetapkan atau menyempurnakan AD/ART, memilih Ketua Umum DPP, dan menetapkan Garis Besar Program Kerja.",
        ],
      },
      {
        articleNumber: "Pasal 9",
        title: "Kepengurusan DPP & DPD",
        clauses: [
          "(1) DPP dipimpin oleh Ketua Umum dibantu Sekretaris Jenderal, Bendahara Umum, dan Bidang Teknis Advokasi.",
          "(2) DPD mengoordinasikan pembinaan anggota di tingkat provinsi serta menyelenggarakan uji kompetensi daerah.",
        ],
      },
    ],
  },
  {
    id: "ad-bab-5",
    type: "AD",
    chapter: "BAB V",
    title: "Kode Etik & Dewan Kehormatan",
    summary:
      "Penetapan Majelis Etik Organisasi dan mekanisme investigasi laporan pelanggaran hak konsumen atau malpraktik teknis.",
    color: "#ec4899",
    icon: Gavel,
    articles: [
      {
        articleNumber: "Pasal 10",
        title: "Dewan Kehormatan & Majelis Etik",
        clauses: [
          "(1) Dewan Kehormatan bersifat independen dan bertugas mengawasi kepatuhan kode etik seluruh anggota.",
          "(2) Memeriksa dan memutus aduan konsumen atau sengketa antar-anggota melalui persidangan Majelis Etik JENDELA.",
        ],
      },
      {
        articleNumber: "Pasal 11",
        title: "Tingkatan Sanksi Organisasi",
        clauses: [
          "(1) Peringatan lisan dan teguran tertulis pertama hingga ketiga.",
          "(2) Pembekuan hak keanggotaan dan penonaktifan status KTA sementara waktu.",
          "(3) Pemberhentian tetap dengan tidak hormat serta pencabutan nomor registrasi KTA permanen.",
        ],
      },
    ],
  },
  {
    id: "ad-bab-6",
    type: "AD",
    chapter: "BAB VI",
    title: "Keuangan & Aset Organisasi",
    summary:
      "Prinsip akuntabilitas iuran anggota, dana abadi pengembangan vokasi, dan audit laporan keuangan tahunan.",
    color: "#06b6d4",
    icon: ShieldCheck,
    articles: [
      {
        articleNumber: "Pasal 12",
        title: "Sumber Keuangan",
        clauses: [
          "(1) Iuran pangkal pendaftaran anggota dan iuran tahunan KTA Digital.",
          "(2) Hasil kegiatan seminar, workshop sertifikasi, serta kontribusi halal dari mitra industri yang tidak mengikat.",
        ],
      },
      {
        articleNumber: "Pasal 13",
        title: "Transparansi & Audit Keuangan",
        clauses: [
          "(1) Laporan penerimaan dan pengeluaran kas wajib dilaporkan secara berkala dalam Rapat Kerja Nasional (Rakernas).",
          "(2) DPP wajib diaudit oleh akuntan publik independen pada akhir masa periode kepengurusan.",
        ],
      },
    ],
  },
];

const artChaptersData: ChapterData[] = [
  {
    id: "art-bab-1",
    type: "ART",
    chapter: "BAB I (ART)",
    title: "Tata Cara Registrasi & Verifikasi KTA",
    summary:
      "Prosedur teknis penerbitan nomor KTA Digital, masa retensi, dan verifikasi sertifikat keahlian di database nasional.",
    color: "#38bdf8",
    icon: FileCheck2,
    articles: [
      {
        articleNumber: "Pasal 1 (ART)",
        title: "Prosedur Pendaftaran Digital",
        clauses: [
          "(1) Calon anggota mengajukan permohonan melalui portal resmi OpenOrg dengan melampirkan identitas KTP dan foto profil.",
          "(2) Verifikator DPD setempat memeriksa kelayakan data dan melakukan verifikasi faktual bengkel atau pengalaman kerja.",
        ],
      },
      {
        articleNumber: "Pasal 2 (ART)",
        title: "Penerbitan KTA Ber-QR Code",
        clauses: [
          "(1) KTA diterbitkan secara digital berformat kartu resmi dengan QR Code yang terhubung ke portal publik verifikasi.",
          "(2) Masa berlaku KTA adalah 1 (satu) tahun dan dapat diperpanjang otomatis setelah menyelesaikan kewajiban iuran tahunan.",
        ],
      },
    ],
  },
  {
    id: "art-bab-2",
    type: "ART",
    chapter: "BAB II (ART)",
    title: "Hak Suara & Mekanisme Pemilihan",
    summary:
      "Tata tertib pencalonan Ketua Umum, hak suara delegasi DPD, dan sistem e-voting Musyawarah Nasional.",
    color: "#f59e0b",
    icon: Users,
    articles: [
      {
        articleNumber: "Pasal 3 (ART)",
        title: "Syarat Calon Ketua Umum DPP",
        clauses: [
          "(1) Telah menjadi Anggota Biasa aktif sekurang-kurangnya 3 (tiga) tahun berturut-turut.",
          "(2) Memiliki sertifikat kompetensi BNSP level Teknisi Madya/Utama dan tidak pernah melanggar kode etik berat.",
        ],
      },
    ],
  },
  {
    id: "art-bab-3",
    type: "ART",
    chapter: "BAB III (ART)",
    title: "Penyelenggaraan Standar Pelatihan & SKP",
    summary:
      "Akreditasi Satuan Kredit Profesi (SKP) mandiri melalui partisipasi workshop, logbook penanganan unit, dan pelatihan K3.",
    color: "#10b981",
    icon: Zap,
    articles: [
      {
        articleNumber: "Pasal 4 (ART)",
        title: "Satuan Kredit Profesi (SKP)",
        clauses: [
          "(1) Setiap anggota wajib mengumpulkan minimal 25 poin SKP dalam 3 tahun untuk mempertahankan status sertifikasi aktif.",
          "(2) Poin SKP diperoleh dari keikutsertaan webinar teknik, sertifikasi BNSP, dan kontribusi bakti sosial pendingin.",
        ],
      },
    ],
  },
];

const ethicsPledgesData = [
  {
    number: "01",
    title: "Kejujuran & Transparansi Diagnosa",
    description:
      "Wajib menyampaikan kondisi riil kerusakan perangkat pendingin secara jujur kepada konsumen tanpa manipulasi komponen atau rekayasa biaya.",
    icon: ShieldCheck,
    tag: "Integritas Moral",
    color: "#0284c7",
  },
  {
    number: "02",
    title: "Standar Tarif Wajar & Terbuka",
    description:
      "Menerapkan estimasi biaya jasa dan suku cadang yang transparan, profesional, dan dapat dipertanggungjawabkan sebelum pengerjaan dimulai.",
    icon: Scale,
    tag: "Kewajaran Usaha",
    color: "#34d399",
  },
  {
    number: "03",
    title: "Jaminan Garansi Kerja Nyata",
    description:
      "Memberikan kepastian garansi perbaikan yang sah dan siap melakukan perbaikan ulang tanpa biaya tambahan jika terjadi kegagalan fungsi dalam masa garansi.",
    icon: Award,
    tag: "Garansi Mutu",
    color: "#818cf8",
  },
  {
    number: "04",
    title: "Keselamatan Kerja (K3) & APD",
    description:
      "Memprioritaskan keselamatan kerja teknisi, konsumen, dan lingkungan dengan penggunaan Alat Pelindung Diri (APD) serta peralatan berstandar SNI.",
    icon: Wrench,
    tag: "K3 & Safety",
    color: "#f59e0b",
  },
  {
    number: "05",
    title: "Kelestarian Lingkungan (Eco-Recovery)",
    description:
      "Wajib menggunakan unit recovery freon saat servis dan melarang keras pembuangan refrigeran sintetik secara bebas ke atmosfer bumi.",
    icon: Leaf,
    tag: "Ramah Lingkungan",
    color: "#10b981",
  },
  {
    number: "06",
    title: "Keamanan Properti Konsumen",
    description:
      "Menjaga kerahasiaan, kehormatan tempat kerja, serta keselamatan aset fisik milik pelanggan selama proses instalasi dan pemeliharaan.",
    icon: Lock,
    tag: "Privasi & Aset",
    color: "#6366f1",
  },
  {
    number: "07",
    title: "Solidaritas Sesama Workshop",
    description:
      "Menjaga persaingan usaha yang sehat, saling menghargai sesama rekan seprofesi, dan tidak melakukan fitnah antar-bengkel binaan.",
    icon: HeartHandshake,
    tag: "Persaudaraan",
    color: "#ec4899",
  },
  {
    number: "08",
    title: "Pengembangan Kompetensi (SKP)",
    description:
      "Senantiasa meningkatkan keahlian teknis melalui program pelatihan resmi, uji sertifikasi BNSP, dan pengisian logbook Satuan Kredit Profesi.",
    icon: Zap,
    tag: "Evolusi Profesi",
    color: "#06b6d4",
  },
  {
    number: "09",
    title: "Kepatuhan AD/ART & Hukum Nasional",
    description:
      "Tunduk pada seluruh keputusan Musyawarah Nasional, maklumat Surat Edaran DPP, serta peraturan perundang-undangan Republik Indonesia.",
    icon: Landmark,
    tag: "Disiplin Hukum",
    color: "#f43f5e",
  },
];

function AdArtContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get("tab") || "ringkasan",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticles, setExpandedArticles] = useState<
    Record<string, boolean>
  >({ "ad-bab-1-Pasal 1": true });
  const [copiedPledge, setCopiedPledge] = useState<string | null>(null);

  const toggleArticle = (key: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopyPledge = (num: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPledge(num);
    setTimeout(() => setCopiedPledge(null), 2000);
  };

  // Filter Chapters based on search
  const filteredAdChapters = useMemo(() => {
    if (!searchQuery.trim()) return adChaptersData;
    const q = searchQuery.toLowerCase();
    return adChaptersData.filter(
      (ch) =>
        ch.title.toLowerCase().includes(q) ||
        ch.summary.toLowerCase().includes(q) ||
        ch.chapter.toLowerCase().includes(q) ||
        ch.articles.some(
          (art) =>
            art.title.toLowerCase().includes(q) ||
            art.articleNumber.toLowerCase().includes(q) ||
            art.clauses.some((c) => c.toLowerCase().includes(q)),
        ),
    );
  }, [searchQuery]);

  const filteredArtChapters = useMemo(() => {
    if (!searchQuery.trim()) return artChaptersData;
    const q = searchQuery.toLowerCase();
    return artChaptersData.filter(
      (ch) =>
        ch.title.toLowerCase().includes(q) ||
        ch.summary.toLowerCase().includes(q) ||
        ch.chapter.toLowerCase().includes(q) ||
        ch.articles.some(
          (art) =>
            art.title.toLowerCase().includes(q) ||
            art.articleNumber.toLowerCase().includes(q) ||
            art.clauses.some((c) => c.toLowerCase().includes(q)),
        ),
    );
  }, [searchQuery]);

  const filteredPledges = useMemo(() => {
    if (!searchQuery.trim()) return ethicsPledgesData;
    const q = searchQuery.toLowerCase();
    return ethicsPledgesData.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q) ||
        p.number.includes(q),
    );
  }, [searchQuery]);

  return (
    <div className="adart-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="adart-hero">
        <div className="wrap adart-hero-inner">
          <div className="org-hero-pill">
            <Scale size={15} color="#38bdf8" />
            <span>LANDASAN HUKUM & KONSTITUSI ORGANISASI</span>
          </div>

          <h1 className="org-hero-title">
            Anggaran Dasar, AD/ART &{" "}
            <span className="text-gradient">Kode Etik Profesi</span>
          </h1>

          <p className="org-hero-lead">
            Konstitusi pokok resmi yang disahkan melalui Musyawarah Nasional
            (Munas) sebagai pedoman tata kelola keorganisasian, hak & kewajiban
            anggota, wewenang kepengurusan DPP/DPD, serta 9 Butir Pakta
            Integritas Profesi Pendingin Indonesia.
          </p>

          {/* Hero Metrics Row */}
          <div className="org-hero-metrics-bar">
            <div className="metric-box">
              <div className="metric-icon-wrap">
                <Landmark size={22} color="#38bdf8" />
              </div>
              <div>
                <strong style={{ fontSize: "14px" }}>SK Kemenkumham Sah</strong>
                <small style={{ color: "#94a3b8" }}>
                  AHU-0012948.AH.01.07.2024
                </small>
              </div>
            </div>
            <div className="metric-box">
              <div className="metric-icon-wrap">
                <FileCheck2 size={22} color="#34d399" />
              </div>
              <div>
                <strong style={{ fontSize: "14px" }}>
                  Naskah Munas 2024–2029
                </strong>
                <small style={{ color: "#94a3b8" }}>
                  Konstitusi Baku Berlaku
                </small>
              </div>
            </div>
            <div className="metric-box">
              <div className="metric-icon-wrap">
                <ShieldCheck size={22} color="#818cf8" />
              </div>
              <div>
                <strong style={{ fontSize: "14px" }}>
                  9 Butir Pakta Integritas
                </strong>
                <small style={{ color: "#94a3b8" }}>
                  Wajib Seluruh Anggota
                </small>
              </div>
            </div>
            <div className="metric-box">
              <div className="metric-icon-wrap">
                <Users size={22} color="#f59e0b" />
              </div>
              <div>
                <strong style={{ fontSize: "14px" }}>38 DPD Provinsi</strong>
                <small style={{ color: "#94a3b8" }}>
                  Struktur Musyawarah Sah
                </small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Interactive Navigation Tabs & Real-time Clause Search */}
      <nav className="adart-nav-sticky">
        <div className="wrap adart-nav-column">
          {/* Top Row: Scrollable Tabs */}
          <div className="adart-tabs-scroll-container">
            <div className="adart-tabs-list">
              <button
                type="button"
                className={`adart-tab-btn ${activeTab === "ringkasan" ? "active" : ""}`}
                onClick={() => setActiveTab("ringkasan")}
              >
                <Sparkles size={15} />
                <span>Ringkasan Eksekutif</span>
              </button>
              <button
                type="button"
                className={`adart-tab-btn ${activeTab === "ad" ? "active" : ""}`}
                onClick={() => setActiveTab("ad")}
              >
                <Landmark size={15} />
                <span>Anggaran Dasar (AD)</span>
              </button>
              <button
                type="button"
                className={`adart-tab-btn ${activeTab === "art" ? "active" : ""}`}
                onClick={() => setActiveTab("art")}
              >
                <FileText size={15} />
                <span>Anggaran Rumah Tangga (ART)</span>
              </button>
              <button
                type="button"
                className={`adart-tab-btn ${activeTab === "etik" ? "active" : ""}`}
                onClick={() => setActiveTab("etik")}
              >
                <ShieldCheck size={15} />
                <span>9 Butir Pakta Integritas</span>
              </button>
              <button
                type="button"
                className={`adart-tab-btn ${activeTab === "unduhan" ? "active" : ""}`}
                onClick={() => setActiveTab("unduhan")}
              >
                <Download size={15} />
                <span>Unduh Dokumen</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Full Width Search Field */}
          <div className="adart-search-field-full">
            <Search size={17} color="#0284c7" />
            <input
              id="adart-search-query"
              name="adartSearchQuery"
              type="text"
              placeholder="Cari pasal, kata kunci (misal: KTA, iuran, K3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari pasal, bab, atau kata kunci AD/ART"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
                aria-label="Hapus pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 3. Main Content Display Area */}
      <main className="section-space">
        <div className="wrap">
          {/* TAB 1: RINGKASAN EKSEKUTIF */}
          {activeTab === "ringkasan" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "40px" }}
            >
              {/* Executive Overview Bento */}
              <div className="section-heading">
                <span className="eyebrow">RINGKASAN KONSTITUSI</span>
                <h2>Fondasi Hukum, Demokrasi & Etika Organisasi</h2>
                <p>
                  Kerangka regulasi internal yang mengikat seluruh jajaran
                  pengurus, koordinator wilayah, pemilik workshop, dan teknisi
                  bersertifikasi.
                </p>
              </div>

              {/* Piagam Komitmen Certificate Showcase */}
              <div className="adart-piagam-shell">
                <Landmark size={240} className="adart-piagam-watermark" />
                <div className="piagam-gold-badge">
                  <BadgeCheck size={15} />
                  <span>Piagam Ketetapan Musyawarah Nasional 2024–2029</span>
                </div>
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: 900,
                    marginBottom: "12px",
                  }}
                >
                  Maklumat Kedaulatan Profesi & Kepatuhan Organisasi
                </h3>
                <p
                  style={{
                    color: "#cbd5e1",
                    fontSize: "14.5px",
                    lineHeight: "1.7",
                    maxWidth: "860px",
                  }}
                >
                  "Bahwa sesungguhnya profesionalisme dan kehormatan praktisi
                  tata udara hanya dapat dicapai melalui kepatuhan terhadap
                  standar keselamatan kerja, pelayanan yang jujur kepada
                  masyarakat, serta persaudaraan sesama teknisi dalam bingkai
                  Negara Kesatuan Republik Indonesia."
                </p>

                <div className="piagam-signatures-row">
                  <div className="piagam-sign-box">
                    <small>Ketua Umum DPP</small>
                    <strong>Ir. H. Nanang Varian, M.T.</strong>
                  </div>
                  <div className="piagam-sign-box">
                    <small>Sekretaris Jenderal</small>
                    <strong>Dedi Kurniawan, S.T.</strong>
                  </div>
                  <div className="piagam-sign-box">
                    <small>Ketua Dewan Kehormatan / Etik</small>
                    <strong>Drs. Supriyanto, M.Si.</strong>
                  </div>
                </div>
              </div>

              {/* Quick Jump Grid into Chapters */}
              <div className="adart-chapter-grid">
                {filteredAdChapters.slice(0, 4).map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <article className="adart-chapter-card" key={ch.id}>
                      <div className="adart-chapter-top">
                        <span
                          className="adart-badge-num"
                          style={{
                            background: `${ch.color}15`,
                            color: ch.color,
                            border: `1px solid ${ch.color}35`,
                          }}
                        >
                          {ch.chapter}
                        </span>
                        <Icon size={20} color={ch.color} />
                      </div>
                      <h4
                        style={{
                          fontSize: "17px",
                          fontWeight: 800,
                          margin: "0 0 8px",
                        }}
                      >
                        {ch.title}
                      </h4>
                      <p
                        style={{
                          fontSize: "13.5px",
                          color: "#64748b",
                          lineHeight: "1.6",
                          margin: "0 0 16px",
                        }}
                      >
                        {ch.summary}
                      </p>
                      <button
                        type="button"
                        className="button outline"
                        style={{
                          marginTop: "auto",
                          fontSize: "13px",
                          padding: "8px 14px",
                        }}
                        onClick={() => setActiveTab("ad")}
                      >
                        <span>Baca {ch.articles.length} Pasal Lengkap</span>
                        <ChevronRight size={14} />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ANGGARAN DASAR (AD) */}
          {activeTab === "ad" && (
            <div>
              <div className="section-heading" style={{ marginBottom: "32px" }}>
                <span className="eyebrow">ANGGARAN DASAR (AD)</span>
                <h2>Batang Tubuh Anggaran Dasar Perkumpulan</h2>
                <p>
                  Klik pada judul pasal untuk membuka naskah bunyi klausul resmi
                  hasil ketetapan Munas.
                </p>
              </div>

              <div className="adart-chapter-grid">
                {filteredAdChapters.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <article className="adart-chapter-card" key={ch.id}>
                      <div className="adart-chapter-top">
                        <span
                          className="adart-badge-num"
                          style={{
                            background: `${ch.color}15`,
                            color: ch.color,
                            border: `1px solid ${ch.color}35`,
                          }}
                        >
                          {ch.chapter}
                        </span>
                        <Icon size={22} color={ch.color} />
                      </div>

                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 800,
                          margin: "0 0 8px",
                        }}
                      >
                        {ch.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "13.5px",
                          color: "#64748b",
                          lineHeight: "1.6",
                          margin: "0 0 14px",
                        }}
                      >
                        {ch.summary}
                      </p>

                      <div className="adart-article-accordion">
                        {ch.articles.map((art) => {
                          const key = `${ch.id}-${art.articleNumber}`;
                          const isExpanded = !!expandedArticles[key];
                          return (
                            <div
                              className="adart-article-item"
                              key={art.articleNumber}
                            >
                              <button
                                type="button"
                                className="adart-article-header"
                                onClick={() => toggleArticle(key)}
                              >
                                <span>
                                  <strong>{art.articleNumber}:</strong>{" "}
                                  {art.title}
                                </span>
                                <ChevronDown
                                  size={16}
                                  style={{
                                    transform: isExpanded
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                    transition: "transform 0.2s ease",
                                  }}
                                />
                              </button>

                              {isExpanded && (
                                <div className="adart-article-body">
                                  {art.clauses.map((cl, cIdx) => (
                                    <p
                                      key={cIdx}
                                      style={{
                                        margin: "0 0 6px",
                                        fontSize: "13px",
                                      }}
                                    >
                                      {cl}
                                    </p>
                                  ))}
                                  <div
                                    style={{
                                      marginTop: "10px",
                                      display: "flex",
                                      gap: "8px",
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          `${art.articleNumber} ${art.title}\n${art.clauses.join("\n")}`,
                                        );
                                      }}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        padding: "4px 8px",
                                        fontSize: "11px",
                                        borderRadius: "6px",
                                        border: "1px solid #cbd5e1",
                                        background: "#f8fafc",
                                        color: "#475569",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <Copy size={12} />
                                      <span>Salin Pasal</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ANGGARAN RUMAH TANGGA (ART) */}
          {activeTab === "art" && (
            <div>
              <div className="section-heading" style={{ marginBottom: "32px" }}>
                <span className="eyebrow">ANGGARAN RUMAH TANGGA (ART)</span>
                <h2>Ketentuan Pelaksanaan & Tata Tertib Keorganisasian</h2>
                <p>
                  Pedoman operasional penerbitan KTA Digital, ketentuan hak
                  suara Musda/Munas, dan program Satuan Kredit Profesi (SKP).
                </p>
              </div>

              <div className="adart-chapter-grid">
                {filteredArtChapters.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <article className="adart-chapter-card" key={ch.id}>
                      <div className="adart-chapter-top">
                        <span
                          className="adart-badge-num"
                          style={{
                            background: `${ch.color}15`,
                            color: ch.color,
                            border: `1px solid ${ch.color}35`,
                          }}
                        >
                          {ch.chapter}
                        </span>
                        <Icon size={22} color={ch.color} />
                      </div>

                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 800,
                          margin: "0 0 8px",
                        }}
                      >
                        {ch.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "13.5px",
                          color: "#64748b",
                          lineHeight: "1.6",
                          margin: "0 0 14px",
                        }}
                      >
                        {ch.summary}
                      </p>

                      <div className="adart-article-accordion">
                        {ch.articles.map((art) => {
                          const key = `${ch.id}-${art.articleNumber}`;
                          const isExpanded = !!expandedArticles[key];
                          return (
                            <div
                              className="adart-article-item"
                              key={art.articleNumber}
                            >
                              <button
                                type="button"
                                className="adart-article-header"
                                onClick={() => toggleArticle(key)}
                              >
                                <span>
                                  <strong>{art.articleNumber}:</strong>{" "}
                                  {art.title}
                                </span>
                                <ChevronDown
                                  size={16}
                                  style={{
                                    transform: isExpanded
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                    transition: "transform 0.2s ease",
                                  }}
                                />
                              </button>

                              {isExpanded && (
                                <div className="adart-article-body">
                                  {art.clauses.map((cl, cIdx) => (
                                    <p
                                      key={cIdx}
                                      style={{
                                        margin: "0 0 6px",
                                        fontSize: "13px",
                                      }}
                                    >
                                      {cl}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: 9 BUTIR PAKTA INTEGRITAS */}
          {activeTab === "etik" && (
            <div>
              <div className="section-heading" style={{ marginBottom: "32px" }}>
                <span className="eyebrow">KODE ETIK & INTEGRITAS PROFESI</span>
                <h2>9 Butir Ikrar Kehormatan Teknisi & Workshop</h2>
                <p>
                  Pedoman moral dan komitmen pelayanan yang diikrarkan oleh
                  setiap pemegang KTA Digital resmi di seluruh Indonesia.
                </p>
              </div>

              <div className="pledge-grid-refined">
                {filteredPledges.map((pledge) => {
                  const Icon = pledge.icon;
                  const isCopied = copiedPledge === pledge.number;
                  return (
                    <article
                      className="pledge-card-refined"
                      key={pledge.number}
                    >
                      <div className="pledge-card-top">
                        <span className="pledge-num-badge">
                          {pledge.number}
                        </span>
                        <span className="pledge-tag">{pledge.tag}</span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: `${pledge.color}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: pledge.color,
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <h4
                          style={{
                            fontSize: "16px",
                            fontWeight: 800,
                            margin: 0,
                            color: "#0f172a",
                          }}
                        >
                          {pledge.title}
                        </h4>
                      </div>

                      <p
                        style={{
                          fontSize: "13.5px",
                          color: "#475569",
                          lineHeight: "1.6",
                          margin: "0 0 16px",
                        }}
                      >
                        {pledge.description}
                      </p>

                      <button
                        type="button"
                        className="pledge-copy-btn"
                        onClick={() =>
                          handleCopyPledge(
                            pledge.number,
                            `Butir ${pledge.number}: ${pledge.title} - ${pledge.description}`,
                          )
                        }
                      >
                        {isCopied ? (
                          <Check size={14} color="#16a34a" />
                        ) : (
                          <Copy size={14} />
                        )}
                        <span>
                          {isCopied ? "Ikrar Tersalin!" : "Salin Ikrar"}
                        </span>
                      </button>
                    </article>
                  );
                })}
              </div>

              {/* Posko Aduan Etik Callout */}
              <div
                style={{
                  marginTop: "40px",
                  padding: "24px 28px",
                  background: "#ffffff",
                  border: "1px solid #fed7aa",
                  borderRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <ShieldAlert size={32} color="#ea580c" />
                  <div>
                    <h4
                      style={{
                        margin: "0 0 4px",
                        fontSize: "16px",
                        fontWeight: 800,
                      }}
                    >
                      Menemukan Pelanggaran Kode Etik oleh Teknisi Ber-KTA?
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13.5px",
                        color: "#64748b",
                      }}
                    >
                      Laporkan keluhan atau dugaan malpraktik ke Posko JENDELA
                      untuk mediasi Dewan Kehormatan.
                    </p>
                  </div>
                </div>
                <Link
                  href="/complaints"
                  className="button primary"
                  style={{ padding: "8px 18px", fontSize: "13px" }}
                >
                  <span>Buat Laporan Etik</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 5: UNDUHAN DOKUMEN OTENTIK */}
          {activeTab === "unduhan" && (
            <div>
              <div className="section-heading" style={{ marginBottom: "32px" }}>
                <span className="eyebrow">REPOSITORI NASKAH RESMI</span>
                <h2>Unduhan Salinan Otentik & Format Legalitas</h2>
                <p>
                  Naskah digital lengkap yang dapat diunduh untuk keperluan
                  kelengkapan berkas administrasi dan rujukan bengkel.
                </p>
              </div>

              <div className="docs-download-grid">
                <article className="doc-card">
                  <div className="doc-card-icon">
                    <FileText size={28} color="#38bdf8" />
                  </div>
                  <div className="doc-card-body">
                    <span className="doc-type-badge">
                      PDF Resmi Munas (4.2 MB)
                    </span>
                    <h3>Naskah Lengkap AD/ART 2024–2029</h3>
                    <p>
                      Naskah lengkap 18 Bab Anggaran Dasar dan Anggaran Rumah
                      Tangga hasil ketetapan Musyawarah Nasional terbaru.
                    </p>
                  </div>
                  <div className="doc-card-foot">
                    <a
                      href="/regulations?kategori=ad-art"
                      className="button outline btn-doc"
                    >
                      <Download size={15} />
                      <span>Unduh Naskah AD/ART</span>
                    </a>
                  </div>
                </article>

                <article className="doc-card">
                  <div className="doc-card-icon">
                    <BadgeCheck size={28} color="#34d399" />
                  </div>
                  <div className="doc-card-body">
                    <span className="doc-type-badge">
                      Salinan Kemenkumham (1.8 MB)
                    </span>
                    <h3>SK Pengesahan Badan Hukum</h3>
                    <p>
                      Salinan Keputusan Menteri Hukum dan HAM RI tentang
                      Pengesahan Badan Hukum Perkumpulan Asosiasi Pendingin
                      Indonesia.
                    </p>
                  </div>
                  <div className="doc-card-foot">
                    <a
                      href="/regulations?kategori=ad-art"
                      className="button outline btn-doc"
                    >
                      <FileCheck2 size={15} />
                      <span>Lihat Salinan SK</span>
                    </a>
                  </div>
                </article>

                <article className="doc-card">
                  <div className="doc-card-icon">
                    <Scale size={28} color="#818cf8" />
                  </div>
                  <div className="doc-card-body">
                    <span className="doc-type-badge">
                      Pedoman Majelis (2.1 MB)
                    </span>
                    <h3>Buku Panduan Kode Etik & Sanksi</h3>
                    <p>
                      Tata cara penegakan disiplin profesi teknisi, standar
                      pelayanan konsumen, dan prosedur mediasi sengketa kerja.
                    </p>
                  </div>
                  <div className="doc-card-foot">
                    <a
                      href="/regulations?kategori=ad-art"
                      className="button outline btn-doc"
                    >
                      <FileText size={15} />
                      <span>Buka Pedoman Etik</span>
                    </a>
                  </div>
                </article>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. Smart Conversion CTA Banner */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Jadilah Bagian dari Praktisi Pendingin Berintegritas"
        guestDescription="Daftarkan bengkel Anda untuk mendapatkan KTA Digital resmi, perlindungan advokasi profesi, dan pengakuan kode etik nasional."
        guestPrimaryCta={{ label: "Daftar Jadi Anggota", href: "/join" }}
        guestSecondaryCta={{ label: "Cek Validitas KTA", href: "/verify" }}
        memberTitle="Patuhi Kode Etik & Tingkatkan Kredensial Anda"
        memberDescription="Sebagai anggota aktif, Anda berhak mencantumkan sertifikat integritas etik dan memanfaatkan jejaring advokasi asosiasi."
        memberPrimaryCta={{ label: "Buka Portal & KTA Saya", href: "/member" }}
        memberSecondaryCta={{ label: "Struktur Pengurus", href: "/structure" }}
      />
    </div>
  );
}

export default function AdArtPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <Scale size={36} className="animate-spin text-primary" />
          <p style={{ color: "#64748b" }}>
            Memuat naskah AD/ART & Kode Etik...
          </p>
        </div>
      }
    >
      <AdArtContent />
    </Suspense>
  );
}
