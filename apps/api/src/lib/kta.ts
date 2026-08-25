const UNIT_CODE_MAP: Record<string, string> = {
  DPP: "00",
  "DPD-DKI": "31",
  DKI: "31",
  "DPD-JABAR": "32",
  JABAR: "32",
  "DPD-JATENG": "33",
  JATENG: "33",
  "DPD-DIY": "34",
  DIY: "34",
  "DPD-JATIM": "35",
  JATIM: "35",
  "DPD-BANTEN": "36",
  BANTEN: "36",
  "DPD-BALI": "51",
  BALI: "51",
  "DPD-SUMUT": "12",
  SUMUT: "12",
  "DPD-SUMBAR": "13",
  SUMBAR: "13",
  "DPD-RIAU": "14",
  RIAU: "14",
  "DPD-SUMSEL": "16",
  SUMSEL: "16",
  "DPD-SULSEL": "73",
  SULSEL: "73",
};

export function extractUnitRegionCode(
  unitCode?: string | null,
  unitSlug?: string | null,
): string {
  if (!unitCode && !unitSlug) return "00";
  const raw = (unitCode || unitSlug || "").toUpperCase().trim();
  if (UNIT_CODE_MAP[raw]) return UNIT_CODE_MAP[raw];
  const stripped = raw.replace(/^DP[DPC]-/, "");
  if (UNIT_CODE_MAP[stripped]) return UNIT_CODE_MAP[stripped];
  if (/^\d{2}$/.test(raw)) return raw;
  const clean = stripped.replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return clean || "00";
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
  orgName?: string | null;
  unitCode?: string | null;
  unitSlug?: string | null;
  date?: Date | null;
  sequence?: string | number | null;
}): string {
  // 1. KODE ORG (e.g. "APTI Indonesia" -> "APTI", "ASISI" -> "ASISI")
  const rawOrg = options?.orgName?.trim() || "APTI";
  const cleanOrg =
    (rawOrg.split(/[\s._-]+/)[0] || "APTI")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase() || "APTI";

  // 2. KODE DPD (e.g. "DPD-DKI" -> "31", "DPD-JABAR" -> "32", "DPP" -> "00")
  const regionCode = extractUnitRegionCode(
    options?.unitCode,
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
