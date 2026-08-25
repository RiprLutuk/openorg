import { db } from "./client";
import {
  adArtDocuments,
  contactSubmissions,
  invoiceLines,
  invoices,
  learningActivities,
  learningAttendance,
  learningCreditLedger,
  learningCreditSchemes,
  learningEnrollments,
  memberEntitlements,
  members,
  organizationMilestones,
  payments,
  revenueProducts,
} from "./schema";
import { eq } from "drizzle-orm";

async function seedAllModules() {
  console.log("🚀 Starting comprehensive seeding for 5 modules (20+ records each)...");

  const allMembers = await db.select().from(members);
  if (!allMembers.length || !allMembers[0]) {
    throw new Error("No members found! Please make sure base members are seeded.");
  }
  const defaultMember = allMembers[0];
  const findMember = (key: string): typeof defaultMember =>
    allMembers.find(
      (m) =>
        (m.email && m.email.toLowerCase().includes(key.toLowerCase())) ||
        m.name.toLowerCase().includes(key.toLowerCase())
    ) || defaultMember;

  const heri = findMember("rizqy.pratama85");
  const nanang = findMember("nanang");
  const ridwan = findMember("ridwan");
  const dedi = findMember("dedi");
  const eko = findMember("eko");
  const budi = findMember("budi");

  // =========================================================================
  // 1. LEARNING / ACADEMY (#learning) - Credit Schemes, 20+ Activities, Enrollments, Ledger
  // =========================================================================
  console.log("📚 1. Seeding Learning Credit Schemes & 21 Activities...");
  const learningSchemesToInsert = [
    {
      code: "SKP-BNSP-RAC",
      name: "SKP Kompetensi Nasional BNSP (Refrigerasi & Tata Udara)",
      unitName: "SKP",
      description: "Satuan Kredit Profesi untuk pelatihan berstandar SKKNI dan uji kompetensi LSP BNSP.",
    },
    {
      code: "SKP-K3-KLHK",
      name: "SKP K3 & Penanganan Ramah Lingkungan (Flammable Refrigerant)",
      unitName: "SKP",
      description: "Kredit kepatuhan keselamatan kerja refrigerasi dan protokol mitigasi gas rumah kaca.",
    },
    {
      code: "SKP-VRF-COMMERCIAL",
      name: "SKP Spesialisasi Sistem Komersial VRF & Chiller Industri",
      unitName: "SKP",
      description: "Kredit pengembangan keahlian tata udara terpusat, gedung bertingkat dan cold storage.",
    },
    {
      code: "SKP-MANAGEMENT",
      name: "SKP Manajemen Bisnis Bengkel & Kewirausahaan Pendingin",
      unitName: "SKP",
      description: "Kredit tata kelola wirausaha servis, SOP pelayanan pelanggan, dan administrasi usaha.",
    },
  ];

  const existingSchemes = await db.select().from(learningCreditSchemes);
  const schemeMap = new Map<string, string>();
  for (const item of learningSchemesToInsert) {
    const existing = existingSchemes.find((s) => s.code === item.code);
    if (existing) {
      schemeMap.set(item.code, existing.id);
    } else {
      const [inserted] = await db.insert(learningCreditSchemes).values(item).returning();
      if (inserted) schemeMap.set(item.code, inserted.id);
    }
  }

  const activitiesData = [
    {
      code: "ACT-2026-01",
      title: "Workshop Praktik Penanganan Hidrokarbon R290 & Mitigasi Risiko Kebakaran",
      creditSchemeId: schemeMap.get("SKP-K3-KLHK"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 400, // 4 SKP
      capacity: 35,
      status: "completed" as const,
      startsAt: new Date("2026-07-15T09:00:00Z"),
      endsAt: new Date("2026-07-15T16:00:00Z"),
      metadata: { locationName: "APTI Training Center Jakarta", category: "Keselamatan Kerja (K3)" },
    },
    {
      code: "ACT-2026-02",
      title: "Masterclass Piping & Commissioning Sistem Variable Refrigerant Flow (VRV/VRF)",
      creditSchemeId: schemeMap.get("SKP-VRF-COMMERCIAL"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 600, // 6 SKP
      capacity: 30,
      status: "completed" as const,
      startsAt: new Date("2026-07-22T08:30:00Z"),
      endsAt: new Date("2026-07-23T17:00:00Z"),
      metadata: { locationName: "Daikin Training Center Bandung", category: "Kompetensi Lanjutan" },
    },
    {
      code: "ACT-2026-03",
      title: "Sertifikasi Uji Kompetensi BNSP Teknisi RAC Domestik & Komersial Angkatan IX",
      creditSchemeId: schemeMap.get("SKP-BNSP-RAC"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 800, // 8 SKP
      capacity: 40,
      status: "completed" as const,
      startsAt: new Date("2026-08-01T08:00:00Z"),
      endsAt: new Date("2026-08-02T17:00:00Z"),
      metadata: { locationName: "TUK LSP Surabaya", category: "Sertifikasi Nasional" },
    },
    {
      code: "ACT-2026-04",
      title: "Pelatihan Sentral Chiller: Water Cooled vs Air Cooled Plant Maintenance",
      creditSchemeId: schemeMap.get("SKP-VRF-COMMERCIAL"),
      deliveryMode: "hybrid" as const,
      creditAmountHundredths: 500,
      capacity: 50,
      status: "open" as const,
      startsAt: new Date("2026-09-05T09:00:00Z"),
      endsAt: new Date("2026-09-05T16:30:00Z"),
      metadata: { locationName: "Hotel Santika Semarang & Zoom Live", category: "Sistem Industri" },
    },
    {
      code: "ACT-2026-05",
      title: "Optimasi Evakuasi Sistem HVAC: Vakum Presisi & Uji Kebocoran Nitrogen Bertekanan",
      creditSchemeId: schemeMap.get("SKP-BNSP-RAC"),
      deliveryMode: "online" as const,
      creditAmountHundredths: 200,
      capacity: 150,
      status: "open" as const,
      startsAt: new Date("2026-09-12T13:00:00Z"),
      endsAt: new Date("2026-09-12T16:00:00Z"),
      metadata: { meetingUrl: "https://meet.google.com/apti-vacuum-pro", category: "Webinar Teknis" },
    },
    {
      code: "ACT-2026-06",
      title: "Troubleshooting Elektronik Modul Inverter PCB Outdoor AC Multi-Split",
      creditSchemeId: schemeMap.get("SKP-BNSP-RAC"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 500,
      capacity: 25,
      status: "open" as const,
      startsAt: new Date("2026-09-18T09:00:00Z"),
      endsAt: new Date("2026-09-19T16:00:00Z"),
      metadata: { locationName: "Balai Latihan Kerja (BLK) Yogyakarta", category: "Elektronika Pendingin" },
    },
    {
      code: "ACT-2026-07",
      title: "Standardisasi Pemasangan AC Split Duct & Cassette Gedung Perkantoran",
      creditSchemeId: schemeMap.get("SKP-VRF-COMMERCIAL"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 400,
      capacity: 30,
      status: "open" as const,
      startsAt: new Date("2026-09-26T08:30:00Z"),
      endsAt: new Date("2026-09-26T16:00:00Z"),
      metadata: { locationName: "Gedung Pusat APTI Tangerang", category: "Instalasi Komersial" },
    },
    {
      code: "ACT-2026-08",
      title: "K3 Ketinggian & Ruang Terbatas (Working at Height & Confined Space) untuk HVAC",
      creditSchemeId: schemeMap.get("SKP-K3-KLHK"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 400,
      capacity: 25,
      status: "open" as const,
      startsAt: new Date("2026-10-03T09:00:00Z"),
      endsAt: new Date("2026-10-03T16:00:00Z"),
      metadata: { locationName: "K3 Safety Center Bekasi", category: "Sertifikasi K3" },
    },
    {
      code: "ACT-2026-09",
      title: "Manajemen Refrigerant Recovery, Recycling & Safe Disposal (Protokol KLHK)",
      creditSchemeId: schemeMap.get("SKP-K3-KLHK"),
      deliveryMode: "hybrid" as const,
      creditAmountHundredths: 300,
      capacity: 60,
      status: "open" as const,
      startsAt: new Date("2026-10-10T09:00:00Z"),
      endsAt: new Date("2026-10-10T15:00:00Z"),
      metadata: { locationName: "Denpasar Training Hall & Online", category: "Lingkungan Hidup" },
    },
    {
      code: "ACT-2026-10",
      title: "Kalibrasi Manifold Gauge Digital & Thermal Imaging untuk Deteksi Kebocoran",
      creditSchemeId: schemeMap.get("SKP-BNSP-RAC"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 300,
      capacity: 30,
      status: "open" as const,
      startsAt: new Date("2026-10-17T09:00:00Z"),
      endsAt: new Date("2026-10-17T15:00:00Z"),
      metadata: { locationName: "DPD APTI Sumatera Utara, Medan", category: "Pengukuran Presisi" },
    },
    {
      code: "ACT-2026-11",
      title: "Dasar Perhitungan Beban Pendingin (Cooling Load Calculation & Duct Sizing)",
      creditSchemeId: schemeMap.get("SKP-VRF-COMMERCIAL"),
      deliveryMode: "online" as const,
      creditAmountHundredths: 300,
      capacity: 200,
      status: "open" as const,
      startsAt: new Date("2026-10-24T13:00:00Z"),
      endsAt: new Date("2026-10-24T17:00:00Z"),
      metadata: { meetingUrl: "https://meet.google.com/apti-load-calc", category: "Perancangan HVAC" },
    },
    {
      code: "ACT-2026-12",
      title: "Workshop Cold Storage & Blast Freezer untuk Industri Pengolahan Makanan",
      creditSchemeId: schemeMap.get("SKP-VRF-COMMERCIAL"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 600,
      capacity: 25,
      status: "open" as const,
      startsAt: new Date("2026-11-05T08:30:00Z"),
      endsAt: new Date("2026-11-06T16:30:00Z"),
      metadata: { locationName: "Kawasan Industri Makassar (KIMA)", category: "Cold Storage" },
    },
    {
      code: "ACT-2026-13",
      title: "Otomasi Gedung BMS (Building Management System) & Integrasi Kontrol HVAC",
      creditSchemeId: schemeMap.get("SKP-VRF-COMMERCIAL"),
      deliveryMode: "hybrid" as const,
      creditAmountHundredths: 400,
      capacity: 50,
      status: "open" as const,
      startsAt: new Date("2026-11-12T09:00:00Z"),
      endsAt: new Date("2026-11-12T16:00:00Z"),
      metadata: { locationName: "Hotel Bidakara Jakarta & Online", category: "Otomasi Smart Building" },
    },
    {
      code: "ACT-2026-14",
      title: "Manajemen Bengkel Servis AC: Standardisasi SOP, Garansi & Kepuasan Pelanggan",
      creditSchemeId: schemeMap.get("SKP-MANAGEMENT"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 300,
      capacity: 40,
      status: "open" as const,
      startsAt: new Date("2026-11-19T09:00:00Z"),
      endsAt: new Date("2026-11-19T16:00:00Z"),
      metadata: { locationName: "Auditorium Poltek Surabaya", category: "Manajemen Usaha" },
    },
    {
      code: "ACT-2026-15",
      title: "Retrofit dan Konversi Refrigerant R22 ke R410A / R32 pada Instalasi Eksisting",
      creditSchemeId: schemeMap.get("SKP-BNSP-RAC"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 300,
      capacity: 35,
      status: "open" as const,
      startsAt: new Date("2026-11-26T09:00:00Z"),
      endsAt: new Date("2026-11-26T15:00:00Z"),
      metadata: { locationName: "DPD APTI Jawa Timur, Malang", category: "Retrofit & Modifikasi" },
    },
    {
      code: "ACT-2026-16",
      title: "Sertifikasi Asesor Kompetensi LSP Tata Udara & Elektronika Indonesia",
      creditSchemeId: schemeMap.get("SKP-BNSP-RAC"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 1000, // 10 SKP
      capacity: 20,
      status: "open" as const,
      startsAt: new Date("2026-12-03T08:00:00Z"),
      endsAt: new Date("2026-12-05T17:00:00Z"),
      metadata: { locationName: "Pusat Diklat BNSP Jakarta Pusat", category: "Pelatihan Asesor" },
    },
    {
      code: "ACT-2026-17",
      title: "Pelatihan Panel Kelistrikan 3 Phase & Proteksi Motor Kompresor Chiller",
      creditSchemeId: schemeMap.get("SKP-VRF-COMMERCIAL"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 400,
      capacity: 30,
      status: "open" as const,
      startsAt: new Date("2026-12-10T09:00:00Z"),
      endsAt: new Date("2026-12-10T16:00:00Z"),
      metadata: { locationName: "Laboratorium Listrik ITB Bandung", category: "Kelistrikan Industri" },
    },
    {
      code: "ACT-2026-18",
      title: "Pemeliharaan Heat Pump & Water Heater Sentral Komersial Gedung Hotel",
      creditSchemeId: schemeMap.get("SKP-VRF-COMMERCIAL"),
      deliveryMode: "hybrid" as const,
      creditAmountHundredths: 300,
      capacity: 45,
      status: "open" as const,
      startsAt: new Date("2026-12-17T09:00:00Z"),
      endsAt: new Date("2026-12-17T15:00:00Z"),
      metadata: { locationName: "Hotel Salak Bogor & Live Stream", category: "Heat Pump System" },
    },
    {
      code: "ACT-2026-19",
      title: "Standar Higienitas & Pembersihan Kimiawi Sirkulasi Udara AHU Rumah Sakit",
      creditSchemeId: schemeMap.get("SKP-K3-KLHK"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 400,
      capacity: 25,
      status: "open" as const,
      startsAt: new Date("2026-12-22T09:00:00Z"),
      endsAt: new Date("2026-12-22T16:00:00Z"),
      metadata: { locationName: "RS Moewardi Solo / Hall APTI Solo", category: "HVAC Rumah Sakit" },
    },
    {
      code: "ACT-2026-20",
      title: "Strategi Pemasaran Digital & Ekosistem Aplikasi Booking Servis AC untuk Teknisi",
      creditSchemeId: schemeMap.get("SKP-MANAGEMENT"),
      deliveryMode: "self_paced" as const,
      creditAmountHundredths: 200,
      capacity: null,
      status: "open" as const,
      startsAt: new Date("2026-08-01T00:00:00Z"),
      endsAt: new Date("2026-12-31T23:59:59Z"),
      metadata: { meetingUrl: "https://lms.apti.or.id/course/digital-marketing", category: "E-Learning Mandiri" },
    },
    {
      code: "ACT-2026-21",
      title: "Pencegahan Korosi & Perlindungan Sirip Aluminium AC Wilayah Pesisir Pantai",
      creditSchemeId: schemeMap.get("SKP-BNSP-RAC"),
      deliveryMode: "onsite" as const,
      creditAmountHundredths: 300,
      capacity: 35,
      status: "open" as const,
      startsAt: new Date("2026-12-28T09:00:00Z"),
      endsAt: new Date("2026-12-28T15:00:00Z"),
      metadata: { locationName: "Aula Grage Hotel Cirebon", category: "Proteksi Lingkungan Pesisir" },
    },
  ];

  const activityMap = new Map<string, string>();
  for (const act of activitiesData) {
    const existing = await db
      .select({ id: learningActivities.id })
      .from(learningActivities)
      .where(eq(learningActivities.code, act.code))
      .limit(1);

    if (existing.length && existing[0]) {
      activityMap.set(act.code, existing[0].id);
    } else {
      const [inserted] = await db.insert(learningActivities).values(act as any).returning();
      if (inserted) activityMap.set(act.code, inserted.id);
    }
  }

  // Seed 20+ enrollments & attendance
  const sampleEnrollments = [
    { memberId: heri.id, activityCode: "ACT-2026-01", status: "completed" as const },
    { memberId: heri.id, activityCode: "ACT-2026-03", status: "completed" as const },
    { memberId: heri.id, activityCode: "ACT-2026-05", status: "confirmed" as const },
    { memberId: nanang.id, activityCode: "ACT-2026-02", status: "completed" as const },
    { memberId: nanang.id, activityCode: "ACT-2026-04", status: "confirmed" as const },
    { memberId: nanang.id, activityCode: "ACT-2026-16", status: "confirmed" as const },
    { memberId: ridwan.id, activityCode: "ACT-2026-02", status: "completed" as const },
    { memberId: ridwan.id, activityCode: "ACT-2026-07", status: "confirmed" as const },
    { memberId: ridwan.id, activityCode: "ACT-2026-13", status: "confirmed" as const },
    { memberId: dedi.id, activityCode: "ACT-2026-01", status: "completed" as const },
    { memberId: dedi.id, activityCode: "ACT-2026-06", status: "confirmed" as const },
    { memberId: dedi.id, activityCode: "ACT-2026-08", status: "confirmed" as const },
    { memberId: eko.id, activityCode: "ACT-2026-03", status: "completed" as const },
    { memberId: eko.id, activityCode: "ACT-2026-12", status: "confirmed" as const },
    { memberId: eko.id, activityCode: "ACT-2026-15", status: "confirmed" as const },
    { memberId: budi.id, activityCode: "ACT-2026-05", status: "confirmed" as const },
    { memberId: budi.id, activityCode: "ACT-2026-14", status: "registered" as const },
    { memberId: budi.id, activityCode: "ACT-2026-20", status: "confirmed" as const },
    { memberId: allMembers[1]?.id || heri.id, activityCode: "ACT-2026-09", status: "confirmed" as const },
    { memberId: allMembers[2]?.id || nanang.id, activityCode: "ACT-2026-10", status: "confirmed" as const },
    { memberId: allMembers[3]?.id || ridwan.id, activityCode: "ACT-2026-11", status: "confirmed" as const },
    { memberId: allMembers[4]?.id || dedi.id, activityCode: "ACT-2026-17", status: "confirmed" as const },
  ];

  for (const enr of sampleEnrollments) {
    const actId = activityMap.get(enr.activityCode);
    if (!actId) continue;
    const existing = await db
      .select({ id: learningEnrollments.id })
      .from(learningEnrollments)
      .where(eq(learningEnrollments.activityId, actId))
      .limit(1);

    if (!existing.length) {
      const [insertedEnr] = await db
        .insert(learningEnrollments)
        .values({
          memberId: enr.memberId,
          activityId: actId,
          status: enr.status,
          registeredAt: new Date("2026-07-01T08:00:00Z"),
          completedAt: enr.status === "completed" ? new Date("2026-08-05T17:00:00Z") : null,
        })
        .returning();

      if (insertedEnr && enr.status === "completed") {
        await db.insert(learningAttendance).values({
          enrollmentId: insertedEnr.id,
          status: "present",
          checkedInAt: new Date("2026-07-15T08:45:00Z"),
          notes: "Hadir penuh dan lulus evaluasi praktik.",
        });

        await db.insert(learningCreditLedger).values({
          memberId: enr.memberId,
          schemeId: schemeMap.get("SKP-BNSP-RAC")!,
          activityId: actId,
          entryType: "earned",
          creditAmountHundredths: 400,
          notes: "Kredit kelulusan aktivitas " + enr.activityCode,
        });
      }
    }
  }

  // =========================================================================
  // 2. REVENUE / FINANCE (#revenue) - Products, 22 Invoices, Lines, Payments, Entitlements
  // =========================================================================
  console.log("💰 2. Seeding Revenue Products, Invoices & Payments...");
  const revenueProductsData = [
    {
      code: "IURAN-ANGGOTA-2026",
      name: "Iuran Tahunan Anggota Teknisi Reguler 2026",
      type: "membership_dues" as const,
      amountMinor: 15000000, // Rp 150.000
      currency: "IDR",
      billingInterval: "annual" as const,
      grantsEntitlementKey: "member_active_status",
      entitlementDurationDays: 365,
      description: "Iuran keanggotaan tahunan resmi APTI Indonesia, pemeliharaan data KTA digital, dan hak suara organisasi.",
    },
    {
      code: "IURAN-KORPORASI-2026",
      name: "Iuran Tahunan Perusahaan / Kontraktor HVAC 2026",
      type: "membership_dues" as const,
      amountMinor: 150000000, // Rp 1.500.000
      currency: "IDR",
      billingInterval: "annual" as const,
      grantsEntitlementKey: "corporate_member_status",
      entitlementDurationDays: 365,
      description: "Keanggotaan badan usaha, registri rekanan resmi tender proyek pendingin, dan direktori kontraktor.",
    },
    {
      code: "UJI-BNSP-RAC",
      name: "Biaya Uji Sertifikasi Kompetensi BNSP Teknisi RAC",
      type: "service" as const,
      amountMinor: 75000000, // Rp 750.000
      currency: "IDR",
      billingInterval: "one_time" as const,
      grantsEntitlementKey: "bnsp_assessment_access",
      entitlementDurationDays: 90,
      description: "Biaya administrasi asesor, materi uji praktik, blanko sertifikat BNSP, dan konsumsi uji.",
    },
    {
      code: "TIKET-EXPO-2026",
      name: "Tiket Seminar & Pameran Nasional HVAC/R Expo 2026",
      type: "event_ticket" as const,
      amountMinor: 25000000, // Rp 250.000
      currency: "IDR",
      billingInterval: "one_time" as const,
      grantsEntitlementKey: "hvac_expo_pass",
      entitlementDurationDays: 7,
      description: "Akses 3 hari pameran teknologi pendingin internasional, seminar teknis, dan sertifikat kehadiran 6 SKP.",
    },
    {
      code: "KTA-CARD-REPRINT",
      name: "Pencetakan Ulang Kartu Anggota KTA Digital Ber-NFC",
      type: "service" as const,
      amountMinor: 5000000, // Rp 50.000
      currency: "IDR",
      billingInterval: "one_time" as const,
      grantsEntitlementKey: "nfc_card_issued",
      entitlementDurationDays: null,
      description: "Penggantian kartu fisik KTA PVC dengan chip NFC dan QR Code resmi jika kartu hilang/rusak.",
    },
    {
      code: "WORKSHOP-VRF-PRO",
      name: "Biaya Pendaftaran Hands-On Workshop VRF Master",
      type: "service" as const,
      amountMinor: 50000000, // Rp 500.000
      currency: "IDR",
      billingInterval: "one_time" as const,
      grantsEntitlementKey: "vrf_workshop_materials",
      entitlementDurationDays: 30,
      description: "Modul pelatihan eksklusif, toolkit praktik flaring R32, dan sertifikat pelatihan keahlian.",
    },
  ];

  const productMap = new Map<string, string>();
  for (const prod of revenueProductsData) {
    const existing = await db
      .select({ id: revenueProducts.id })
      .from(revenueProducts)
      .where(eq(revenueProducts.code, prod.code))
      .limit(1);

    if (existing.length && existing[0]) {
      productMap.set(prod.code, existing[0].id);
    } else {
      const [inserted] = await db.insert(revenueProducts).values(prod).returning();
      if (inserted) productMap.set(prod.code, inserted.id);
    }
  }

  // 22 Realistic Invoices
  const invoicesData = [
    { num: "INV-2026-08-001", member: heri, prodCode: "IURAN-ANGGOTA-2026", qty: 1, amount: 15000000, status: "paid" as const, daysAgo: 25 },
    { num: "INV-2026-08-002", member: heri, prodCode: "UJI-BNSP-RAC", qty: 1, amount: 75000000, status: "paid" as const, daysAgo: 20 },
    { num: "INV-2026-08-003", member: nanang, prodCode: "IURAN-KORPORASI-2026", qty: 1, amount: 150000000, status: "paid" as const, daysAgo: 30 },
    { num: "INV-2026-08-004", member: nanang, prodCode: "TIKET-EXPO-2026", qty: 2, amount: 50000000, status: "paid" as const, daysAgo: 15 },
    { num: "INV-2026-08-005", member: ridwan, prodCode: "IURAN-ANGGOTA-2026", qty: 1, amount: 15000000, status: "paid" as const, daysAgo: 28 },
    { num: "INV-2026-08-006", member: ridwan, prodCode: "WORKSHOP-VRF-PRO", qty: 1, amount: 50000000, status: "paid" as const, daysAgo: 12 },
    { num: "INV-2026-08-007", member: dedi, prodCode: "IURAN-ANGGOTA-2026", qty: 1, amount: 15000000, status: "paid" as const, daysAgo: 18 },
    { num: "INV-2026-08-008", member: dedi, prodCode: "UJI-BNSP-RAC", qty: 1, amount: 75000000, status: "open" as const, daysAgo: 3 },
    { num: "INV-2026-08-009", member: eko, prodCode: "IURAN-ANGGOTA-2026", qty: 1, amount: 15000000, status: "paid" as const, daysAgo: 22 },
    { num: "INV-2026-08-010", member: eko, prodCode: "TIKET-EXPO-2026", qty: 1, amount: 25000000, status: "paid" as const, daysAgo: 10 },
    { num: "INV-2026-08-011", member: budi, prodCode: "IURAN-ANGGOTA-2026", qty: 1, amount: 15000000, status: "open" as const, daysAgo: 5 },
    { num: "INV-2026-08-012", member: budi, prodCode: "KTA-CARD-REPRINT", qty: 1, amount: 5000000, status: "open" as const, daysAgo: 2 },
    { num: "INV-2026-08-013", member: allMembers[1] || heri, prodCode: "IURAN-ANGGOTA-2026", qty: 1, amount: 15000000, status: "paid" as const, daysAgo: 16 },
    { num: "INV-2026-08-014", member: allMembers[1] || heri, prodCode: "WORKSHOP-VRF-PRO", qty: 1, amount: 50000000, status: "paid" as const, daysAgo: 8 },
    { num: "INV-2026-08-015", member: allMembers[2] || nanang, prodCode: "IURAN-KORPORASI-2026", qty: 1, amount: 150000000, status: "paid" as const, daysAgo: 14 },
    { num: "INV-2026-08-016", member: allMembers[3] || ridwan, prodCode: "UJI-BNSP-RAC", qty: 1, amount: 75000000, status: "paid" as const, daysAgo: 11 },
    { num: "INV-2026-08-017", member: allMembers[4] || dedi, prodCode: "TIKET-EXPO-2026", qty: 1, amount: 25000000, status: "open" as const, daysAgo: 4 },
    { num: "INV-2026-08-018", member: allMembers[0] || heri, prodCode: "KTA-CARD-REPRINT", qty: 1, amount: 5000000, status: "paid" as const, daysAgo: 9 },
    { num: "INV-2026-08-019", member: allMembers[1] || nanang, prodCode: "TIKET-EXPO-2026", qty: 3, amount: 75000000, status: "paid" as const, daysAgo: 7 },
    { num: "INV-2026-08-020", member: allMembers[2] || ridwan, prodCode: "IURAN-ANGGOTA-2026", qty: 1, amount: 15000000, status: "open" as const, daysAgo: 1 },
    { num: "INV-2026-08-021", member: allMembers[3] || dedi, prodCode: "WORKSHOP-VRF-PRO", qty: 1, amount: 50000000, status: "void" as const, daysAgo: 21 },
    { num: "INV-2026-08-022", member: allMembers[4] || eko, prodCode: "UJI-BNSP-RAC", qty: 1, amount: 75000000, status: "paid" as const, daysAgo: 6 },
  ];

  for (const inv of invoicesData) {
    const existing = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.invoiceNumber, inv.num))
      .limit(1);

    if (!existing.length) {
      const issuedDate = new Date(Date.now() - inv.daysAgo * 86400000);
      const dueDate = new Date(issuedDate.getTime() + 14 * 86400000);
      const isPaid = inv.status === "paid";
      const paidMinor = isPaid ? inv.amount : 0;

      const [createdInvoice] = await db
        .insert(invoices)
        .values({
          memberId: inv.member.id,
          invoiceNumber: inv.num,
          status: inv.status,
          currency: "IDR",
          issuedAt: issuedDate,
          dueAt: dueDate,
          subtotalMinor: inv.amount,
          totalMinor: inv.amount,
          paidMinor: paidMinor,
          notes: `Tagihan otomatis sistem untuk ${inv.prodCode}`,
        })
        .returning();

      if (createdInvoice) {
        const prodId = productMap.get(inv.prodCode);
        await db.insert(invoiceLines).values({
          invoiceId: createdInvoice.id,
          productId: prodId || null,
          description: `Pembayaran ${inv.prodCode}`,
          quantity: inv.qty,
          unitAmountMinor: Math.round(inv.amount / inv.qty),
          lineTotalMinor: inv.amount,
        });

        if (isPaid) {
          await db.insert(payments).values({
            invoiceId: createdInvoice.id,
            amountMinor: inv.amount,
            currency: "IDR",
            method: "Bank Transfer / QRIS BCA",
            reference: `TRX-${inv.num.replace("INV-", "")}`,
            status: "confirmed",
            paidAt: new Date(issuedDate.getTime() + 3600000),
          });

          await db.insert(memberEntitlements).values({
            memberId: inv.member.id,
            entitlementKey: `entitlement_${inv.prodCode.toLowerCase()}`,
            label: `Hak Akses Layanan ${inv.prodCode}`,
            sourceInvoiceId: createdInvoice.id,
            sourceProductId: prodId || null,
            status: "active",
            startsAt: issuedDate,
            endsAt: new Date(issuedDate.getTime() + 365 * 86400000),
          });
        }
      }
    }
  }

  // =========================================================================
  // 3. INBOX / FORM SUBMISSIONS (#inbox) - 22 Contact Form Submissions
  // =========================================================================
  console.log("📨 3. Seeding 22 Public & Member Inbox Submissions...");
  const contactMessages = [
    {
      name: "Bambang Suherman",
      email: "bambang.suherman88@gmail.com",
      subject: "Konfirmasi Pendaftaran Anggota Baru Korwil Cirebon",
      message: "Selamat siang Sekretariat APTI. Saya teknisi AC di Cirebon sudah mendaftar lewat web. Mohon konfirmasi jadwal wawancara berkas dan aktivasi KTA.",
      status: "new" as const,
    },
    {
      name: "dr. Hendra Setiawan (RSUD Cibinong)",
      email: "hendra.sarpras@rsudcibinong.go.id",
      subject: "Permohonan Rujukan Kontraktor Chiller Gedung Rawat Inap",
      message: "Kami dari bagian sarpras RSUD memerlukan rujukan kontraktor resmi anggota APTI yang bersertifikasi untuk peremajaan sistem water-cooled chiller kapasitas 300 TR.",
      status: "in_progress" as const,
    },
    {
      name: "Dewi Lestari, S.T. (PT Daikin Airconditioning Indonesia)",
      email: "dewi.lestari@daikin.co.id",
      subject: "Undangan Kerjasama Pelatihan VRV Master Batch 4",
      message: "Mengundang pengurus APTI untuk koordinasi jadwal pelatihan VRV bersama instruktur dari Jepang yang akan diadakan bulan depan di National Training Center.",
      status: "resolved" as const,
    },
    {
      name: "Agus Santoso (Building Manager Graha Niaga)",
      email: "bm.graha@niaga-properti.co.id",
      subject: "Verifikasi Keaslian KTA Teknisi Heri Riski Anto",
      message: "Mohon konfirmasi keabsahan KTA nomor APTI-00.2026.41818 atas nama Heri Riski Anto yang saat ini sedang mengajukan izin kerja perbaikan AC gedung kami.",
      status: "resolved" as const,
    },
    {
      name: "Suryadi Pratama",
      email: "suryadi.ac@yahoo.com",
      subject: "Laporan Dugaan Teknisi Ilegal Menggunakan Atribut APTI",
      message: "Melaporkan ada oknum di daerah Tangerang yang memakai seragam dan stempel berlogo APTI namun hasil pekerjaannya merugikan warga dan tidak terdaftar di direktori.",
      status: "in_progress" as const,
    },
    {
      name: "Wahyu Hidayat (CV Sejuk Makmur)",
      email: "cvsejukmakmur@gmail.com",
      subject: "Penawaran Kerjasama Distributor Pipa Tembaga & Freon R32",
      message: "Kami distributor resmi pipa tembaga Inaba Denko ingin menawarkan harga khusus diskon keanggotaan untuk rekan-rekan teknisi yang terdaftar di APTI.",
      status: "new" as const,
    },
    {
      name: "Ir. Ahmad Fauzi (Konsultan MEP)",
      email: "afauzi.mep@engineers.co.id",
      subject: "Konsultasi Standardisasi Sistem VRV Apartemen Grand Pakubuwono",
      message: "Mohon asistensi dari Komite Teknis APTI terkait review desain sistem pemipaan refrigerant R410A pada gedung 32 lantai.",
      status: "in_progress" as const,
    },
    {
      name: "PT Metropolitan Mall Bekasi",
      email: "engineering@metropolitanmall.com",
      subject: "Permohonan Pelatihan In-House Teknisi Maintenance HVAC Mall",
      message: "Kami mengajukan permohonan in-house training selama 3 hari untuk 15 teknisi internal kami mengenai SOP penanganan kebocoran refrigerant dan uji K3.",
      status: "resolved" as const,
    },
    {
      name: "Rizky Ramadhan",
      email: "rizky.teknisi@gmail.com",
      subject: "Tanya Jadwal Uji Sertifikasi BNSP Wilayah Jawa Timur",
      message: "Kapan jadwal terdekat uji kompetensi BNSP level 2 untuk wilayah Surabaya dan Malang? Saya ingin memperbarui sertifikat yang habis masa berlakunya.",
      status: "resolved" as const,
    },
    {
      name: "Ibu Ratna Kumalasari",
      email: "ratna.k@kompasgramedia.com",
      subject: "Aduan Layanan Servis Teknisi di Wilayah Bekasi Barat",
      message: "Servis AC kantor kami oleh teknisi mitra belum dingin setelah 3 hari. Mohon bantuan mediasi garansi pengerjaan sesuai standar SOP organisasi.",
      status: "resolved" as const,
    },
    {
      name: "PT Gree Electric Appliances Indonesia",
      email: "marketing.gree@gree.id",
      subject: "Sponsor Utama National HVAC Skills Championship 2026",
      message: "Konfirmasi kesediaan PT Gree Indonesia sebagai Platinum Sponsor untuk kejuaraan nasional teknisi pendingin tahun 2026 dan penyediaan 20 unit AC uji praktik.",
      status: "in_progress" as const,
    },
    {
      name: "SMK Negeri 1 Jakarta (Jurusan TPTU)",
      email: "smkn1jakarta.tptu@sekolah.sch.id",
      subject: "Kerjasama Praktik Kerja Lapangan (PKL) Siswa Vokasi",
      message: "Permohonan penempatan 25 siswa jurusan Teknik Pendingin dan Tata Udara di bengkel-bengkel resmi rekanan APTI untuk program magang 6 bulan.",
      status: "new" as const,
    },
    {
      name: "Faisal Tanjung, S.E.",
      email: "faisal.tanjung@sinarmas.com",
      subject: "Pertanyaan Iuran Keanggotaan Badan Usaha Kontraktor",
      message: "Perusahaan kami berencana mendaftar sebagai anggota korporasi. Mohon dikirimkan rincian persyaratan legalitas PT dan form pendaftaran resmi.",
      status: "new" as const,
    },
    {
      name: "H. Mustofa Kamal",
      email: "mustofa.kamal77@gmail.com",
      subject: "Konfirmasi Pembayaran Uji Kompetensi Batch 4",
      message: "Saya sudah mentransfer biaya pendaftaran uji sertifikasi BNSP sebesar Rp 750.000 via transfer BCA. Mohon dicek bukti transfer terlampir.",
      status: "resolved" as const,
    },
    {
      name: "PT Tokopedia / GoTo Financial",
      email: "partnerships@tokopedia.com",
      subject: "Penjajakan Kerjasama Layanan Servis AC On-Demand",
      message: "Kami tertarik menjajaki integrasi verifikasi KTA API APTI untuk kurasi teknisi pendingin resmi pada layanan marketplace jasa kami.",
      status: "in_progress" as const,
    },
    {
      name: "Korwil Persiapan APTI Karawang",
      email: "apti.karawang@gmail.com",
      subject: "Permohonan SK Pembentukan Kepengurusan Korwil Karawang",
      message: "Bersama ini kami lampirkan berita acara rapat musyawarah teknisi Karawang yang dihadiri 45 teknisi untuk pengajuan pengesahan DPC Karawang.",
      status: "resolved" as const,
    },
    {
      name: "Lembaga Swadaya Lingkungan Hijau",
      email: "kontak@bumihijau.org",
      subject: "Laporan Pembuangan Ilegal Refrigerant R22 di Bantaran Sungai",
      message: "Menemukan bengkel AC non-resmi yang melakukan venting freon langsung ke udara bebas. Mohon tindakan edukasi dan sosialisasi protokol KLHK.",
      status: "new" as const,
    },
    {
      name: "Yudi Prasetyo",
      email: "yudi.cool@gmail.com",
      subject: "Permintaan Modul Pelatihan R290 Hidrokarbon",
      message: "Apakah modul panduan praktis penanganan hidrokarbon R290 bisa diunduh oleh anggota aktif melalui dashboard e-learning?",
      status: "resolved" as const,
    },
    {
      name: "PT Asuransi Jiwa Sejahtera",
      email: "corporate@jiwasejahtera.co.id",
      subject: "Penawaran Proteksi Asuransi Kecelakaan Kerja Teknisi KTA",
      message: "Proposal bundling asuransi perlindungan kecelakaan kerja bagi seluruh pemegang KTA aktif APTI dengan premi khusus organisasi.",
      status: "in_progress" as const,
    },
    {
      name: "M. Taufik Hidayat",
      email: "taufik.acservice@gmail.com",
      subject: "Konsultasi Retrofit Freon Ramah Lingkungan R32",
      message: "Mohon panduan teknis apakah kompresor eks-R22 aman diganti refrigerant R32 tanpa mengganti pipa tembaga yang tebalnya 0.6mm.",
      status: "resolved" as const,
    },
    {
      name: "Kementerian Lingkungan Hidup dan Kehutanan RI",
      email: "sekretariat.ppi@menlhk.go.id",
      subject: "Undangan Rapat Koordinasi Nasional Pengurangan Gas Rumah Kaca",
      message: "Mengundang Ketua Umum dan Pengurus DPP APTI Indonesia dalam rapat evaluasi implementasi Amandemen Kigali pada industri pendingin nasional.",
      status: "resolved" as const,
    },
    {
      name: "Doni Iskandar (PT Cold Chain Logistics)",
      email: "doni.iskandar@coldchain.id",
      subject: "Pendaftaran Uji Kompetensi Khusus Chiller & Cold Storage",
      message: "Kami mendaftarkan 10 teknisi sentral pendingin gudang beku untuk mengikuti sertifikasi BNSP Level 3 angkatan mendatang.",
      status: "new" as const,
    },
  ];

  for (const msg of contactMessages) {
    const existing = await db
      .select({ id: contactSubmissions.id })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.subject, msg.subject))
      .limit(1);

    if (!existing.length) {
      await db.insert(contactSubmissions).values(msg);
    }
  }

  // =========================================================================
  // 4. AD/ART & LEGAL DOCUMENTS (#adArt) - 22 Chapters
  // =========================================================================
  console.log("📜 4. Seeding 22 Chapters of AD, ART & Kode Etik...");
  const adArtData = [
    // ANGGARAN DASAR (AD) - 10 BAB
    {
      docType: "AD",
      chapterNumber: "BAB I",
      title: "Nama, Waktu, Kedudukan, dan Sifat Organisasi",
      summary: "Menetapkan identitas resmi Asosiasi Pengusaha & Teknisi Pendingin Indonesia (APTI), masa berdiri tak terbatas, dan kedudukan Dewan Pimpinan Pusat di Ibukota Negara.",
      color: "#0284c7",
      sortOrder: 1,
      articles: [
        { articleNumber: "Pasal 1", title: "Nama Organisasi", clauses: ["Organisasi ini bernama Asosiasi Pengusaha & Teknisi Pendingin Indonesia, disingkat APTI Indonesia.", "Dalam pergaulan internasional menggunakan nama Indonesian Association of HVAC/R Contractors and Technicians."] },
        { articleNumber: "Pasal 2", title: "Waktu dan Kedudukan", clauses: ["APTI didirikan pada tanggal 10 Oktober 2019 di Jakarta untuk jangka waktu yang tidak ditentukan.", "Dewan Pimpinan Pusat (DPP) berkedudukan di Ibukota Negara Republik Indonesia."] },
      ],
    },
    {
      docType: "AD",
      chapterNumber: "BAB II",
      title: "Asas, Landasan, dan Tujuan Organisasi",
      summary: "Organisasi berasaskan Pancasila dan UUD 1945, bertujuan memajukan profesionalisme, keselamatan kerja, serta kesejahteraan teknisi dan pengusaha pendingin.",
      color: "#0284c7",
      sortOrder: 2,
      articles: [
        { articleNumber: "Pasal 3", title: "Asas dan Landasan", clauses: ["APTI berasaskan Pancasila dan berlandaskan Undang-Undang Dasar Negara Republik Indonesia Tahun 1945.", "Landasan operasional adalah Undang-Undang Ketenagakerjaan dan Peraturan Perlindungan Lingkungan Hidup."] },
        { articleNumber: "Pasal 4", title: "Tujuan Organisasi", clauses: ["Meningkatkan kompetensi, integritas, dan perlindungan hukum bagi teknisi pendingin Indonesia.", "Mewujudkan standarisasi industri tata udara yang ramah lingkungan, hemat energi, dan berdaya saing global."] },
      ],
    },
    {
      docType: "AD",
      chapterNumber: "BAB III",
      title: "Kedaulatan dan Lambang Organisasi",
      summary: "Kedaulatan tertinggi berada di tangan anggota melalui Musyawarah Nasional (Munas). Mengatur atribut, bendera, dan logo resmi organisasi.",
      color: "#0284c7",
      sortOrder: 3,
      articles: [
        { articleNumber: "Pasal 5", title: "Kedaulatan", clauses: ["Kedaulatan organisasi berada sepenuhnya di tangan anggota dan dilaksanakan melalui Musyawarah Nasional."] },
        { articleNumber: "Pasal 6", title: "Lambang dan Panji", clauses: ["Lambang organisasi berbentuk kristal salju biru dengan siluet roda gigi industri dan kepulauan nusantara.", "Ketentuan rincian lambang dan bendera diatur lebih lanjut dalam Anggaran Rumah Tangga."] },
      ],
    },
    {
      docType: "AD",
      chapterNumber: "BAB IV",
      title: "Keanggotaan dan Kategori Anggota",
      summary: "Mendefinisikan klasifikasi anggota: Anggota Biasa (Teknisi), Anggota Badan Usaha, Anggota Luar Biasa, dan Anggota Kehormatan.",
      color: "#0284c7",
      sortOrder: 4,
      articles: [
        { articleNumber: "Pasal 7", title: "Klasifikasi Anggota", clauses: ["Anggota Biasa: Teknisi perseorangan yang bekerja di bidang refrigerasi dan tata udara.", "Anggota Badan Usaha: Perusahaan/kontraktor berbadan hukum yang bergerak di bidang pendingin.", "Anggota Kehormatan: Tokoh atau pakar yang berjasa luar biasa bagi kemajuan industri pendingin."] },
      ],
    },
    {
      docType: "AD",
      chapterNumber: "BAB V",
      title: "Hak dan Kewajiban Anggota",
      summary: "Mengatur hak memilih, dipilih, mendapatkan perlindungan hukum, sertifikasi, serta kewajiban menaati AD/ART, kode etik, dan iuran.",
      color: "#0284c7",
      sortOrder: 5,
      articles: [
        { articleNumber: "Pasal 8", title: "Hak Anggota", clauses: ["Mendapatkan Kartu Tanda Anggota (KTA) resmi ber-NFC dan akses ekosistem digital APTI.", "Mengikuti program sertifikasi kompetensi BNSP dengan fasilitas asosiasi.", "Memperoleh advokasi hukum dan mediasi sengketa profesi."] },
        { articleNumber: "Pasal 9", title: "Kewajiban Anggota", clauses: ["Menjunjung tinggi Kode Etik Teknisi Pendingin Indonesia.", "Membayar iuran anggota secara tertib.", "Menerapkan SOP Keselamatan Kerja (K3) dan protokol anti-emisi freon."] },
      ],
    },
    {
      docType: "AD",
      chapterNumber: "BAB VI",
      title: "Susunan Organisasi & Wilayah Kerja",
      summary: "Struktur kepengurusan terdiri dari Dewan Pimpinan Pusat (DPP), Dewan Pimpinan Daerah (DPD Provinsi), dan Koordinator Wilayah (Korwil/DPC).",
      color: "#0284c7",
      sortOrder: 6,
      articles: [
        { articleNumber: "Pasal 10", title: "Tingkatan Kepengurusan", clauses: ["Dewan Pimpinan Pusat (DPP) di tingkat Nasional.", "Dewan Pimpinan Daerah (DPD) di tingkat Provinsi.", "Koordinator Wilayah (Korwil/DPC) di tingkat Kabupaten/Kota."] },
      ],
    },
    {
      docType: "AD",
      chapterNumber: "BAB VII",
      title: "Permusyawaratan & Rapat Kerja",
      summary: "Munas diselenggarakan setiap 5 tahun sekali. Musda setiap 5 tahun, dan Rapat Kerja Nasional (Rakernas) diadakan minimal 1 tahun sekali.",
      color: "#0284c7",
      sortOrder: 7,
      articles: [
        { articleNumber: "Pasal 11", title: "Musyawarah Nasional (Munas)", clauses: ["Munas adalah forum pengambil keputusan tertinggi organisasi.", "Munas memilih dan menetapkan Ketua Umum DPP serta mengesahkan penyempurnaan AD/ART."] },
      ],
    },
    {
      docType: "AD",
      chapterNumber: "BAB VIII",
      title: "Keuangan dan Perbendaharaan",
      summary: "Sumber keuangan organisasi berasal dari iuran pangkal, iuran tahunan, hibah, kerjasama sponsor yang sah, dan unit usaha resmi.",
      color: "#0284c7",
      sortOrder: 8,
      articles: [
        { articleNumber: "Pasal 12", title: "Sumber Pendapatan", clauses: ["Uang pangkal pendaftaran dan iuran tahunan anggota.", "Hasil penyelenggaraan pelatihan, sertifikasi, dan pameran.", "Sumbangan dan kerjasama industri yang tidak mengikat."] },
      ],
    },
    {
      docType: "AD",
      chapterNumber: "BAB IX",
      title: "Badan Otonom, LSP, dan Dewan Pakar",
      summary: "Pembentukan Lembaga Sertifikasi Profesi (LSP) P-3, Lembaga Pelatihan Kerja (LPK), dan Dewan Kehormatan Etik.",
      color: "#0284c7",
      sortOrder: 9,
      articles: [
        { articleNumber: "Pasal 13", title: "Badan Otonom", clauses: ["DPP dapat membentuk Lembaga Sertifikasi Profesi yang terafiliasi dengan BNSP.", "Membentuk Badan Advokasi Hukum dan Dewan Pakar Keteknikan."] },
      ],
    },
    {
      docType: "AD",
      chapterNumber: "BAB X",
      title: "Perubahan AD dan Ketentuan Penutup",
      summary: "Perubahan AD hanya sah jika disetujui sekurang-kurangnya 2/3 suara peserta Munas yang sah.",
      color: "#0284c7",
      sortOrder: 10,
      articles: [
        { articleNumber: "Pasal 14", title: "Perubahan AD", clauses: ["Perubahan Anggaran Dasar hanya dapat diputuskan oleh Musyawarah Nasional atau Munas Luar Biasa."] },
      ],
    },

    // ANGGARAN RUMAH TANGGA (ART) - 8 BAB
    {
      docType: "ART",
      chapterNumber: "BAB I",
      title: "Tata Cara Penerimaan & Registrasi Anggota",
      summary: "Mekanisme pendaftaran online via portal web resmi, verifikasi KTP, riwayat portofolio, dan penerbitan KTA digital ber-QR Code.",
      color: "#38bdf8",
      sortOrder: 11,
      articles: [
        { articleNumber: "Pasal 1", title: "Prosedur Pendaftaran", clauses: ["Calon anggota mengisi formulir digital di portal resmi organisasi.", "Melampirkan KTP, pas foto, dan bukti pengalaman kerja atau sertifikat keahlian.", "Admin DPD memverifikasi berkas dalam waktu maksimal 3x24 jam."] },
      ],
    },
    {
      docType: "ART",
      chapterNumber: "BAB II",
      title: "Tata Tertib & Syarat Kepengurusan",
      summary: "Kriteria pengurus DPP, DPD, dan Korwil: memiliki KTA aktif minimal 2 tahun, tidak pernah dihukum pidana, dan berkomitmen aktif.",
      color: "#38bdf8",
      sortOrder: 12,
      articles: [
        { articleNumber: "Pasal 2", title: "Persyaratan Pengurus", clauses: ["Warga Negara Indonesia, beriman dan bertakwa.", "Telah menjadi anggota aktif sekurang-kurangnya 2 (dua) tahun berturut-turut.", "Memiliki sertifikat kompetensi BNSP atau pengalaman teknis yang diakui."] },
      ],
    },
    {
      docType: "ART",
      chapterNumber: "BAB III",
      title: "Standar KTA Digital & Hak Akses",
      summary: "Format penomoran KTA resmi (Model 3 Administrasi Wilayah), masa berlaku KTA, dan integrasi fitur verifikasi publik.",
      color: "#38bdf8",
      sortOrder: 13,
      articles: [
        { articleNumber: "Pasal 3", title: "Format KTA Digital", clauses: ["Nomor KTA tersusun atas [KODE_ORG]-[KODE_DPD].[TAHUN].[NO_URUT].", "KTA dilengkapi QR Code dinamis yang terhubung ke server verifikasi publik."] },
      ],
    },
    {
      docType: "ART",
      chapterNumber: "BAB IV",
      title: "Disiplin Organisasi & Tata Tertib",
      summary: "Kewajiban pengurus dan anggota mematuhi tata tertib persidangan, rapat koordinasi, dan laporan pertanggungjawaban berkala.",
      color: "#38bdf8",
      sortOrder: 14,
      articles: [
        { articleNumber: "Pasal 4", title: "Disiplin Kerja", clauses: ["Pengurus wajib menghadiri rapat kerja dan menyusun laporan pertanggungjawaban tahunan."] },
      ],
    },
    {
      docType: "ART",
      chapterNumber: "BAB V",
      title: "Mekanisme Sanksi & Pembelaan Diri",
      summary: "Tingkatan sanksi: Peringatan Lisan, Surat Peringatan (SP 1-3), Pembekuan KTA, hingga Pemberhentian Tetap dengan hak pembelaan di Dewan Kehormatan.",
      color: "#38bdf8",
      sortOrder: 15,
      articles: [
        { articleNumber: "Pasal 5", title: "Tingkatan Sanksi", clauses: ["Teguran tertulis pertama dan kedua.", "Pembekuan hak keanggotaan sementara selama 6 bulan.", "Pemberhentian tidak dengan hormat atas pelanggaran berat kode etik."] },
      ],
    },
    {
      docType: "ART",
      chapterNumber: "BAB VI",
      title: "Tata Kelola Distribusi Iuran Organisasi",
      summary: "Proporsi pembagian iuran tahunan: 40% DPP (Pusat), 40% DPD (Provinsi), dan 20% Korwil (Daerah) untuk kegiatan operasional.",
      color: "#38bdf8",
      sortOrder: 16,
      articles: [
        { articleNumber: "Pasal 6", title: "Bagi Hasil Iuran", clauses: ["Iuran tahunan dialokasikan: 40% DPP, 40% DPD pengusul, dan 20% DPC/Korwil.", "Seluruh transaksi iuran wajib tercatat transparan di ledger digital organisasi."] },
      ],
    },
    {
      docType: "ART",
      chapterNumber: "BAB VII",
      title: "Akreditasi Lembaga Pelatihan & TUK",
      summary: "Standar Tempat Uji Kompetensi (TUK) mitra APTI dalam hal kelengkapan manifold, recovery machine, APD, dan ruang vakum.",
      color: "#38bdf8",
      sortOrder: 17,
      articles: [
        { articleNumber: "Pasal 7", title: "Persyaratan TUK", clauses: ["Memiliki kelengkapan alat ukur terkalibrasi dan peralatan keselamatan kerja K3."] },
      ],
    },
    {
      docType: "ART",
      chapterNumber: "BAB VIII",
      title: "Ketentuan Penutup & Aturan Peralihan",
      summary: "Ketentuan operasional yang belum diatur dalam ART ini akan ditetapkan melalui Peraturan Organisasi (PO) oleh DPP.",
      color: "#38bdf8",
      sortOrder: 18,
      articles: [
        { articleNumber: "Pasal 8", title: "Pemberlakuan", clauses: ["Anggaran Rumah Tangga ini berlaku sejak tanggal ditetapkan pada Munas."] },
      ],
    },

    // KODE ETIK & SOP PROFESI (KODE_ETIK) - 4 BAB
    {
      docType: "KODE_ETIK",
      chapterNumber: "BAB I",
      title: "Integritas Profesi & Kejujuran Teknis",
      summary: "Kewajiban teknisi bersikap jujur mengenai kerusakan unit, transparansi penggantian suku cadang, dan larangan manipulasi tekanan refrigerant.",
      color: "#10b981",
      sortOrder: 19,
      articles: [
        { articleNumber: "Pasal 1", title: "Kejujuran Diagnosa", clauses: ["Teknisi wajib memberikan penjelasan riil atas kerusakan unit tanpa menambah-nambahkan kerusakan.", "Dilarang memvonis kompresor rusak atau kebocoran fiktif demi keuntungan pribadi."] },
      ],
    },
    {
      docType: "KODE_ETIK",
      chapterNumber: "BAB II",
      title: "Keselamatan & Kesehatan Kerja (K3) HVAC",
      summary: "Kewajiban penggunaan APD lengkap (safety shoes, sarung tangan, helm, safety harness saat bekerja di ketinggian) dan uji kebocoran gas.",
      color: "#10b981",
      sortOrder: 20,
      articles: [
        { articleNumber: "Pasal 2", title: "Penerapan APD", clauses: ["Wajib menggunakan Alat Pelindung Diri (APD) standar saat melakukan instalasi dan pemeliharaan.", "Bekerja di ketinggian wajib menggunakan full body harness bertali ganda."] },
      ],
    },
    {
      docType: "KODE_ETIK",
      chapterNumber: "BAB III",
      title: "Perlindungan Lingkungan & Anti-Emisi Freon",
      summary: "Larangan keras membuang (venting) refrigerant ke atmosfer. Wajib menggunakan recovery machine dan tabung penampung tersertifikasi.",
      color: "#10b981",
      sortOrder: 21,
      articles: [
        { articleNumber: "Pasal 3", title: "Zero Venting Freon", clauses: ["Dilarang keras melepas refrigerant BPO dan gas rumah kaca langsung ke udara terbuka.", "Setiap proses evakuasi sistem wajib menggunakan mesin recovery berstandar KLHK."] },
      ],
    },
    {
      docType: "KODE_ETIK",
      chapterNumber: "BAB IV",
      title: "Standar Layanan Konsumen & Transparansi Biaya",
      summary: "Memberikan garansi pengerjaan minimal 30 hari, rincian nota resmi, dan menjalin hubungan kerja yang harmonis sesama rekan teknisi.",
      color: "#10b981",
      sortOrder: 22,
      articles: [
        { articleNumber: "Pasal 4", title: "Jaminan Pelayanan", clauses: ["Wajib memberikan bukti nota pengerjaan dan garansi servis sekurang-kurangnya 30 hari kalender.", "Menjaga etika profesi dan saling menghormati antar rekan teknisi se-profesi."] },
      ],
    },
  ];

  for (const doc of adArtData) {
    const existing = await db
      .select({ id: adArtDocuments.id })
      .from(adArtDocuments)
      .where(eq(adArtDocuments.title, doc.title))
      .limit(1);

    if (!existing.length) {
      await db.insert(adArtDocuments).values(doc);
    }
  }

  // =========================================================================
  // 5. MILESTONES & SEJARAH (#milestones) - 22 Milestone Timeline Entries
  // =========================================================================
  console.log("🌟 5. Seeding 22 Organization Milestones...");
  const milestonesData = [
    {
      year: "2018",
      phase: "Inisiasi Komunitas",
      title: "Pertemuan Awal Paguyuban Teknisi Pendingin Jabodetabek",
      description: "Pertemuan informal lebih dari 120 teknisi dan wirausahawan AC di Jakarta Pusat untuk menyepakati perlunya wadah profesi resmi nasional.",
      tags: ["Komunitas", "Deklarasi", "Sejarah Awal"],
      highlight: "120+ Teknisi Penggagas",
      sortOrder: 1,
    },
    {
      year: "2019",
      phase: "Deklarasi Pendirian",
      title: "Deklarasi Pendirian Resmi APTI Indonesia",
      description: "Deklarasi pendirian Asosiasi Pengusaha & Teknisi Pendingin Indonesia (APTI) bertempat di Gedung Juang 45 Jakarta, menetapkan Visi & Misi organisasi.",
      tags: ["Pendirian", "Deklarasi Nasional"],
      highlight: "10 Oktober 2019",
      sortOrder: 2,
    },
    {
      year: "2019",
      phase: "Badan Hukum",
      title: "Pengesahan Badan Hukum Resmi Kemenkumham RI",
      description: "Penerbitan Surat Keputusan Menteri Hukum dan HAM RI No. AHU-0012890.AH.01.07.2019 sebagai asosiasi profesi resmi berbadan hukum nasional.",
      tags: ["Legalitas", "Kemenkumham"],
      highlight: "SK AHU Kemenkumham",
      sortOrder: 3,
    },
    {
      year: "2020",
      phase: "Sertifikasi Perdana",
      title: "Peluncuran Program Sertifikasi BNSP RAC Mandiri Angkatan I",
      description: "Penyelenggaraan uji kompetensi perdana standar SKKNI BNSP yang meluluskan 500 teknisi pendingin berlisensi di 5 kota besar.",
      tags: ["BNSP", "Sertifikasi", "SKKNI"],
      highlight: "500 Teknisi Lulus",
      sortOrder: 4,
    },
    {
      year: "2020",
      phase: "Ekspansi Wilayah",
      title: "Peresmian DPD Jawa Barat & DPD Jawa Timur",
      description: "Pelantikan kepengurusan Dewan Pimpinan Daerah Jawa Barat (Bandung) dan DPD Jawa Timur (Surabaya) untuk memperluas jangkauan pembinaan daerah.",
      tags: ["DPD Jabar", "DPD Jatim", "Struktur"],
      highlight: "2 DPD Provinsi Pertama",
      sortOrder: 5,
    },
    {
      year: "2021",
      phase: "Kemitraan Pemerintah",
      title: "Kerjasama Strategis dengan Ditjen PPI Kementerian LHK",
      description: "Penandatanganan nota kesepahaman (MoU) dengan Kementerian Lingkungan Hidup untuk pelatihan penanganan refrigerant ramah lingkungan dan mitigasi HCFC.",
      tags: ["KLHK", "BPO", "Lingkungan"],
      highlight: "MoU Bersama KLHK RI",
      sortOrder: 6,
    },
    {
      year: "2021",
      phase: "Jaringan Cabang",
      title: "Pembentukan Korwil Bandung Raya, Bekasi, Cirebon & Malang",
      description: "Ekspansi pembentukan Koordinator Wilayah (Korwil/DPC) di tingkat kota/kabupaten strategis untuk mendekatkan layanan organisasi ke teknisi akar rumput.",
      tags: ["Korwil", "Cabang Daerah"],
      highlight: "4 Korwil Perdana",
      sortOrder: 7,
    },
    {
      year: "2021",
      phase: "Aksi Sosial",
      title: "Pembentukan Satgas Peduli APTI untuk Bantuan Bencana",
      description: "Inisiatif relawan teknisi APTI membantu perbaikan sistem pendingin dan cold storage vaksin di rumah sakit darurat dan puskesmas wilayah bencana.",
      tags: ["Satgas", "Sosial", "Bakti Negeri"],
      highlight: "Aksi Relawan Medis",
      sortOrder: 8,
    },
    {
      year: "2022",
      phase: "Musyawarah Nasional",
      title: "Pelaksanaan Munas I APTI Indonesia di Jakarta",
      description: "Musyawarah Nasional pertama yang dihadiri perwakilan DPD dari 15 provinsi, menetapkan AD/ART definitif dan arah strategi 5 tahun ke depan.",
      tags: ["Munas I", "Demokrasi Organisasi"],
      highlight: "Munas I Definitif",
      sortOrder: 9,
    },
    {
      year: "2022",
      phase: "Kerjasama Industri",
      title: "MoU Akademi Pelatihan Bersama Daikin, Gree & Panasonic",
      description: "Kemitraan pelatihan teknologi VRV, Inverter, dan R32 dengan para prinsipal pabrikan AC terkemuka dunia di Indonesia.",
      tags: ["Prinsipal OEM", "Daikin", "Panasonic", "Gree"],
      highlight: "Kemitraan Pabrikan Global",
      sortOrder: 10,
    },
    {
      year: "2023",
      phase: "Transformasi Digital",
      title: "Peluncuran Portal KTA Digital Ber-NFC & Verifikasi QR Code",
      description: "Implementasi KTA digital pintar berbasis NFC dan verifikasi publik via QR Code untuk menjamin keaslian teknisi bersertifikat bagi konsumen.",
      tags: ["KTA Digital", "NFC", "Teknologi"],
      highlight: "KTA Berbasis Smart NFC",
      sortOrder: 11,
    },
    {
      year: "2023",
      phase: "Standardisasi K3",
      title: "Pembentukan Komite K3 & Standardisasi Flammable Refrigerant R290",
      description: "Penyusunan modul dan protokol keselamatan kerja penanganan refrigerant hidrokarbon mudah terbakar sesuai Permenaker No. 37/2016.",
      tags: ["K3", "R290", "Keselamatan"],
      highlight: "Modul K3 Nasional R290",
      sortOrder: 12,
    },
    {
      year: "2023",
      phase: "Jaringan Luar Jawa",
      title: "Ekspansi Pembentukan DPD Sumatera Utara, Bali, dan Kaltim",
      description: "Pembentukan struktur kepengurusan DPD di Medan (Sumut), Denpasar (Bali), dan Balikpapan (Kalimantan Timur) untuk menyongsong Ibu Kota Nusantara.",
      tags: ["Sumut", "Bali", "Kaltim", "IKN"],
      highlight: "Ekspansi Luar Jawa",
      sortOrder: 13,
    },
    {
      year: "2024",
      phase: "Pusat Pelatihan",
      title: "Peresmian APTI National Training Center Terpadu",
      description: "Peresmian gedung pusat pelatihan terpadu berkapasitas 100 peserta dengan fasilitas chiller simulator, VRF test bench, dan lab kelistrikan.",
      tags: ["Training Center", "Fasilitas Modern"],
      highlight: "Pusat Diklat Terpadu",
      sortOrder: 14,
    },
    {
      year: "2024",
      phase: "Penguatan Asesor",
      title: "Pelatihan & Sertifikasi 100 Asesor Kompetensi Nasional",
      description: "Peningkatan kapasitas penguji uji kompetensi BNSP guna memenuhi target percepatan sertifikasi teknisi pendingin di seluruh provinsi.",
      tags: ["Asesor", "LSP", "Kapasitas"],
      highlight: "100 Asesor BNSP Resmi",
      sortOrder: 15,
    },
    {
      year: "2024",
      phase: "Konsolidasi Wilayah",
      title: "Musda Serentak DPD Jabar, Jatim, dan DKI Jakarta Periode 2024-2029",
      description: "Pelaksanaan Musyawarah Daerah serentak menghasilkan regenerasi kepemimpinan wilayah yang progresif dan siap bertransformasi digital.",
      tags: ["Musda", "Kepengurusan Baru"],
      highlight: "Musda Sukses 3 DPD",
      sortOrder: 16,
    },
    {
      year: "2025",
      phase: "Kompetisi Nasional",
      title: "National HVAC Skills Championship 2025",
      description: "Penyelenggaraan kejuaraan nasional keterampilan teknisi pendingin memperebutkan Piala Bergilir APTI dengan 300 peserta perwakilan 20 provinsi.",
      tags: ["Championship", "Kejuaraan", "Skill"],
      highlight: "300 Finalis Se-Indonesia",
      sortOrder: 17,
    },
    {
      year: "2025",
      phase: "Database Terpadu",
      title: "Integrasi Database Wilayah Nasional (38 Provinsi, 514 Kab/Kota)",
      description: "Adopsi standar database kodifikasi wilayah Kemendagri ke dalam sistem registrasi KTA dan verifikasi teknisi online.",
      tags: ["Database Wilayah", "Satu Data"],
      highlight: "100% Wilayah Indonesia",
      sortOrder: 18,
    },
    {
      year: "2025",
      phase: "Standardisasi Bengkel",
      title: "Akreditasi 1.000 Bengkel Servis AC Standar APTI Prima",
      description: "Program audit dan pemberian sertifikat bengkel terstandarisasi untuk 1.000 wirausaha pendingin mandiri di Indonesia.",
      tags: ["Akreditasi Bengkel", "Kemitraan"],
      highlight: "1.000 Bengkel Terakreditasi",
      sortOrder: 19,
    },
    {
      year: "2026",
      phase: "Platform Terpadu",
      title: "Peluncuran OpenOrg ComplyFlow & Ekosistem Digital APTI",
      description: "Implementasi platform sistem informasi modern yang mengintegrasikan tata kelola kepengurusan, akademi SKP, verifikasi kredensial, dan billing iuran.",
      tags: ["OpenOrg", "ComplyFlow", "Transformasi 2026"],
      highlight: "Sistem Terpadu 2026",
      sortOrder: 20,
    },
    {
      year: "2026",
      phase: "Diplomasi Regional",
      title: "Partisipasi Forum HVAC/R ASEAN di Bangkok Mewakili Indonesia",
      description: "Delegasi pengurus DPP APTI Indonesia memaparkan capaian implementasi keselamatan flammable refrigerant di hadapan asosiasi pendingin se-Asia Tenggara.",
      tags: ["ASEAN", "Internasional", "Bangkok"],
      highlight: "Delegasi Resmi ASEAN",
      sortOrder: 21,
    },
    {
      year: "2026+",
      phase: "Visi Masa Depan",
      title: "Roadmap 50.000 Teknisi Tersertifikasi & Zero Accident K3 2030",
      description: "Peta jalan strategis jangka panjang untuk memastikan seluruh teknisi pendingin di Indonesia memiliki lisensi kompetensi resmi dan perlindungan kerja optimal.",
      tags: ["Roadmap 2030", "Zero Accident", "Indonesia Emas"],
      highlight: "Target 50.000 Teknisi Bersertifikat",
      sortOrder: 22,
    },
  ];

  for (const m of milestonesData) {
    const existing = await db
      .select({ id: organizationMilestones.id })
      .from(organizationMilestones)
      .where(eq(organizationMilestones.title, m.title))
      .limit(1);

    if (!existing.length) {
      await db.insert(organizationMilestones).values(m);
    }
  }

  console.log("✅ ALL 5 MODULES SEEDED WITH 20+ RECORDS EACH SUCCESSFULLY!");
}

seedAllModules()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error seeding modules:", err);
    process.exit(1);
  });
