import { randomUUID } from "node:crypto";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { closeDatabase, db } from "./client";
import {
  contents,
  credentialRequirements,
  credentialSchemes,
  creditSchemes,
  events,
  forms,
  learningActivities,
  members,
  navigationItems,
  organizations,
  organizationUnits,
  pages,
  permissions,
  positionAssignments,
  positions,
  revenueProducts,
  rolePermissions,
  roles,
  settings,
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
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, "demo"))
    .limit(1);
  if (existing) {
    process.stdout.write("Demo organization already exists; seed skipped.\n");
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
    const [organization] = await tx
      .insert(organizations)
      .values({
        name: "OpenOrg Collective",
        slug: "demo",
        kind: "humanitarian",
        tagline: "People-powered change, built in the open.",
        description:
          "A flexible demonstration workspace for communities, associations, foundations, professional groups, and mission-driven organizations.",
        email: "hello@demo.openorg",
        phone: "+62 21 555 0101",
        address: "Jakarta, Indonesia",
        theme: {
          colors: {
            primary: "#3b5bdb",
            secondary: "#182230",
            accent: "#f97066",
            surface: "#f8fafc",
            foreground: "#101828",
          },
          radius: "large",
          fontHeading: "Manrope",
          fontBody: "Inter",
        },
        features: {
          members: true,
          events: true,
          donations: true,
          chapters: true,
          publicDirectory: true,
        },
      })
      .returning();
    if (!organization) throw new Error("Could not create demo organization");

    const [owner] = await tx
      .insert(users)
      .values({
        organizationId: organization.id,
        name: "Demo Owner",
        email: adminEmail.toLowerCase(),
        passwordHash,
        status: "active",
        emailVerifiedAt: now,
      })
      .returning();
    if (!owner) throw new Error("Could not create demo owner");

    const [ownerRole] = await tx
      .insert(roles)
      .values({
        organizationId: organization.id,
        name: "Owner",
        description: "Full workspace access",
        isSystem: true,
      })
      .returning();
    if (!ownerRole) throw new Error("Could not create owner role");
    const permissionSeeds = [
      ["*", "Full platform access"],
      ["pages.read", "View pages"],
      ["pages.write", "Create and update pages"],
      ["pages.delete", "Archive pages"],
      ["contents.read", "View editorial content"],
      ["contents.write", "Create and update editorial content"],
      ["contents.publish", "Publish editorial content"],
      ["events.read", "View events"],
      ["events.write", "Manage events"],
      ["members.read", "View members"],
      ["members.write", "Manage members"],
      ["credentials.read", "View credential schemes and submissions"],
      ["credentials.write", "Manage credential schemes and requirements"],
      ["credentials.verify", "Verify or reject member credentials"],
      ["governance.read", "View organization structure and appointments"],
      ["governance.write", "Manage units, positions, and appointments"],
      ["learning.read", "View learning activities and credit records"],
      ["learning.write", "Manage activities, enrollment, and attendance"],
      ["learning.award", "Complete activities and post credit ledger entries"],
      ["revenue.read", "View products, invoices, payments, and benefits"],
      ["revenue.write", "Manage revenue products and invoices"],
      ["revenue.payment", "Record and reconcile payments"],
      ["engagement.read", "View audience segments and campaigns"],
      ["engagement.write", "Manage audience segments and campaigns"],
      ["engagement.dispatch", "Queue campaign recipients for delivery"],
      ["forms.read", "View form submissions"],
      ["forms.write", "Manage forms"],
      ["media.read", "View media library"],
      ["media.write", "Manage media"],
      ["settings.read", "View organization settings"],
      ["settings.write", "Manage organization settings"],
      ["users.manage", "Manage users and roles"],
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

    const heroId = randomUUID();
    await tx.insert(pages).values([
      {
        organizationId: organization.id,
        title: "Home",
        slug: "home",
        excerpt: "A welcoming digital home for a people-powered organization.",
        status: "published",
        isHomepage: true,
        publishedAt: now,
        createdBy: owner.id,
        updatedBy: owner.id,
        seo: {
          title: "OpenOrg Collective",
          description: "People-powered change, built in the open.",
        },
        sections: [
          {
            id: heroId,
            type: "hero",
            eyebrow: "Ekosistem organisasi terpadu",
            title:
              "Anggota berkembang. Standar terjaga. Industri bergerak bersama.",
            description:
              "Satu rumah digital untuk keanggotaan, kredensial profesi, pembelajaran, tata kelola, dan manfaat yang benar-benar dapat dirasakan anggota.",
            primaryAction: {
              label: "Daftar menjadi anggota",
              href: "/join",
              external: false,
            },
            secondaryAction: {
              label: "Lihat cara kami bekerja",
              href: "/about",
              external: false,
            },
            alignment: "left",
            panelTitle: "Pusat layanan organisasi",
            highlights: [
              "Registry anggota",
              "Verifikasi kredensial",
              "Akademi & kredit profesi",
              "Iuran & manfaat",
            ],
            proofPoints: [
              "Data anggota terlindungi",
              "Keputusan dapat diaudit",
              "Layanan selalu terhubung",
            ],
          },
          {
            id: randomUUID(),
            type: "stats",
            title: "Dampak yang terlihat, layanan yang terukur",
            items: [
              { value: "1.240+", label: "Anggota aktif" },
              { value: "18", label: "Wilayah & chapter" },
              { value: "86", label: "Kredensial terverifikasi" },
              { value: "34", label: "Program tahun ini" },
            ],
          },
          {
            id: randomUUID(),
            type: "features",
            eyebrow: "Layanan untuk seluruh siklus anggota",
            title: "Lebih dari website—sebuah ekosistem organisasi",
            description:
              "Setiap layanan terhubung pada satu profil anggota dan dapat dikonfigurasi tanpa mengubah kode dasar.",
            columns: 3,
            variant: "platform",
            items: [
              {
                icon: "member registry",
                title: "Keanggotaan digital",
                description:
                  "Pendaftaran, review, direktori, dan kartu anggota digital dalam alur yang jelas.",
                link: {
                  label: "Ajukan keanggotaan",
                  href: "/join",
                  external: false,
                },
              },
              {
                icon: "credential shield",
                title: "Kredensial terpercaya",
                description:
                  "Sertifikat dan nomor registrasi diverifikasi pada tingkat kepercayaan yang dapat diaudit.",
              },
              {
                icon: "learning academy",
                title: "Akademi profesi",
                description:
                  "Pelatihan, kehadiran, dan SKP/CPD dicatat dalam ledger pembelajaran anggota.",
              },
              {
                icon: "governance network",
                title: "Tata kelola transparan",
                description:
                  "Struktur pusat, wilayah, posisi, dan masa jabatan tampil dari satu sumber data.",
                link: {
                  label: "Lihat struktur",
                  href: "/structure",
                  external: false,
                },
              },
              {
                icon: "revenue payment",
                title: "Iuran & manfaat",
                description:
                  "Invoice dan pembayaran terhubung langsung dengan benefit yang berhak diterima anggota.",
              },
              {
                icon: "engagement campaign",
                title: "Komunikasi tepat sasaran",
                description:
                  "Segmentasi anggota membantu organisasi menyampaikan program kepada audiens yang relevan.",
              },
            ],
          },
          {
            id: randomUUID(),
            type: "richText",
            eyebrow: "Kepercayaan melalui bukti",
            title: "Legalitas dan birokrasi tidak harus menjadi beban anggota",
            html: "<p>Organisasi yang dipercaya tidak hanya memiliki identitas yang kuat, tetapi juga mampu membuktikan siapa anggotanya, kompetensi apa yang masih berlaku, siapa yang mengambil keputusan, dan manfaat apa yang telah diberikan.</p><h3>Satu data, banyak layanan</h3><p>Profil anggota menjadi sumber yang konsisten untuk proses verifikasi, pembelajaran, struktur organisasi, penagihan, dan komunikasi. Anggota tidak perlu berulang kali menyerahkan data yang sama kepada divisi berbeda.</p>",
            width: "narrow",
          },
          {
            id: randomUUID(),
            type: "features",
            eyebrow: "Perjalanan anggota",
            title: "Dari pendaftaran hingga kontribusi profesional",
            description:
              "Tahapan yang mudah dipahami anggota dan tetap fleksibel untuk berbagai jenis asosiasi.",
            columns: 4,
            variant: "steps",
            items: [
              {
                title: "Daftar",
                description:
                  "Isi profil, persetujuan, dan dokumen awal melalui alur digital.",
              },
              {
                title: "Terverifikasi",
                description:
                  "Admin menilai persyaratan dan meninggalkan jejak keputusan yang jelas.",
              },
              {
                title: "Berkembang",
                description:
                  "Ikuti program dan kumpulkan kredit profesi yang telah divalidasi.",
              },
              {
                title: "Berkontribusi",
                description:
                  "Terlibat dalam chapter, kepengurusan, komunitas, dan program industri.",
              },
            ],
          },
          {
            id: randomUUID(),
            type: "contentFeed",
            title: "Wawasan dan kabar terbaru",
            contentType: "post",
            limit: 3,
            layout: "grid",
            action: {
              label: "Tentang organisasi kami",
              href: "/about",
              external: false,
            },
          },
          {
            id: randomUUID(),
            type: "contentFeed",
            title: "Agenda yang mempertemukan anggota",
            contentType: "event",
            limit: 4,
            layout: "grid",
            action: {
              label: "Hubungi sekretariat",
              href: "/contact",
              external: false,
            },
          },
          {
            id: randomUUID(),
            type: "organizationChart",
            title: "Dikelola secara terbuka, bergerak sampai ke daerah",
            depth: 4,
          },
          {
            id: randomUUID(),
            type: "cta",
            title: "Mari bertumbuh bersama organisasi yang tertib dan relevan.",
            description:
              "Daftar sebagai anggota atau bicarakan peluang kolaborasi dengan sekretariat kami.",
            primaryAction: {
              label: "Daftar sekarang",
              href: "/join",
              external: false,
            },
            secondaryAction: {
              label: "Hubungi sekretariat",
              href: "/contact",
              external: false,
            },
            tone: "contrast",
          },
        ],
      },
      {
        organizationId: organization.id,
        title: "About us",
        slug: "about",
        excerpt:
          "Our purpose, approach, and commitment to transparent community work.",
        status: "published",
        publishedAt: now,
        createdBy: owner.id,
        updatedBy: owner.id,
        sections: [
          {
            id: randomUUID(),
            type: "hero",
            eyebrow: "About OpenOrg Collective",
            title: "Change works best when everyone has a seat at the table.",
            description:
              "We are a member-led network that turns shared knowledge into practical action.",
            primaryAction: {
              label: "Meet our people",
              href: "/structure",
              external: false,
            },
            alignment: "left",
          },
          {
            id: randomUUID(),
            type: "richText",
            eyebrow: "Our story",
            title: "Local wisdom, connected nationally",
            html: "<p>We began with a simple belief: communities already hold much of the knowledge needed to solve their hardest problems. Our role is to connect that knowledge, add resources, and make progress visible.</p><h3>Open by default</h3><p>We document decisions, measure results, and invite members to improve how we work.</p>",
            width: "narrow",
          },
          {
            id: randomUUID(),
            type: "organizationChart",
            title: "Our organization",
            depth: 4,
          },
        ],
      },
      {
        organizationId: organization.id,
        title: "Contact",
        slug: "contact",
        excerpt: "Talk to the OpenOrg Collective team.",
        status: "published",
        publishedAt: now,
        createdBy: owner.id,
        updatedBy: owner.id,
        sections: [
          {
            id: randomUUID(),
            type: "contact",
            title: "A good partnership starts with a conversation.",
            description:
              "Tell us what you are working on, what support you need, or how you would like to contribute.",
            showForm: true,
            showMap: false,
          },
        ],
      },
    ]);

    await tx.insert(contents).values([
      {
        organizationId: organization.id,
        createdBy: owner.id,
        type: "post",
        title: "Dari pelatihan lokal menjadi jejaring profesional",
        slug: "neighborhood-kitchen-support-network",
        excerpt:
          "Bagaimana satu kelas kecil berkembang menjadi ruang berbagi kompetensi antardaerah.",
        body: "<p>Berawal dari pelatihan teknis sederhana, anggota kini saling berbagi praktik baik, mentor, dan peluang kolaborasi.</p>",
        status: "published",
        featured: true,
        publishedAt: new Date(now.getTime() - 86_400_000 * 2),
      },
      {
        organizationId: organization.id,
        createdBy: owner.id,
        type: "post",
        title: "Apa yang berubah setelah organisasi mulai mendengar anggota",
        slug: "listening-first-youth-program",
        excerpt:
          "Program yang paling relevan lahir dari kebutuhan anggota, bukan hanya dari ruang rapat.",
        body: "<p>Sebelum menyusun program berikutnya, tim memetakan kebutuhan, hambatan, dan aspirasi anggota lintas wilayah.</p>",
        status: "published",
        publishedAt: new Date(now.getTime() - 86_400_000 * 6),
      },
      {
        organizationId: organization.id,
        createdBy: owner.id,
        type: "post",
        title: "Lima chapter, satu standar layanan anggota",
        slug: "five-chapters-climate-action",
        excerpt:
          "Pedoman bersama membantu pengurus wilayah bergerak cepat tanpa kehilangan konteks lokal.",
        body: "<p>Standar layanan dan otonomi wilayah bukan dua hal yang bertentangan. Keduanya membantu organisasi tumbuh secara bertanggung jawab.</p>",
        status: "published",
        publishedAt: new Date(now.getTime() - 86_400_000 * 12),
      },
      {
        organizationId: organization.id,
        createdBy: owner.id,
        type: "news",
        title: "OpenOrg Collective welcomes three new regional chapters",
        slug: "three-new-regional-chapters",
        excerpt:
          "New member-led chapters extend the network to three more cities.",
        body: "<p>We are delighted to welcome local teams in Bandung, Semarang, and Makassar.</p>",
        status: "published",
        publishedAt: new Date(now.getTime() - 86_400_000),
      },
    ]);

    await tx.insert(events).values([
      {
        organizationId: organization.id,
        title: "Forum kepemimpinan chapter",
        slug: "community-leadership-circle",
        description:
          "Ruang bertukar pengalaman bagi koordinator wilayah dan calon pemimpin organisasi.",
        locationName: "Jakarta Community Hub",
        startsAt: new Date(now.getTime() + 86_400_000 * 9),
        endsAt: new Date(now.getTime() + 86_400_000 * 9 + 7_200_000),
        status: "published",
        publishedAt: now,
        capacity: 60,
      },
      {
        organizationId: organization.id,
        title: "Open house calon anggota",
        slug: "volunteer-open-house",
        description:
          "Kenali layanan organisasi, tim program, dan jalur keanggotaan yang sesuai.",
        locationName: "Daring",
        meetingUrl: "https://example.org/meeting",
        startsAt: new Date(now.getTime() + 86_400_000 * 16),
        endsAt: new Date(now.getTime() + 86_400_000 * 16 + 5_400_000),
        status: "published",
        publishedAt: now,
        capacity: 200,
      },
      {
        organizationId: organization.id,
        title: "Klinik pembiayaan program organisasi",
        slug: "practical-fundraising-local-programs",
        description:
          "Lokakarya praktis untuk membangun pendanaan program dan hubungan mitra yang berkelanjutan.",
        locationName: "Sekretariat Chapter Bandung",
        startsAt: new Date(now.getTime() + 86_400_000 * 28),
        status: "published",
        publishedAt: now,
        capacity: 45,
      },
    ]);

    const [cpdScheme, skpScheme, complianceScheme] = await tx
      .insert(creditSchemes)
      .values([
        {
          organizationId: organization.id,
          code: "CPD",
          name: "Continuing Professional Development",
          unitLabel: "CPD points",
          description:
            "Reusable professional-development credit for technical and competency programs.",
          validityMonths: 36,
        },
        {
          organizationId: organization.id,
          code: "SKP",
          name: "Satuan Kredit Profesi",
          unitLabel: "SKP",
          description:
            "Professional learning credit used by regulated and licensed practitioners.",
          validityMonths: 60,
        },
        {
          organizationId: organization.id,
          code: "COMPLIANCE-HOUR",
          name: "Compliance Learning Hours",
          unitLabel: "hours",
          description:
            "Tracked learning hours for regulated company and governance training.",
          validityMonths: 12,
        },
      ])
      .returning();
    if (!cpdScheme || !skpScheme || !complianceScheme)
      throw new Error("Could not create learning credit schemes");
    await tx.insert(learningActivities).values([
      {
        organizationId: organization.id,
        creditSchemeId: cpdScheme.id,
        code: "HVAC-REFRIGERANT-2026",
        title: "Safe Refrigerant Handling & Recovery",
        description:
          "A practical recertification clinic for safe handling, recovery, and documentation.",
        category: "technical-competency",
        deliveryMode: "hybrid",
        locationName: "Jakarta Training Center",
        meetingUrl: "https://example.org/hvac-learning",
        startsAt: new Date(now.getTime() + 86_400_000 * 21),
        endsAt: new Date(now.getTime() + 86_400_000 * 21 + 25_200_000),
        enrollmentClosesAt: new Date(now.getTime() + 86_400_000 * 19),
        capacity: 40,
        creditAmountHundredths: 250,
        status: "open",
        createdBy: owner.id,
      },
      {
        organizationId: organization.id,
        creditSchemeId: skpScheme.id,
        code: "PROF-ETHICS-2026",
        title: "Professional Ethics & Public Accountability",
        description:
          "A cross-profession case clinic for ethical decisions and accountable practice.",
        category: "professional-ethics",
        deliveryMode: "online",
        meetingUrl: "https://example.org/ethics-learning",
        startsAt: new Date(now.getTime() + 86_400_000 * 35),
        endsAt: new Date(now.getTime() + 86_400_000 * 35 + 10_800_000),
        capacity: 250,
        creditAmountHundredths: 300,
        status: "open",
        createdBy: owner.id,
      },
      {
        organizationId: organization.id,
        creditSchemeId: complianceScheme.id,
        code: "AML-GOVERNANCE-2026",
        title: "AML Governance for Digital Financial Services",
        description:
          "Board and compliance-team learning on escalation, evidence, and oversight.",
        category: "regulatory-compliance",
        deliveryMode: "online",
        meetingUrl: "https://example.org/compliance-learning",
        startsAt: new Date(now.getTime() + 86_400_000 * 42),
        endsAt: new Date(now.getTime() + 86_400_000 * 42 + 14_400_000),
        capacity: 120,
        creditAmountHundredths: 400,
        status: "open",
        createdBy: owner.id,
      },
    ]);

    await tx.insert(revenueProducts).values([
      {
        organizationId: organization.id,
        code: "PRO-ANNUAL",
        name: "Professional Annual Membership",
        description:
          "Annual dues that unlock the configured member-benefit package.",
        type: "membership_dues",
        priceMinor: 75_000_000,
        currency: "IDR",
        billingInterval: "annual",
        entitlementKey: "member-benefits",
        entitlementLabel: "Member Benefit Access",
        entitlementDurationMonths: 12,
      },
      {
        organizationId: organization.id,
        code: "CERT-REVIEW",
        name: "Certification Review Service",
        description: "One-time administrative and evidence review service.",
        type: "service",
        priceMinor: 25_000_000,
        currency: "IDR",
        billingInterval: "one_time",
      },
      {
        organizationId: organization.id,
        code: "ACADEMY-PARTNER",
        name: "Academy Partner Pass",
        description: "Annual partner access to selected academy programs.",
        type: "sponsorship",
        priceMinor: 150_000_000,
        currency: "IDR",
        billingInterval: "annual",
        entitlementKey: "academy-partner",
        entitlementLabel: "Academy Partner Access",
        entitlementDurationMonths: 12,
      },
    ]);

    const [national, westJava] = await tx
      .insert(organizationUnits)
      .values([
        {
          organizationId: organization.id,
          name: "National Council",
          slug: "national",
          type: "national",
          sortOrder: 1,
        },
        {
          organizationId: organization.id,
          name: "West Java Chapter",
          slug: "west-java",
          type: "regional",
          sortOrder: 2,
        },
      ])
      .returning();
    if (!national || !westJava)
      throw new Error("Could not create organization units");
    await tx
      .update(organizationUnits)
      .set({ parentId: national.id })
      .where(eq(organizationUnits.id, westJava.id));
    const [chair, director, coordinator] = await tx
      .insert(positions)
      .values([
        {
          organizationId: organization.id,
          unitId: national.id,
          title: "Council Chair",
          sortOrder: 1,
        },
        {
          organizationId: organization.id,
          unitId: national.id,
          title: "Executive Director",
          sortOrder: 2,
        },
        {
          organizationId: organization.id,
          unitId: westJava.id,
          title: "Chapter Coordinator",
          sortOrder: 1,
        },
      ])
      .returning();
    const createdMembers = await tx
      .insert(members)
      .values([
        {
          organizationId: organization.id,
          unitId: national.id,
          memberNumber: "ORG-0001",
          name: "Ayu Pradana",
          email: "ayu@example.org",
          biography:
            "Community organizer and collaborative governance advocate.",
          joinedAt: new Date("2022-01-15"),
          status: "active",
          isPublic: true,
          customFields: { expertise: "Community organizing" },
        },
        {
          organizationId: organization.id,
          unitId: national.id,
          memberNumber: "ORG-0002",
          name: "Bima Santoso",
          email: "bima@example.org",
          biography: "Program designer focused on measurable local impact.",
          joinedAt: new Date("2022-03-20"),
          status: "active",
          isPublic: true,
          customFields: { expertise: "Program design" },
        },
        {
          organizationId: organization.id,
          unitId: westJava.id,
          memberNumber: "ORG-0028",
          name: "Citra Lestari",
          email: "citra@example.org",
          biography:
            "Volunteer leader connecting people to useful opportunities.",
          joinedAt: new Date("2023-06-02"),
          status: "active",
          isPublic: true,
          customFields: { expertise: "Volunteer management" },
        },
      ])
      .returning();
    if (
      chair &&
      director &&
      coordinator &&
      createdMembers[0] &&
      createdMembers[1] &&
      createdMembers[2]
    ) {
      await tx.insert(positionAssignments).values([
        {
          organizationId: organization.id,
          positionId: chair.id,
          memberId: createdMembers[0].id,
          startsAt: new Date("2025-01-01"),
        },
        {
          organizationId: organization.id,
          positionId: director.id,
          memberId: createdMembers[1].id,
          startsAt: new Date("2025-01-01"),
        },
        {
          organizationId: organization.id,
          positionId: coordinator.id,
          memberId: createdMembers[2].id,
          startsAt: new Date("2025-01-01"),
        },
      ]);
    }

    const [hvacCredential, fintechCredential, medicalCredential] = await tx
      .insert(credentialSchemes)
      .values([
        {
          organizationId: organization.id,
          code: "HVAC-COMP-L3",
          name: "HVAC Competency Level 3",
          description:
            "Competency credential for residential air-conditioning technicians.",
          subjectType: "person",
          category: "competency",
          issuerName: "LSP Teknik Pendingin Tata Udara",
          validityMonths: 36,
          renewalWindowDays: 60,
          minimumVerificationLevel: "issuer_confirmed",
          fields: [
            {
              key: "specialization",
              label: "Specialization",
              type: "text",
              required: true,
            },
            {
              key: "assessmentLocation",
              label: "Assessment location",
              type: "text",
              required: false,
            },
          ],
        },
        {
          organizationId: organization.id,
          code: "OJK-OPERATING-LICENSE",
          name: "Financial Services Operating License",
          description:
            "Operating authorization for a regulated financial technology company.",
          subjectType: "organization",
          category: "legal",
          issuerName: "Otoritas Jasa Keuangan",
          renewalWindowDays: 90,
          minimumVerificationLevel: "api_verified",
          fields: [
            {
              key: "businessModel",
              label: "Licensed business model",
              type: "text",
              required: true,
            },
            {
              key: "licenseScope",
              label: "License scope",
              type: "text",
              required: true,
            },
          ],
        },
        {
          organizationId: organization.id,
          code: "MED-PRACTICE-LICENSE",
          name: "Medical Practice License",
          description:
            "Professional practice authorization tied to a practice location.",
          subjectType: "person",
          category: "license",
          issuerName: "Government Licensing Authority",
          validityMonths: 60,
          renewalWindowDays: 90,
          minimumVerificationLevel: "api_verified",
          fields: [
            {
              key: "profession",
              label: "Profession",
              type: "text",
              required: true,
            },
            {
              key: "practiceLocation",
              label: "Practice location",
              type: "text",
              required: true,
            },
            {
              key: "creditStatus",
              label: "Professional credit status",
              type: "text",
              required: false,
            },
          ],
        },
      ])
      .returning();
    if (!hvacCredential || !fintechCredential || !medicalCredential)
      throw new Error("Could not create demo credential schemes");
    await tx.insert(credentialRequirements).values([
      {
        organizationId: organization.id,
        schemeId: hvacCredential.id,
        membershipType: "hvac-professional",
        rule: "required",
        requiredVerificationLevel: "issuer_confirmed",
        gracePeriodDays: 30,
        blocksApproval: true,
        sortOrder: 10,
      },
      {
        organizationId: organization.id,
        schemeId: fintechCredential.id,
        membershipType: "fintech-company",
        rule: "required",
        requiredVerificationLevel: "api_verified",
        blocksApproval: true,
        sortOrder: 10,
      },
      {
        organizationId: organization.id,
        schemeId: medicalCredential.id,
        membershipType: "medical-professional",
        rule: "required",
        requiredVerificationLevel: "api_verified",
        gracePeriodDays: 30,
        blocksApproval: true,
        sortOrder: 10,
      },
    ]);

    await tx.insert(forms).values({
      organizationId: organization.id,
      name: "Contact form",
      slug: "contact",
      description: "Public contact form",
      fields: [
        { name: "name", type: "text", label: "Your name", required: true },
        {
          name: "email",
          type: "email",
          label: "Email address",
          required: true,
        },
        {
          name: "message",
          type: "textarea",
          label: "How can we help?",
          required: true,
        },
      ],
      successMessage: "Thank you. A member of our team will reply shortly.",
      notificationEmails: ["hello@demo.openorg"],
    });

    await tx.insert(navigationItems).values([
      {
        organizationId: organization.id,
        location: "header",
        label: "Home",
        href: "/",
        sortOrder: 1,
      },
      {
        organizationId: organization.id,
        location: "header",
        label: "About",
        href: "/about",
        sortOrder: 2,
      },
      {
        organizationId: organization.id,
        location: "header",
        label: "Stories",
        href: "/stories",
        sortOrder: 3,
      },
      {
        organizationId: organization.id,
        location: "header",
        label: "Events",
        href: "/events",
        sortOrder: 4,
      },
      {
        organizationId: organization.id,
        location: "header",
        label: "Our people",
        href: "/structure",
        sortOrder: 5,
      },
    ]);
    await tx.insert(settings).values([
      {
        organizationId: organization.id,
        key: "footer",
        isPublic: true,
        updatedBy: owner.id,
        value: {
          description:
            "A member-led network turning shared knowledge into practical, measurable action.",
          copyright: `© ${now.getFullYear()} OpenOrg Collective. Built in the open.`,
          links: [
            { label: "Instagram", href: "https://instagram.com" },
            { label: "LinkedIn", href: "https://linkedin.com" },
            { label: "Contact", href: "/contact" },
          ],
        },
      },
      {
        organizationId: organization.id,
        key: "announcement",
        isPublic: true,
        updatedBy: owner.id,
        value: {
          enabled: false,
          eyebrow: "Community update",
          title: "A timely announcement belongs here.",
          message:
            "Schedule a campaign, celebration, registration drive, or urgent update from CMS Studio.",
          imageUrl: null,
          actionLabel: "Learn more",
          actionUrl: "/stories",
          startsAt: null,
          endsAt: null,
        },
      },
      {
        organizationId: organization.id,
        key: "quickContact",
        isPublic: true,
        updatedBy: owner.id,
        value: {
          enabled: true,
          label: "Talk to us",
          href: "/contact",
          channel: "message",
        },
      },
    ]);
  });

  process.stdout.write(
    `Seed complete. Studio login: ${adminEmail} / ${adminPassword}\n`,
  );
}

try {
  await seed();
} finally {
  await closeDatabase();
}
