import { relations, sql } from "drizzle-orm";
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

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    kind: organizationKind("kind").notNull().default("association"),
    tagline: varchar("tagline", { length: 240 }),
    description: text("description"),
    logoUrl: text("logo_url"),
    faviconUrl: text("favicon_url"),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    address: text("address"),
    locale: varchar("locale", { length: 12 }).notNull().default("id-ID"),
    timezone: varchar("timezone", { length: 60 })
      .notNull()
      .default("Asia/Jakarta"),
    theme: jsonb("theme")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    features: jsonb("features")
      .$type<Record<string, boolean>>()
      .notNull()
      .default({}),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("organizations_slug_unique").on(table.slug)],
);

export const domains = pgTable(
  "domains",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    hostname: varchar("hostname", { length: 253 }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("domains_hostname_unique").on(table.hostname),
    index("domains_organization_idx").on(table.organizationId),
  ],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    avatarUrl: text("avatar_url"),
    status: userStatus("status").notNull().default("invited"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_org_email_unique").on(table.organizationId, table.email),
    index("users_organization_idx").on(table.organizationId),
  ],
);

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    description: varchar("description", { length: 240 }),
    isSystem: boolean("is_system").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("roles_org_name_unique").on(table.organizationId, table.name),
  ],
);

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
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    tokenHash: bytea("token_hash").notNull(),
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
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_idx").on(table.userId),
  ],
);

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    excerpt: text("excerpt"),
    sections: jsonb("sections")
      .$type<Array<Record<string, unknown>>>()
      .notNull()
      .default([]),
    status: publicationStatus("status").notNull().default("draft"),
    isHomepage: boolean("is_homepage").notNull().default(false),
    seo: jsonb("seo").$type<Record<string, unknown>>().notNull().default({}),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("pages_org_slug_unique")
      .on(table.organizationId, table.slug)
      .where(sql`${table.deletedAt} is null`),
    index("pages_public_idx").on(
      table.organizationId,
      table.status,
      table.publishedAt,
    ),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    color: varchar("color", { length: 7 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("categories_org_slug_unique").on(
      table.organizationId,
      table.slug,
    ),
  ],
);

export const contents = pgTable(
  "contents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    type: varchar("type", { length: 40 }).notNull().default("post"),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull().default(""),
    coverUrl: text("cover_url"),
    authorName: varchar("author_name", { length: 160 }),
    sourceUrl: text("source_url"),
    status: publicationStatus("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    seo: jsonb("seo").$type<Record<string, unknown>>().notNull().default({}),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("contents_org_type_slug_unique")
      .on(table.organizationId, table.type, table.slug)
      .where(sql`${table.deletedAt} is null`),
    index("contents_feed_idx").on(
      table.organizationId,
      table.type,
      table.status,
      table.publishedAt,
    ),
  ],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
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
    status: publicationStatus("status").notNull().default("draft"),
    capacity: integer("capacity"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("events_org_slug_unique")
      .on(table.organizationId, table.slug)
      .where(sql`${table.deletedAt} is null`),
    index("events_date_idx").on(table.organizationId, table.startsAt),
  ],
);

export const organizationUnits = pgTable(
  "organization_units",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    type: varchar("type", { length: 60 }).notNull().default("chapter"),
    description: text("description"),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    address: text("address"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("units_org_slug_unique").on(table.organizationId, table.slug),
    index("units_parent_idx").on(table.organizationId, table.parentId),
  ],
);

export const positions = pgTable(
  "positions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    unitId: uuid("unit_id").references(() => organizationUnits.id, {
      onDelete: "cascade",
    }),
    parentId: uuid("parent_id"),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("positions_unit_idx").on(table.organizationId, table.unitId),
  ],
);

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    unitId: uuid("unit_id").references(() => organizationUnits.id, {
      onDelete: "set null",
    }),
    memberNumber: varchar("member_number", { length: 80 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    avatarUrl: text("avatar_url"),
    address: text("address"),
    biography: text("biography"),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    status: memberStatus("status").notNull().default("applicant"),
    isPublic: boolean("is_public").notNull().default(false),
    customFields: jsonb("custom_fields")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    socialLinks: jsonb("social_links")
      .$type<Array<{ platform: string; url: string }>>()
      .notNull()
      .default([]),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("members_org_number_unique").on(
      table.organizationId,
      table.memberNumber,
    ),
    index("members_status_idx").on(table.organizationId, table.status),
  ],
);

export const memberAccounts = pgTable(
  "member_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    verificationTokenHash: bytea("verification_token_hash"),
    verificationExpiresAt: timestamp("verification_expires_at", {
      withTimezone: true,
    }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("member_accounts_member_unique").on(table.memberId),
    uniqueIndex("member_accounts_org_email_unique").on(
      table.organizationId,
      table.email,
    ),
  ],
);

export const memberApplications = pgTable(
  "member_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    status: memberStatus("status").notNull().default("applicant"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    rejectionReason: text("rejection_reason"),
    reviewerNotes: text("reviewer_notes"),
    consent: jsonb("consent")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("member_applications_member_unique").on(table.memberId),
    index("member_applications_queue_idx").on(
      table.organizationId,
      table.status,
      table.submittedAt,
    ),
  ],
);

export const memberSessions = pgTable(
  "member_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    tokenHash: bytea("token_hash").notNull(),
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
  (table) => [
    uniqueIndex("member_sessions_token_unique").on(table.tokenHash),
    index("member_sessions_member_idx").on(table.memberId),
  ],
);

export const membershipCards = pgTable(
  "membership_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    cardNumber: varchar("card_number", { length: 80 }).notNull(),
    verificationCode: uuid("verification_code").notNull().defaultRandom(),
    version: integer("version").notNull().default(1),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    snapshot: jsonb("snapshot")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("membership_cards_verification_unique").on(
      table.verificationCode,
    ),
    uniqueIndex("membership_cards_org_number_version_unique").on(
      table.organizationId,
      table.cardNumber,
      table.version,
    ),
    index("membership_cards_member_idx").on(table.memberId, table.revokedAt),
  ],
);

export const positionAssignments = pgTable(
  "position_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    uniqueIndex("assignments_position_member_unique").on(
      table.positionId,
      table.memberId,
    ),
  ],
);

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    kind: mediaKind("kind").notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    size: integer("size").notNull(),
    storageKey: text("storage_key").notNull(),
    publicUrl: text("public_url").notNull(),
    altText: varchar("alt_text", { length: 300 }),
    width: integer("width"),
    height: integer("height"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    uploadedBy: uuid("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("media_org_created_idx").on(table.organizationId, table.createdAt),
  ],
);

export const memberDocuments = pgTable(
  "member_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    kind: memberDocumentKind("kind").notNull(),
    label: varchar("label", { length: 180 }).notNull(),
    status: reviewStatus("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewNotes: text("review_notes"),
    ...timestamps,
  },
  (table) => [
    index("member_documents_member_idx").on(table.memberId, table.kind),
    index("member_documents_review_idx").on(table.organizationId, table.status),
  ],
);

export const credentialSchemes = pgTable(
  "credential_schemes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    description: text("description"),
    subjectType: credentialSubjectType("subject_type")
      .notNull()
      .default("person"),
    category: varchar("category", { length: 80 }).notNull().default("general"),
    issuerName: varchar("issuer_name", { length: 180 }),
    validityMonths: integer("validity_months"),
    renewalWindowDays: integer("renewal_window_days").notNull().default(30),
    minimumVerificationLevel: verificationLevel("minimum_verification_level")
      .notNull()
      .default("document_checked"),
    fields: jsonb("fields")
      .$type<
        Array<{
          key: string;
          label: string;
          type: "text" | "date" | "number" | "url" | "select";
          required: boolean;
          options?: string[] | undefined;
        }>
      >()
      .notNull()
      .default([]),
    verificationConfig: jsonb("verification_config")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("credential_schemes_org_code_unique").on(
      table.organizationId,
      table.code,
    ),
    index("credential_schemes_category_idx").on(
      table.organizationId,
      table.category,
      table.isActive,
    ),
  ],
);

export const credentialRequirements = pgTable(
  "credential_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    schemeId: uuid("scheme_id")
      .notNull()
      .references(() => credentialSchemes.id, { onDelete: "cascade" }),
    membershipType: varchar("membership_type", { length: 80 })
      .notNull()
      .default("default"),
    rule: credentialRequirementRule("rule").notNull().default("required"),
    groupKey: varchar("group_key", { length: 80 }),
    requiredVerificationLevel: verificationLevel("required_verification_level")
      .notNull()
      .default("document_checked"),
    gracePeriodDays: integer("grace_period_days").notNull().default(0),
    blocksApproval: boolean("blocks_approval").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("credential_requirements_scope_unique").on(
      table.organizationId,
      table.schemeId,
      table.membershipType,
    ),
    index("credential_requirements_type_idx").on(
      table.organizationId,
      table.membershipType,
      table.sortOrder,
    ),
  ],
);

export const memberCredentials = pgTable(
  "member_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    schemeId: uuid("scheme_id")
      .notNull()
      .references(() => credentialSchemes.id, { onDelete: "restrict" }),
    credentialNumber: varchar("credential_number", { length: 180 }),
    issuerName: varchar("issuer_name", { length: 180 }),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    status: credentialStatus("status").notNull().default("draft"),
    verificationLevel: verificationLevel("verification_level")
      .notNull()
      .default("self_declared"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedBy: uuid("verified_by").references(() => users.id, {
      onDelete: "set null",
    }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokeReason: text("revoke_reason"),
    sourceUrl: text("source_url"),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    ...timestamps,
  },
  (table) => [
    index("member_credentials_member_idx").on(
      table.organizationId,
      table.memberId,
      table.status,
    ),
    index("member_credentials_expiry_idx").on(
      table.organizationId,
      table.expiresAt,
      table.status,
    ),
  ],
);

export const credentialEvidence = pgTable(
  "credential_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    credentialId: uuid("credential_id")
      .notNull()
      .references(() => memberCredentials.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    label: varchar("label", { length: 180 }).notNull(),
    sourceUrl: text("source_url"),
    fileHash: varchar("file_hash", { length: 128 }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("credential_evidence_credential_idx").on(table.credentialId),
  ],
);

export const credentialVerificationEvents = pgTable(
  "credential_verification_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    credentialId: uuid("credential_id")
      .notNull()
      .references(() => memberCredentials.id, { onDelete: "cascade" }),
    fromStatus: credentialStatus("from_status"),
    toStatus: credentialStatus("to_status").notNull(),
    verificationLevel: verificationLevel("verification_level").notNull(),
    method: varchar("method", { length: 80 }).notNull(),
    source: varchar("source", { length: 180 }),
    notes: text("notes"),
    result: jsonb("result")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("credential_verification_timeline_idx").on(
      table.credentialId,
      table.createdAt,
    ),
  ],
);

export const creditSchemes = pgTable(
  "credit_schemes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 60 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    unitLabel: varchar("unit_label", { length: 60 }).notNull(),
    description: text("description"),
    validityMonths: integer("validity_months"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("credit_schemes_org_code_unique").on(
      table.organizationId,
      table.code,
    ),
  ],
);

export const learningActivities = pgTable(
  "learning_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    creditSchemeId: uuid("credit_scheme_id").references(
      () => creditSchemes.id,
      { onDelete: "set null" },
    ),
    code: varchar("code", { length: 80 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 80 }).notNull().default("general"),
    deliveryMode: learningDeliveryMode("delivery_mode")
      .notNull()
      .default("onsite"),
    locationName: varchar("location_name", { length: 200 }),
    meetingUrl: text("meeting_url"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    timezone: varchar("timezone", { length: 60 })
      .notNull()
      .default("Asia/Jakarta"),
    enrollmentOpensAt: timestamp("enrollment_opens_at", {
      withTimezone: true,
    }),
    enrollmentClosesAt: timestamp("enrollment_closes_at", {
      withTimezone: true,
    }),
    capacity: integer("capacity"),
    creditAmountHundredths: integer("credit_amount_hundredths")
      .notNull()
      .default(0),
    status: learningActivityStatus("status").notNull().default("draft"),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("learning_activities_org_code_unique").on(
      table.organizationId,
      table.code,
    ),
    index("learning_activities_schedule_idx").on(
      table.organizationId,
      table.status,
      table.startsAt,
    ),
  ],
);

export const learningEnrollments = pgTable(
  "learning_enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
    ...timestamps,
  },
  (table) => [
    uniqueIndex("learning_enrollments_activity_member_unique").on(
      table.activityId,
      table.memberId,
    ),
    index("learning_enrollments_member_idx").on(
      table.organizationId,
      table.memberId,
      table.status,
    ),
  ],
);

export const learningAttendance = pgTable(
  "learning_attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => learningActivities.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    status: learningAttendanceStatus("status").notNull(),
    checkInAt: timestamp("check_in_at", { withTimezone: true }),
    checkOutAt: timestamp("check_out_at", { withTimezone: true }),
    minutesAttended: integer("minutes_attended"),
    source: varchar("source", { length: 80 }).notNull().default("admin"),
    evidence: jsonb("evidence")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    verifiedBy: uuid("verified_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("learning_attendance_activity_member_unique").on(
      table.activityId,
      table.memberId,
    ),
  ],
);

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    creditSchemeId: uuid("credit_scheme_id")
      .notNull()
      .references(() => creditSchemes.id, { onDelete: "restrict" }),
    activityId: uuid("activity_id").references(() => learningActivities.id, {
      onDelete: "set null",
    }),
    enrollmentId: uuid("enrollment_id").references(
      () => learningEnrollments.id,
      { onDelete: "set null" },
    ),
    entryType: creditLedgerEntryType("entry_type").notNull(),
    amountHundredths: integer("amount_hundredths").notNull(),
    reason: text("reason").notNull(),
    reversalOf: uuid("reversal_of"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    postedBy: uuid("posted_by").references(() => users.id, {
      onDelete: "set null",
    }),
    postedAt: timestamp("posted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("credit_ledger_member_idx").on(
      table.organizationId,
      table.memberId,
      table.creditSchemeId,
      table.postedAt,
    ),
    uniqueIndex("credit_ledger_activity_award_unique")
      .on(table.activityId, table.memberId, table.creditSchemeId)
      .where(sql`${table.entryType} = 'earned'`),
  ],
);

export const revenueProducts = pgTable(
  "revenue_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    description: text("description"),
    type: revenueProductType("type").notNull(),
    priceMinor: integer("price_minor").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
    billingInterval: billingInterval("billing_interval")
      .notNull()
      .default("one_time"),
    entitlementKey: varchar("entitlement_key", { length: 100 }),
    entitlementLabel: varchar("entitlement_label", { length: 180 }),
    entitlementDurationMonths: integer("entitlement_duration_months"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("revenue_products_org_code_unique").on(
      table.organizationId,
      table.code,
    ),
    index("revenue_products_active_idx").on(
      table.organizationId,
      table.isActive,
    ),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),
    invoiceNumber: varchar("invoice_number", { length: 80 }).notNull(),
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
  },
  (table) => [
    uniqueIndex("invoices_org_number_unique").on(
      table.organizationId,
      table.invoiceNumber,
    ),
    index("invoices_member_status_idx").on(
      table.organizationId,
      table.memberId,
      table.status,
    ),
  ],
);

export const invoiceLines = pgTable("invoice_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
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

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    uniqueIndex("payments_org_reference_unique")
      .on(table.organizationId, table.reference)
      .where(sql`${table.reference} is not null`),
    index("payments_invoice_idx").on(
      table.organizationId,
      table.invoiceId,
      table.paidAt,
    ),
  ],
);

export const memberEntitlements = pgTable(
  "member_entitlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    uniqueIndex("member_entitlements_source_unique").on(
      table.memberId,
      table.sourceInvoiceId,
      table.sourceProductId,
    ),
    index("member_entitlements_active_idx").on(
      table.organizationId,
      table.memberId,
      table.status,
    ),
  ],
);

export const audienceSegments = pgTable(
  "audience_segments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    index("audience_segments_active_idx").on(
      table.organizationId,
      table.isActive,
    ),
  ],
);

export const engagementCampaigns = pgTable(
  "engagement_campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    index("engagement_campaigns_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

export const campaignRecipients = pgTable(
  "campaign_recipients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    uniqueIndex("campaign_recipients_campaign_member_unique").on(
      table.campaignId,
      table.memberId,
    ),
    index("campaign_recipients_status_idx").on(
      table.organizationId,
      table.campaignId,
      table.status,
    ),
  ],
);

export const navigationItems = pgTable(
  "navigation_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    location: varchar("location", { length: 30 }).notNull().default("header"),
    label: varchar("label", { length: 80 }).notNull(),
    href: text("href").notNull(),
    isExternal: boolean("is_external").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("navigation_location_idx").on(
      table.organizationId,
      table.location,
      table.sortOrder,
    ),
  ],
);

export const forms = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    description: text("description"),
    fields: jsonb("fields")
      .$type<Array<Record<string, unknown>>>()
      .notNull()
      .default([]),
    successMessage: text("success_message"),
    notificationEmails: jsonb("notification_emails")
      .$type<string[]>()
      .notNull()
      .default([]),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("forms_org_slug_unique").on(table.organizationId, table.slug),
  ],
);

export const formSubmissions = pgTable(
  "form_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: submissionStatus("status").notNull().default("new"),
    ipHash: varchar("ip_hash", { length: 64 }),
    userAgent: varchar("user_agent", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    index("submissions_inbox_idx").on(
      table.organizationId,
      table.status,
      table.createdAt,
    ),
  ],
);

export const settings = pgTable(
  "settings",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 120 }).notNull(),
    value: jsonb("value").$type<unknown>().notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.key] })],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    index("audit_org_created_idx").on(table.organizationId, table.createdAt),
  ],
);

export const organizationRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  pages: many(pages),
  contents: many(contents),
  events: many(events),
  members: many(members),
  domains: many(domains),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  sessions: many(sessions),
  roles: many(userRoles),
}));

export const pageRelations = relations(pages, ({ one }) => ({
  organization: one(organizations, {
    fields: [pages.organizationId],
    references: [organizations.id],
  }),
}));

export const contentRelations = relations(contents, ({ one }) => ({
  organization: one(organizations, {
    fields: [contents.organizationId],
    references: [organizations.id],
  }),
  category: one(categories, {
    fields: [contents.categoryId],
    references: [categories.id],
  }),
}));
