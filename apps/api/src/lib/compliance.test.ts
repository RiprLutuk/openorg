import { describe, expect, test } from "bun:test";
import {
  type ComplianceCredential,
  type ComplianceRequirement,
  evaluateCredentialRequirements,
} from "./compliance";

const now = new Date("2026-08-14T00:00:00.000Z");

function requirement(
  overrides: Partial<ComplianceRequirement> = {},
): ComplianceRequirement {
  return {
    id: "requirement-a",
    schemeId: "scheme-a",
    rule: "required",
    groupKey: null,
    requiredVerificationLevel: "issuer_confirmed",
    gracePeriodDays: 0,
    blocksApproval: true,
    ...overrides,
  };
}

function credential(
  overrides: Partial<ComplianceCredential> = {},
): ComplianceCredential {
  return {
    schemeId: "scheme-a",
    status: "verified",
    verificationLevel: "issuer_confirmed",
    expiresAt: null,
    ...overrides,
  };
}

describe("evaluateCredentialRequirements", () => {
  test("blocks credentials below the required trust level", () => {
    const result = evaluateCredentialRequirements(
      [requirement()],
      [credential({ verificationLevel: "document_checked" })],
      now,
    );

    expect(result.satisfiedById["requirement-a"]).toBe(false);
    expect(result.blockers.map((item) => item.id)).toEqual(["requirement-a"]);
  });

  test("honors the configured post-expiry grace period", () => {
    const result = evaluateCredentialRequirements(
      [requirement({ gracePeriodDays: 14 })],
      [credential({ expiresAt: new Date("2026-08-01T00:00:00.000Z") })],
      now,
    );

    expect(result.satisfiedById["requirement-a"]).toBe(true);
    expect(result.blockers).toHaveLength(0);
  });

  test("satisfies every one-of item when one alternative is valid", () => {
    const requirements = [
      requirement({
        id: "license-a",
        schemeId: "scheme-a",
        rule: "one_of",
        groupKey: "operating-license",
      }),
      requirement({
        id: "license-b",
        schemeId: "scheme-b",
        rule: "one_of",
        groupKey: "operating-license",
      }),
    ];
    const result = evaluateCredentialRequirements(
      requirements,
      [credential({ schemeId: "scheme-b" })],
      now,
    );

    expect(result.satisfiedById).toEqual({
      "license-a": true,
      "license-b": true,
    });
    expect(result.blockers).toHaveLength(0);
  });

  test("reports an unsatisfied one-of group as one blocker", () => {
    const requirements = [
      requirement({
        id: "license-a",
        rule: "one_of",
        groupKey: "operating-license",
      }),
      requirement({
        id: "license-b",
        schemeId: "scheme-b",
        rule: "one_of",
        groupKey: "operating-license",
      }),
    ];
    const result = evaluateCredentialRequirements(requirements, [], now);

    expect(result.blockers.map((item) => item.id)).toEqual(["license-a"]);
  });
});
