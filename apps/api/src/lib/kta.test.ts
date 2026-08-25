import { describe, expect, it } from "bun:test";
import { generateKtaNumber } from "./kta";

describe("generateKtaNumber", () => {
  it("formats KTA as NAMAORGANISASI.CODEDAERAH.MMDD.5digitunix", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const kta = generateKtaNumber({
      orgName: "APTI Indonesia",
      unitCode: "31",
      date: fixedDate,
      sequence: 142,
    });
    expect(kta).toBe("APTI.31.0825.00142");
  });

  it("handles ASISI organization and regional code", () => {
    const fixedDate = new Date("2026-12-05T10:00:00Z");
    const kta = generateKtaNumber({
      orgName: "ASISI",
      unitCode: "DKI",
      date: fixedDate,
      sequence: "98765",
    });
    expect(kta).toBe("ASISI.DKI.1205.98765");
  });

  it("defaults to fallback unit 00 and generates random 5-digit string when sequence omitted", () => {
    const fixedDate = new Date("2026-08-25T10:00:00Z");
    const kta = generateKtaNumber({
      orgName: "APTI",
      date: fixedDate,
    });
    const parts = kta.split(".");
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe("APTI");
    expect(parts[1]).toBe("00");
    expect(parts[2]).toBe("0825");
    expect(parts[3]).toMatch(/^\d{5}$/);
  });
});
