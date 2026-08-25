import { eq } from "drizzle-orm";
import { db } from "./client";
import { credentialSchemes, memberCredentials, members } from "./schema";

async function seedCredentials() {
  console.log("Seeding credential schemes & member credentials...");

  // 1. Check existing schemes or insert
  const existingSchemes = await db.select().from(credentialSchemes);
  const schemeMap = new Map<string, string>();

  const schemesToInsert = [
    {
      code: "BNSP-RAC-LV2",
      name: "Sertifikasi Profesi Teknisi RAC Domestik (BNSP / LSP)",
      subjectType: "person" as const,
      minimumVerificationLevel: "document_checked" as const,
      validityPeriodDays: 1095, // 3 tahun
      renewalGracePeriodDays: 30,
      jsonSchema: {
        fields: [
          {
            key: "noRegistrasi",
            label: "No. Registrasi BNSP",
            type: "text",
            required: true,
          },
          {
            key: "skemaKompetensi",
            label: "Skema Sertifikasi",
            type: "text",
            required: true,
          },
          {
            key: "lembagaLsp",
            label: "Nama LSP Penerbit",
            type: "text",
            required: true,
          },
        ],
      },
      metadata: {
        category: "Kompetensi Nasional (BNSP)",
        issuerName:
          "Badan Nasional Sertifikasi Profesi (BNSP / LSP Elektronika)",
        validityMonths: 36,
        description:
          "Sertifikasi standar kompetensi kerja nasional Indonesia (SKKNI) bidang refrigerasi dan tata udara domestik tingkat teknisi mandiri.",
      },
    },
    {
      code: "K3-FLAMMABLE-REFRIG",
      name: "Lisensi K3 & Sertifikasi Flammable Refrigerant (R290 & R32)",
      subjectType: "person" as const,
      minimumVerificationLevel: "issuer_confirmed" as const,
      validityPeriodDays: 730, // 2 tahun
      renewalGracePeriodDays: 60,
      jsonSchema: {
        fields: [
          {
            key: "jenisRefrigerant",
            label: "Refrigerant Diuji",
            type: "text",
            required: true,
          },
          {
            key: "standarK3",
            label: "Dasar Regulasi K3",
            type: "text",
            required: true,
          },
        ],
      },
      metadata: {
        category: "Keselamatan Kerja (K3) & Lingkungan",
        issuerName: "Kementerian Ketenagakerjaan RI & Ditjen PPI KLHK",
        validityMonths: 24,
        description:
          "Lisensi penanganan refrigerant mudah terbakar (A2L/A3 seperti R32 & R290) sesuai standar K3 dan protokol ramah lingkungan bebas HCFC.",
      },
    },
    {
      code: "BNSP-CHILLER-LV3",
      name: "Sertifikasi Teknisi Sistem Chiller & HVAC Industri (BNSP Level 3)",
      subjectType: "person" as const,
      minimumVerificationLevel: "issuer_confirmed" as const,
      validityPeriodDays: 1095, // 3 tahun
      renewalGracePeriodDays: 30,
      jsonSchema: {
        fields: [
          {
            key: "kapasitasMaksimal",
            label: "Kapasitas Unit Chiller",
            type: "text",
            required: true,
          },
          {
            key: "spesialisasiSistem",
            label: "Water/Air Cooled",
            type: "text",
            required: true,
          },
        ],
      },
      metadata: {
        category: "Kompetensi Tingkat Lanjut (Industri)",
        issuerName: "LSP Tata Udara & Asosiasi HVAC Industri",
        validityMonths: 36,
        description:
          "Kredensial master teknisi tata udara skala besar, sentral building, water cooled / air cooled chiller dan cold storage industri.",
      },
    },
    {
      code: "OEM-VRF-MASTER",
      name: "Sertifikasi Spesialis Sistem VRF / Multi-Split Komersial",
      subjectType: "person" as const,
      minimumVerificationLevel: "document_checked" as const,
      validityPeriodDays: 730, // 2 tahun
      renewalGracePeriodDays: 30,
      jsonSchema: {
        fields: [
          {
            key: "oemBrand",
            label: "Principal / Brand",
            type: "text",
            required: true,
          },
          {
            key: "levelSertifikasi",
            label: "Tingkat Keahlian",
            type: "text",
            required: true,
          },
        ],
      },
      metadata: {
        category: "Principal / Pabrikan (OEM)",
        issuerName: "Daikin & Panasonic HVAC Certified Academy",
        validityMonths: 24,
        description:
          "Sertifikasi perancangan, instalasi piping refractory, commisioning, dan troubleshooting sistem Variable Refrigerant Flow (VRF/VRV).",
      },
    },
    {
      code: "KEMNAKER-K3-LISTRIK",
      name: "Lisensi K3 Teknisi Listrik & Instalasi Pendingin",
      subjectType: "person" as const,
      minimumVerificationLevel: "api_verified" as const,
      validityPeriodDays: 1825, // 5 tahun
      renewalGracePeriodDays: 90,
      jsonSchema: {
        fields: [
          {
            key: "noSio",
            label: "Nomor SIO Kemnaker",
            type: "text",
            required: true,
          },
          {
            key: "teganganOperasi",
            label: "Batas Tegangan Kerja",
            type: "text",
            required: true,
          },
        ],
      },
      metadata: {
        category: "Lisensi Pemerintah (Kemnaker RI)",
        issuerName: "Kementerian Ketenagakerjaan Republik Indonesia",
        validityMonths: 60,
        description:
          "Surat Ijin Operasi (SIO) dan lisensi resmi K3 instalasi kelistrikan sistem mesin pendingin dan kontrol otomatisasi HVAC.",
      },
    },
  ];

  for (const item of schemesToInsert) {
    const existing = existingSchemes.find((s) => s.code === item.code);
    if (existing) {
      schemeMap.set(item.code, existing.id);
    } else {
      const [inserted] = await db
        .insert(credentialSchemes)
        .values(item)
        .returning();
      if (inserted) {
        schemeMap.set(item.code, inserted.id);
      }
    }
  }

  // 2. Fetch members to link credentials
  const allMembers = await db.select().from(members);
  const findMember = (emailOrName: string) =>
    allMembers.find(
      (m) =>
        (m.email &&
          m.email.toLowerCase().includes(emailOrName.toLowerCase())) ||
        m.name.toLowerCase().includes(emailOrName.toLowerCase()),
    );

  const heri = findMember("rizqy.pratama85") || findMember("Heri Riski Anto");
  const nanang = findMember("nanang") || findMember("Nanang");
  const ridwan = findMember("ridwan") || findMember("Ridwan");
  const dedi = findMember("dedi") || findMember("Dedi");
  const eko = findMember("eko") || findMember("Eko");
  const budi = findMember("budi") || findMember("Budi");

  const sampleCredentials = [
    // Heri Riski Anto (New applicant / newly activated)
    heri && {
      memberId: heri.id,
      schemeId: schemeMap.get("BNSP-RAC-LV2")!,
      credentialNumber: "BNSP-RAC-2026-04818",
      verificationLevel: "document_checked" as const,
      status: "submitted" as const, // Waiting in queue!
      issuedAt: new Date("2026-08-20T08:00:00Z"),
      expiresAt: new Date("2029-08-20T08:00:00Z"),
      payload: {
        skemaKompetensi: "Teknisi Refrigerasi Domestik Level II",
        noRegistrasi: "REG.ELK.RAC.2026.04818",
        lembagaLsp: "LSP Elektronika & Tata Udara Indonesia",
        sourceUrl: "https://bnsp.go.id/sertifikat/verify?code=04818",
      },
    },
    heri && {
      memberId: heri.id,
      schemeId: schemeMap.get("K3-FLAMMABLE-REFRIG")!,
      credentialNumber: "K3-R290-2026-99120",
      verificationLevel: "issuer_confirmed" as const,
      status: "verified" as const,
      issuedAt: new Date("2026-08-15T09:00:00Z"),
      expiresAt: new Date("2028-08-15T09:00:00Z"),
      payload: {
        jenisRefrigerant: "R290 (Propana) & R32 Ramah Lingkungan",
        standarK3: "Permenaker RI No. 37/2016 & SOP APTI",
        nilaiPraktik: "94 (Sangat Baik / Lulus)",
      },
    },
    // Ir. H. Nanang Varian Supriadi (DPP Master)
    nanang && {
      memberId: nanang.id,
      schemeId: schemeMap.get("BNSP-CHILLER-LV3")!,
      credentialNumber: "BNSP-CHILLER-2024-00101",
      verificationLevel: "cryptographically_verified" as const,
      status: "verified" as const,
      issuedAt: new Date("2024-05-10T08:00:00Z"),
      expiresAt: new Date("2027-05-10T08:00:00Z"),
      payload: {
        kapasitasMaksimal: "Unlimited (Central Chiller Plant > 1000 TR)",
        spesialisasiSistem: "Centrifugal & Screw Water-Cooled Chiller",
        statusAsesor: "Master Assessor BNSP",
      },
    },
    nanang && {
      memberId: nanang.id,
      schemeId: schemeMap.get("KEMNAKER-K3-LISTRIK")!,
      credentialNumber: "SIO-K3-EL-2023-88741",
      verificationLevel: "api_verified" as const,
      status: "verified" as const,
      issuedAt: new Date("2023-03-12T08:00:00Z"),
      expiresAt: new Date("2028-03-12T08:00:00Z"),
      payload: {
        noSio: "SIO.K3.LISTRIK.2023.88741",
        teganganOperasi: "Tinggi & Menengah (TM/TR s/d 20kV)",
      },
    },
    // M. Ridwan Syah, ST
    ridwan && {
      memberId: ridwan.id,
      schemeId: schemeMap.get("OEM-VRF-MASTER")!,
      credentialNumber: "VRF-MASTER-2025-01432",
      verificationLevel: "issuer_confirmed" as const,
      status: "verified" as const,
      issuedAt: new Date("2025-02-18T08:00:00Z"),
      expiresAt: new Date("2027-02-18T08:00:00Z"),
      payload: {
        oemBrand: "Daikin VRV IV & Panasonic FSV Specialist",
        levelSertifikasi: "Master Engineer / Piping Designer",
      },
    },
    ridwan && {
      memberId: ridwan.id,
      schemeId: schemeMap.get("BNSP-RAC-LV2")!,
      credentialNumber: "BNSP-RAC-2025-09214",
      verificationLevel: "document_checked" as const,
      status: "verified" as const,
      issuedAt: new Date("2025-01-10T08:00:00Z"),
      expiresAt: new Date("2028-01-10T08:00:00Z"),
      payload: {
        skemaKompetensi: "Teknisi Refrigerasi Domestik Level II",
        noRegistrasi: "REG.ELK.RAC.2025.09214",
        lembagaLsp: "LSP Elektronika Indonesia",
      },
    },
    // Dedi Kurniawan (DPD Jabar)
    dedi && {
      memberId: dedi.id,
      schemeId: schemeMap.get("BNSP-RAC-LV2")!,
      credentialNumber: "BNSP-RAC-2026-11880",
      verificationLevel: "document_checked" as const,
      status: "submitted" as const, // Waiting in queue!
      issuedAt: new Date("2026-08-21T08:00:00Z"),
      expiresAt: new Date("2029-08-21T08:00:00Z"),
      payload: {
        skemaKompetensi: "Teknisi Refrigerasi Domestik Level II",
        noRegistrasi: "REG.ELK.RAC.2026.11880",
        lembagaLsp: "LSP Elektronika Jawa Barat",
      },
    },
    dedi && {
      memberId: dedi.id,
      schemeId: schemeMap.get("OEM-VRF-MASTER")!,
      credentialNumber: "VRF-SPEC-2026-08129",
      verificationLevel: "document_checked" as const,
      status: "submitted" as const, // Waiting in queue!
      issuedAt: new Date("2026-08-22T08:00:00Z"),
      expiresAt: new Date("2028-08-22T08:00:00Z"),
      payload: {
        oemBrand: "Panasonic Certified HVAC Commercial",
        levelSertifikasi: "Certified VRF Installer",
      },
    },
    // H. Eko Susilo (DPD Jatim)
    eko && {
      memberId: eko.id,
      schemeId: schemeMap.get("BNSP-CHILLER-LV3")!,
      credentialNumber: "BNSP-CHILLER-2024-00918",
      verificationLevel: "issuer_confirmed" as const,
      status: "verified" as const,
      issuedAt: new Date("2024-09-05T08:00:00Z"),
      expiresAt: new Date("2027-09-05T08:00:00Z"),
      payload: {
        kapasitasMaksimal: "Industri Cold Storage & Chiller Plant",
        spesialisasiSistem: "Ammonia (R717) & Freon Industrial Chiller",
      },
    },
    eko && {
      memberId: eko.id,
      schemeId: schemeMap.get("K3-FLAMMABLE-REFRIG")!,
      credentialNumber: "K3-R290-2025-41029",
      verificationLevel: "issuer_confirmed" as const,
      status: "verified" as const,
      issuedAt: new Date("2025-04-12T08:00:00Z"),
      expiresAt: new Date("2027-04-12T08:00:00Z"),
      payload: {
        jenisRefrigerant: "R290, R32, R1234ze",
        standarK3: "Permenaker No. 37/2016",
      },
    },
    // Budi Pratama (Demo)
    budi && {
      memberId: budi.id,
      schemeId: schemeMap.get("K3-FLAMMABLE-REFRIG")!,
      credentialNumber: "K3-R32-2026-55210",
      verificationLevel: "document_checked" as const,
      status: "rejected" as const,
      issuedAt: new Date("2026-08-10T08:00:00Z"),
      expiresAt: new Date("2028-08-10T08:00:00Z"),
      payload: {
        jenisRefrigerant: "R32 Flammable",
        alasanPenolakan:
          "Hasil scan sertifikat buram dan nomor registrasi tidak ditemukan di database LSP.",
      },
    },
  ].filter(Boolean);

  for (const cred of sampleCredentials) {
    if (!cred) continue;
    const existing = await db
      .select({ id: memberCredentials.id })
      .from(memberCredentials)
      .where(eq(memberCredentials.credentialNumber, cred.credentialNumber))
      .limit(1);

    if (!existing.length) {
      await db.insert(memberCredentials).values(cred as any);
      console.log(
        `Inserted credential: ${cred.credentialNumber} (${cred.status})`,
      );
    }
  }

  console.log("Credential schemes and member credentials seeded successfully!");
}

seedCredentials()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding credentials:", err);
    process.exit(1);
  });
