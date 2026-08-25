import { describe, expect, it } from "bun:test";
import {
  extractUnitRegionCode,
  generateKtaNumber,
  generateRegistrationNumber,
} from "./kta";

describe("generateRegistrationNumber", () => {
  it("generates registration code in REG-YYYYMMDD-XXXX format", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const reg = generateRegistrationNumber(fixedDate);
    expect(reg).toMatch(/^REG-20260825-\d{4}$/);
  });
});

describe("extractUnitRegionCode", () => {
  it("maps known DPD units to standard provincial codes", () => {
    expect(extractUnitRegionCode("DPD-DKI")).toBe("31");
    expect(extractUnitRegionCode("DPD-JABAR")).toBe("32");
    expect(extractUnitRegionCode("DPD-JATIM")).toBe("35");
    expect(extractUnitRegionCode("DPP")).toBe("00");
    expect(extractUnitRegionCode(null, null)).toBe("00");
  });
});

describe("generateKtaNumber - Model 3 (Numerik Administrasi)", () => {
  it("formats official KTA as [KODE_ORG]-[KODE_DPD].[YYYY].[NO_URUT]", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const kta = generateKtaNumber({
      orgName: "APTI Indonesia",
      unitCode: "DPD-DKI",
      date: fixedDate,
      sequence: 142,
    });
    expect(kta).toBe("APTI-31.2026.00142");
  });

  it("handles Jabar unit and custom sequence", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const kta = generateKtaNumber({
      orgName: "APTI",
      unitCode: "DPD-JABAR",
      date: fixedDate,
      sequence: 85,
    });
    expect(kta).toBe("APTI-32.2026.00085");
  });

  it("handles DPP central unit", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const kta = generateKtaNumber({
      orgName: "APTI",
      unitCode: "DPP",
      date: fixedDate,
      sequence: 1,
    });
    expect(kta).toBe("APTI-00.2026.00001");
  });

  it("generates random 5-digit sequence when sequence is omitted", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const kta = generateKtaNumber({
      orgName: "APTI",
      unitCode: "DPD-DKI",
      date: fixedDate,
    });
    expect(kta).toMatch(/^APTI-31\.2026\.\d{5}$/);
  });
});
