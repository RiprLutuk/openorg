import { describe, expect, test } from "bun:test";
import {
  addMonths,
  matchSegmentCriteria,
  moneyFromMinor,
  moneyToMinor,
} from "./revenue";

describe("revenue ledger", () => {
  test("converts decimal money without float drift", () => {
    expect(moneyToMinor(1250.25)).toBe(125025);
    expect(moneyFromMinor(125025)).toBe(1250.25);
  });

  test("matches sector-neutral audience rules", () => {
    const member = {
      status: "active",
      unitId: "ec3a3291-78aa-4cff-b3fb-ad4f2d3f2c5f",
      customFields: { membershipType: "hvac-professional" },
      entitlementKeys: ["member-benefits"],
    };
    expect(
      matchSegmentCriteria(member, {
        membershipStatuses: ["active"],
        membershipTypes: ["hvac-professional"],
        hasEntitlement: "member-benefits",
      }),
    ).toBe(true);
    expect(matchSegmentCriteria(member, { membershipTypes: ["doctor"] })).toBe(
      false,
    );
  });

  test("computes a UTC entitlement term", () => {
    expect(
      addMonths(new Date("2026-08-14T00:00:00.000Z"), 12).toISOString(),
    ).toBe("2027-08-14T00:00:00.000Z");
  });
});
