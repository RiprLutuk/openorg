import { describe, expect, it } from "bun:test";
import { computeProfileCompleteness } from "./profile-completeness";

describe("computeProfileCompleteness", () => {
  it("marks incomplete when mandatory fields are missing", () => {
    const res = computeProfileCompleteness({
      name: "Budi Santoso",
      email: "budi@example.com",
    });
    expect(res.isComplete).toBe(false);
    expect(res.percentage).toBeLessThan(50);
    expect(res.missingFields).toContain("Foto Profil Resmi");
    expect(res.missingFields).toContain("NIK (16 Digit Angka)");
    expect(res.missingFields).toContain("Upload Berkas KTP / SIM");
    expect(res.missingFields).toContain("Jabatan Organisasi");
    expect(res.missingFields).toContain("DPD Pengampu");
    expect(res.missingFields).toContain("Koordinator Wilayah (Korwil)");
    expect(res.missingFields).toContain("Informasi & Spesialisasi Usaha");
  });

  it("marks 100% complete when all 7 mandatory criteria are satisfied", () => {
    const res = computeProfileCompleteness({
      name: "Budi Santoso",
      avatarUrl: "https://example.com/avatar.jpg",
      unitId: "11111111-1111-1111-1111-111111111111",
      companyName: "Berkah Teknik AC",
      metadata: {
        nik: "3201123456789012",
        idCardUrl: "https://example.com/ktp.jpg",
        jabatan: "Anggota Teknisi",
        korwil: "Korwil Tangerang Raya",
        specialization: ["AC Split / Wall Mounted", "VRV / VRF"],
      },
    });

    expect(res.isComplete).toBe(true);
    expect(res.score).toBe(7);
    expect(res.totalMandatory).toBe(7);
    expect(res.percentage).toBe(100);
    expect(res.missingFields.length).toBe(0);
  });

  it("rejects invalid NIK with non-16 digits", () => {
    const res = computeProfileCompleteness({
      avatarUrl: "https://example.com/avatar.jpg",
      unitId: "11111111-1111-1111-1111-111111111111",
      companyName: "Berkah Teknik",
      metadata: {
        nik: "12345", // invalid NIK length
        idCardUrl: "https://example.com/ktp.jpg",
        jabatan: "Ketua DPD",
        korwil: "Korwil Banten",
        specialization: ["Chiller Industri"],
      },
    });

    expect(res.isComplete).toBe(false);
    expect(res.missingFields).toContain("NIK (16 Digit Angka)");
  });
});
