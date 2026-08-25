"use client";

import {
  AlertCircle,
  Award,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  IdCard,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  SearchableSelect,
  type SearchableOption,
} from "@/components/searchable-select";
import { memberApi } from "@/lib/member-client";

interface UnitOption {
  id: string;
  name: string;
  code?: string | null;
  slug?: string | null;
}

interface MemberProfileVerificationProps {
  member: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    memberNumber: string;
    avatarUrl: string | null;
    unitId?: string | null;
    unitName?: string | null;
    address: string | null;
    biography: string | null;
    joinedAt: string | null;
    status: string;
    companyName?: string | null;
    metadata?: Record<string, unknown> | null;
  };
  completeness?: {
    isComplete: boolean;
    score: number;
    totalMandatory: number;
    percentage: number;
    missingFields: string[];
    completedFields: string[];
  } | null | undefined;
  onReload: () => void;
}

const JABATAN_PRESETS = [
  "Anggota Teknisi / Praktisi",
  "Pengurus DPD - Ketua",
  "Pengurus DPD - Wakil Ketua",
  "Pengurus DPD - Sekretaris",
  "Pengurus DPD - Bendahara",
  "Koordinator Wilayah (Korwil)",
  "Pengurus DPP (Pusat)",
  "Dewan Penasehat / Pembina",
  "Instruktur / Trainer Ahli",
  "Lainnya (Ketik Manual)",
];

const SPECIALIZATION_PRESETS = [
  "AC Split / Wall-Mounted",
  "Multi-Split / VRV / VRF System",
  "AC Central & Water Chiller",
  "Cold Storage & Blast Freezer",
  "Kulkas & Pendingin Komersial",
  "Heat Pump & Water Heater",
  "Ducting & Tata Udara Industri",
  "Perbaikan Modul & PCB Inverter",
];

const KORWIL_PRESETS = [
  "Korwil Tangerang Raya",
  "Korwil Serang & Cilegon",
  "Korwil Lebak & Pandeglang",
  "Korwil Jakarta Barat",
  "Korwil Jakarta Selatan",
  "Korwil Jakarta Timur",
  "Korwil Jakarta Utara & Pusat",
  "Korwil Bekasi & Cikarang",
  "Korwil Bogor & Depok",
  "Korwil Bandung Raya",
  "Korwil Cirebon & Indramayu",
  "Korwil Semarang Raya",
  "Korwil Solo Raya",
  "Korwil Surabaya & Sidoarjo",
  "Korwil Malang Raya",
  "Korwil Denpasar & Bali",
  "Korwil Medan & Sumut",
  "Korwil Makassar & Sulsel",
];

export function MemberProfileVerification({
  member,
  completeness,
  onReload,
}: MemberProfileVerificationProps) {
  const meta = (member.metadata || {}) as Record<string, unknown>;
  const businessInfo = (meta.businessInfo || {}) as Record<string, unknown>;
  const emergencyInfo = (meta.emergencyContact || {}) as Record<string, unknown>;

  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Form states
  const [avatarUrl, setAvatarUrl] = useState<string>(member.avatarUrl || "");
  const [nik, setNik] = useState<string>(String(meta.nik || ""));
  const [idCardUrl, setIdCardUrl] = useState<string>(
    String(meta.idCardUrl || ""),
  );

  const initialJabatan = String(meta.jabatan || "Anggota Teknisi / Praktisi");
  const isPresetJabatan = JABATAN_PRESETS.includes(initialJabatan);
  const [jabatanSelection, setJabatanSelection] = useState<string>(
    isPresetJabatan ? initialJabatan : "Lainnya (Ketik Manual)",
  );
  const [customJabatan, setCustomJabatan] = useState<string>(
    isPresetJabatan ? "" : initialJabatan,
  );

  const [unitId, setUnitId] = useState<string>(member.unitId || "");

  const initialKorwil = String(meta.korwil || "");
  const isPresetKorwil = KORWIL_PRESETS.includes(initialKorwil);
  const [korwilSelection, setKorwilSelection] = useState<string>(
    isPresetKorwil
      ? initialKorwil
      : initialKorwil
        ? "__custom__"
        : "",
  );
  const [customKorwil, setCustomKorwil] = useState<string>(
    isPresetKorwil ? "" : initialKorwil,
  );

  const [companyName, setCompanyName] = useState<string>(
    member.companyName ||
      String(meta.companyName || "") ||
      String(businessInfo.name || ""),
  );

  const initialSpecializations: string[] = Array.isArray(meta.specialization)
    ? (meta.specialization as string[])
    : Array.isArray(businessInfo.specialization)
      ? (businessInfo.specialization as string[])
      : [];
  const [specializations, setSpecializations] = useState<string[]>(
    initialSpecializations,
  );

  const [businessAddress, setBusinessAddress] = useState<string>(
    String(businessInfo.address || meta.addressDetail || member.address || ""),
  );
  const [staffCount, setStaffCount] = useState<string>(
    businessInfo.staffCount ? String(businessInfo.staffCount) : "",
  );
  const [businessPhone, setBusinessPhone] = useState<string>(
    String(businessInfo.phone || member.phone || ""),
  );

  const [workExperienceYears, setWorkExperienceYears] = useState<string>(
    meta.workExperienceYears ? String(meta.workExperienceYears) : "",
  );

  const [emergencyName, setEmergencyName] = useState<string>(
    String(emergencyInfo.name || ""),
  );
  const [emergencyPhone, setEmergencyPhone] = useState<string>(
    String(emergencyInfo.phone || ""),
  );
  const [emergencyRelation, setEmergencyRelation] = useState<string>(
    String(emergencyInfo.relation || ""),
  );

  // Uploading & Dragging states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);
  const [isDragOverIdCard, setIsDragOverIdCard] = useState(false);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);

  // Fetch Units (DPD) with fallback
  useEffect(() => {
    let mounted = true;
    async function loadUnits() {
      setLoadingUnits(true);
      try {
        const res = await fetch("/api/v1/public/units");
        if (res.ok) {
          const json = await res.json();
          if (mounted && Array.isArray(json.data) && json.data.length > 0) {
            setUnits(json.data);
            return;
          }
        }

        // Fallback to /structure
        const structRes = await fetch("/api/v1/public/structure");
        if (structRes.ok) {
          const structJson = await structRes.json();
          if (
            mounted &&
            structJson.data?.units &&
            Array.isArray(structJson.data.units)
          ) {
            setUnits(structJson.data.units);
          }
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoadingUnits(false);
      }
    }
    void loadUnits();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute live values
  const effectiveJabatan =
    jabatanSelection === "Lainnya (Ketik Manual)"
      ? customJabatan.trim()
      : jabatanSelection.trim();

  const effectiveKorwil =
    korwilSelection === "__custom__"
      ? customKorwil.trim()
      : korwilSelection.trim();

  const isNikValid = /^\d{16}$/.test(nik.trim());
  const hasAvatar = Boolean(avatarUrl && avatarUrl.trim().length > 0);
  const hasIdCard = Boolean(idCardUrl && idCardUrl.trim().length > 0);
  const hasJabatan = Boolean(effectiveJabatan.length > 0);
  const hasUnit = Boolean(unitId);
  const hasKorwil = Boolean(effectiveKorwil.length > 0);
  const hasBusiness = Boolean(
    companyName.trim().length > 0 && specializations.length > 0,
  );

  const totalMandatory = 7;
  const completedCount = [
    hasAvatar,
    isNikValid,
    hasIdCard,
    hasJabatan,
    hasUnit,
    hasKorwil,
    hasBusiness,
  ].filter(Boolean).length;
  const livePercentage = Math.round((completedCount / totalMandatory) * 100);
  const isAllComplete = completedCount === totalMandatory;

  // Searchable Options for Select2 Comboboxes
  const unitOptions: SearchableOption[] = useMemo(() => {
    return units.map((u) => ({
      value: u.id,
      label: u.name,
      subLabel: u.code ? `Kode: ${u.code}` : undefined,
    }));
  }, [units]);

  const jabatanOptions: SearchableOption[] = useMemo(() => {
    return JABATAN_PRESETS.map((j) => ({
      value: j,
      label: j,
    }));
  }, []);

  const korwilOptions: SearchableOption[] = useMemo(() => {
    return [
      ...KORWIL_PRESETS.map((k) => ({
        value: k,
        label: k,
      })),
      {
        value: "__custom__",
        label: "✍️ Ketik Korwil Kustom / Wilayah Lainnya...",
      },
    ];
  }, []);

  // File Upload Handler (Robust multipart fetch)
  const handleFileUpload = async (
    file: File,
    type: "avatar" | "idCard",
  ) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran berkas maksimal 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (type === "avatar") setUploadingAvatar(true);
    else setUploadingIdCard(true);

    try {
      const res = await fetch("/api/v1/member/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          json.message ||
            json.error?.message ||
            `Gagal mengunggah berkas (HTTP ${res.status}). Pastikan format JPG, PNG, atau PDF.`,
        );
      }

      const uploadedUrl = json.data?.url;
      if (!uploadedUrl) throw new Error("URL berkas tidak valid dari server.");

      if (type === "avatar") {
        setAvatarUrl(uploadedUrl);
        toast.success("Foto profil resmi berhasil diunggah!");
      } else {
        setIdCardUrl(uploadedUrl);
        toast.success("Dokumen KTP / SIM berhasil diunggah!");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunggah berkas.",
      );
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingIdCard(false);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>, type: "avatar" | "idCard") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "avatar") setIsDragOverAvatar(true);
    else setIsDragOverIdCard(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>, type: "avatar" | "idCard") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "avatar") setIsDragOverAvatar(false);
    else setIsDragOverIdCard(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, type: "avatar" | "idCard") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "avatar") setIsDragOverAvatar(false);
    else setIsDragOverIdCard(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFileUpload(file, type);
    }
  };

  const handleToggleSpecialization = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        avatarUrl: avatarUrl || null,
        unitId: unitId || null,
        companyName: companyName.trim() || null,
        nik: nik.trim() || undefined,
        idCardUrl: idCardUrl || null,
        jabatan: effectiveJabatan || undefined,
        korwil: effectiveKorwil || undefined,
        specialization: specializations,
        businessInfo: {
          name: companyName.trim(),
          specialization: specializations,
          address: businessAddress.trim(),
          staffCount: staffCount ? parseInt(staffCount, 10) : undefined,
          phone: businessPhone.trim(),
        },
        emergencyContact:
          emergencyName.trim() || emergencyPhone.trim()
            ? {
                name: emergencyName.trim(),
                phone: emergencyPhone.trim(),
                relation: emergencyRelation.trim() || "Kerabat",
              }
            : undefined,
        workExperienceYears: workExperienceYears
          ? parseInt(workExperienceYears, 10)
          : undefined,
      };

      const res = await memberApi<{ data: { member: unknown } }>(
        "/v1/member/profile",
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );

      if (res.data) {
        toast.success("Profil & berkas verifikasi berhasil disimpan!");
        onReload();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan perubahan.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="member-profile-verification-wrapper">
      {/* 1. Header & Completeness Status Card */}
      <div className="profile-completeness-card">
        <div className="completeness-header">
          <div>
            <div className="completeness-badge-row">
              <span
                className={`completeness-badge ${isAllComplete ? "complete" : "pending"}`}
              >
                {isAllComplete ? (
                  <>
                    <BadgeCheck size={14} /> Berkas Lengkap (100%)
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} /> Kelengkapan Berkas: {livePercentage}%
                  </>
                )}
              </span>
              <span className="member-status-pill">
                Status Akun: <strong>{member.status.toUpperCase()}</strong>
              </span>
            </div>
            <h2>Kelengkapan Berkas & Syarat Verifikasi KTA</h2>
            <p>
              {isAllComplete
                ? "Semua data dan berkas wajib Anda sudah lengkap! Pengurus DPD dapat memverifikasi dan mencetak KTA Digital resmi Anda."
                : "Lengkapi 7 data wajib bertanda bintang (*) agar pengurus DPD dapat memverifikasi dan menerbitkan KTA Digital resmi Anda."}
            </p>
          </div>
          <button
            type="button"
            className="button primary save-profile-btn desktop-only"
            disabled={saving}
            onClick={handleSaveProfile}
          >
            {saving ? (
              <>
                <Loader2 size={15} className="spin-icon" /> Menyimpan…
              </>
            ) : (
              <>
                <Save size={15} /> Simpan Perubahan
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="completeness-progress-track">
          <div
            className={`completeness-progress-fill ${isAllComplete ? "full" : ""}`}
            style={{ width: `${livePercentage}%` }}
          />
        </div>

        {/* Requirements Checklist Chips */}
        <div className="completeness-checklist-grid">
          <div className={`check-chip ${hasAvatar ? "done" : "todo"}`}>
            {hasAvatar ? <CheckCircle2 size={13} /> : <span className="chip-dot" />}
            <span>1. Pas Foto Profil</span>
          </div>
          <div className={`check-chip ${isNikValid ? "done" : "todo"}`}>
            {isNikValid ? <CheckCircle2 size={13} /> : <span className="chip-dot" />}
            <span>2. NIK (16 Digit)</span>
          </div>
          <div className={`check-chip ${hasIdCard ? "done" : "todo"}`}>
            {hasIdCard ? <CheckCircle2 size={13} /> : <span className="chip-dot" />}
            <span>3. Scan KTP / SIM</span>
          </div>
          <div className={`check-chip ${hasJabatan ? "done" : "todo"}`}>
            {hasJabatan ? <CheckCircle2 size={13} /> : <span className="chip-dot" />}
            <span>4. Jabatan Organisasi</span>
          </div>
          <div className={`check-chip ${hasUnit ? "done" : "todo"}`}>
            {hasUnit ? <CheckCircle2 size={13} /> : <span className="chip-dot" />}
            <span>5. DPD Pengampu</span>
          </div>
          <div className={`check-chip ${hasKorwil ? "done" : "todo"}`}>
            {hasKorwil ? <CheckCircle2 size={13} /> : <span className="chip-dot" />}
            <span>6. Korwil</span>
          </div>
          <div className={`check-chip ${hasBusiness ? "done" : "todo"}`}>
            {hasBusiness ? <CheckCircle2 size={13} /> : <span className="chip-dot" />}
            <span>7. Info & Spesialisasi</span>
          </div>
        </div>
      </div>

      {/* 2. Main Form Grid */}
      <div className="profile-sections-grid">
        {/* SECTION A: FOTO PROFIL & IDENTITAS KTP */}
        <div className="profile-section-panel">
          <div className="panel-section-title">
            <User size={18} />
            <div>
              <h3>1. Foto Profil & Identitas Resmi (KTP/SIM)</h3>
              <p>Pas foto resmi dan scan kartu identitas untuk verifikasi keanggotaan.</p>
            </div>
          </div>

          <div className="form-row-2">
            {/* Kolom Kiri: Pas Foto Profil */}
            <div>
              <label className="field-label">
                Foto Profil Resmi <span className="req-star">*</span>
              </label>

              <input
                type="file"
                ref={avatarInputRef}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileUpload(file, "avatar");
                }}
              />

              {avatarUrl ? (
                <div className="avatar-preview-wrapper">
                  <div className="avatar-circle-box">
                    <img
                      src={avatarUrl}
                      alt="Foto Profil"
                      className="avatar-large-circle"
                    />
                    <span className="avatar-ok-badge">
                      <CheckCircle2 size={13} />
                    </span>
                  </div>
                  <div className="avatar-details-box">
                    <span className="doc-status-pill success">
                      <CheckCircle2 size={13} /> Foto Profil Terunggah
                    </span>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 6px" }}>
                      Pas foto berlatar polos untuk KTA Digital.
                    </p>
                    <div className="vcard-actions-row">
                      <button
                        type="button"
                        className="btn-icon-action"
                        title="Ganti Foto Profil"
                        aria-label="Ganti Foto Profil"
                        disabled={uploadingAvatar}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action danger"
                        title="Hapus Foto Profil"
                        aria-label="Hapus Foto Profil"
                        onClick={() => setAvatarUrl("")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`drag-drop-zone ${isDragOverAvatar ? "active" : ""} ${
                    uploadingAvatar ? "disabled" : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, "avatar")}
                  onDragEnter={(e) => handleDragOver(e, "avatar")}
                  onDragLeave={(e) => handleDragLeave(e, "avatar")}
                  onDrop={(e) => handleDrop(e, "avatar")}
                  onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                >
                  <div className="dropzone-icon-circle">
                    {uploadingAvatar ? (
                      <Loader2 size={20} className="spin-icon" />
                    ) : (
                      <Camera size={20} />
                    )}
                  </div>
                  <p className="dropzone-title">
                    {uploadingAvatar ? (
                      "Mengunggah foto..."
                    ) : isDragOverAvatar ? (
                      "Lepaskan foto di sini"
                    ) : (
                      <>
                        Tarik & lepas pas foto, atau <span>pilih berkas</span>
                      </>
                    )}
                  </p>
                  <p className="dropzone-subtitle">
                    Pas foto berlatar polos (rasio 1:1 atau 3:4)
                  </p>
                  <div className="dropzone-meta-tags">
                    <span className="meta-tag">JPG / PNG / WebP</span>
                    <span className="meta-tag">Maks. 5 MB</span>
                  </div>
                </div>
              )}
            </div>

            {/* Kolom Kanan: NIK & KTP/SIM */}
            <div>
              {/* NIK Input */}
              <div>
                <label className="field-label">
                  Nomor Induk Kependudukan (NIK) <span className="req-star">*</span>
                </label>
                <div className="nik-input-wrapper">
                  <input
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                    placeholder="16 digit angka (cth: 3201123456780001)"
                    className={`text-input ${
                      nik && !isNikValid ? "input-invalid" : isNikValid ? "input-valid" : ""
                    }`}
                  />
                  {isNikValid && <CheckCircle2 size={16} className="nik-valid-icon" />}
                </div>
                {nik && !isNikValid && (
                  <small className="error-text">
                    NIK harus tepat 16 digit angka (saat ini: {nik.length} digit).
                  </small>
                )}
              </div>

              {/* KTP / SIM Upload */}
              <div style={{ marginTop: "14px" }}>
                <label className="field-label">
                  Upload Scan / Foto KTP atau SIM <span className="req-star">*</span>
                </label>

                <input
                  type="file"
                  ref={idCardInputRef}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileUpload(file, "idCard");
                  }}
                />

                {idCardUrl ? (
                  <div className="idcard-preview-wrapper">
                    <img
                      src={idCardUrl}
                      alt="Berkas KTP/SIM"
                      className="idcard-doc-img"
                    />
                    <div className="idcard-details-box">
                      <span className="doc-status-pill success">
                        <CheckCircle2 size={13} /> Dokumen KTP/SIM Terlampir
                      </span>
                      <div className="vcard-actions-row">
                        <a
                          href={idCardUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-icon-action"
                          title="Buka / Lihat Berkas Penuh (Tab Baru)"
                          aria-label="Buka Berkas Penuh"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          type="button"
                          className="btn-icon-action"
                          title="Ganti Berkas KTP/SIM"
                          aria-label="Ganti Berkas KTP/SIM"
                          disabled={uploadingIdCard}
                          onClick={() => idCardInputRef.current?.click()}
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon-action danger"
                          title="Hapus Berkas KTP/SIM"
                          aria-label="Hapus Berkas KTP/SIM"
                          onClick={() => setIdCardUrl("")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`drag-drop-zone ${isDragOverIdCard ? "active" : ""} ${
                      uploadingIdCard ? "disabled" : ""
                    }`}
                    onDragOver={(e) => handleDragOver(e, "idCard")}
                    onDragEnter={(e) => handleDragOver(e, "idCard")}
                    onDragLeave={(e) => handleDragLeave(e, "idCard")}
                    onDrop={(e) => handleDrop(e, "idCard")}
                    onClick={() => !uploadingIdCard && idCardInputRef.current?.click()}
                  >
                    <div className="dropzone-icon-circle">
                      {uploadingIdCard ? (
                        <Loader2 size={20} className="spin-icon" />
                      ) : (
                        <IdCard size={20} />
                      )}
                    </div>
                    <p className="dropzone-title">
                      {uploadingIdCard ? (
                        "Mengunggah berkas..."
                      ) : isDragOverIdCard ? (
                        "Lepaskan berkas di sini"
                      ) : (
                        <>
                          Tarik & lepas foto KTP/SIM, atau <span>pilih berkas</span>
                        </>
                      )}
                    </p>
                    <p className="dropzone-subtitle">
                      Foto / scan KTP atau SIM yang terbaca jelas
                    </p>
                    <div className="dropzone-meta-tags">
                      <span className="meta-tag">JPG / PNG / WebP / PDF</span>
                      <span className="meta-tag">Maks. 5 MB</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: STRUKTUR ORGANISASI (JABATAN, DPD, KORWIL - SELECT2 SEARCHABLE) */}
        <div className="profile-section-panel">
          <div className="panel-section-title">
            <Building2 size={18} />
            <div>
              <h3>2. Jabatan, Pengurus Daerah (DPD) & Korwil</h3>
              <p>Penugasan struktural dan perwakilan wilayah pengurus organisasi.</p>
            </div>
          </div>

          <div className="form-row-2">
            {/* Jabatan Organisasi (Searchable Select2) */}
            <div>
              <label className="field-label">
                Jabatan dalam Organisasi <span className="req-star">*</span>
              </label>
              <SearchableSelect
                value={jabatanSelection}
                onChange={(val) => setJabatanSelection(val)}
                options={jabatanOptions}
                placeholder="Pilih atau cari jabatan..."
                searchPlaceholder="Ketik untuk mencari jabatan..."
              />

              {jabatanSelection === "Lainnya (Ketik Manual)" && (
                <input
                  type="text"
                  value={customJabatan}
                  onChange={(e) => setCustomJabatan(e.target.value)}
                  placeholder="Ketik nama jabatan / posisi Anda..."
                  className="text-input"
                  style={{ marginTop: "8px" }}
                />
              )}
            </div>

            {/* DPD Pengampu (Searchable Select2) */}
            <div>
              <label className="field-label">
                DPD Pengampu (Pengurus Daerah) <span className="req-star">*</span>
              </label>
              <SearchableSelect
                value={unitId}
                onChange={(val) => setUnitId(val)}
                options={unitOptions}
                loading={loadingUnits}
                placeholder={
                  loadingUnits
                    ? "Memuat daftar DPD..."
                    : "Pilih atau cari DPD Pengampu..."
                }
                searchPlaceholder="Ketik nama provinsi / DPD..."
                emptyText="DPD tidak ditemukan"
              />
            </div>
          </div>

          <div className="form-row-1" style={{ marginTop: "14px" }}>
            {/* Korwil (Searchable Select2) */}
            <div>
              <label className="field-label">
                Koordinator Wilayah (Korwil / Zona) <span className="req-star">*</span>
              </label>
              <SearchableSelect
                value={korwilSelection}
                onChange={(val) => setKorwilSelection(val)}
                options={korwilOptions}
                placeholder="Pilih atau cari Koordinator Wilayah..."
                searchPlaceholder="Ketik nama kota / zona korwil..."
              />

              {korwilSelection === "__custom__" && (
                <input
                  type="text"
                  value={customKorwil}
                  onChange={(e) => setCustomKorwil(e.target.value)}
                  placeholder="Ketik nama koordinator wilayah Anda (cth: Korwil Tangerang Selatan)..."
                  className="text-input"
                  style={{ marginTop: "8px" }}
                />
              )}
              <small className="help-text">
                Pilih atau ketik zona perwakilan daerah terdekat dengan domisili kerja Anda.
              </small>
            </div>
          </div>
        </div>

        {/* SECTION C: INFORMASI USAHA & SPESIALISASI HVAC/R */}
        <div className="profile-section-panel">
          <div className="panel-section-title">
            <Wrench size={18} />
            <div>
              <h3>3. Informasi Usaha / Bengkel & Spesialisasi Teknisi</h3>
              <p>Data workshop pendingin, bidang keahlian, dan armada teknisi.</p>
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label className="field-label">
                Nama Usaha / Bengkel / CV <span className="req-star">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Contoh: Berkah Sejuk Mandiri Teknik"
                className="text-input"
              />
            </div>

            <div>
              <label className="field-label">Jumlah Teknisi / Armada</label>
              <input
                type="number"
                min={1}
                max={500}
                value={staffCount}
                onChange={(e) => setStaffCount(e.target.value)}
                placeholder="Contoh: 4 Orang"
                className="text-input"
              />
            </div>
          </div>

          {/* Spesialisasi Checkbox Chips */}
          <div style={{ marginTop: "14px" }}>
            <label className="field-label">
              Bidang Spesialisasi Pendingin & Tata Udara <span className="req-star">*</span>
            </label>
            <div className="specialization-chips-container">
              {SPECIALIZATION_PRESETS.map((spec) => {
                const isSelected = specializations.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    className={`spec-chip-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleSpecialization(spec)}
                  >
                    {isSelected && <CheckCircle2 size={13} />}
                    <span>{spec}</span>
                  </button>
                );
              })}
            </div>
            {specializations.length === 0 && (
              <small className="error-text">
                Pilih minimal 1 bidang spesialisasi pendingin.
              </small>
            )}
          </div>

          <div className="form-row-2" style={{ marginTop: "14px" }}>
            <div>
              <label className="field-label">Alamat Workshop / Bengkel</label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Alamat fisik bengkel atau kantor operasional..."
                className="text-input"
              />
            </div>

            <div>
              <label className="field-label">No. Telepon / WhatsApp Bisnis</label>
              <input
                type="text"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="Nomor kontak layanan pelanggan..."
                className="text-input"
              />
            </div>
          </div>
        </div>

        {/* SECTION D: INFORMASI PELENGKAP (PENGALAMAN & KONTAK DARURAT) */}
        <div className="profile-section-panel">
          <div className="panel-section-title">
            <Shield size={18} />
            <div>
              <h3>4. Pengalaman Kerja & Kontak Darurat (Pelengkap)</h3>
              <p>Data rekam jejak dan kontak darurat untuk keamanan praktisi di lapangan.</p>
            </div>
          </div>

          <div className="form-row-3">
            <div>
              <label className="field-label">Pengalaman Kerja di HVAC/R</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={workExperienceYears}
                  onChange={(e) => setWorkExperienceYears(e.target.value)}
                  placeholder="Contoh: 5"
                  className="text-input"
                />
                <span className="input-suffix">Tahun</span>
              </div>
            </div>

            <div>
              <label className="field-label">Nama Kontak Darurat</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Nama kerabat / keluarga..."
                className="text-input"
              />
            </div>

            <div>
              <label className="field-label">No. HP Kontak Darurat</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="text-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="profile-bottom-save-bar">
        <div className="save-bar-info">
          {isAllComplete ? (
            <span className="save-bar-badge ready">
              <BadgeCheck size={16} /> Berkas Siap Diverifikasi Pengurus DPD
            </span>
          ) : (
            <span className="save-bar-badge incomplete">
              <AlertCircle size={16} /> {completedCount} dari {totalMandatory} berkas wajib terisi ({livePercentage}%)
            </span>
          )}
        </div>
        <button
          type="button"
          className="button primary save-profile-main-btn"
          disabled={saving}
          onClick={handleSaveProfile}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="spin-icon" /> Menyimpan…
            </>
          ) : (
            <>
              <Save size={16} /> Simpan Profil & Ajukan Verifikasi
            </>
          )}
        </button>
      </div>
    </div>
  );
}
