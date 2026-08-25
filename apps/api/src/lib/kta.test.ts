import { describe, expect, it } from "bun:test";
import {
  extractUnitRegionCode,
  generateKtaNumber,
  generateRegistrationNumber,
} from "./kta";

describe("extractUnitRegionCode with Database Wilayah", () => {
  it("resolves province code directly from Database Wilayah Indonesia", () => {
    expect(extractUnitRegionCode(null, "DKI Jakarta")).toBe("31");
    expect(extractUnitRegionCode(null, "DPD APTI Jawa Barat")).toBe("32");
    expect(extractUnitRegionCode(null, "DPD Jawa Timur")).toBe("35");
    expect(extractUnitRegionCode(null, "Bali")).toBe("51");
    expect(extractUnitRegionCode(null, "Sumatera Utara")).toBe("12");
    expect(extractUnitRegionCode(null, "Sulawesi Selatan")).toBe("73");
    expect(extractUnitRegionCode(null, "Papua")).toBe("91");
  });

  it("handles numeric codes and national central units", () => {
    expect(extractUnitRegionCode("31")).toBe("31");
    expect(extractUnitRegionCode("DPP")).toBe("00");
    expect(extractUnitRegionCode("PUSAT")).toBe("00");
    expect(extractUnitRegionCode(null, null)).toBe("00");
  });
});

describe("generateRegistrationNumber", () => {
  it("generates registration code in REG-YYYYMMDD-XXXX format", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const reg = generateRegistrationNumber(fixedDate);
    expect(reg).toMatch(/^REG-20260825-\d{4}$/);
  });
});

describe("generateKtaNumber - Model 3 (Numerik Administrasi)", () => {
  it("formats official KTA as [KODE_ORG]-[KODE_DPD].[YYYY].[NO_URUT] with Database Wilayah", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const kta = generateKtaNumber({
      orgName: "APTI Indonesia",
      unitName: "DPD APTI DKI Jakarta",
      date: fixedDate,
      sequence: 142,
    });
    expect(kta).toBe("APTI-31.2026.00142");
  });

  it("handles Jabar unit from database name", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const kta = generateKtaNumber({
      orgName: "APTI",
      unitName: "DPD APTI Jawa Barat",
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
});
