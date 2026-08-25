export function generateKtaNumber(options?: {
  orgName?: string | null;
  unitCode?: string | null;
  date?: Date | null;
  sequence?: string | number | null;
}): string {
  // 1. NAMA ORGANISASI: Clean uppercase, e.g. "APTI Indonesia" -> "APTI", "ASISI" -> "ASISI"
  const rawOrg = options?.orgName?.trim() || "APTI";
  const cleanOrg =
    (rawOrg.split(/[\s._-]+/)[0] || "APTI")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase() || "APTI";

  // 2. KODE DAERAH: e.g. "31", "DKI", "JABAR", "32", "BDG", or fallback "00"
  let cleanUnit = "00";
  if (options?.unitCode) {
    const sanitized = options.unitCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (sanitized) {
      cleanUnit = sanitized.slice(0, 6);
    }
  }

  // 3. MMDD: 2 digit month, 2 digit day (e.g. 0825 for Aug 25)
  const now = options?.date || new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const mmdd = `${month}${day}`;

  // 4. 5 DIGIT UNIK: 5 digit numeric / sequence (10000 - 99999 or padded)
  let random5: string;
  if (options?.sequence != null) {
    random5 = String(options.sequence).padStart(5, "0").slice(-5);
  } else {
    random5 = String(Math.floor(10000 + Math.random() * 90000));
  }

  return `${cleanOrg}.${cleanUnit}.${mmdd}.${random5}`;
}
