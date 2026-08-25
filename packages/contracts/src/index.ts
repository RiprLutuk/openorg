import { z } from "zod";

export const organizationKindSchema = z.enum([
  "association",
  "nonprofit",
  "foundation",
  "community",
  "professional",
  "financial",
  "animal_welfare",
  "humanitarian",
  "other",
]);

export const localeSchema = z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/);

export const themeSchema = z.object({
  colors: z.object({
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
  radius: z.enum(["none", "small", "medium", "large", "pill"]),
  fontHeading: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[A-Za-z0-9 ,'-]+$/),
  fontBody: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[A-Za-z0-9 ,'-]+$/),
});

const safePublicHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (value) =>
      (/^\/(?!\/)/.test(value) ||
        value.startsWith("#") ||
        /^https?:\/\//i.test(value) ||
        /^mailto:/i.test(value) ||
        /^tel:/i.test(value)) &&
      !Array.from(value).some((character) => {
        const code = character.charCodeAt(0);
        return code < 32 || code === 127;
      }),
    "Link must use a safe relative, HTTP(S), mailto, tel, or anchor URL.",
  );

export const publicFooterSchema = z.object({
  description: z.string().max(1000).optional(),
  copyright: z.string().max(300).optional(),
  links: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        href: safePublicHrefSchema,
      }),
    )
    .max(12)
    .default([]),
});

export const publicAnnouncementSchema = z.object({
  enabled: z.boolean().default(false),
  eyebrow: z.string().trim().max(100).default("Announcement"),
  title: z.string().trim().max(180).default(""),
  message: z.string().trim().max(1200).default(""),
  imageUrl: z.string().url().nullable().default(null),
  actionLabel: z.string().trim().max(80).default("Learn more"),
  actionUrl: safePublicHrefSchema.default("/"),
  startsAt: z.string().datetime().nullable().default(null),
  endsAt: z.string().datetime().nullable().default(null),
});

export const publicQuickContactSchema = z.object({
  enabled: z.boolean().default(false),
  label: z.string().trim().min(1).max(80).default("Contact us"),
  href: safePublicHrefSchema.default("/contact"),
  channel: z.enum(["message", "whatsapp", "email"]).default("message"),
});

export const publicNavItemSchema = z.object({
  id: z.string(),
  label: z.string().trim().min(1).max(80),
  href: safePublicHrefSchema,
  children: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().trim().min(1).max(80),
        href: safePublicHrefSchema,
      }),
    )
    .optional(),
});

export const publicSettingsSchema = z.object({
  navigation: z.array(publicNavItemSchema).optional(),
  footer: publicFooterSchema,
  announcement: publicAnnouncementSchema,
  quickContact: publicQuickContactSchema,
});

const linkSchema = z.object({
  label: z.string().min(1).max(80),
  href: safePublicHrefSchema,
  external: z.boolean().default(false),
});

export const pageSectionSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().uuid(),
    type: z.literal("hero"),
    eyebrow: z.string().max(120).optional(),
    title: z.string().min(1).max(180),
    description: z.string().max(600).optional(),
    image: z.string().url().optional(),
    primaryAction: linkSchema.optional(),
    secondaryAction: linkSchema.optional(),
    alignment: z.enum(["left", "center"]).default("left"),
    panelTitle: z.string().max(120).optional(),
    highlights: z.array(z.string().trim().min(1).max(120)).max(6).optional(),
    proofPoints: z.array(z.string().trim().min(1).max(100)).max(6).optional(),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("richText"),
    eyebrow: z.string().max(120).optional(),
    title: z.string().max(180).optional(),
    html: z.string().max(100_000),
    width: z.enum(["narrow", "wide", "full"]).default("narrow"),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("features"),
    eyebrow: z.string().max(120).optional(),
    title: z.string().min(1).max(180),
    description: z.string().max(500).optional(),
    columns: z.number().int().min(2).max(4).default(3),
    variant: z.enum(["cards", "platform", "steps"]).default("cards"),
    items: z
      .array(
        z.object({
          icon: z.string().max(40).optional(),
          title: z.string().min(1).max(120),
          description: z.string().max(500),
          link: linkSchema.optional(),
        }),
      )
      .min(1)
      .max(12),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("stats"),
    title: z.string().max(180).optional(),
    items: z
      .array(
        z.object({ value: z.string().max(30), label: z.string().max(100) }),
      )
      .min(1)
      .max(8),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("contentFeed"),
    title: z.string().min(1).max(180),
    contentType: z.enum(["post", "news", "event", "member", "campaign"]),
    limit: z.number().int().min(1).max(24).default(6),
    layout: z.enum(["grid", "list", "carousel"]).default("grid"),
    action: linkSchema.optional(),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("organizationChart"),
    title: z.string().min(1).max(180),
    description: z.string().max(500).optional(),
    rootUnitId: z.string().uuid().optional(),
    depth: z.number().int().min(1).max(8).default(4),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("cta"),
    title: z.string().min(1).max(180),
    description: z.string().max(500).optional(),
    primaryAction: linkSchema,
    secondaryAction: linkSchema.optional(),
    tone: z.enum(["brand", "neutral", "contrast"]).default("brand"),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal("contact"),
    title: z.string().min(1).max(180),
    description: z.string().max(500).optional(),
    showForm: z.boolean().default(true),
    showMap: z.boolean().default(false),
  }),
]);

export const pageSectionsSchema = z.array(pageSectionSchema).max(40);
export type PageSection = z.infer<typeof pageSectionSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type PublicFooter = z.infer<typeof publicFooterSchema>;
export type PublicAnnouncement = z.infer<typeof publicAnnouncementSchema>;
export type PublicQuickContact = z.infer<typeof publicQuickContactSchema>;
export type PublicNavItem = z.infer<typeof publicNavItemSchema>;
export type PublicSettings = z.infer<typeof publicSettingsSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
});

export const verificationLevelSchema = z.enum([
  "self_declared",
  "document_checked",
  "issuer_confirmed",
  "api_verified",
  "cryptographically_verified",
]);

export const credentialStatusSchema = z.enum([
  "draft",
  "submitted",
  "verified",
  "rejected",
  "expired",
  "revoked",
]);

export const credentialFieldSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z][a-zA-Z0-9_]*$/),
  label: z.string().trim().min(1).max(120),
  type: z.enum(["text", "date", "number", "url", "select"]),
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
});

export const credentialSchemeInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[A-Z0-9][A-Z0-9_-]*$/),
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(5000).nullable().optional(),
  subjectType: z.enum(["person", "organization"]).default("person"),
  category: z.string().trim().min(2).max(80).default("general"),
  issuerName: z.string().trim().max(180).nullable().optional(),
  validityMonths: z.number().int().min(1).max(1200).nullable().optional(),
  renewalWindowDays: z.number().int().min(0).max(3650).default(30),
  minimumVerificationLevel: verificationLevelSchema.default("document_checked"),
  fields: z.array(credentialFieldSchema).max(50).default([]),
  verificationConfig: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true),
});

export type VerificationLevel = z.infer<typeof verificationLevelSchema>;
export type CredentialStatus = z.infer<typeof credentialStatusSchema>;
export type CredentialField = z.infer<typeof credentialFieldSchema>;

export const creditSchemeInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[A-Z0-9][A-Z0-9_-]*$/),
  name: z.string().trim().min(2).max(160),
  unitLabel: z.string().trim().min(1).max(60),
  description: z.string().trim().max(5000).nullable().optional(),
  validityMonths: z.number().int().min(1).max(1200).nullable().optional(),
  isActive: z.boolean().default(true),
});

export const learningActivityInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[A-Z0-9][A-Z0-9_-]*$/),
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(20_000).nullable().optional(),
    category: z.string().trim().min(2).max(80).default("general"),
    deliveryMode: z
      .enum(["onsite", "online", "hybrid", "self_paced"])
      .default("onsite"),
    locationName: z.string().trim().max(200).nullable().optional(),
    meetingUrl: z.string().url().max(2048).nullable().optional(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime().nullable().optional(),
    timezone: z.string().trim().min(2).max(60).default("Asia/Jakarta"),
    enrollmentOpensAt: z.string().datetime().nullable().optional(),
    enrollmentClosesAt: z.string().datetime().nullable().optional(),
    capacity: z.number().int().min(1).max(10_000_000).nullable().optional(),
    creditSchemeId: z.string().uuid().nullable().optional(),
    creditAmount: z.number().min(0).max(10_000).multipleOf(0.01).default(0),
    status: z
      .enum(["draft", "open", "in_progress", "completed", "cancelled"])
      .default("draft"),
  })
  .superRefine((value, context) => {
    if (value.endsAt && value.endsAt < value.startsAt)
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Activity end must be after its start.",
      });
    if (
      value.enrollmentOpensAt &&
      value.enrollmentClosesAt &&
      value.enrollmentClosesAt < value.enrollmentOpensAt
    )
      context.addIssue({
        code: "custom",
        path: ["enrollmentClosesAt"],
        message: "Enrollment close must be after its opening.",
      });
    if (value.creditAmount > 0 && !value.creditSchemeId)
      context.addIssue({
        code: "custom",
        path: ["creditSchemeId"],
        message: "A credit scheme is required when an activity awards credit.",
      });
  });

export type CreditSchemeInput = z.infer<typeof creditSchemeInputSchema>;
export type LearningActivityInput = z.infer<typeof learningActivityInputSchema>;

export const audienceSegmentCriteriaSchema = z.object({
  membershipStatuses: z
    .array(z.enum(["applicant", "pending", "active", "inactive", "rejected"]))
    .max(5)
    .optional(),
  membershipTypes: z
    .array(z.string().trim().min(1).max(80))
    .max(100)
    .optional(),
  unitIds: z.array(z.string().uuid()).max(100).optional(),
  hasEntitlement: z.string().trim().min(1).max(100).optional(),
});

export const revenueProductInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[A-Z0-9][A-Z0-9_-]*$/),
    name: z.string().trim().min(2).max(180),
    description: z.string().trim().max(5000).nullable().optional(),
    type: z.enum([
      "membership_dues",
      "event_ticket",
      "donation",
      "service",
      "sponsorship",
      "other",
    ]),
    price: z.number().min(0).max(10_000_000_000).multipleOf(0.01),
    currency: z
      .string()
      .trim()
      .length(3)
      .transform((value) => value.toUpperCase())
      .default("IDR"),
    billingInterval: z
      .enum(["one_time", "monthly", "quarterly", "annual"])
      .default("one_time"),
    entitlementKey: z.string().trim().min(1).max(100).nullable().optional(),
    entitlementLabel: z.string().trim().min(1).max(180).nullable().optional(),
    entitlementDurationMonths: z
      .number()
      .int()
      .min(1)
      .max(1200)
      .nullable()
      .optional(),
    isActive: z.boolean().default(true),
  })
  .superRefine((value, context) => {
    if (value.entitlementKey && !value.entitlementLabel)
      context.addIssue({
        code: "custom",
        path: ["entitlementLabel"],
        message: "An entitlement label is required.",
      });
  });

export const invoiceCreateInputSchema = z.object({
  memberId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100_000).default(1),
  dueAt: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export const engagementCampaignInputSchema = z.object({
  segmentId: z.string().uuid(),
  name: z.string().trim().min(2).max(180),
  channel: z.enum(["email", "whatsapp", "sms", "in_app"]),
  subject: z.string().trim().max(240).nullable().optional(),
  message: z.string().trim().min(1).max(20_000),
  scheduledAt: z.string().datetime().nullable().optional(),
});

export const regulationInputSchema = z.object({
  title: z.string().trim().min(2).max(220),
  slug: z.string().trim().min(2).max(200).optional(),
  category: z
    .enum([
      "regulasi_pemerintah",
      "se_organisasi",
      "ad_art",
      "posisi_kebijakan",
    ])
    .default("regulasi_pemerintah"),
  number: z.string().trim().max(120).nullable().optional(),
  issuedDate: z.string().nullable().optional(),
  fileUrl: z.string().trim().max(2048).nullable().optional(),
  summary: z.string().trim().max(5000).nullable().optional(),
  status: z
    .enum(["draft", "review", "scheduled", "published", "archived"])
    .default("published"),
});

export const publicComplaintInputSchema = z.object({
  complainantName: z.string().trim().min(2).max(160),
  complainantEmail: z.string().trim().email().max(320),
  complainantPhone: z.string().trim().max(40).optional(),
  targetType: z
    .enum(["member", "technician", "lender", "company"])
    .default("member"),
  targetIdentifier: z.string().trim().min(2).max(160),
  category: z
    .enum(["kode_etik", "layanan_teknisi", "penagihan", "sengketa"])
    .default("kode_etik"),
  description: z.string().trim().min(10).max(10_000),
  evidenceFileUrl: z.string().trim().max(2048).nullable().optional(),
});

export const championshipStandingInputSchema = z.object({
  seasonYear: z.number().int().min(2000).max(2100).default(2026),
  category: z.string().trim().min(2).max(120),
  participantName: z.string().trim().min(2).max(160),
  teamName: z.string().trim().max(160).nullable().optional(),
  unitName: z.string().trim().max(160).nullable().optional(),
  points: z.number().int().min(0).default(0),
  rank: z.number().int().min(1).default(1),
  achievements: z.string().trim().max(2000).nullable().optional(),
});

export const eventRegistrationInputSchema = z.object({
  participantName: z.string().trim().min(2).max(160),
  participantEmail: z.string().trim().email().max(320),
  participantPhone: z.string().trim().max(40).optional(),
});

export const industryStatisticInputSchema = z.object({
  metricKey: z.string().trim().min(2).max(80),
  metricLabel: z.string().trim().min(2).max(180),
  metricValue: z.string().trim().min(1).max(80),
  metricUnit: z.string().trim().max(40).nullable().optional(),
  trendDirection: z.enum(["up", "down", "stable"]).default("up"),
  trendPercentage: z.string().trim().max(20).nullable().optional(),
  category: z.string().trim().max(80).default("general"),
  period: z.string().trim().max(80).default("2026 Q1"),
  sortOrder: z.number().int().default(0),
});

export type AudienceSegmentCriteria = z.infer<
  typeof audienceSegmentCriteriaSchema
>;
export type RevenueProductInput = z.infer<typeof revenueProductInputSchema>;
export type RegulationInput = z.infer<typeof regulationInputSchema>;
export type PublicComplaintInput = z.infer<typeof publicComplaintInputSchema>;
export type ChampionshipStandingInput = z.infer<
  typeof championshipStandingInputSchema
>;
export type IndustryStatisticInput = z.infer<
  typeof industryStatisticInputSchema
>;

export type ApiEnvelope<T> = {
  data: T;
  meta?: { page?: number; limit?: number; total?: number; requestId?: string };
};

export type PublicSite = {
  organization: {
    id: string;
    name: string;
    slug: string;
    kind: z.infer<typeof organizationKindSchema>;
    tagline: string | null;
    description: string | null;
    logoUrl: string | null;
    faviconUrl: string | null;
    locale: string;
    theme: Theme;
  };
  navigation: Array<{
    id: string;
    label: string;
    href: string;
    children: Array<{ label: string; href: string }>;
  }>;
  footer: PublicFooter;
  announcement: PublicAnnouncement | null;
  quickContact: PublicQuickContact | null;
};

export * from "./wilayah";
