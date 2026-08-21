import { describe, expect, test } from "bun:test";
import {
  audienceSegmentCriteriaSchema,
  credentialSchemeInputSchema,
  creditSchemeInputSchema,
  learningActivityInputSchema,
  pageSectionsSchema,
  publicSettingsSchema,
  revenueProductInputSchema,
  themeSchema,
} from "./index";

describe("revenue and engagement contracts", () => {
  test("accepts a dues product that grants a reusable benefit", () => {
    const result = revenueProductInputSchema.safeParse({
      code: "PRO-ANNUAL",
      name: "Professional annual membership",
      type: "membership_dues",
      price: 750000,
      billingInterval: "annual",
      entitlementKey: "member-benefits",
      entitlementLabel: "Member benefit access",
      entitlementDurationMonths: 12,
    });
    expect(result.success).toBe(true);
  });

  test("validates portable audience criteria", () => {
    const result = audienceSegmentCriteriaSchema.safeParse({
      membershipStatuses: ["active"],
      membershipTypes: ["hvac-professional"],
      hasEntitlement: "member-benefits",
    });
    expect(result.success).toBe(true);
  });
});

describe("page builder contracts", () => {
  test("accepts a valid responsive hero section", () => {
    const result = pageSectionsSchema.safeParse([
      {
        id: crypto.randomUUID(),
        type: "hero",
        title: "A shared purpose",
        description: "One flexible platform for every organization.",
        alignment: "left",
      },
    ]);
    expect(result.success).toBe(true);
  });

  test("accepts CMS-driven hero proof and platform variants", () => {
    const result = pageSectionsSchema.safeParse([
      {
        id: crypto.randomUUID(),
        type: "hero",
        title: "A complete member ecosystem",
        alignment: "left",
        panelTitle: "Member operations",
        highlights: ["Registry", "Credentials", "Academy", "Benefits"],
        proofPoints: ["Tenant secure", "Audit ready"],
      },
      {
        id: crypto.randomUUID(),
        type: "features",
        title: "Universal modules",
        columns: 3,
        variant: "platform",
        items: [
          {
            icon: "member",
            title: "Registry",
            description: "One member source of truth.",
          },
        ],
      },
    ]);
    expect(result.success).toBe(true);
  });

  test("rejects unknown section types", () => {
    const result = pageSectionsSchema.safeParse([
      { id: crypto.randomUUID(), type: "unsafeEmbed", code: "<script />" },
    ]);
    expect(result.success).toBe(false);
  });

  test("rejects executable page-builder links", () => {
    const result = pageSectionsSchema.safeParse([
      {
        id: crypto.randomUUID(),
        type: "cta",
        title: "Unsafe action",
        primaryAction: {
          label: "Open",
          href: "javascript:alert(document.cookie)",
        },
        tone: "brand",
      },
    ]);
    expect(result.success).toBe(false);
  });
});

describe("academy contracts", () => {
  test("accepts a sector-neutral credit activity", () => {
    const scheme = creditSchemeInputSchema.parse({
      code: "CPD",
      name: "Continuing professional development",
      unitLabel: "CPD points",
    });
    const result = learningActivityInputSchema.safeParse({
      code: "SAFE-REFRIGERANT-2026",
      title: "Safe refrigerant handling",
      category: "technical",
      deliveryMode: "hybrid",
      startsAt: "2026-09-10T02:00:00.000Z",
      endsAt: "2026-09-10T09:00:00.000Z",
      creditSchemeId: crypto.randomUUID(),
      creditAmount: 2.5,
      status: "open",
    });

    expect(scheme.unitLabel).toBe("CPD points");
    expect(result.success).toBe(true);
  });

  test("rejects awarded credit without a scheme", () => {
    const result = learningActivityInputSchema.safeParse({
      code: "ETHICS-2026",
      title: "Professional ethics",
      startsAt: "2026-10-01T02:00:00.000Z",
      creditAmount: 3,
    });

    expect(result.success).toBe(false);
  });
});

describe("theme contracts", () => {
  test("rejects colors that are not six-digit hex values", () => {
    const result = themeSchema.safeParse({
      colors: {
        primary: "red",
        secondary: "#182230",
        accent: "#f97066",
        surface: "#f8fafc",
        foreground: "#101828",
      },
      radius: "large",
      fontHeading: "Manrope",
      fontBody: "Inter",
    });
    expect(result.success).toBe(false);
  });
});

describe("public settings contracts", () => {
  test("fills safe defaults for optional announcement fields", () => {
    const result = publicSettingsSchema.parse({
      footer: { links: [] },
      announcement: { enabled: true, title: "Member registration is open" },
      quickContact: {
        enabled: true,
        label: "WhatsApp",
        href: "https://wa.me/1",
      },
    });
    expect(result.announcement.actionUrl).toBe("/");
    expect(result.announcement.startsAt).toBeNull();
    expect(result.quickContact.channel).toBe("message");
  });

  test("rejects unsupported quick-contact channels", () => {
    const result = publicSettingsSchema.safeParse({
      footer: { links: [] },
      announcement: { enabled: false },
      quickContact: {
        enabled: true,
        label: "Run script",
        href: "/",
        channel: "javascript",
      },
    });
    expect(result.success).toBe(false);
  });

  test("rejects executable public links", () => {
    const result = publicSettingsSchema.safeParse({
      footer: { links: [] },
      announcement: {
        enabled: true,
        actionUrl: "javascript:alert(document.cookie)",
      },
      quickContact: { enabled: false },
    });
    expect(result.success).toBe(false);
  });
});

describe("credential contracts", () => {
  test("accepts an industry-neutral credential scheme", () => {
    const result = credentialSchemeInputSchema.safeParse({
      code: "TECH-L3",
      name: "Technical competency level 3",
      category: "competency",
      issuerName: "Accredited certification body",
      validityMonths: 36,
      fields: [
        { key: "specialization", label: "Specialization", type: "text" },
      ],
    });
    expect(result.success).toBe(true);
  });

  test("rejects unsafe dynamic field keys", () => {
    const result = credentialSchemeInputSchema.safeParse({
      code: "LICENSE",
      name: "Professional license",
      fields: [{ key: "<script>", label: "Unsafe", type: "text" }],
    });
    expect(result.success).toBe(false);
  });
});
