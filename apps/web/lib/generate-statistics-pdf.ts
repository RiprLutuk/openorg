import { jsPDF } from "jspdf";

interface IndustryStatistic {
  id: string;
  metricKey: string;
  metricLabel: string;
  metricValue: string;
  metricUnit: string | null;
  trendDirection: "up" | "down" | "stable" | null;
  trendPercentage: string | null;
  category: string;
  period: string | null;
}

const STATS_EXPLANATIONS: Record<string, { desc: string; benchmark: string }> = {
  certified_technicians: {
    desc: "Jumlah teknisi aktif yang memegang sertifikat uji kompetensi LSP TPTU / BNSP RI dan teregistrasi KTA digital.",
    benchmark: "Target Nasional 2026: 10.000 Teknisi Tersertifikasi",
  },
  dpd_coverage: {
    desc: "Cakupan kepengurusan Dewan Pimpinan Daerah (DPD) tingkat provinsi di seluruh wilayah Indonesia.",
    benchmark: "100% Wilayah Indonesia Terlayani (38 Provinsi)",
  },
  serviced_units_volume: {
    desc: "Total unit pendingin (AC Split, VRV, Chiller, Cold Storage) yang ditangani teknisi ber-KTA sah setiap bulan.",
    benchmark: "Pertumbuhan Kuartalan Konsisten di atas 20%",
  },
  public_satisfaction_rate: {
    desc: "Survei kepuasan konsumen terhadap kualitas servis, kejujuran takaran freon, dan kwitansi resmi bergaransi.",
    benchmark: "Standar Mutu Nasional: Minimum 95.0%",
  },
};

export async function generateStatisticsPdf(statsList: IndustryStatistic[]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm

  // 1. Top Decorative Bar
  doc.setFillColor(2, 132, 199); // #0284c7 Primary Sky Blue
  doc.rect(0, 0, pageWidth, 7, "F");

  doc.setFillColor(15, 23, 42); // #0f172a Deep Slate
  doc.rect(margin, 14, contentWidth, 32, "F");

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("LAPORAN STATISTIK & INDIKATOR KINERJA INDUSTRI HVAC/R", margin + 8, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(186, 230, 253); // #bae6fd Light Cyan
  doc.text("ASOSIASI PRAKTISI TEKNIK REFRIGERASI DAN TATA UDARA (APTI INDONESIA)", margin + 8, 32);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // #94a3b8
  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`No. Dokumen: APTI/STAT-NAS/2026/Q1  •  Diterbitkan: ${todayStr}  •  Status: Data Sah Terverifikasi`, margin + 8, 39);

  // 2. Executive Summary Highlights (4 Bento Boxes)
  let y = 52;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("RINGKASAN EKSEKUTIF INDIKATOR NASIONAL", margin, y);

  y += 5;
  const boxWidth = (contentWidth - 9) / 4; // 4 columns
  const boxHeight = 22;

  const highlights: Array<{
    label: string;
    val: string;
    unit: string;
    bg: [number, number, number];
    border: [number, number, number];
  }> = [
    { label: "TEKNISI BERSERTIFIKAT", val: "8.450+", unit: "BNSP / LSP", bg: [240, 249, 255], border: [186, 230, 253] },
    { label: "SEBARAN WILAYAH DPD", val: "38", unit: "Provinsi Sah", bg: [236, 253, 245], border: [167, 243, 208] },
    { label: "VOLUME UNIT SERVIS", val: "142.800", unit: "Unit / Bulan", bg: [238, 242, 255], border: [199, 210, 254] },
    { label: "INDEKS KEPUASAN PUBLIK", val: "98.4%", unit: "Rating Positif", bg: [254, 243, 199], border: [253, 230, 138] },
  ];

  highlights.forEach((h, i) => {
    const bx = margin + i * (boxWidth + 3);
    doc.setFillColor(h.bg[0], h.bg[1], h.bg[2]);
    doc.setDrawColor(h.border[0], h.border[1], h.border[2]);
    doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(h.label, bx + 3, y + 6);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(h.val, bx + 3, y + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(h.unit, bx + 3, y + 18);
  });

  // 3. Detailed Data Table
  y += boxHeight + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("TABEL LENGKAP INDIKATOR KINERJA INDUSTRI (METRIK RESMI)", margin, y);

  y += 5;
  // Table Header
  doc.setFillColor(241, 245, 249); // #f1f5f9
  doc.setDrawColor(203, 213, 225); // #cbd5e1
  doc.rect(margin, y, contentWidth, 8, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  doc.text("NO", margin + 3, y + 5.5);
  doc.text("INDIKATOR KINERJA", margin + 12, y + 5.5);
  doc.text("NILAI TERUKUR", margin + 68, y + 5.5);
  doc.text("KATEGORI", margin + 98, y + 5.5);
  doc.text("PERIODE", margin + 124, y + 5.5);
  doc.text("TREN & TARGET BENCHMARK", margin + 146, y + 5.5);

  y += 8;

  const dataToPrint = statsList.length > 0 ? statsList : [
    {
      id: "1",
      metricKey: "certified_technicians",
      metricLabel: "Total Teknisi Ber-KTA & Lisensi LSP",
      metricValue: "8.450",
      metricUnit: "Teknisi",
      trendDirection: "up" as const,
      trendPercentage: "+18.4%",
      category: "Keanggotaan",
      period: "Kuartal I - 2026",
    },
    {
      id: "2",
      metricKey: "dpd_coverage",
      metricLabel: "Sebaran Kepengurusan DPD Provinsi",
      metricValue: "38",
      metricUnit: "Provinsi",
      trendDirection: "up" as const,
      trendPercentage: "100%",
      category: "Organisasi",
      period: "Tahun 2026",
    },
    {
      id: "3",
      metricKey: "serviced_units_volume",
      metricLabel: "Volume Servis Unit AC & Tata Udara Bulanan",
      metricValue: "142.800",
      metricUnit: "Unit/Bln",
      trendDirection: "up" as const,
      trendPercentage: "+24.1%",
      category: "Layanan",
      period: "Kuartal I - 2026",
    },
    {
      id: "4",
      metricKey: "public_satisfaction_rate",
      metricLabel: "Indeks Kepuasan Konsumen Terverifikasi",
      metricValue: "98.4%",
      metricUnit: "Indeks",
      trendDirection: "up" as const,
      trendPercentage: "+1.2%",
      category: "Kualitas",
      period: "Survei 2026",
    },
  ];

  dataToPrint.forEach((item, index) => {
    const rowHeight = 15;
    const isEven = index % 2 === 0;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, rowHeight, "FD");

    // No
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text((index + 1).toString(), margin + 4, y + 6);

    // Indicator Name & Description
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(item.metricLabel, margin + 12, y + 5.5);

    const info = STATS_EXPLANATIONS[item.metricKey];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    const shortDesc = info ? info.desc.slice(0, 48) + "..." : "Metrik kinerja resmi APTI.";
    doc.text(shortDesc, margin + 12, y + 10.5);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(2, 132, 199);
    doc.text(`${item.metricValue} ${item.metricUnit || ""}`, margin + 68, y + 7.5);

    // Category
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.category, margin + 98, y + 7.5);

    // Period
    doc.text(item.period || "2026", margin + 124, y + 7.5);

    // Trend & Benchmark
    doc.setFont("helvetica", "bold");
    if (item.trendDirection === "up") {
      doc.setTextColor(22, 163, 74);
    } else {
      doc.setTextColor(71, 85, 105);
    }
    doc.text(item.trendPercentage ? `▲ ${item.trendPercentage}` : "-", margin + 146, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    const bench = info ? info.benchmark.slice(0, 24) : "SNI Standard";
    doc.text(bench, margin + 146, y + 10.5);

    y += rowHeight;
  });

  // 4. Data Governance & Methodology Section
  y += 8;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(3, 105, 161);
  doc.text("METODOLOGI PENGUMPULAN DATA & INTEGRITAS BUKU BESAR DIGITAL", margin + 5, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const methodologyText =
    "Seluruh data statistik dihimpun melalui sistem ComplyFlow dari pelaporan mandiri 38 Dewan Pimpinan Daerah (DPD), database uji kompetensi LSP TPTU / BNSP RI, serta transaksi KTA digital yang diaudit secara periodik sesuai standar SNI & ISO tata kelola keorganisasian nirlaba.";
  const splitMethodology = doc.splitTextToSize(methodologyText, contentWidth - 10);
  doc.text(splitMethodology, margin + 5, y + 11);

  // 5. Signature & Validation Block
  y += 30;
  const colW = contentWidth / 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);

  // Col 1: Direktur Sertifikasi
  doc.text("Disusun & Divalidasi Oleh:", margin, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Direktur Standarisasi Mutu", margin, y + 5);
  doc.text("LSP TPTU / DPP APTI", margin, y + 20);

  // Col 2: Sekjen
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Mengetahui,", margin + colW, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Sekretaris Jenderal DPP", margin + colW, y + 5);
  doc.text("Bambang Hermanto, S.T.", margin + colW, y + 20);

  // Col 3: Ketum
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Disetujui Oleh:", margin + colW * 2, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Ketua Umum DPP APTI", margin + colW * 2, y + 5);
  doc.text("H. Rachmat Wijaya, M.T.", margin + colW * 2, y + 20);

  // 6. Bottom Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Dokumen Resmi DPP APTI Indonesia • Hak Cipta Dilindungi Undang-Undang • https://apti.or.id", margin, pageHeight - 7);
  doc.text("Halaman 1 dari 1", pageWidth - margin - 20, pageHeight - 7);

  // Save the document
  doc.save(`Laporan_Statistik_Industri_HVACR_APTI_2026.pdf`);
}
