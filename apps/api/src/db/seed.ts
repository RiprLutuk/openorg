import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { closeDatabase, db } from "./client";
import { ALL_INDONESIA_REGENCIES, INDONESIA_PROVINCES } from "@openorg/contracts";
import {
  championshipStandings,
  contents,
  events,
  indonesiaDistricts,
  indonesiaProvinces,
  indonesiaRegencies,
  indonesiaVillages,
  industryStatistics,
  learningActivities,
  learningCreditLedger,
  learningCreditSchemes,
  learningEnrollments,
  lenderRegistries,
  memberAccounts,
  members,
  membershipCards,
  organizationUnits,
  pages,
  permissions,
  positionAssignments,
  positions,
  publicComplaints,
  registeredClubs,
  regulations,
  rolePermissions,
  roles,
  siteSettings,
  technicianDirectories,
  userRoles,
  users,
  workingGroups,
} from "./schema";

const now = new Date();

async function seed() {
  const demoHash = await hash("OpenOrg!2026Demo", {
    algorithm: 2,
    memoryCost: 19_456,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  });
  const defaultHash = await hash("password123", {
    algorithm: 2,
    memoryCost: 19_456,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  });

  await db.transaction(async (tx) => {
    // Clean old data for clean seed
    await tx.delete(siteSettings);
    await tx.delete(userRoles);
    await tx.delete(rolePermissions);
    await tx.delete(permissions);
    await tx.delete(roles);
    await tx.delete(positionAssignments);
    await tx.delete(positions);
    await tx.delete(membershipCards);
    await tx.delete(learningCreditLedger);
    await tx.delete(learningEnrollments);
    await tx.delete(learningActivities);
    await tx.delete(learningCreditSchemes);
    await tx.delete(members);
    await tx.delete(organizationUnits);
    await tx.delete(events);
    await tx.delete(contents);
    await tx.delete(pages);
    await tx.delete(regulations);
    await tx.delete(publicComplaints);
    await tx.delete(championshipStandings);
    await tx.delete(industryStatistics);
    await tx.delete(workingGroups);
    await tx.delete(technicianDirectories);
    await tx.delete(registeredClubs);
    await tx.delete(lenderRegistries);
    await tx.delete(indonesiaVillages);
    await tx.delete(indonesiaDistricts);
    await tx.delete(indonesiaRegencies);
    await tx.delete(indonesiaProvinces);
    await tx.delete(users);

    // 1. Site Settings APTI Indonesia (Asosiasi Pengusaha & Teknisi Pendingin Indonesia)
    await tx.insert(siteSettings).values({
      id: "default",
      name: "APTI Indonesia",
      slug: "apti",
      kind: "association",
      tagline: "Asosiasi Pengusaha & Teknisi Pendingin Indonesia",
      description:
        "Wadah resmi profesionalisme perusahaan pendingin dan teknisi refrigerasi tata udara (HVAC/R) Indonesia. Terintegrasi dengan registri KTA digital resmi, sertifikasi kompetensi BNSP, struktur kepengurusan DPP, DPD & Korwil Nusantara, serta pelatihan teknis terstandarisasi.",
      email: "sekretariat@apti.or.id",
      phone: "+62 812-9000-1980",
      address:
        "Gedung APTI Center, Jl. Jend. Sudirman No. 88, Jakarta Pusat 10220",
      primaryColor: "#0284c7",
      secondaryColor: "#090d16",
      theme: {
        colors: {
          primary: "#0284c7",
          secondary: "#090d16",
          accent: "#38bdf8",
          surface: "#f8fafc",
          foreground: "#0f172a",
        },
        radius: "large",
        fontHeading: "Manrope",
        fontBody: "Inter",
      },
      quickContact: {
        channel: "message",
        label: "WhatsApp Sekretariat APTI",
        value: "+62 812-9000-1980",
        href: "https://wa.me/6281290001980",
      },
      navigation: [
        { id: "home", label: "Beranda", href: "/", children: [] },
        {
          id: "profile",
          label: "Profil",
          href: "/organization-profile",
          children: [
            {
              id: "org-profile",
              label: "Profil & Sejarah",
              href: "/organization-profile",
            },
            {
              id: "vision-mission",
              label: "Visi & Misi",
              href: "/vision-mission",
            },
            {
              id: "structure",
              label: "Struktur Pengurus (DPP/DPD)",
              href: "/structure",
            },
            {
              id: "ad-art",
              label: "AD/ART & Kode Etik",
              href: "/ad-art",
            },
          ],
        },
        {
          id: "membership",
          label: "Keanggotaan",
          href: "/join",
          children: [
            {
              id: "tech-locator",
              label: "Cari Teknisi AC Terverifikasi",
              href: "/technicians",
            },
            {
              id: "verify-kta",
              label: "Verifikasi KTA & Kredensial",
              href: "/verify",
            },
            {
              id: "lender-verifier",
              label: "Direktori Mitra & Distributor Resmi",
              href: "/partners",
            },
            { id: "join-terms", label: "Syarat & Pendaftaran", href: "/join" },
            {
              id: "member-portal",
              label: "Portal Anggota",
              href: "/member/login",
            },
          ],
        },
        {
          id: "services",
          label: "Layanan & Data",
          href: "/working-groups",
          children: [
            {
              id: "working-groups",
              label: "Kelompok Kerja (Pokja) Advokasi",
              href: "/working-groups",
            },
            {
              id: "regulations-list",
              label: "Regulasi Pemerintah & Standar SNI",
              href: "/regulations?kategori=regulasi-pemerintah",
            },
            {
              id: "se-list",
              label: "Surat Edaran Resmi (SE)",
              href: "/regulations?kategori=surat-edaran",
            },
            {
              id: "policy-papers",
              label: "Naskah Kebijakan",
              href: "/regulations?kategori=naskah-kebijakan",
            },
            {
              id: "industry-stats",
              label: "Statistik Industri Sektor",
              href: "/statistics",
            },
            {
              id: "calculator",
              label: "Kalkulator PK AC & Data Freon",
              href: "/calculator",
            },
            {
              id: "public-complaints",
              label: "Pengaduan Etik JENDELA",
              href: "/complaints",
            },
            {
              id: "events-list",
              label: "Agenda Workshop & Sertifikasi",
              href: "/events",
            },
            {
              id: "championships",
              label: "Kejuaraan & Skill Contest",
              href: "/championships",
            },
          ],
        },
        { id: "stories", label: "Berita", href: "/stories", children: [] },
      ],
      footer: {
        description:
          "Asosiasi Pengusaha & Teknisi Pendingin Indonesia (APTI). Mewujudkan teknisi AC & pendingin Indonesia yang kompeten, bersertifikat BNSP, dan berstandar internasional.",
        copyright: `© ${now.getFullYear()} APTI Indonesia (Asosiasi Pengusaha & Teknisi Pendingin Indonesia). All rights reserved.`,
        links: [
          { label: "Agenda Pelatihan & Sertifikasi", href: "/events" },
          { label: "Struktur DPP & DPD Provinsi", href: "/structure" },
          { label: "Cek KTA Digital Teknisi", href: "/verify" },
        ],
      },
    });

    // 2. Admin Users
    const adminUsers = await tx
      .insert(users)
      .values([
        {
          name: "Administrator Organisasi",
          email: "admin@organization.org",
          passwordHash: defaultHash,
          status: "active",
          emailVerifiedAt: now,
        },
        {
          name: "Sekretariat DPP APTI Indonesia",
          email: "admin@demo.openorg",
          passwordHash: demoHash,
          status: "active",
          emailVerifiedAt: now,
        },
        {
          name: "Pengurus Pusat APTI",
          email: "sekretariat@apti.or.id",
          passwordHash: defaultHash,
          status: "active",
          emailVerifiedAt: now,
        },
      ])
      .returning();

    if (!adminUsers.length) throw new Error("Could not create admin users");
    const owner = adminUsers[0]!;

    const [ownerRole] = await tx
      .insert(roles)
      .values({
        name: "Administrator Organisasi",
        description: "Akses penuh manajemen asosiasi APTI Indonesia",
        isSystem: true,
      })
      .returning();
    if (!ownerRole) throw new Error("Could not create owner role");

    const permissionSeeds = [
      ["*", "Akses penuh platform"],
      ["pages.read", "Melihat halaman"],
      ["pages.write", "Kelola halaman"],
      ["contents.read", "Melihat berita & artikel"],
      ["contents.write", "Kelola berita & artikel"],
      ["events.read", "Melihat agenda & sertifikasi"],
      ["events.write", "Kelola agenda & sertifikasi"],
      ["members.read", "Melihat data teknisi terdaftar"],
      ["members.write", "Kelola data teknisi & KTA"],
      ["credentials.read", "Melihat sertifikat BNSP"],
      ["credentials.write", "Kelola sertifikat & lisensi"],
      ["credentials.verify", "Verifikasi KTA & sertifikat"],
      ["governance.read", "Melihat struktur pengurus DPP/DPD"],
      ["governance.write", "Kelola unit & posisi DPP/DPD"],
      ["learning.read", "Melihat pelatihan & SKP"],
      ["learning.write", "Kelola pelatihan & SKP"],
      ["revenue.read", "Melihat iuran & sponsorship"],
      ["revenue.write", "Kelola iuran & sponsorship"],
      ["settings.write", "Kelola profil & identitas organisasi"],
      ["users.manage", "Kelola pengurus & hak akses"],
    ] as const;

    const createdPermissions = await tx
      .insert(permissions)
      .values(
        permissionSeeds.map(([key, description]) => ({ key, description })),
      )
      .returning();

    await tx.insert(rolePermissions).values(
      createdPermissions.map((permission) => ({
        roleId: ownerRole.id,
        permissionId: permission.id,
      })),
    );

    await tx.insert(userRoles).values(
      adminUsers.map((u) => ({
        userId: u.id,
        roleId: ownerRole.id,
      })),
    );

    // 3. Organization Units (DPP, DPD & Korwil)
    const [dppUnit, dpdJabar, dpdJatim, dpdDki, dpcBdg] = await tx
      .insert(organizationUnits)
      .values([
        {
          name: "Dewan Pimpinan Pusat (DPP APTI Indonesia)",
          slug: "dpp",
          code: "DPP",
          type: "national",
          description:
            "Pengurus Pusat Asosiasi Pengusaha & Teknisi Pendingin Indonesia",
          sortOrder: 1,
        },
        {
          name: "DPD APTI Jawa Barat",
          slug: "dpd-jabar",
          code: "DPD-JABAR",
          type: "regional",
          description: "Dewan Pimpinan Daerah APTI Provinsi Jawa Barat",
          sortOrder: 2,
        },
        {
          name: "DPD APTI Jawa Timur",
          slug: "dpd-jatim",
          code: "DPD-JATIM",
          type: "regional",
          description: "Dewan Pimpinan Daerah APTI Provinsi Jawa Timur",
          sortOrder: 3,
        },
        {
          name: "DPD APTI DKI Jakarta",
          slug: "dpd-dki",
          code: "DPD-DKI",
          type: "regional",
          description: "Dewan Pimpinan Daerah APTI Provinsi DKI Jakarta",
          sortOrder: 4,
        },
        {
          name: "Korwil Bandung Raya (DPC)",
          slug: "dpc-bdg",
          code: "DPC-BDG",
          type: "chapter",
          description: "Koordinator Wilayah Bandung Raya & Kota Cimahi",
          sortOrder: 5,
        },
      ])
      .returning();
    let demoMember: typeof members.$inferSelect | undefined;

    if (dppUnit && dpdJabar && dpdJatim && dpdDki && dpcBdg) {
      await tx
        .update(organizationUnits)
        .set({ parentId: dppUnit.id })
        .where(eq(organizationUnits.id, dpdJabar.id));
      await tx
        .update(organizationUnits)
        .set({ parentId: dppUnit.id })
        .where(eq(organizationUnits.id, dpdJatim.id));
      await tx
        .update(organizationUnits)
        .set({ parentId: dppUnit.id })
        .where(eq(organizationUnits.id, dpdDki.id));
      await tx
        .update(organizationUnits)
        .set({ parentId: dpdJabar.id })
        .where(eq(organizationUnits.id, dpcBdg.id));

      // Positions
      const [ketuaUmum, sekjen, ketuaJabar, ketuaJatim] = await tx
        .insert(positions)
        .values([
          {
            unitId: dppUnit.id,
            title: "Ketua Umum DPP APTI",
            description:
              "Memimpin arah strategis organisasi dan hubungan kelembagaan nasional",
            sortOrder: 1,
          },
          {
            unitId: dppUnit.id,
            title: "Sekretaris Jenderal DPP",
            description:
              "Mengkoordinasikan sekretariat dan operasional organisasi nasional",
            sortOrder: 2,
          },
          {
            unitId: dpdJabar.id,
            title: "Ketua DPD APTI Jawa Barat",
            description:
              "Memimpin jaringan teknisi dan kegiatan wilayah Jawa Barat",
            sortOrder: 1,
          },
          {
            unitId: dpdJatim.id,
            title: "Ketua DPD APTI Jawa Timur",
            description:
              "Memimpin jaringan teknisi dan kegiatan wilayah Jawa Timur",
            sortOrder: 1,
          },
        ])
        .returning();

      // Seed Members (Teknisi APTI)
      const createdMembers = await tx
        .insert(members)
        .values([
          {
            unitId: dppUnit.id,
            memberNumber: "KTA-APTI-DPP-001",
            name: "Ir. H. Nanang Varian Supriadi",
            email: "nanang@apti.or.id",
            phone: "+6281290001980",
            joinedAt: new Date("2018-05-10"),
            status: "active",
            metadata: {
              competency: "Master Auditor HVAC & Chiller System",
              certificateNumber: "BNSP-HVAC-2024-0019",
              company: "PT Central Pendingin Nusantara",
            },
          },
          {
            unitId: dppUnit.id,
            memberNumber: "KTA-APTI-DPP-002",
            name: "M. Ridwan Syah, ST",
            email: "ridwan@apti.or.id",
            phone: "+6281388991100",
            joinedAt: new Date("2019-02-14"),
            status: "active",
            metadata: {
              competency: "Asesor Sertifikasi Kompetensi BNSP",
              certificateNumber: "BNSP-HVAC-2024-0082",
              company: "CV Teknik Utama HVAC",
            },
          },
          {
            unitId: dpdJabar.id,
            memberNumber: "KTA-APTI-JABAR-0142",
            name: "Dedi Kurniawan, S.Pd",
            email: "dedi.jabar@apti.or.id",
            phone: "+6281577889900",
            joinedAt: new Date("2020-08-20"),
            status: "active",
            metadata: {
              competency: "Teknisi Senior AC Inverter & VRV/VRF",
              certificateNumber: "BNSP-HVAC-2025-0142",
              company: "Jabar Aircon Service",
            },
          },
          {
            unitId: dpdJatim.id,
            memberNumber: "KTA-APTI-JATIM-0285",
            name: "H. Eko Susilo, MT",
            email: "eko.jatim@apti.or.id",
            phone: "+6281233445566",
            joinedAt: new Date("2021-03-12"),
            status: "active",
            metadata: {
              competency: "Spesialis Cold Storage & Industrial Refrigeration",
              certificateNumber: "BNSP-HVAC-2025-0285",
              company: "Surabaya Pendingin Jaya",
            },
          },
        ])
        .returning();

      if (
        ketuaUmum &&
        sekjen &&
        ketuaJabar &&
        ketuaJatim &&
        createdMembers[0] &&
        createdMembers[1] &&
        createdMembers[2] &&
        createdMembers[3]
      ) {
        await tx.insert(positionAssignments).values([
          {
            positionId: ketuaUmum.id,
            memberId: createdMembers[0].id,
            startsAt: new Date("2024-01-01"),
          },
          {
            positionId: sekjen.id,
            memberId: createdMembers[1].id,
            startsAt: new Date("2024-01-01"),
          },
          {
            positionId: ketuaJabar.id,
            memberId: createdMembers[2].id,
            startsAt: new Date("2024-01-01"),
          },
          {
            positionId: ketuaJatim.id,
            memberId: createdMembers[3].id,
            startsAt: new Date("2025-01-01"),
          },
        ]);

        // Create Member Accounts & Digital KTA Cards for members
        for (const member of createdMembers) {
          if (member.email) {
            await tx.insert(memberAccounts).values({
              memberId: member.id,
              email: member.email,
              passwordHash: defaultHash,
              status: "active",
            });
          }
          await tx.insert(membershipCards).values({
            memberId: member.id,
            code: member.memberNumber,
            version: 1,
            isActive: true,
            issuedAt: member.joinedAt ?? now,
          });
        }

        // Demo Member Account for instant live testing
        const [demoMemberRow] = await tx
          .insert(members)
          .values({
            unitId: dppUnit.id,
            memberNumber: "KTA-APTI-DEMO-007",
            name: "Budi Pratama (Demo Member)",
            email: "member@demo.openorg",
            phone: "+6281299887766",
            joinedAt: now,
            status: "active",
            metadata: {
              competency: "Teknisi Pendingin Residensial & Komersial",
              certificateNumber: "BNSP-HVAC-2026-DEMO",
              company: "Demo Cool Engineering",
            },
          })
          .returning();

        demoMember = demoMemberRow;

        if (demoMember) {
          await tx.insert(memberAccounts).values({
            memberId: demoMember.id,
            email: "member@demo.openorg",
            passwordHash: demoHash,
            status: "active",
          });
          await tx.insert(membershipCards).values({
            memberId: demoMember.id,
            code: demoMember.memberNumber,
            version: 1,
            isActive: true,
            issuedAt: now,
          });
        }
      }
    }

    // 4. Agenda & Sertifikasi APTI
    const seededEvents = await tx
      .insert(events)
      .values([
        {
          title: "Uji Kompetensi & Sertifikasi Teknisi Pendingin BNSP 2026",
          slug: "uji-kompetensi-sertifikasi-bnsp-2026",
          description:
            "Sertifikasi kompetensi resmi LSP-HVAC dan BNSP untuk teknisi AC Split, VRV/VRF, dan Cold Storage. Peserta yang lulus berhak mendapatkan sertifikat BNSP dan KTA Digital APTI.",
          locationName: "Gedung Balai Latihan Kerja (BLK) Jakarta Pusat",
          startsAt: new Date(now.getTime() + 86_400_000 * 12),
          endsAt: new Date(now.getTime() + 86_400_000 * 12 + 28_800_000),
          status: "published",
          publishedAt: now,
          capacity: 100,
        },
        {
          title:
            "Workshop Penanganan Flammable Refrigerant (R290 & R32) dan K3 Kerja",
          slug: "workshop-flammable-refrigerant-r290-r32",
          description:
            "Bimbingan teknis penggunaan freon ramah lingkungan R32 dan Hydrocarbon R290 dengan standar keselamatan K3 tinggi untuk mencegah risiko kecelakaan kerja.",
          locationName: "Hotel Santika Premier Surabaya & Daring via Zoom",
          startsAt: new Date(now.getTime() + 86_400_000 * 20),
          endsAt: new Date(now.getTime() + 86_400_000 * 20 + 18_000_000),
          status: "published",
          publishedAt: now,
          capacity: 250,
        },
        {
          title: "Musyawarah Nasional (MUNAS) & Rakernas APTI Indonesia 2026",
          slug: "munas-rakernas-apti-indonesia-2026",
          description:
            "Pertemuan akbar seluruh Pengurus DPP, DPD 38 Provinsi, dan Korwil Cabang APTI Indonesia untuk menyusun arah kebijakan dan kemitraan dengan produsen AC terkemuka.",
          locationName: "Grand Ballroom Hotel Patra Semarang",
          startsAt: new Date(now.getTime() + 86_400_000 * 45),
          endsAt: new Date(now.getTime() + 86_400_000 * 47),
          status: "published",
          publishedAt: now,
          capacity: 500,
        },
      ])
      .returning();

    // 4.1. Learning Credit Schemes & Activities (SKP CPD BNSP)
    const [schemeBnsp, schemeEco] = await tx
      .insert(learningCreditSchemes)
      .values([
        {
          code: "SKP_CPD_BNSP",
          name: "Satuan Kredit Profesi (SKP) BNSP / LSP TPTU",
          unitName: "SKP",
          description:
            "Kredit pengembangan keprofesian berkelanjutan resmi BNSP & LSP TPTU Indonesia.",
        },
        {
          code: "SKP_ECO_FREON",
          name: "Sertifikasi K3 & Flammable Refrigerant R290",
          unitName: "SKP",
          description:
            "Kredit kompetensi penanganan freon ramah lingkungan dan standar keselamatan kerja.",
        },
      ])
      .returning();

    if (seededEvents.length > 0 && schemeBnsp) {
      const seededActivities = await tx
        .insert(learningActivities)
        .values([
          {
            eventId: seededEvents[0]?.id,
            creditSchemeId: schemeBnsp.id,
            title: "Uji Kompetensi & Sertifikasi Teknisi Pendingin BNSP 2026",
            code: "BNSP-2026-001",
            deliveryMode: "onsite",
            creditAmountHundredths: 400,
            capacity: 100,
            status: "open",
            startsAt: new Date(now.getTime() + 86_400_000 * 12),
            endsAt: new Date(now.getTime() + 86_400_000 * 12 + 28_800_000),
          },
          {
            eventId: seededEvents[1]?.id,
            creditSchemeId: schemeEco?.id ?? schemeBnsp.id,
            title:
              "Workshop Penanganan Flammable Refrigerant (R290 & R32) dan K3 Kerja",
            code: "WS-R290-2026",
            deliveryMode: "hybrid",
            creditAmountHundredths: 600,
            capacity: 250,
            status: "open",
            startsAt: new Date(now.getTime() + 86_400_000 * 20),
            endsAt: new Date(now.getTime() + 86_400_000 * 20 + 18_000_000),
          },
          {
            eventId: seededEvents[2]?.id,
            creditSchemeId: schemeBnsp.id,
            title: "Musyawarah Nasional (MUNAS) & Rakernas APTI Indonesia 2026",
            code: "MUNAS-2026",
            deliveryMode: "onsite",
            creditAmountHundredths: 200,
            capacity: 500,
            status: "open",
            startsAt: new Date(now.getTime() + 86_400_000 * 45),
            endsAt: new Date(now.getTime() + 86_400_000 * 47),
          },
        ])
        .returning();

      // Seed sample enrollment for demo member
      if (demoMember && seededActivities.length > 0) {
        await tx.insert(learningEnrollments).values({
          activityId: seededActivities[0]!.id,
          memberId: demoMember.id,
          status: "registered",
        });

        // Seed initial ledger points (+8 SKP)
        await tx.insert(learningCreditLedger).values({
          memberId: demoMember.id,
          schemeId: schemeBnsp.id,
          activityId: seededActivities[0]!.id,
          entryType: "earned",
          creditAmountHundredths: 800,
          notes:
            "Kredit awal lulus Sertifikasi Teknisi Junior AC Split SKKNI Level 1",
        });
      }
    }

    // 5. Berita & Artikel Teknis HVAC/R
    await tx.insert(contents).values([
      {
        title:
          "APTI Indonesia Resmikan Program Akselerasi 10.000 Teknisi AC Tersertifikasi BNSP 2026",
        slug: "apti-indonesia-target-10000-teknisi-bnsp",
        type: "news",
        authorName: "Sekretariat Jenderal DPP APTI",
        excerpt:
          "Program kolaborasi nasional DPP APTI dengan LSP TPTU dan Kemenaker guna mencetak teknisi pendingin berstandar kompetensi kerja nasional Indonesia (SKKNI).",
        body: `<p><strong>JAKARTA</strong> — Dewan Pengurus Pusat Asosiasi Pengusaha & Teknisi Pendingin Indonesia (DPP APTI) secara resmi mencanangkan program <em>Akselerasi 10.000 Teknisi Tersertifikasi BNSP</em> hingga akhir tahun 2026. Langkah ini diambil sebagai respons konkret terhadap tingginya kebutuhan industri refrigerasi komersial dan residensial akan tenaga kerja yang memiliki legitimasi keahlian berstandar negara.</p>
<h3>Sinergi Tripartit Ketenagakerjaan</h3>
<p>Dalam acara peresmian yang dihadiri perwakilan Kementerian Ketenagakerjaan, Badan Nasional Sertifikasi Profesi (BNSP), serta para pimpinan prinsipal pendingin terkemuka di Jakarta, Ketua Umum DPP APTI menegaskan bahwa sertifikasi bukan sekadar selembar kertas pengakuan, melainkan bukti kompetensi teknis, pemahaman K3, serta etika profesional teknisi.</p>
<blockquote><p>"Melalui sertifikasi BNSP berlogo Garuda Emas dan kepemilikan KTA Digital APTI, konsumen akan merasa aman karena unit pendinginnya ditangani oleh teknisi yang menguasai standar vakum &lt;500 mikron, brazing bebas oksidasi, dan penanganan refrigeran yang aman."</p></blockquote>
<h3>Fasilitasi Uji Kompetensi di Seluruh DPD</h3>
<p>Program ini mencakup penyelenggaraan uji kompetensi bersubsidi di 38 provinsi melalui Tempat Uji Kompetensi (TUK) Balai Latihan Kerja dan SMK Pusat Keunggulan yang telah terverifikasi. Anggota aktif APTI berhak memperoleh subsidi biaya asesmen hingga 40% dari kas pemberdayaan asosiasi.</p>`,
        coverUrl:
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-08-24T08:30:00.000Z"),
        authorId: owner.id,
      },
      {
        title:
          "Standard Operating Procedure (SOP) Vakum & Recovery Freon R32 / R410A Bebas Emisi",
        slug: "sop-vacuuming-recovery-freon-r32",
        type: "post",
        authorName: "Pokja Standardisasi & K3 DPP APTI",
        excerpt:
          "Panduan teknis langkah demi langkah pemvakuman presisi di bawah 500 mikron untuk menjaga kestabilan oli sintetis POE dan efisiensi sistem AC inverter.",
        body: `<p>Proses pemvakuman (<em>evacuation</em>) adalah salah satu tahapan paling kritis dalam instalasi dan perbaikan sistem tata udara refrigerasi modern yang menggunakan kompresor inverter dan oli sintetis Polyolester (POE).</p>
<h3>Mengapa Pemvakuman di Bawah 500 Micron Wajib?</h3>
<p>Udara atmosfer mengandung gas nitrogen, oksigen, dan uap air (kelembapan). Jika uap air tertinggal di dalam pipa tembaga saat freon diisi, uap air akan bereaksi secara kimiawi dengan oli sintetis POE membentuk asam hidroklorat atau asam fluorat (<em>hydrofluoric acid</em>). Asam ini merusak isolasi lilitan email tembaga kompresor hingga menyebabkan kompresor short-body atau macet mekanis (<em>acid sludge</em>).</p>
<h3>Langkah-Langkah SOP Vakum APTI:</h3>
<ol>
  <li><strong>Gunakan Pompa Vakum 2-Stage:</strong> Pastikan oli pompa vakum dalam kondisi jernih dan mampu mencapai tingkat kevakuman minimal 50 mikron pada kondisi blank-off.</li>
  <li><strong>Pasang Digital Micron Gauge:</strong> Hindari mengandalkan jarum manifold analog jarum untuk mengukur vakum; gunakan sensor digital micron gauge pada titik terjauh dari pompa.</li>
  <li><strong>Target Kestabilan 500 Micron:</strong> Lakukan penarikan vakum hingga mikron gauge menunjukkan angka di bawah 500 micron, lalu tutup katup manifold dan lakukan <em>Vacuum Decay Test</em> selama 10 menit. Jika angka tidak naik di atas 1.000 micron, sistem terbebas dari kebocoran dan kelembapan.</li>
  <li><strong>Purging dengan Nitrogen Kering:</strong> Untuk sistem yang pernah mengalami kompresor jebol atau kemasukan air, lakukan proses nitrogen purging berulang (<em>triple evacuation</em>).</li>
</ol>`,
        coverUrl:
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-08-22T14:15:00.000Z"),
        authorId: owner.id,
      },
      {
        title:
          "Mengenal Refrigeran Alami R290 (Propana): Karakteristik Termodinamika & Standar Keselamatan K3",
        slug: "mengenal-refrigeran-ramah-lingkungan-r290-propana",
        type: "post",
        authorName: "Tim Riset Efisiensi Energi APTI",
        excerpt:
          "Analisis mendalam mengenai karakteristik termodinamika freon R290 dengan GWP mendekati nol, serta panduan pencegahan risiko mudah terbakar (flammability).",
        body: `<p>Seiring berlakunya Protokol Montreal Amandemen Kigali dan regulasi Kementerian Lingkungan Hidup dan Kehutanan (KLHK) tentang penghapusan Bahan Perusak Ozon (BPO) serta pembatasan HFC ber-GWP tinggi, industri refrigerasi dunia bergerak cepat menuju pemanfaatan <strong>Hydrocarbon R290 (Propane)</strong>.</p>
<h3>Keunggulan Termodinamika R290</h3>
<p>R290 memiliki <em>Global Warming Potential (GWP)</em> sebesar 3 dan <em>Ozone Depletion Potential (ODP)</em> nol. Selain ramah lingkungan, massa jenis refrigeran R290 lebih ringan sekitar 40-50% dibanding R22 atau R410A untuk kapasitas pendinginan yang sama. Hal ini membuat kompresor bekerja lebih enteng dan menghasilkan efisiensi energi (EER) hingga 15% lebih hemat listrik.</p>
<h3>Protokol K3 Wajib untuk Teknisi:</h3>
<ul>
  <li>Dilarang keras menyalakan api torch las atau merokok dalam radius 5 meter saat proses pelepasan sisa freon.</li>
  <li>Wajib menggunakan blower ventilasi anti-percikan (<em>explosion-proof fan</em>) di area ruang tertutup.</li>
  <li>Gunakan koneksi <em>flare</em> mekanis berstandar tinggi atau alat <em>lokring ring-lock</em> tanpa api saat penyambungan pipa R290.</li>
</ul>`,
        coverUrl:
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-08-20T10:00:00.000Z"),
        authorId: owner.id,
      },
      {
        title:
          "Kunjungan Kerja DPP APTI ke Balai Latihan Vokasi: Siapkan Lab Uji VRV & Chiller Canggih",
        slug: "kunjungan-kerja-dpp-apti-ke-balai-vokasi-vrv",
        type: "news",
        authorName: "Biro Humas & Publikasi APTI",
        excerpt:
          "DPP APTI bersama pengelola Balai Latihan Vokasi Kemenaker meresmikan fasilitas Tempat Uji Kompetensi (TUK) Mandiri berstandar industri komersial di Jawa Timur dan Jawa Barat.",
        body: `<p><strong>SURABAYA</strong> — Jajaran Pengurus DPP APTI bersama pimpinan DPD Jawa Timur melakukan peninjauan kesiapan fasilitas workshop Balai Latihan Kerja Vokasi sebagai pusat Tempat Uji Kompetensi (TUK) Mandiri untuk skema teknisi komersial kelas industri berat.</p>
<p>Fasilitas lab baru ini dilengkapi simulator sistem <em>Variable Refrigerant Volume (VRV/VRF)</em> multi-indoor, unit <em>water-cooled chiller</em>, serta stasiun pengelasan pipa tembaga berdiameter 1-1/8 inch dengan kontrol gas nitrogen terintegrasi.</p>
<p>Kerjasama ini memastikan bahwa teknisi daerah yang hendak mengambil sertifikasi Level 3 (Teknisi Utama Komersial) tidak perlu lagi melakukan perjalanan jauh ke Jakarta untuk mengikuti asesmen praktik langsung.</p>`,
        coverUrl:
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-08-18T16:00:00.000Z"),
        authorId: owner.id,
      },
      {
        title:
          "DPD APTI Jawa Barat Gelar Musda & Workshop Troubleshooting Modul Inverter PCB di Bandung",
        slug: "dpd-apti-jabar-musda-workshop-inverter-bandung",
        type: "news",
        authorName: "DPD APTI Jawa Barat",
        excerpt:
          "Lebih dari 180 teknisi se-Bandung Raya antusias mengikuti bedah skema kelistrikan IPM, IGBT modul, dan teknik bypass proteksi kompresor inverter.",
        body: `<p><strong>BANDUNG</strong> — DPD APTI Jawa Barat sukses menyelenggarakan Musyawarah Daerah (MUSDA) sekaligus Masterclass Teknis Perbaikan Modul Elektronika Inverter AC di Grand Ballroom Hotel Savoy Homann, Bandung.</p>
<p>Pelatihan yang dipandu langsung oleh instruktur senior bidang mikrokontroler HVAC mengupas tuntas teknik pengukuran resistansi 3-phase kompresor inverter, penanganan error komunikasi DC bus voltage, serta metode penggantian komponen <em>Intelligent Power Module (IPM)</em> tanpa harus mengganti seluruh papan PCB outdoor yang berharga mahal.</p>
<p>Ketua DPD Jabar menegaskan bahwa penguasaan modul inverter adalah pembeda utama antara teknisi profesional dengan tukang servis konvensional di era AC hemat listrik saat ini.</p>`,
        coverUrl:
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-08-15T09:30:00.000Z"),
        authorId: owner.id,
      },
      {
        title:
          "Waspada Kebiasaan Fatal: Mengapa Uji Tekanan Sistem AC Dilarang Keras Memakai Gas Oksigen",
        slug: "larangan-uji-tekanan-sistem-ac-menggunakan-oksigen",
        type: "post",
        authorName: "Dewan Etik & Advokasi K3 Teknisi",
        excerpt:
          "Penjelasan reaksi eksplosif antara oli kompresor mineral/POE bertekanan tinggi dengan oksigen murni, dan mengapa Nitrogen Kering (OFND) adalah kewajiban mutlak.",
        body: `<p>Masih ditemukan kasus kecelakaan kerja fatal di lapangan di mana teknisi menggunakan tabung gas oksigen (O2) las karbit untuk melakukan pengetesan tekanan (<em>pressure test</em>) kebocoran instalasi pipa AC. DPP APTI mengeluarkan peringatan keras mengenai bahaya maut dari tindakan malpraktik ini.</p>
<h3>Reaksi Kimia Ledakan Spontan (Diesel Effect)</h3>
<p>Oli pelumas kompresor pendingin (baik Mineral Oil, Alkylbenzene, maupun POE) adalah senyawa hidrokarbon yang sangat mudah terbakar ketika berada di bawah tekanan tinggi dalam atmosfer kaya oksigen murni.</p>
<p>Ketika gas oksigen bertekanan tinggi dimasukkan ke dalam pipa yang mengandung residu oli, kontak langsung tersebut dapat memicu <strong>pembakaran spontan (auto-ignition)</strong> tanpa perlu adanya percikan api luar. Tekanan ledakan yang dihasilkan dapat menghancurkan casing evaporator dan pipa tembaga seketika, mengancam keselamatan jiwa teknisi.</p>
<h3>Standar Uji Tekanan Resmi:</h3>
<p>Wajib menggunakan <strong>Gas Nitrogen Kering (Oxygen-Free Nitrogen / OFND)</strong> dengan regulator tekanan tinggi bersertifikat uji 600 PSI. Nitrogen adalah gas inert (tidak reaktif) yang menyerap kelembapan dan 100% aman dari risiko ledakan.</p>`,
        coverUrl:
          "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-08-12T11:00:00.000Z"),
        authorId: owner.id,
      },
      {
        title:
          "Siaran Pers: Pembentukan Pokja JENDELA untuk Perlindungan Konsumen & Standardisasi Jasa Servis",
        slug: "siaran-pers-pembentukan-pokja-jendela-konsumen",
        type: "news",
        authorName: "Dewan Pertimbangan Organisasi APTI",
        excerpt:
          "Langkah strategis asosiasi dalam membasmi praktik oknum servis abal-abal melalui integrasi KTA Digital dan verifikasi barcode pada unit servis.",
        body: `<p><strong>JAKARTA</strong> — Menyikapi maraknya keluhan masyarakat mengenai oknum penyedia jasa servis AC yang melakukan vonis ganti kompresor fiktif atau pengisian freon tanpa indikasi kebocoran, APTI Indonesia resmi meluncurkan satuan tugas <strong>JENDELA (Jaringan Edukasi & Pengawasan Pelayanan Etik Anggota)</strong>.</p>
<p>Melalui kanal pengaduan publik yang terintegrasi di website resmi OpenOrg/APTI, konsumen kini dapat melaporkan nomor KTA teknisi atau scan barcode servis untuk memeriksa keaslian tarif dan garansi pekerjaan.</p>
<p>Teknisi yang terbukti melanggar kode etik akan dikenakan sanksi pencabutan KTA Digital dan penonaktifan akses kredensial verifikasi publik.</p>`,
        coverUrl:
          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-08-08T13:45:00.000Z"),
        authorId: owner.id,
      },
      {
        title:
          "Panduan Keselamatan K3: Bekerja pada Ketinggian (Working at Height) saat Instalasi Outdoor AC",
        slug: "panduan-keselamatan-k3-bekerja-pada-ketinggian-outdoor-ac",
        type: "post",
        authorName: "Tim Keselamatan Kerja & Standardisasi K3",
        excerpt:
          "Kewajiban penggunaan Full Body Harness double lanyard dan anchor point tersertifikasi saat pemasangan bracket outdoor di gedung bertingkat.",
        body: `<p>Pemasangan unit outdoor AC di apartemen dan gedung komersial menuntut disiplin K3 tinggi. Sesuai Permenaker No. 9 Tahun 2016, teknisi pendingin yang bekerja pada ketinggian lebih dari 1,8 meter wajib mengantongi kompetensi Tenaga Kerja Bangunan Tinggi (TKBT).</p>
<h3>Perlengkapan APD Wajib:</h3>
<ul>
  <li>Full body harness dengan shock absorber dan double hook lanyard.</li>
  <li>Helm pelindung kepala (safety helmet) dengan tali dagu 4 titik.</li>
  <li>Sepatu safety beralas karet anti-slip dengan pelindung jari kaki (steel toe).</li>
  <li>Safety glasses dan sarung tangan kerja anti-abrasi.</li>
</ul>`,
        coverUrl:
          "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-08-05T08:15:00.000Z"),
        authorId: owner.id,
      },
      {
        title:
          "DPD APTI Jawa Timur Luncurkan Program Bantuan Alat Kerja Digital Manifold & Vakum Komunitas",
        slug: "dpd-apti-jatim-luncurkan-program-bantuan-alat-kerja-vakum",
        type: "news",
        authorName: "DPD APTI Jawa Timur",
        excerpt:
          "Penyaluran 50 set peralatan servis modern bersubsidi bagi anggota muda dan koperasi teknisi perintis di wilayah Jawa Timur.",
        body: `<p><strong>SURABAYA</strong> — Sebagai komitmen nyata dalam memajukan taraf hidup dan profesionalisme teknisi daerah, DPD APTI Jawa Timur menyalurkan 50 paket alat kerja standar presisi tinggi kepada komunitas teknisi muda di 12 kabupaten/kota.</p>
<p>Bantuan mencakup digital manifold gauge, pompa vakum 2-stage bersertifikasi CE, flaring tool eccentric, dan recovery machine portable.</p>`,
        coverUrl:
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-08-01T10:20:00.000Z"),
        authorId: owner.id,
      },
      {
        title:
          "Rekomendasi Ketebalan Pipa Tembaga ASTM B280 untuk Instalasi Freon Tekanan Tinggi R32 / R410A",
        slug: "rekomendasi-standar-pipa-tembaga-astm-b280-inverter-r32",
        type: "post",
        authorName: "Divisi Riset Material & Komponen APTI",
        excerpt:
          "Mengapa penggunaan pipa di bawah 0.61mm sangat berisiko pecah akibat tekanan kerja freon R32 yang mencapai 450 PSI pada kondisi ekstrem.",
        body: `<p>Freon R32 dan R410A beroperasi pada tekanan kerja sekitar 1,6 kali lipat lebih tinggi dibandingkan freon R22 generasi lama. Menggunakan pipa tembaga tipis (ketebalan 0.5mm atau kurang) adalah penyebab utama kebocoran mikroskopis dan ledakan pipa saat beban puncak musim kemarau.</p>
<p>APTI mewajibkan penggunaan pipa tembaga berkode ASTM B280 dengan ketebalan minimal 0.61mm (grade H atau setara) demi menjamin keamanan dan masa pakai unit di atas 10 tahun.</p>`,
        coverUrl:
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80",
        status: "published",
        publishedAt: new Date("2026-07-28T14:00:00.000Z"),
        authorId: owner.id,
      },
    ]);

    // 6. Regulasi, AD/ART & Surat Edaran (APINDO, APPI, APJII, AFPI, ASISI)
    await tx.insert(regulations).values([
      {
        title:
          "Anggaran Dasar & Anggaran Rumah Tangga (AD/ART) APTI Indonesia 2026",
        slug: "ad-art-apti-indonesia-2026",
        category: "ad_art",
        number: "001/TAP-MUNAS/APTI/2026",
        issuedDate: new Date("2026-01-15"),
        summary:
          "Landasan hukum, asas, tujuan, hak & kewajiban anggota, serta struktur kepengurusan DPP, DPD, dan Korwil APTI Indonesia.",
        fileUrl:
          "https://raw.githubusercontent.com/RiprLutuk/openorg/main/docs/sample-ad-art.pdf",
        downloadCount: 1420,
        status: "published",
      },
      {
        title:
          "Peraturan Menteri LHK No. 73 Tahun 2024 tentang Pengolahan & Pengurangan Bahan Perusak Ozon (BPO)",
        slug: "permen-lhk-73-2024-pengurangan-bpo",
        category: "regulasi_pemerintah",
        number: "Permen LHK No. 73/2024",
        issuedDate: new Date("2024-11-10"),
        summary:
          "Regulasi wajib uji kompetensi dan sertifikasi BNSP bagi setiap teknisi HVAC/R di Indonesia guna mendukung pemulihan lapisan ozon.",
        fileUrl:
          "https://raw.githubusercontent.com/RiprLutuk/openorg/main/docs/permen-lhk-73-2024.pdf",
        downloadCount: 890,
        status: "published",
      },
      {
        title:
          "Surat Edaran DPP APTI: Standar Biaya Jasa Servis & Keselamatan Kerja K3 Teknisi",
        slug: "se-dpp-apti-standar-biaya-servis-k3",
        category: "se_organisasi",
        number: "SE/012/DPP-APTI/II/2026",
        issuedDate: new Date("2026-02-01"),
        summary:
          "Pedoman acuan honorarium standar minimum perbaikan AC Split, Central, dan perlengkapan APD wajib K3 saat bertugas.",
        fileUrl:
          "https://raw.githubusercontent.com/RiprLutuk/openorg/main/docs/se-standar-biaya-k3.pdf",
        downloadCount: 2310,
        status: "published",
      },
      {
        title:
          "Naskah Kebijakan (Policy Paper): Insentif Pajak Produk HVAC Ramah Lingkungan R290",
        slug: "policy-paper-insentif-pajak-hvac-r290",
        category: "posisi_kebijakan",
        number: "PP/004/ADVOKASI-APTI/2026",
        issuedDate: new Date("2026-02-18"),
        summary:
          "Rekomendasi resmi APTI kepada Kementerian Keuangan & Kemenperin untuk pembebasan bea masuk suku cadang AC ramah lingkungan.",
        fileUrl:
          "https://raw.githubusercontent.com/RiprLutuk/openorg/main/docs/policy-paper-r290.pdf",
        downloadCount: 450,
        status: "published",
      },
    ]);

    // 7. Pengaduan Masyarakat & Kode Etik Desk (AFPI, APITU, ASISI)
    await tx.insert(publicComplaints).values([
      {
        ticketNumber: "CMP-2026-0081",
        complainantName: "Budi Santoso",
        complainantEmail: "budi.santoso@gmail.com",
        complainantPhone: "081299887766",
        targetType: "technician",
        targetIdentifier: "Budi Kurniawan (APTI-2026-0004)",
        category: "layanan_teknisi",
        description:
          "Pengaduan pengerjaan cuci AC tidak dingin di area Kelapa Gading dan tidak memberikan garansi sesuai komitmen KTA APTI.",
        status: "under_review",
        responseNotes:
          "Sekretariat DPD DKI Jakarta telah menghubungi pihak teknisi untuk memverifikasi garansi pengerjaan ulang.",
      },
      {
        ticketNumber: "CMP-2026-0094",
        complainantName: "Siti Rahmawati",
        complainantEmail: "siti.rahma@yahoo.com",
        complainantPhone: "085711223344",
        targetType: "member",
        targetIdentifier: "PT Cold Chain Indonesia",
        category: "kode_etik",
        description:
          "Laporan penggunaan refrigerant ilegal R22 tanpa izin pengolahan lingkungan hidup.",
        status: "mediated",
        responseNotes:
          "Tim Etik DPP APTI telah melakukan inspeksi TUK dan menerbitkan teguran tertulis.",
      },
    ]);

    // 8. Klasemen Kejuaraan & Skill Competition Standings (IMI, ASISI, APITU)
    await tx.insert(championshipStandings).values([
      {
        seasonYear: 2026,
        category:
          "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
        participantName: "Budi Kurniawan",
        teamName: "APTI DPD DKI Jakarta - Team Alpha",
        unitName: "DPD DKI Jakarta",
        points: 480,
        rank: 1,
        achievements:
          "Juara 1 Troubleshooting Inverter AC & Waktu Vakum Tercepat (08:42 menit)",
      },
      {
        seasonYear: 2026,
        category:
          "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
        participantName: "Agus Pratama",
        teamName: "APTI DPD Jawa Barat - Bandung Technicians",
        unitName: "DPD Jawa Barat",
        points: 445,
        rank: 2,
        achievements:
          "Juara 2 K3 Safety & Prosedur Brazing Tembaga Tanpa Oksidasi",
      },
      {
        seasonYear: 2026,
        category:
          "Kontes Keterampilan Teknisi Pendingin Nasional (Skill Contest 2026)",
        participantName: "Dewi Lestari",
        teamName: "APTI DPD Jawa Tengah - Semarang Cold Chain",
        unitName: "DPD Jawa Tengah",
        points: 410,
        rank: 3,
        achievements: "Juara 3 Perancangan Cold Room Industri Farmasi",
      },
    ]);

    // 9. Indikator Statistik Industri & Peering Traffic (APJII, APPI, idEA, FINTECH.ID)
    await tx.insert(industryStatistics).values([
      {
        metricKey: "certified_technicians",
        metricLabel: "Total Teknisi Bersertifikat BNSP",
        metricValue: "8,450",
        metricUnit: "Teknisi",
        trendDirection: "up",
        trendPercentage: "+18.5%",
        category: "Keanggotaan",
        period: "2026 Q1",
        sortOrder: 1,
      },
      {
        metricKey: "dpd_coverage",
        metricLabel: "Sebaran DPD & Korwil Provinsi",
        metricValue: "38 / 38",
        metricUnit: "Provinsi",
        trendDirection: "stable",
        trendPercentage: "100%",
        category: "Organisasi",
        period: "2026 Q1",
        sortOrder: 2,
      },
      {
        metricKey: "serviced_units_volume",
        metricLabel: "Volume Servis Unit AC Terverifikasi",
        metricValue: "142,800",
        metricUnit: "Unit AC/Bulan",
        trendDirection: "up",
        trendPercentage: "+24.2%",
        category: "Layanan Sektor",
        period: "2026 Q1",
        sortOrder: 3,
      },
      {
        metricKey: "public_satisfaction_rate",
        metricLabel: "Tingkat Kepuasan Pelanggan KTA APTI",
        metricValue: "98.4%",
        metricUnit: "Indeks Trust",
        trendDirection: "up",
        trendPercentage: "+2.1%",
        category: "Kualitas Service",
        period: "2026 Q1",
        sortOrder: 4,
      },
    ]);

    // 10. Kelompok Kerja / Pokja Advokasi (APINDO, AFTECH, idEA, AFPI)
    await tx.insert(workingGroups).values([
      {
        name: "Pokja Standardisasi Kompetensi & K3 HVAC",
        slug: "pokja-kompetensi-k3",
        chairName: "Hendra Wijaya, S.T., M.T.",
        category: "Standardisasi & Sertifikasi",
        description:
          "Merumuskan standar kurikulum uji kompetensi BNSP, K3 keselamatan kerja freon R290, dan sertifikasi teknisi tingkat nasional.",
        memberCount: 28,
        isActive: true,
      },
      {
        name: "Pokja Advokasi Kebijakan Lingkungan & Ozon (KLHK)",
        slug: "pokja-advokasi-klhk",
        chairName: "Dr. Ir. Rahmat Hidayat",
        category: "Advokasi & Regulatotif",
        description:
          "Mewakili asosiasi dalam audiensi bersama Kementerian LHK dan Kemenperin terkait transisi freon ramah lingkungan.",
        memberCount: 16,
        isActive: true,
      },
      {
        name: "Pokja Pengaduan Konsumen & Kode Etik",
        slug: "pokja-etik-konsumen",
        chairName: "Surya Pratama, S.H.",
        category: "Kode Etik & Mediasi",
        description:
          "Mengelola desk pengaduan publik JENDELA, melakukan investigasi pelanggaran KTA, dan mediasi klaim garansi.",
        memberCount: 12,
        isActive: true,
      },
    ]);

    // 11. Direktori Teknisi Terverifikasi / "Cari Teknisi" (ASISI, APITU)
    await tx.insert(technicianDirectories).values([
      {
        name: "Budi Kurniawan",
        ktaNumber: "APTI-2026-0004",
        skillLevel: "Level 4 Komersial & Inverter VRV",
        province: "DKI Jakarta",
        city: "Jakarta Selatan",
        phone: "081234567890",
        workshopName: "Jakarta Aircon Service Center",
        rating: "4.95",
        certifiedBnsp: true,
        isAvailable: true,
      },
      {
        name: "Agus Pratama",
        ktaNumber: "APTI-2026-0005",
        skillLevel: "Level 3 Residensial & Split",
        province: "Jawa Barat",
        city: "Bandung",
        phone: "081298765432",
        workshopName: "Bandung Cold Solution",
        rating: "4.88",
        certifiedBnsp: true,
        isAvailable: true,
      },
      {
        name: "Dewi Lestari",
        ktaNumber: "APTI-2026-0006",
        skillLevel: "Level 4 Chiller & Cold Storage",
        province: "Jawa Tengah",
        city: "Semarang",
        phone: "081311223344",
        workshopName: "Semarang Industrial HVAC",
        rating: "4.92",
        certifiedBnsp: true,
        isAvailable: true,
      },
    ]);

    // 12. Direktori Klub & Pengprov TKT (IMI, APITU)
    await tx.insert(registeredClubs).values([
      {
        clubName: "Teknisi Pendingin Jakarta Raya Club",
        codeTkt: "TKT-DPD-DKI-001",
        province: "DKI Jakarta",
        category: "Komunitas Teknisi & Workshop",
        chairName: "Budi Kurniawan",
        activeMembers: 142,
        status: "verified",
      },
      {
        clubName: "Bandung Cooling & Refrigeration Association",
        codeTkt: "TKT-DPD-JBR-002",
        province: "Jawa Barat",
        category: "Komunitas Teknisi & Workshop",
        chairName: "Agus Pratama",
        activeMembers: 98,
        status: "verified",
      },
    ]);

    // 13. Verifikasi Entity / Mitra Prinsipal & Distributor Resmi Sektor HVAC/R
    await tx.insert(lenderRegistries).values([
      {
        brandName: "Daikin Indonesia HVAC Partner",
        companyName: "PT Daikin Airconditioning Indonesia",
        licenseNumber: "SK-MITRA-DPP-001",
        sectorType: "Prinsipal & Manufaktur AC",
        ojkStatus: "Mitra Prinsipal Resmi",
        websiteUrl: "https://daikin.co.id",
        isAfpiMember: true,
      },
      {
        brandName: "Panasonic Cooling Solutions",
        companyName: "PT Panasonic Gobel Indonesia",
        licenseNumber: "SK-MITRA-DPP-002",
        sectorType: "Prinsipal & Manufaktur AC",
        ojkStatus: "Mitra Prinsipal Resmi",
        websiteUrl: "https://panasonic.com/id",
        isAfpiMember: true,
      },
      {
        brandName: "Danfoss Refrigeration Supply",
        companyName: "PT Danfoss Indonesia",
        licenseNumber: "SK-DIST-DPP-003",
        sectorType: "Distributor Komponen & Kompresor",
        ojkStatus: "Distributor Terakreditasi",
        websiteUrl: "https://danfoss.com",
        isAfpiMember: true,
      },
      {
        brandName: "Refco & Value Tools Indonesia",
        companyName: "PT Prima Alat Refrigerasi",
        licenseNumber: "SK-DIST-DPP-004",
        sectorType: "Penyedia Alat Kerja & Pompa Vakum",
        ojkStatus: "Distributor Terakreditasi",
        websiteUrl: "https://refco.ch",
        isAfpiMember: true,
      },
      {
        brandName: "Kredit Usaha Mandiri Alat HVAC",
        companyName: "PT Sinergi Pembiayaan Bengkel",
        licenseNumber: "KEP-102/D.05/2024",
        sectorType: "Pembiayaan Alat & Modal Bengkel",
        ojkStatus: "Berizin OJK & Rekanan Resmi",
        websiteUrl: "https://sinergipembiayaan.co.id",
        isAfpiMember: true,
      },
    ]);

    // 14. CMS Dynamic Custom Pages (Profil & Sejarah, Visi & Misi)
    await tx.insert(pages).values([
      {
        title: "Profil & Sejarah Organisasi",
        slug: "organization-profile",
        excerpt:
          "Sejarah pembentukan, peran strategis, dan transformasi APTI Indonesia dalam ekosistem industri tata udara refrigerasi nasional.",
        status: "published",
        isHomepage: false,
        publishedAt: now,
        seo: {
          title: "Profil & Sejarah Asosiasi - APTI Indonesia",
          description:
            "Mengenal perjalanan panjang dan komitmen APTI Indonesia dalam standardisasi kompetensi teknisi HVAC dan perlindungan konsumen.",
        },
        sections: [
          {
            id: "a1b2c3d4-0001-4000-8000-000000000001",
            type: "hero",
            eyebrow: "PROFIL ASOSIASI",
            title: "Sejarah & Transformasi APTI Indonesia",
            description:
              "Wadah resmi profesionalisme perusahaan pendingin dan teknisi refrigerasi tata udara (HVAC/R) Indonesia yang memadukan sertifikasi BNSP, transparansi kode etik, dan inovasi KTA digital.",
            alignment: "left",
            highlights: [
              "Terakreditasi BNSP",
              "DPD di 38 Provinsi",
              "Standar Eco-Refrigerant K3",
            ],
            proofPoints: [
              "8,400+ Anggota KTA",
              "38 DPD Wilayah",
              "100% Audit Kredensial",
            ],
          },
          {
            id: "a1b2c3d4-0001-4000-8000-000000000002",
            type: "features",
            eyebrow: "PILAR STRATEGIS",
            title: "Peran Utama Memajukan Ekosistem Nasional",
            description:
              "Tiga pilar dedikasi organisasi dalam menjembatani kebutuhan industri, keahlian teknisi, dan perlindungan konsumen.",
            columns: 3,
            variant: "cards",
            items: [
              {
                title: "Standardisasi & Uji Kompetensi",
                description:
                  "Menyelenggarakan sertifikasi BNSP resmi dan sistem perolehan Satuan Kredit Profesi (SKP) berkelanjutan.",
              },
              {
                title: "Registri KTA & Audit Publik",
                description:
                  "Penerbitan kartu tanda anggota ber-QR anti-pemalsuan yang dapat diverifikasi instan oleh masyarakat dan pemilik gedung.",
              },
              {
                title: "Advokasi Kebijakan & Lingkungan",
                description:
                  "Bermitra dengan KLHK dan Kemenperin dalam standardisasi freon ramah lingkungan serta pencegahan emisi ozon.",
              },
            ],
          },
          {
            id: "a1b2c3d4-0001-4000-8000-000000000003",
            type: "richText",
            eyebrow: "REKAM JEJAK",
            title: "Komitmen Berkelanjutan untuk Indonesia",
            html: "<p>Didirikan atas inisiatif para praktisi senior dan pengusaha pendingin di seluruh tanah air, <strong>APTI Indonesia</strong> lahir untuk menjawab tantangan standarisasi kualitas instalasi, keamanan refrigeran, serta kepastian garansi bagi konsumen.</p><p>Kini, dengan dukungan Dewan Pimpinan Pusat (DPP), 38 Dewan Pimpinan Daerah (DPD), dan ribuan workshop binaan, asosiasi terus melangkah maju menghadirkan tata kelola modern berbasis digital, audit kredensial terbuka, serta perlindungan hukum bagi setiap anggota aktif.</p>",
            width: "narrow",
          },
          {
            id: "a1b2c3d4-0001-4000-8000-000000000004",
            type: "cta",
            title: "Bergabunglah Bersama Ribuan Profesional Pendingin",
            description:
              "Tingkatkan legitimasi kompetensi dan kepercayaan pelanggan workshop Anda dengan KTA digital resmi.",
            primaryAction: {
              label: "Daftar Keanggotaan",
              href: "/join",
            },
            secondaryAction: {
              label: "Verifikasi Kredensial",
              href: "/verify",
            },
            tone: "brand",
          },
        ],
      },
      {
        title: "Visi, Misi & Nilai Kehormatan",
        slug: "vision-mission",
        excerpt:
          "Arah strategis dan fondasi etika APTI Indonesia dalam mewujudkan ekosistem refrigerasi yang berintegritas dan berdaya saing internasional.",
        status: "published",
        isHomepage: false,
        publishedAt: now,
        seo: {
          title: "Visi & Misi Organisasi - APTI Indonesia",
          description:
            "Visi, misi, dan nilai etika APTI Indonesia dalam memajukan industri tata udara ramah lingkungan dan profesional.",
        },
        sections: [
          {
            id: "a1b2c3d4-0002-4000-8000-000000000001",
            type: "hero",
            eyebrow: "ARAH STRATEGIS",
            title: "Visi, Misi & Nilai Kehormatan APTI",
            description:
              "Mewujudkan ekosistem industri refrigerasi dan tata udara Indonesia yang berdaya saing global, berintegritas tinggi, dan ramah lingkungan hidup.",
            alignment: "left",
            highlights: [
              "Integritas Profesi",
              "Keselamatan K3 Kerja",
              "Eco-Friendly Refrigerant",
            ],
            proofPoints: [
              "Target Net Zero 2060",
              "100% K3 Compliance",
              "Sertifikasi Global",
            ],
          },
          {
            id: "a1b2c3d4-0002-4000-8000-000000000002",
            type: "features",
            eyebrow: "NILAI KEHORMATAN",
            title: "3 Nilai Utama Profesi Pendingin",
            description:
              "Prinsip dasar yang wajib dijunjung oleh setiap pemegang KTA dan pengurus APTI di seluruh Nusantara.",
            columns: 3,
            variant: "cards",
            items: [
              {
                title: "Profesionalisme & Kejujuran",
                description:
                  "Menjaga transparansi diagnosis kerusakan, kepatuhan harga wajar, dan integritas penanganan unit pelanggan.",
              },
              {
                title: "Keselamatan & K3 Ketat",
                description:
                  "Menerapkan SOP keselamatan kerja berstandar tinggi saat menangani refrigeran bertekanan dan gas mudah terbakar.",
              },
              {
                title: "Kepedulian Lingkungan Hidup",
                description:
                  "Berperan aktif menekan pelepasan emisi hidrofluorokarbon (HFC) ke atmosfer melalui prosedur recovery refrigeran yang benar.",
              },
            ],
          },
          {
            id: "a1b2c3d4-0002-4000-8000-000000000003",
            type: "richText",
            eyebrow: "AGENDA AKSI",
            title: "5 Misi Pembangunan Berkelanjutan",
            html: "<ul><li><strong>1. Standardisasi Kompetensi:</strong> Memastikan seluruh teknisi memiliki sertifikasi kompetensi BNSP level nasional.</li><li><strong>2. Transformasi Digital:</strong> Menyediakan sistem manajemen keanggotaan dan logbook SKP berbasis cloud.</li><li><strong>3. Sinergi Regulasi:</strong> Mengawal harmonisasi peraturan pemerintah terkait efisiensi energi dan transisi refrigeran hijau.</li><li><strong>4. Mediasi & Etika:</strong> Menghadirkan layanan pengaduan etik yang transparan untuk melindungi konsumen.</li><li><strong>5. Pemberdayaan UMKM:</strong> Meningkatkan kemandirian bengkel binaan daerah melalui pelatihan manajerial dan teknis.</li></ul>",
            width: "narrow",
          },
          {
            id: "a1b2c3d4-0002-4000-8000-000000000004",
            type: "cta",
            title: "Bersama Wujudkan Ekosistem HVAC/R Terbaik",
            description:
              "Mari bergabung dalam barisan pengusaha dan teknisi profesional berintegritas.",
            primaryAction: {
              label: "Daftar Anggota Sekarang",
              href: "/join",
            },
            secondaryAction: {
              label: "Lihat Agenda Workshop",
              href: "/events",
            },
            tone: "brand",
          },
        ],
      },
    ]);

    // Seed Database Wilayah & Kodepos Indonesia (38 Provinsi & 514 Kab/Kota)
    if (INDONESIA_PROVINCES.length > 0) {
      await tx.insert(indonesiaProvinces).values(
        INDONESIA_PROVINCES.map((p) => ({
          kode: p.kode,
          nama: p.nama,
          ibukota: p.ibukota,
          kodepos: p.kodepos,
          kodeposRange: p.kodeposRange,
        })),
      );
    }

    const chunkSize = 100;
    for (let i = 0; i < ALL_INDONESIA_REGENCIES.length; i += chunkSize) {
      const chunk = ALL_INDONESIA_REGENCIES.slice(i, i + chunkSize);
      await tx.insert(indonesiaRegencies).values(
        chunk.map((r) => ({
          kode: r.kode,
          provinceKode: r.provinceCode,
          nama: r.nama,
          ibukota: r.ibukota,
          kodepos: r.kodepos,
          kodeposRange: r.kodeposRange,
          kodeposList: r.kodeposList,
        })),
      );
    }

    // Seed Kecamatan (7.265 Districts)
    try {
      const districtsPath = join(import.meta.dirname, "data", "districts.json");
      const rawDistricts = readFileSync(districtsPath, "utf-8");
      const districts: Array<{
        kode: string;
        regencyKode: string;
        provinceKode: string;
        nama: string;
      }> = JSON.parse(rawDistricts);

      const distChunk = 500;
      for (let i = 0; i < districts.length; i += distChunk) {
        await tx.insert(indonesiaDistricts).values(districts.slice(i, i + distChunk));
      }
    } catch (e) {
      console.warn("Notice: skipping districts seeding if file not available", e);
    }

    // Seed Desa / Kelurahan & Kodepos (83.345 Villages)
    try {
      const villagesPath = join(import.meta.dirname, "data", "villages.json");
      const rawVillages = readFileSync(villagesPath, "utf-8");
      const villages: Array<{
        kode: string;
        districtKode: string;
        regencyKode: string;
        provinceKode: string;
        nama: string;
        kodepos: string;
      }> = JSON.parse(rawVillages);

      const vilChunk = 1000;
      for (let i = 0; i < villages.length; i += vilChunk) {
        await tx.insert(indonesiaVillages).values(villages.slice(i, i + vilChunk));
      }
    } catch (e) {
      console.warn("Notice: skipping villages seeding if file not available", e);
    }
  });

  process.stdout.write(
    `APTI Indonesia Seed Complete!\n- Seeded 38 Indonesia Provinces into Database\n- Seeded 514 Indonesia Regencies/Cities with Postal Codes into Database\n- Seeded 7,265 Indonesia Districts (Kecamatan) into Database\n- Seeded 83,345 Indonesia Villages (Desa/Kelurahan) with exact Postal Codes into Database\n\nAdmin login accounts:\n1) admin@organization.org (password: password123)\n2) admin@demo.openorg (password: OpenOrg!2026Demo)\n3) sekretariat@apti.or.id (password: password123)\n\nMember Portal login accounts (/member/login):\n1) member@demo.openorg (password: OpenOrg!2026Demo) - Budi Pratama (Demo Member)\n2) nanang@apti.or.id (password: password123) - Ir. H. Nanang Varian\n3) dedi.jabar@apti.or.id (password: password123) - Dedi Kurniawan\n`,
  );
}

try {
  await seed();
} finally {
  await closeDatabase();
}
