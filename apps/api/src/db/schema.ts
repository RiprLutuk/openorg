import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const organizationKind = pgEnum("organization_kind", [
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
export const publicationStatus = pgEnum("publication_status", [
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
]);
export const userStatus = pgEnum("user_status", [
  "invited",
  "active",
  "suspended",
]);
export const memberStatus = pgEnum("member_status", [
  "applicant",
  "pending",
  "active",
  "inactive",
  "rejected",
]);
export const mediaKind = pgEnum("media_kind", [
  "image",
  "video",
  "document",
  "audio",
]);
export const submissionStatus = pgEnum("submission_status", [
  "new",
  "in_progress",
  "resolved",
  "spam",
]);
export const memberDocumentKind = pgEnum("member_document_kind", [
  "identity",
  "background_check",
  "certificate",
  "license",
  "other",
]);
export const reviewStatus = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
]);
export const credentialSubjectType = pgEnum("credential_subject_type", [
  "person",
  "organization",
]);
export const credentialStatus = pgEnum("credential_status", [
  "draft",
  "submitted",
  "verified",
  "rejected",
  "expired",
  "revoked",
]);
export const verificationLevel = pgEnum("verification_level", [
  "self_declared",
  "document_checked",
  "issuer_confirmed",
  "api_verified",
  "cryptographically_verified",
]);
export const credentialRequirementRule = pgEnum("credential_requirement_rule", [
  "required",
  "one_of",
  "optional",
]);
export const learningActivityStatus = pgEnum("learning_activity_status", [
  "draft",
  "open",
  "in_progress",
  "completed",
  "cancelled",
]);
export const learningDeliveryMode = pgEnum("learning_delivery_mode", [
  "onsite",
  "online",
  "hybrid",
  "self_paced",
]);
export const learningEnrollmentStatus = pgEnum("learning_enrollment_status", [
  "registered",
  "waitlisted",
  "confirmed",
  "completed",
  "cancelled",
]);
export const learningAttendanceStatus = pgEnum("learning_attendance_status", [
  "present",
  "late",
  "absent",
  "excused",
]);
export const creditLedgerEntryType = pgEnum("credit_ledger_entry_type", [
  "earned",
  "adjustment",
  "reversal",
]);
export const revenueProductType = pgEnum("revenue_product_type", [
  "membership_dues",
  "event_ticket",
  "donation",
  "service",
  "sponsorship",
  "other",
]);
export const billingInterval = pgEnum("billing_interval", [
  "one_time",
  "monthly",
  "quarterly",
  "annual",
]);
export const invoiceStatus = pgEnum("invoice_status", [
  "draft",
  "open",
  "paid",
  "void",
]);
export const paymentStatus = pgEnum("payment_status", [
  "confirmed",
  "failed",
  "refunded",
]);
export const entitlementStatus = pgEnum("entitlement_status", [
  "active",
  "expired",
  "revoked",
]);
export const campaignChannel = pgEnum("campaign_channel", [
  "email",
  "whatsapp",
  "sms",
  "in_app",
]);
export const campaignStatus = pgEnum("campaign_status", [
  "draft",
  "scheduled",
  "queued",
  "sent",
  "cancelled",
]);
export const campaignRecipientStatus = pgEnum("campaign_recipient_status", [
  "queued",
  "sent",
  "failed",
  "skipped",
]);

// Single Organization Site Settings
export const siteSettings = pgTable("site_settings", {
  id: varchar("id", { length: 64 }).primaryKey().default("default"),
  name: varchar("name", { length: 160 })
    .notNull()
    .default("OpenOrg Association"),
  slug: varchar("slug", { length: 80 }).notNull().default("openorg"),
  kind: organizationKind("kind").notNull().default("association"),
  tagline: varchar("tagline", { length: 240 }).default(
    "Platform Resmi Organisasi",
  ),
  description: text("description").default(
    "Platform terpadu keanggotaan, tata kelola organisasi, kredit akademi SKP/CPD, dan verifikasi kredensial.",
  ),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  locale: varchar("locale", { length: 12 }).notNull().default("id-ID"),
  timezone: varchar("timezone", { length: 60 })
    .notNull()
    .default("Asia/Jakarta"),
  primaryColor: text("primary_color").default("#6941C6"),
  secondaryColor: text("secondary_color").default("#12B76A"),
  quickContact: jsonb("quick_contact").$type<{
    channel: string;
    value: string;
    label: string;
    href: string;
  }>(),
  socialLinks: jsonb("social_links")
    .$type<Array<{ platform: string; url: string; label: string }>>()
    .default([]),
  navigation: jsonb("navigation")
    .$type<
      Array<{
        id: string;
        label: string;
        href: string;
        children?: Array<{ id: string; label: string; href: string }>;
      }>
    >()
    .default([]),
  footer: jsonb("footer").$type<Record<string, unknown>>().default({}),
  theme: jsonb("theme").$type<{
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      surface: string;
      foreground: string;
    };
    radius: "none" | "small" | "medium" | "large" | "pill";
    fontHeading: string;
    fontBody: string;
  }>(),
  ...timestamps,
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  status: userStatus("status").notNull().default("invited"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
});

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  description: varchar("description", { length: 240 }),
  isSystem: boolean("is_system").notNull().default(false),
  ...timestamps,
});

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  description: varchar("description", { length: 240 }),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: bytea("token_hash").notNull().unique(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 500 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  excerpt: text("excerpt"),
  sections: jsonb("sections")
    .$type<Array<Record<string, unknown>>>()
    .notNull()
    .default([]),
  status: publicationStatus("status").notNull().default("draft"),
  isHomepage: boolean("is_homepage").notNull().default(false),
  seo: jsonb("seo").$type<Record<string, unknown>>().notNull().default({}),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  authorId: uuid("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: varchar("description", { length: 240 }),
  parentId: uuid("parent_id"),
  ...timestamps,
});

export const contents = pgTable(
  "contents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    type: varchar("type", { length: 40 }).notNull().default("post"),
    excerpt: text("excerpt"),
    body: text("body").notNull().default(""),
    coverUrl: text("cover_url"),
    authorName: varchar("author_name", { length: 120 }),
    sourceUrl: text("source_url"),
    status: publicationStatus("status").notNull().default("draft"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    seo: jsonb("seo").$type<Record<string, unknown>>().notNull().default({}),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    authorId: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [index("contents_type_status_idx").on(table.type, table.status)],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    description: text("description"),
    coverUrl: text("cover_url"),
    locationName: varchar("location_name", { length: 200 }),
    address: text("address"),
    meetingUrl: text("meeting_url"),
    registrationUrl: text("registration_url"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    timezone: varchar("timezone", { length: 60 })
      .notNull()
      .default("Asia/Jakarta"),
    capacity: integer("capacity"),
    status: publicationStatus("status").notNull().default("published"),
    seo: jsonb("seo").$type<Record<string, unknown>>().notNull().default({}),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    organizerId: uuid("organizer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [index("events_starts_at_idx").on(table.startsAt)],
);

export const organizationUnits = pgTable("organization_units", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id"),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 120 }),
  code: varchar("code", { length: 40 }),
  type: varchar("type", { length: 60 }).notNull().default("unit"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const positions = pgTable("positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitId: uuid("unit_id").references(() => organizationUnits.id, {
    onDelete: "set null",
  }),
  parentId: uuid("parent_id"),
  title: varchar("title", { length: 160 }).notNull(),
  code: varchar("code", { length: 40 }),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberNumber: varchar("member_number", { length: 60 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    status: memberStatus("status").notNull().default("active"),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    unitId: uuid("unit_id").references(() => organizationUnits.id, {
      onDelete: "set null",
    }),
    avatarUrl: text("avatar_url"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestamps,
  },
  (table) => [index("members_status_idx").on(table.status)],
);

export const memberAccounts = pgTable("member_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .unique()
    .references(() => members.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  status: userStatus("status").notNull().default("active"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  verificationTokenHash: bytea("verification_token_hash"),
  verificationTokenExpiresAt: timestamp("verification_token_expires_at", {
    withTimezone: true,
  }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
});

export const memberApplications = pgTable("member_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  requestedUnitId: uuid("requested_unit_id").references(
    () => organizationUnits.id,
    { onDelete: "set null" },
  ),
  payload: jsonb("payload")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  status: memberStatus("status").notNull().default("applicant"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNotes: text("review_notes"),
  createdMemberId: uuid("created_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const memberSessions = pgTable("member_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberAccountId: uuid("member_account_id")
    .notNull()
    .references(() => memberAccounts.id, { onDelete: "cascade" }),
  tokenHash: bytea("token_hash").notNull().unique(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: varchar("user_agent", { length: 500 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const membershipCards = pgTable("membership_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 80 }).notNull().unique(),
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  issuedAt: timestamp("issued_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedReason: text("revoked_reason"),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const positionAssignments = pgTable("position_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  positionId: uuid("position_id")
    .notNull()
    .references(() => positions.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isPrimary: boolean("is_primary").notNull().default(true),
  ...timestamps,
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: mediaKind("kind").notNull().default("image"),
  filename: varchar("filename", { length: 255 }).notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  checksumSha256: varchar("checksum_sha256", { length: 64 }).notNull(),
  width: integer("width"),
  height: integer("height"),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  uploadedBy: uuid("uploaded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const memberDocuments = pgTable("member_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "restrict" }),
  kind: memberDocumentKind("kind").notNull().default("other"),
  title: varchar("title", { length: 180 }).notNull(),
  reviewStatus: reviewStatus("review_status").notNull().default("pending"),
  reviewNotes: text("review_notes"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  ...timestamps,
});

export const credentialSchemes = pgTable("credential_schemes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  subjectType: credentialSubjectType("subject_type")
    .notNull()
    .default("person"),
  minimumVerificationLevel: verificationLevel("minimum_verification_level")
    .notNull()
    .default("document_checked"),
  validityPeriodDays: integer("validity_period_days"),
  renewalGracePeriodDays: integer("renewal_grace_period_days")
    .notNull()
    .default(30),
  jsonSchema: jsonb("json_schema")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  ...timestamps,
});

export const credentialRequirements = pgTable("credential_requirements", {
  id: uuid("id").primaryKey().defaultRandom(),
  schemeId: uuid("scheme_id")
    .notNull()
    .references(() => credentialSchemes.id, { onDelete: "cascade" }),
  prerequisiteSchemeId: uuid("prerequisite_scheme_id")
    .notNull()
    .references(() => credentialSchemes.id, { onDelete: "cascade" }),
  ruleGroup: varchar("rule_group", { length: 80 }).notNull().default("primary"),
  ruleType: credentialRequirementRule("rule_type")
    .notNull()
    .default("required"),
  ...timestamps,
});

export const memberCredentials = pgTable("member_credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  schemeId: uuid("scheme_id")
    .notNull()
    .references(() => credentialSchemes.id, { onDelete: "restrict" }),
  credentialNumber: varchar("credential_number", { length: 100 })
    .notNull()
    .unique(),
  verificationLevel: verificationLevel("verification_level")
    .notNull()
    .default("document_checked"),
  status: credentialStatus("status").notNull().default("verified"),
  issuedAt: timestamp("issued_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedReason: text("revoked_reason"),
  payload: jsonb("payload")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  issuedBy: uuid("issued_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const learningCreditSchemes = pgTable("learning_credit_schemes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  unitName: varchar("unit_name", { length: 40 }).notNull().default("SKP"),
  description: text("description"),
  ...timestamps,
});

export const learningActivities = pgTable("learning_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => events.id, {
    onDelete: "set null",
  }),
  creditSchemeId: uuid("credit_scheme_id").references(
    () => learningCreditSchemes.id,
    { onDelete: "restrict" },
  ),
  title: varchar("title", { length: 200 }).notNull(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  deliveryMode: learningDeliveryMode("delivery_mode")
    .notNull()
    .default("onsite"),
  creditAmountHundredths: integer("credit_amount_hundredths")
    .notNull()
    .default(100),
  capacity: integer("capacity"),
  status: learningActivityStatus("status").notNull().default("open"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  ...timestamps,
});

export const learningEnrollments = pgTable(
  "learning_enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => learningActivities.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    status: learningEnrollmentStatus("status").notNull().default("registered"),
    registeredAt: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
  },
  (table) => [
    uniqueIndex("enrollments_activity_member_unique").on(
      table.activityId,
      table.memberId,
    ),
  ],
);

export const learningAttendance = pgTable("learning_attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  enrollmentId: uuid("enrollment_id")
    .notNull()
    .unique()
    .references(() => learningEnrollments.id, { onDelete: "cascade" }),
  status: learningAttendanceStatus("status").notNull().default("present"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  verifiedBy: uuid("verified_by").references(() => users.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
});

export const learningCreditLedger = pgTable("learning_credit_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  schemeId: uuid("scheme_id")
    .notNull()
    .references(() => learningCreditSchemes.id, { onDelete: "restrict" }),
  activityId: uuid("activity_id").references(() => learningActivities.id, {
    onDelete: "set null",
  }),
  entryType: creditLedgerEntryType("entry_type").notNull().default("earned"),
  creditAmountHundredths: integer("credit_amount_hundredths").notNull(),
  notes: text("notes"),
  issuedBy: uuid("issued_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const revenueProducts = pgTable("revenue_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 180 }).notNull(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  type: revenueProductType("type").notNull().default("membership_dues"),
  description: text("description"),
  amountMinor: integer("amount_minor").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
  billingInterval: billingInterval("billing_interval")
    .notNull()
    .default("annual"),
  grantsEntitlementKey: varchar("grants_entitlement_key", { length: 100 }),
  entitlementDurationDays: integer("entitlement_duration_days"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "restrict" }),
  invoiceNumber: varchar("invoice_number", { length: 80 }).notNull().unique(),
  status: invoiceStatus("status").notNull().default("open"),
  currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
  issuedAt: timestamp("issued_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  subtotalMinor: integer("subtotal_minor").notNull(),
  totalMinor: integer("total_minor").notNull(),
  paidMinor: integer("paid_minor").notNull().default(0),
  notes: text("notes"),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const invoiceLines = pgTable("invoice_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => revenueProducts.id, {
    onDelete: "set null",
  }),
  description: varchar("description", { length: 300 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitAmountMinor: integer("unit_amount_minor").notNull(),
  lineTotalMinor: integer("line_total_minor").notNull(),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "restrict" }),
  amountMinor: integer("amount_minor").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  method: varchar("method", { length: 80 }).notNull(),
  reference: varchar("reference", { length: 160 }),
  status: paymentStatus("status").notNull().default("confirmed"),
  paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
  recordedBy: uuid("recorded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const memberEntitlements = pgTable("member_entitlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  entitlementKey: varchar("entitlement_key", { length: 100 }).notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  sourceInvoiceId: uuid("source_invoice_id").references(() => invoices.id, {
    onDelete: "set null",
  }),
  sourceProductId: uuid("source_product_id").references(
    () => revenueProducts.id,
    { onDelete: "set null" },
  ),
  status: entitlementStatus("status").notNull().default("active"),
  startsAt: timestamp("starts_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  ...timestamps,
});

export const audienceSegments = pgTable("audience_segments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description"),
  criteria: jsonb("criteria")
    .$type<{
      membershipStatuses?: Array<
        "applicant" | "pending" | "active" | "inactive" | "rejected"
      >;
      membershipTypes?: string[];
      unitIds?: string[];
      hasEntitlement?: string;
    }>()
    .notNull()
    .default({}),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const engagementCampaigns = pgTable("engagement_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  segmentId: uuid("segment_id")
    .notNull()
    .references(() => audienceSegments.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 180 }).notNull(),
  channel: campaignChannel("channel").notNull(),
  subject: varchar("subject", { length: 240 }),
  message: text("message").notNull(),
  status: campaignStatus("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  metrics: jsonb("metrics")
    .$type<Record<string, number>>()
    .notNull()
    .default({}),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const campaignRecipients = pgTable("campaign_recipients", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => engagementCampaigns.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  destination: varchar("destination", { length: 320 }),
  status: campaignRecipientStatus("status").notNull().default("queued"),
  queuedAt: timestamp("queued_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  error: text("error"),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  status: submissionStatus("status").notNull().default("new"),
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 80 }).notNull(),
  resourceId: varchar("resource_id", { length: 100 }),
  before: jsonb("before").$type<Record<string, unknown>>(),
  after: jsonb("after").$type<Record<string, unknown>>(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: varchar("user_agent", { length: 500 }),
  requestId: varchar("request_id", { length: 80 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const regulationCategory = pgEnum("regulation_category", [
  "regulasi_pemerintah",
  "se_organisasi",
  "ad_art",
  "posisi_kebijakan",
]);

export const complaintStatus = pgEnum("complaint_status", [
  "new",
  "under_review",
  "mediated",
  "resolved",
  "dismissed",
]);

export const regulations = pgTable("regulations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  category: regulationCategory("category")
    .notNull()
    .default("regulasi_pemerintah"),
  number: varchar("number", { length: 120 }),
  issuedDate: timestamp("issued_date", { withTimezone: true }),
  fileUrl: text("file_url"),
  summary: text("summary"),
  downloadCount: integer("download_count").notNull().default(0),
  status: publicationStatus("status").notNull().default("published"),
  ...timestamps,
});

export const publicComplaints = pgTable("public_complaints", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketNumber: varchar("ticket_number", { length: 60 }).notNull().unique(),
  complainantName: varchar("complainant_name", { length: 160 }).notNull(),
  complainantEmail: varchar("complainant_email", { length: 320 }).notNull(),
  complainantPhone: varchar("complainant_phone", { length: 40 }),
  targetType: varchar("target_type", { length: 60 })
    .notNull()
    .default("member"),
  targetIdentifier: varchar("target_identifier", { length: 160 }).notNull(),
  category: varchar("category", { length: 80 }).notNull().default("kode_etik"),
  description: text("description").notNull(),
  evidenceFileUrl: text("evidence_file_url"),
  status: complaintStatus("status").notNull().default("new"),
  responseNotes: text("response_notes"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  ...timestamps,
});

export const championshipStandings = pgTable("championship_standings", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonYear: integer("season_year").notNull().default(2026),
  category: varchar("category", { length: 120 })
    .notNull()
    .default("refrigeration_skill"),
  participantName: varchar("participant_name", { length: 160 }).notNull(),
  teamName: varchar("team_name", { length: 160 }),
  unitName: varchar("unit_name", { length: 160 }),
  points: integer("points").notNull().default(0),
  rank: integer("rank").notNull().default(1),
  achievements: text("achievements"),
  ...timestamps,
});

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  participantName: varchar("participant_name", { length: 160 }).notNull(),
  participantEmail: varchar("participant_email", { length: 320 }).notNull(),
  participantPhone: varchar("participant_phone", { length: 40 }),
  ticketCode: varchar("ticket_code", { length: 80 }).notNull().unique(),
  qrCodeUrl: text("qr_code_url"),
  status: varchar("status", { length: 40 }).notNull().default("registered"),
  ...timestamps,
});

export const industryStatistics = pgTable("industry_statistics", {
  id: uuid("id").primaryKey().defaultRandom(),
  metricKey: varchar("metric_key", { length: 80 }).notNull().unique(),
  metricLabel: varchar("metric_label", { length: 180 }).notNull(),
  metricValue: varchar("metric_value", { length: 80 }).notNull(),
  metricUnit: varchar("metric_unit", { length: 40 }),
  trendDirection: varchar("trend_direction", { length: 20 }).default("up"),
  trendPercentage: varchar("trend_percentage", { length: 20 }),
  category: varchar("category", { length: 80 }).notNull().default("general"),
  period: varchar("period", { length: 80 }).default("2026 Q1"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const workingGroups = pgTable("working_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  chairName: varchar("chair_name", { length: 160 }),
  category: varchar("category", { length: 80 }).notNull().default("advocacy"),
  description: text("description"),
  memberCount: integer("member_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const technicianDirectories = pgTable("technician_directories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  ktaNumber: varchar("kta_number", { length: 80 }).notNull().unique(),
  skillLevel: varchar("skill_level", { length: 80 })
    .notNull()
    .default("Level 3 Residensial"),
  province: varchar("province", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  workshopName: varchar("workshop_name", { length: 160 }),
  rating: varchar("rating", { length: 10 }).default("4.9"),
  certifiedBnsp: boolean("certified_bnsp").notNull().default(true),
  isAvailable: boolean("is_available").notNull().default(true),
  ...timestamps,
});

export const registeredClubs = pgTable("registered_clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubName: varchar("club_name", { length: 180 }).notNull(),
  codeTkt: varchar("code_tkt", { length: 80 }).notNull().unique(),
  province: varchar("province", { length: 100 }).notNull(),
  category: varchar("category", { length: 80 })
    .notNull()
    .default("Mobility & Community"),
  chairName: varchar("chair_name", { length: 160 }),
  activeMembers: integer("active_members").notNull().default(1),
  status: varchar("status", { length: 40 }).notNull().default("verified"),
  ...timestamps,
});

export const lenderRegistries = pgTable("lender_registries", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandName: varchar("brand_name", { length: 160 }).notNull(),
  companyName: varchar("company_name", { length: 220 }).notNull(),
  licenseNumber: varchar("license_number", { length: 120 }).notNull().unique(),
  sectorType: varchar("sector_type", { length: 80 })
    .notNull()
    .default("P2P Lending Produktif"),
  ojkStatus: varchar("ojk_status", { length: 60 })
    .notNull()
    .default("Berizin OJK"),
  websiteUrl: text("website_url"),
  isAfpiMember: boolean("is_afpi_member").notNull().default(true),
  ...timestamps,
});

// Relations definitions
export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  roles: many(userRoles),
}));

export const pageRelations = relations(pages, () => ({}));

export const contentRelations = relations(contents, ({ one }) => ({
  category: one(categories, {
    fields: [contents.categoryId],
    references: [categories.id],
  }),
}));
