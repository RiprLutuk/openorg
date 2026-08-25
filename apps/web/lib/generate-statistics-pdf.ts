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

const STATS_EXPLANATIONS: Record<string, { desc: string; benchmark: string }> =
  {
    certified_technicians: {
      desc: "Teknisi aktif pemegang sertifikat uji kompetensi LSP TPTU / BNSP RI dan teregistrasi KTA digital.",
      benchmark: "Target Nasional: 10.000",
    },
    dpd_coverage: {
      desc: "Cakupan kepengurusan Dewan Pimpinan Daerah (DPD) tingkat provinsi di seluruh wilayah Indonesia.",
      benchmark: "Target: 100% Wilayah (38 DPD)",
    },
    serviced_units_volume: {
      desc: "Total unit pendingin (AC Split, VRV, Chiller, Cold Chain) yang ditangani teknisi ber-KTA sah tiap bulan.",
      benchmark: "Target: >100.000 Unit / Bln",
    },
    public_satisfaction_rate: {
      desc: "Survei kepuasan konsumen terhadap mutu servis, kejujuran takaran freon, dan kwitansi bergaransi resmi.",
      benchmark: "Standar Mutu: Min. 95.0%",
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
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // ==========================================
  // 1. TOP HEADER BANNER (Full Width Navy)
  // ==========================================
  doc.setFillColor(11, 25, 44); // Deep Navy #0b192c
  doc.rect(0, 0, pageWidth, 36, "F");

  // Top Sky Blue Accent Stripe
  doc.setFillColor(2, 132, 199); // #0284c7 Primary Sky Blue
  doc.rect(0, 0, pageWidth, 3.5, "F");

  // Organization Logo / Crest Emblem
  doc.setFillColor(2, 132, 199);
  doc.roundedRect(margin, 7.5, 20, 20, 2.5, 2.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("APTI", margin + 10, 16.5, { align: "center" });
  doc.setFontSize(5.5);
  doc.text("INDONESIA", margin + 10, 21.5, { align: "center" });

  // Main Title & Organization
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text(
    "LAPORAN RESMI STATISTIK & INDIKATOR INDUSTRI HVAC/R",
    margin + 25,
    14.5,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(125, 211, 252); // #7dd3fc Sky Light
  doc.text(
    "ASOSIASI PRAKTISI TEKNIK REFRIGERASI DAN TATA UDARA (APTI INDONESIA)",
    margin + 25,
    20.5,
  );

  // Metadata Sub-row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184); // #94a3b8 Slate
  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(
    `No. Registrasi: APTI/STAT-NAS/2026/Q1   |   Tanggal Publikasi: ${todayStr}   |   Klasifikasi: Publik / Terverifikasi BNSP`,
    margin + 25,
    26.5,
  );

  // ==========================================
  // 2. EXECUTIVE SUMMARY (4 BENTO HIGHLIGHTS)
  // ==========================================
  let y = 42;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. RINGKASAN EKSEKUTIF INDIKATOR UTAMA", margin, y);

  y += 4;
  const boxWidth = (contentWidth - 9) / 4; // 43.25mm
  const boxHeight = 21;

  const highlights: Array<{
    label: string;
    val: string;
    unit: string;
    bg: [number, number, number];
    border: [number, number, number];
    accent: [number, number, number];
  }> = [
    {
      label: "TEKNISI BERSERTIFIKAT",
      val: "8.450+",
      unit: "BNSP / LSP TPTU",
      bg: [240, 249, 255],
      border: [186, 230, 253],
      accent: [2, 132, 199],
    },
    {
      label: "SEBARAN WILAYAH DPD",
      val: "38",
      unit: "Provinsi Sah (100%)",
      bg: [240, 253, 244],
      border: [187, 247, 208],
      accent: [22, 163, 74],
    },
    {
      label: "VOLUME UNIT SERVIS",
      val: "142.800",
      unit: "Unit AC / Bulan",
      bg: [238, 242, 255],
      border: [199, 210, 254],
      accent: [79, 70, 229],
    },
    {
      label: "KEPUASAN KONSUMEN",
      val: "98.4%",
      unit: "Indeks Trust Publik",
      bg: [254, 243, 199],
      border: [253, 230, 138],
      accent: [217, 119, 6],
    },
  ];

  highlights.forEach((h, i) => {
    const bx = margin + i * (boxWidth + 3);
    doc.setFillColor(h.bg[0], h.bg[1], h.bg[2]);
    doc.setDrawColor(h.border[0], h.border[1], h.border[2]);
    doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, "FD");

    // Top mini accent line
    doc.setFillColor(h.accent[0], h.accent[1], h.accent[2]);
    doc.rect(bx, y, boxWidth, 1.8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    doc.text(h.label, bx + 3, y + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42);
    doc.text(h.val, bx + 3, y + 13.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(h.unit, bx + 3, y + 18.5);
  });

  // ==========================================
  // 3. DETAILED TABLE (ASCII SAFE, PRECISE WIDTHS)
  // ==========================================
  y += boxHeight + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("2. TABEL INDIKATOR KINERJA INDUSTRI TERVERIFIKASI", margin, y);

  y += 4;
  // Table Header (Exact Widths: 8 + 62 + 38 + 32 + 42 = 182mm)
  doc.setFillColor(241, 245, 249); // #f1f5f9
  doc.setDrawColor(203, 213, 225); // #cbd5e1
  doc.rect(margin, y, contentWidth, 7.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);

  doc.text("NO", margin + 4, y + 5, { align: "center" });
  doc.text("INDIKATOR KINERJA & DESKRIPSI", margin + 10, y + 5);
  doc.text("NILAI DATA & UNIT", margin + 72, y + 5);
  doc.text("KATEGORI & PERIODE", margin + 110, y + 5);
  doc.text("TREN & STATUS BENCHMARK", margin + 142, y + 5);

  y += 7.5;

  const dataToPrint =
    statsList.length > 0
      ? statsList
      : [
          {
            id: "1",
            metricKey: "certified_technicians",
            metricLabel: "Total Teknisi Bersertifikat BNSP",
            metricValue: "8,450",
            metricUnit: "Teknisi Terdaftar",
            trendDirection: "up" as const,
            trendPercentage: "+18.5%",
            category: "Keanggotaan",
            period: "2026 Q1",
          },
          {
            id: "2",
            metricKey: "dpd_coverage",
            metricLabel: "Sebaran DPD & Korwil Provinsi",
            metricValue: "38 / 38",
            metricUnit: "Provinsi Sah (100%)",
            trendDirection: "up" as const,
            trendPercentage: "100%",
            category: "Organisasi",
            period: "2026 Q1",
          },
          {
            id: "3",
            metricKey: "serviced_units_volume",
            metricLabel: "Volume Servis Unit AC Terverifikasi",
            metricValue: "142,800",
            metricUnit: "Unit AC / Bulan",
            trendDirection: "up" as const,
            trendPercentage: "+24.2%",
            category: "Layanan Sektor",
            period: "2026 Q1",
          },
          {
            id: "4",
            metricKey: "public_satisfaction_rate",
            metricLabel: "Tingkat Kepuasan Pelanggan KTA APTI",
            metricValue: "98.4%",
            metricUnit: "Indeks Trust Publik",
            trendDirection: "up" as const,
            trendPercentage: "+2.1%",
            category: "Kualitas Service",
            period: "2026 Q1",
          },
        ];

  dataToPrint.forEach((item, index) => {
    const rowHeight = 16;
    const isEven = index % 2 === 0;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, rowHeight, "FD");

    // Subtle Column Separators
    doc.setDrawColor(241, 245, 249);
    doc.line(margin + 8, y, margin + 8, y + rowHeight);
    doc.line(margin + 70, y, margin + 70, y + rowHeight);
    doc.line(margin + 108, y, margin + 108, y + rowHeight);
    doc.line(margin + 140, y, margin + 140, y + rowHeight);

    // Col 1: No
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text((index + 1).toString(), margin + 4, y + 6.5, { align: "center" });

    // Col 2: Indicator Name & Description (Width: 62mm)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text(item.metricLabel, margin + 10, y + 5.5);

    const info = STATS_EXPLANATIONS[item.metricKey];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    const descText = info ? info.desc : "Metrik kinerja resmi APTI Indonesia.";
    doc.text(descText.slice(0, 60), margin + 10, y + 10.5);

    // Col 3: Value (Line 1) & Unit (Line 2) (Width: 38mm)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.2);
    doc.setTextColor(2, 132, 199);
    doc.text(item.metricValue, margin + 72, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(item.metricUnit || "Unit Terukur", margin + 72, y + 10.5);

    // Col 4: Category (Line 1) & Period (Line 2) (Width: 32mm)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    doc.text(item.category, margin + 110, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(item.period || "2026 Q1", margin + 110, y + 10.5);

    // Col 5: Trend (Line 1) & Benchmark (Line 2) (Width: 42mm)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    if (item.trendDirection === "up") {
      doc.setTextColor(22, 163, 74);
    } else {
      doc.setTextColor(71, 85, 105);
    }
    const trendText = item.trendPercentage
      ? `[ ${item.trendPercentage} ]`
      : "[ - ]";
    doc.text(trendText, margin + 142, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    const bench = info ? info.benchmark : "Target Terpenuhi";
    doc.text(bench.slice(0, 26), margin + 142, y + 10.5);

    y += rowHeight;
  });

  // ==========================================
  // 4. REGIONAL & SECTOR BREAKDOWN (2 Cards)
  // ==========================================
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("3. SEBARAN REGIONAL DPD & PROPORSI SEKTOR INDUSTRI", margin, y);

  y += 4;
  const splitCardWidth = (contentWidth - 4) / 2; // 89mm
  const splitCardHeight = 25;

  // Left Card: Regional DPD
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, splitCardWidth, splitCardHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Sebaran Kepengurusan 38 DPD Provinsi:", margin + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text("• Sumatera: 10 DPD    • Jawa - Bali: 7 DPD", margin + 4, y + 11);
  doc.text("• Kalimantan: 5 DPD    • Sulawesi: 6 DPD", margin + 4, y + 16);
  doc.text(
    "• Nusa Tenggara, Maluku & Papua: 10 DPD (100% Sah)",
    margin + 4,
    y + 21,
  );

  // Right Card: Sector Utilization
  const rightX = margin + splitCardWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightX, y, splitCardWidth, splitCardHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Proporsi Unit Pendingin Ditangani:", rightX + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "• Residensial (AC Split Inverter/Non-Inv): 65%",
    rightX + 4,
    y + 11,
  );
  doc.text("• Komersial Ringan (Cassette & VRV/VRF): 22%", rightX + 4, y + 16);
  doc.text(
    "• Industrial (Chiller & Cold Storage Chain): 13%",
    rightX + 4,
    y + 21,
  );

  // ==========================================
  // 5. METHODOLOGY & COMPLIANCE BOX
  // ==========================================
  y += splitCardHeight + 7;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin, y, contentWidth, 23, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(3, 105, 161);
  doc.text(
    "4. METODOLOGI PENGUMPULAN DATA & INTEGRITAS BUKU BESAR DIGITAL",
    margin + 5,
    y + 5.5,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.6);
  doc.setTextColor(51, 65, 85);
  const methodologyText =
    "Seluruh data indikator dihimpun melalui sistem buku besar digital ComplyFlow dari pelaporan mandiri 38 DPD, database uji kompetensi LSP TPTU / BNSP RI, serta transaksi KTA digital yang diaudit secara periodik sesuai standar SNI & ISO tata kelola keorganisasian nirlaba.";
  const splitMethodology = doc.splitTextToSize(
    methodologyText,
    contentWidth - 10,
  );
  doc.text(splitMethodology, margin + 5, y + 10.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(2, 132, 199);
  doc.text(
    "[v] Audit DPD 38 Provinsi   •   [v] Lisensi BNSP RI   •   [v] Prosedur Vakum SNI <500u   •   [v] Otentikasi KTA Digital",
    margin + 5,
    y + 19.5,
  );

  // ==========================================
  // 6. SIGNATURE & LEGAL VALIDATION
  // ==========================================
  y += 29;
  const colW = contentWidth / 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);

  // Col 1: Direktur Sertifikasi
  doc.text("Disusun & Divalidasi Oleh:", margin, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Direktur Standarisasi Mutu", margin, y + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text("LSP TPTU / DPP APTI", margin, y + 8.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Ir. Hendra Gunawan, IPM.", margin, y + 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("Asesor Kompetensi BNSP", margin, y + 24.5);

  // Col 2: Sekjen
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("Mengetahui,", margin + colW, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Sekretaris Jenderal DPP", margin + colW, y + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text("DPP APTI Indonesia", margin + colW, y + 8.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Bambang Hermanto, S.T.", margin + colW, y + 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("KTA No. 2024-0002-DPP", margin + colW, y + 24.5);

  // Col 3: Ketum
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("Disetujui & Ditetapkan Oleh:", margin + colW * 2, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Ketua Umum DPP APTI", margin + colW * 2, y + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text("DPP APTI Indonesia", margin + colW * 2, y + 8.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("H. Rachmat Wijaya, M.T.", margin + colW * 2, y + 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("KTA No. 2024-0001-DPP", margin + colW * 2, y + 24.5);

  // ==========================================
  // 7. FOOTER
  // ==========================================
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Dokumen Resmi DPP APTI Indonesia • Pusat Data Statistik Nasional HVAC/R • https://apti.or.id",
    margin,
    pageHeight - 6,
  );
  doc.text("Halaman 1 dari 1", pageWidth - margin - 18, pageHeight - 6);

  // Save the document
  doc.save(`Laporan_Statistik_Industri_HVACR_APTI_2026.pdf`);
}
