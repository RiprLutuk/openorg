import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { closeDatabase, db } from "./client";
import {
  events,
  members,
  organizationUnits,
  permissions,
  positionAssignments,
  positions,
  rolePermissions,
  roles,
  siteSettings,
  userRoles,
  users,
} from "./schema";

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@demo.openorg";
const adminPassword =
  process.env.SEED_ADMIN_PASSWORD ??
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("SEED_ADMIN_PASSWORD is required in production.");
      })()
    : "OpenOrg!2026Demo");
const now = new Date();

async function seed() {
  const [existing] = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.id, "default"))
    .limit(1);

  if (existing) {
    process.stdout.write("Site settings already initialized; seed skipped.\n");
    return;
  }

  const passwordHash = await hash(adminPassword, {
    algorithm: 2,
    memoryCost: 19_456,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  });

  await db.transaction(async (tx) => {
    await tx.insert(siteSettings).values({
      id: "default",
      name: "OpenOrg Association",
      slug: "openorg",
      kind: "association",
      tagline: "Platform Resmi Keanggotaan & Tata Kelola Organisasi",
      description:
        "Satu rumah digital terpadu untuk manajemen keanggotaan, pengembangan kompetensi akademi SKP/CPD, dan verifikasi kredensial publik.",
      email: "sekretariat@openorg.id",
      phone: "+62 21 555 0101",
      address: "Jakarta, Indonesia",
      primaryColor: "#6941C6",
      secondaryColor: "#12B76A",
      quickContact: {
        channel: "message",
        label: "Hubungi Sekretariat",
        value: "sekretariat@openorg.id",
        href: "mailto:sekretariat@openorg.id",
      },
      navigation: [
        { id: "home", label: "Beranda", href: "/" },
        { id: "events", label: "Agenda", href: "/events" },
        { id: "structure", label: "Struktur Pengurus", href: "/structure" },
        { id: "verify", label: "Verifikasi Kredensial", href: "/verify" },
      ],
      footer: {
        description:
          "Platform resmi organisasi mandiri yang mengintegrasikan tata kelola, keanggotaan, akademi SKP, dan kredensial.",
        copyright: `© ${now.getFullYear()} OpenOrg Association. All rights reserved.`,
        links: [
          { label: "Agenda Kegiatan", href: "/events" },
          { label: "Peta Pengurus", href: "/structure" },
          { label: "Cek KTA Digital", href: "/verify" },
        ],
      },
    });

    const [owner] = await tx
      .insert(users)
      .values({
        name: "Administrator Pengurus",
        email: adminEmail.toLowerCase(),
        passwordHash,
        status: "active",
        emailVerifiedAt: now,
      })
      .returning();
    if (!owner) throw new Error("Could not create admin user");

    const [ownerRole] = await tx
      .insert(roles)
      .values({
        name: "Owner",
        description: "Akses penuh manajemen organisasi",
        isSystem: true,
      })
      .returning();
    if (!ownerRole) throw new Error("Could not create owner role");

    const permissionSeeds = [
      ["*", "Akses penuh platform"],
      ["pages.read", "Melihat halaman"],
      ["pages.write", "Kelola halaman"],
      ["contents.read", "Melihat konten"],
      ["contents.write", "Kelola konten"],
      ["events.read", "Melihat agenda"],
      ["events.write", "Kelola agenda"],
      ["members.read", "Melihat data anggota"],
      ["members.write", "Kelola data anggota"],
      ["credentials.read", "Melihat kredensial"],
      ["credentials.write", "Kelola kredensial"],
      ["credentials.verify", "Verifikasi kredensial"],
      ["governance.read", "Melihat struktur pengurus"],
      ["governance.write", "Kelola unit & posisi pengurus"],
      ["learning.read", "Melihat akademi & SKP"],
      ["learning.write", "Kelola akademi & SKP"],
      ["revenue.read", "Melihat tagihan & iuran"],
      ["revenue.write", "Kelola iuran anggota"],
      ["settings.write", "Kelola pengaturan organisasi"],
      ["users.manage", "Kelola pengguna & hak akses"],
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

    await tx
      .insert(userRoles)
      .values({ userId: owner.id, roleId: ownerRole.id });

    // Seed sample Events
    await tx.insert(events).values([
      {
        title: "Forum Kepemimpinan & Rapat Kerja Nasional",
        slug: "forum-kepemimpinan-rakernas-2026",
        description:
          "Ruang bertukar pengalaman bagi koordinator wilayah dan pengurus pusat dalam menyusun arah strategis organisasi.",
        locationName: "Jakarta Convention Center",
        startsAt: new Date(now.getTime() + 86_400_000 * 9),
        endsAt: new Date(now.getTime() + 86_400_000 * 9 + 7_200_000),
        status: "published",
        publishedAt: now,
        capacity: 150,
      },
      {
        title: "Pelatihan Professional SKP: Tata Kelola Digital",
        slug: "pelatihan-skp-tata-kelola-digital",
        description:
          "Pelatihan akademis bersertifikat SKP mengenai transparansi digital dan standar ketaatan organisasi.",
        locationName: "Daring via Zoom",
        meetingUrl: "https://openorg.id/zoom-learning",
        startsAt: new Date(now.getTime() + 86_400_000 * 16),
        endsAt: new Date(now.getTime() + 86_400_000 * 16 + 10_800_000),
        status: "published",
        publishedAt: now,
        capacity: 300,
      },
    ]);

    // Seed Governance Units & Positions
    const [nationalUnit, regionalUnit] = await tx
      .insert(organizationUnits)
      .values([
        {
          name: "Pengurus Pusat (DPP)",
          code: "DPP",
          type: "national",
          sortOrder: 1,
        },
        {
          name: "Pengurus Daerah Jawa Barat (DPD)",
          code: "DPD-JABAR",
          type: "regional",
          sortOrder: 2,
        },
      ])
      .returning();

    if (nationalUnit && regionalUnit) {
      await tx
        .update(organizationUnits)
        .set({ parentId: nationalUnit.id })
        .where(eq(organizationUnits.id, regionalUnit.id));

      const [ketuaUmum, sekjen, ketuaDpd] = await tx
        .insert(positions)
        .values([
          {
            unitId: nationalUnit.id,
            title: "Ketua Umum",
            sortOrder: 1,
          },
          {
            unitId: nationalUnit.id,
            title: "Sekretaris Jenderal",
            sortOrder: 2,
          },
          {
            unitId: regionalUnit.id,
            title: "Ketua DPD Jawa Barat",
            sortOrder: 1,
          },
        ])
        .returning();

      const createdMembers = await tx
        .insert(members)
        .values([
          {
            unitId: nationalUnit.id,
            memberNumber: "ORG-0001",
            name: "Dr. Ayu Pradana, M.Si",
            email: "ayu@openorg.id",
            phone: "+6281234567890",
            joinedAt: new Date("2022-01-15"),
            status: "active",
          },
          {
            unitId: nationalUnit.id,
            memberNumber: "ORG-0002",
            name: "Bima Santoso, S.T",
            email: "bima@openorg.id",
            phone: "+6281234567891",
            joinedAt: new Date("2022-03-20"),
            status: "active",
          },
          {
            unitId: regionalUnit.id,
            memberNumber: "ORG-0028",
            name: "Citra Lestari, S.H",
            email: "citra@openorg.id",
            phone: "+6281234567892",
            joinedAt: new Date("2023-06-02"),
            status: "active",
          },
        ])
        .returning();

      if (
        ketuaUmum &&
        sekjen &&
        ketuaDpd &&
        createdMembers[0] &&
        createdMembers[1] &&
        createdMembers[2]
      ) {
        await tx.insert(positionAssignments).values([
          {
            positionId: ketuaUmum.id,
            memberId: createdMembers[0].id,
            startsAt: new Date("2025-01-01"),
          },
          {
            positionId: sekjen.id,
            memberId: createdMembers[1].id,
            startsAt: new Date("2025-01-01"),
          },
          {
            positionId: ketuaDpd.id,
            memberId: createdMembers[2].id,
            startsAt: new Date("2025-01-01"),
          },
        ]);
      }
    }
  });

  process.stdout.write(
    `Seed complete. Admin login: ${adminEmail} / ${adminPassword}\n`,
  );
}

try {
  await seed();
} finally {
  await closeDatabase();
}
