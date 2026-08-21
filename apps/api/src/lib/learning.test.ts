import { describe, expect, test } from "bun:test";
import {
  creditFromHundredths,
  creditToHundredths,
  isCreditEligible,
  resolveEnrollmentStatus,
} from "./learning";

describe("learning ledger rules", () => {
  test("preserves fractional professional credits as integer hundredths", () => {
    expect(creditToHundredths(2.5)).toBe(250);
    expect(creditFromHundredths(250)).toBe(2.5);
  });

  test("waitlists a member when capacity is full", () => {
    expect(resolveEnrollmentStatus(40, 39)).toBe("registered");
    expect(resolveEnrollmentStatus(40, 40)).toBe("waitlisted");
    expect(resolveEnrollmentStatus(null, 500)).toBe("registered");
  });

  test("awards only enrolled members with valid attendance", () => {
    expect(isCreditEligible("confirmed", "present")).toBe(true);
    expect(isCreditEligible("registered", "late")).toBe(true);
    expect(isCreditEligible("confirmed", "absent")).toBe(false);
    expect(isCreditEligible("waitlisted", "present")).toBe(false);
  });
});
