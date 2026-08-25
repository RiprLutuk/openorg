export interface MemberProfileCompleteness {
  isComplete: boolean;
  score: number;
  totalMandatory: number;
  percentage: number;
  missingFields: string[];
  completedFields: string[];
  checklist: Array<{
    key: string;
    label: string;
    description: string;
    isCompleted: boolean;
    required: boolean;
    value?: string | number | null;
  }>;
}

export interface MemberDataForCompleteness {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  unitId?: string | null;
  companyName?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Calculates member profile completeness against the mandatory criteria required for administrative approval.
 */
export function computeProfileCompleteness(
  member?: MemberDataForCompleteness | null,
): MemberProfileCompleteness {
  if (!member) {
    return {
      isComplete: false,
      score: 0,
      totalMandatory: 7,
      percentage: 0,
      missingFields: [
        "Foto Profil Resmi",
        "NIK (16 Digit Angka)",
        "Upload Berkas KTP / SIM",
        "Jabatan Organisasi",
        "DPD Pengampu",
        "Koordinator Wilayah (Korwil)",
        "Informasi & Spesialisasi Usaha",
      ],
      completedFields: [],
      checklist: [],
    };
  }

  const meta = (member.metadata || {}) as Record<string, unknown>;
  const missingFields: string[] = [];
  const completedFields: string[] = [];

  // 1. Foto Profil Resmi (avatarUrl)
  const avatarUrl = (member.avatarUrl || meta.avatarUrl || "") as string;
  const hasAvatar = Boolean(avatarUrl && avatarUrl.trim().length > 0);
  if (hasAvatar) completedFields.push("avatarUrl");
  else missingFields.push("Foto Profil Resmi");

  // 2. NIK (16 Digit Angka KTP)
  const nik = String(meta.nik || "").trim();
  const hasNik = Boolean(nik && /^\d{16}$/.test(nik));
  if (hasNik) completedFields.push("nik");
  else missingFields.push("NIK (16 Digit Angka)");

  // 3. Upload Dokumen KTP atau SIM (idCardUrl)
  const idCardUrl = String(meta.idCardUrl || "").trim();
  const hasIdCard = Boolean(idCardUrl && idCardUrl.length > 0);
  if (hasIdCard) completedFields.push("idCardUrl");
  else missingFields.push("Upload Berkas KTP / SIM");

  // 4. Jabatan dalam Organisasi
  const jabatan = String(meta.jabatan || meta.roleTitle || "").trim();
  const hasJabatan = Boolean(jabatan && jabatan.length > 0);
  if (hasJabatan) completedFields.push("jabatan");
  else missingFields.push("Jabatan Organisasi");

  // 5. DPD Pengampu & Korwil
  const hasUnit = Boolean(member.unitId);
  if (hasUnit) completedFields.push("unitId");
  else missingFields.push("DPD Pengampu");

  const korwil = String(meta.korwil || "").trim();
  const hasKorwil = Boolean(korwil && korwil.length > 0);
  if (hasKorwil) completedFields.push("korwil");
  else missingFields.push("Koordinator Wilayah (Korwil)");

  // 6. Informasi Usaha & Spesialisasi
  const businessName = String(
    member.companyName ||
      meta.companyName ||
      (meta.businessInfo as any)?.name ||
      "",
  ).trim();
  const specialization =
    meta.specialization || (meta.businessInfo as any)?.specialization;
  const hasSpecialization = Array.isArray(specialization)
    ? specialization.length > 0
    : Boolean(specialization);
  const hasBusinessInfo = Boolean(businessName && hasSpecialization);
  if (hasBusinessInfo) completedFields.push("businessInfo");
  else missingFields.push("Informasi & Spesialisasi Usaha");

  // Additional Non-Mandatory Checklist (Bonus Polish)
  const hasEmergency = Boolean(
    meta.emergencyContact &&
      (meta.emergencyContact as any)?.name &&
      (meta.emergencyContact as any)?.phone,
  );
  const hasCertifications = Boolean(
    Array.isArray(meta.certifications) && meta.certifications.length > 0,
  );
  const hasExperience = Boolean(
    meta.workExperienceYears != null && Number(meta.workExperienceYears) >= 0,
  );

  const totalMandatory = 7;
  const score = completedFields.length;
  const percentage = Math.round((score / totalMandatory) * 100);
  const isComplete = missingFields.length === 0;

  const checklist = [
    {
      key: "avatarUrl",
      label: "Foto Profil Resmi",
      description: "Pas foto formal berlatar polos untuk KTA & profil anggota",
      isCompleted: hasAvatar,
      required: true,
      value: hasAvatar ? avatarUrl : null,
    },
    {
      key: "nik",
      label: "Nomor Induk Kependudukan (NIK)",
      description: "Nomor 16 digit sesuai identitas resmi KTP Republik Indonesia",
      isCompleted: hasNik,
      required: true,
      value: hasNik ? nik : null,
    },
    {
      key: "idCardUrl",
      label: "Upload Berkas KTP / SIM",
      description: "Foto atau scan jelas dokumen identitas KTP atau SIM aktif",
      isCompleted: hasIdCard,
      required: true,
      value: hasIdCard ? idCardUrl : null,
    },
    {
      key: "jabatan",
      label: "Jabatan Organisasi",
      description: "Posisi struktural / teknisi (misal: Anggota Teknisi, Pengurus DPD)",
      isCompleted: hasJabatan,
      required: true,
      value: hasJabatan ? jabatan : null,
    },
    {
      key: "unitId",
      label: "DPD Pengampu",
      description: "Dewan Pengurus Daerah yang menaungi domisili anggota",
      isCompleted: hasUnit,
      required: true,
      value: member.unitId || null,
    },
    {
      key: "korwil",
      label: "Koordinator Wilayah (Korwil)",
      description: "Wilayah zona kerja / sub-daerah perwakilan pengurus",
      isCompleted: hasKorwil,
      required: true,
      value: hasKorwil ? korwil : null,
    },
    {
      key: "businessInfo",
      label: "Informasi & Spesialisasi Usaha",
      description: "Nama bengkel/usaha dan bidang keahlian teknisi pendingin",
      isCompleted: hasBusinessInfo,
      required: true,
      value: hasBusinessInfo
        ? `${businessName} (${Array.isArray(specialization) ? specialization.join(", ") : specialization})`
        : null,
    },
    {
      key: "emergencyContact",
      label: "Kontak Darurat (Opsional)",
      description: "Nama & nomor telepon kerabat untuk keadaan darurat teknisi di lapangan",
      isCompleted: hasEmergency,
      required: false,
      value: hasEmergency ? (meta.emergencyContact as any)?.name : null,
    },
    {
      key: "certifications",
      label: "Sertifikasi Kompetensi (Opsional)",
      description: "Sertifikat BNSP, Daikin, Panasonic, atau lembaga kompetensi pendingin",
      isCompleted: hasCertifications,
      required: false,
      value: hasCertifications ? `${(meta.certifications as any[]).length} Sertifikat` : null,
    },
    {
      key: "workExperienceYears",
      label: "Pengalaman Kerja (Opsional)",
      description: "Lama berkecimpung di industri pendingin & tata udara (HVAC/R)",
      isCompleted: hasExperience,
      required: false,
      value: hasExperience ? `${meta.workExperienceYears} Tahun` : null,
    },
  ];

  return {
    isComplete,
    score,
    totalMandatory,
    percentage,
    missingFields,
    completedFields,
    checklist,
  };
}
