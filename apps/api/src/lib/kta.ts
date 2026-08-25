import { findProvince, searchRegencies } from "@openorg/contracts";

/**
 * Resolves standard 2-digit regional code (Kode Wilayah Kepmendagri)
 * directly from the official Database Wilayah Indonesia (38 Provinsi & 514 Kabupaten/Kota).
 */
export function extractUnitRegionCode(
  unitCode?: string | null | undefined,
  unitName?: string | null | undefined,
  unitSlug?: string | null | undefined,
): string {
  const candidates = [unitCode, unitName, unitSlug].filter(Boolean) as string[];
  if (candidates.length === 0) return "00";

  for (const raw of candidates) {
    const trimmed = raw.trim();
    if (
      trimmed.toUpperCase() === "DPP" ||
      trimmed.toUpperCase() === "PUSAT" ||
      trimmed === "00"
    ) {
      return "00";
    }

    // Direct 2-digit numeric code (e.g. "31", "32", "35", "73")
    if (/^\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // 1. Lookup province in official Database Wilayah (38 Provinces)
    const cleanSearch = trimmed
      .replace(/^DP[DPC][\s._-]*/i, "")
      .replace(/^(PROVINSI|PROV|DAERAH|KORWIL|CABANG)[\s._-]*/i, "")
      .trim();

    const prov = findProvince(cleanSearch) || findProvince(trimmed);
    if (prov) {
      return prov.kode;
    }

    // 2. If unit is a city / regency / chapter (e.g. Bandung, Surabaya, Medan)
    const matchedRegency =
      searchRegencies(cleanSearch)[0] || searchRegencies(trimmed)[0];
    if (matchedRegency) {
      return matchedRegency.provinceCode;
    }
  }

  return "00";
}

/**
 * Generates a temporary registration ticket number for applicants.
 * Example: REG-20260825-4819
 */
export function generateRegistrationNumber(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random4 = String(Math.floor(1000 + Math.random() * 9000));
  return `REG-${yyyy}${mm}${dd}-${random4}`;
}

/**
 * Generates an official KTA number following Model 3 (Numerik Administrasi):
 * Format: [KODE_ORG]-[KODE_DPD].[YYYY].[NO_URUT]
 * Example: APTI-31.2026.00142
 */
export function generateKtaNumber(options?: {
  orgName?: string | null | undefined;
  unitCode?: string | null | undefined;
  unitName?: string | null | undefined;
  unitSlug?: string | null | undefined;
  provinceName?: string | null | undefined;
  date?: Date | null | undefined;
  sequence?: string | number | null | undefined;
}): string {
  // 1. KODE ORG (e.g. "APTI Indonesia" -> "APTI", "ASISI" -> "ASISI")
  const rawOrg = options?.orgName?.trim() || "APTI";
  const cleanOrg =
    (rawOrg.split(/[\s._-]+/)[0] || "APTI")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase() || "APTI";

  // 2. KODE DPD: Resolved dynamically from official Database Wilayah
  const regionCode = extractUnitRegionCode(
    options?.unitCode,
    options?.unitName || options?.provinceName,
    options?.unitSlug,
  );

  // 3. YYYY (Year)
  const now = options?.date || new Date();
  const yyyy = now.getFullYear();

  // 4. NO_URUT (5-digit zero-padded sequence, e.g. 00142)
  let sequence5: string;
  if (options?.sequence != null) {
    sequence5 = String(options.sequence).padStart(5, "0").slice(-5);
  } else {
    sequence5 = String(Math.floor(10000 + Math.random() * 90000));
  }

  return `${cleanOrg}-${regionCode}.${yyyy}.${sequence5}`;
}
