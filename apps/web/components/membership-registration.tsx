"use client";

import {
  INDONESIA_PROVINCES,
  type WilayahDistrict,
  type WilayahProvince,
  type WilayahRegency,
  type WilayahVillage,
} from "@openorg/contracts";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { memberApi } from "@/lib/member-client";
import { useMemberAuth } from "@/lib/use-member-auth";
import { SearchableSelect, type SearchableOption } from "./searchable-select";

type Unit = { id: string; name: string; type: string };

interface FormState {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  companyName: string;
  unitId: string;
  // Wilayah fields
  provinceKode: string;
  provinceNama: string;
  regencyKode: string;
  regencyNama: string;
  districtKode: string;
  districtNama: string;
  villageKode: string;
  villageNama: string;
  postalCode: string;
  addressDetail: string;
  latitude: number | null;
  longitude: number | null;
  // Security
  password: string;
  confirmPassword: string;
  consent: boolean;
}

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  companyName: "",
  unitId: "",
  provinceKode: "",
  provinceNama: "",
  regencyKode: "",
  regencyNama: "",
  districtKode: "",
  districtNama: "",
  villageKode: "",
  villageNama: "",
  postalCode: "",
  addressDetail: "",
  latitude: null,
  longitude: null,
  password: "",
  confirmPassword: "",
  consent: false,
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const DRAFT_STORAGE_KEY = "openorg_registration_draft_v2";

// In-memory client cache to prevent redundant API calls
const regencyCache = new Map<string, WilayahRegency[]>();
const districtCache = new Map<string, WilayahDistrict[]>();
const villageCache = new Map<string, WilayahVillage[]>();

const WIZARD_STEPS = [
  {
    id: 1,
    label: "Identitas",
    sub: "KTP & Kontak",
    icon: User,
  },
  {
    id: 2,
    label: "Wilayah",
    sub: "Alamat & GPS",
    icon: MapPin,
  },
  {
    id: 3,
    label: "Pengurus",
    sub: "DPD & Usaha",
    icon: Building2,
  },
  {
    id: 4,
    label: "Keamanan",
    sub: "Sandi & Pakta",
    icon: Lock,
  },
] as const;

export function MembershipRegistration({
  organizationName,
}: {
  organizationName: string;
}) {
  const { isLoggedIn, member } = useMemberAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [stage, setStage] = useState<"register" | "done">("register");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Form State & Validations
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});
  const [showPassword, setShowPassword] = useState(false);

  // Auto-Save Draft State
  const [hasDraft, setHasDraft] = useState(false);
  const [draftTime, setDraftTime] = useState<string | null>(null);

  // Wilayah Cascading Data
  const [regencies, setRegencies] = useState<WilayahRegency[]>([]);
  const [districts, setDistricts] = useState<WilayahDistrict[]>([]);
  const [villages, setVillages] = useState<WilayahVillage[]>([]);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Geolocation state
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(
    null,
  );

  // Memoized Searchable Options for Select2 Comboboxes
  const provinceOptions = useMemo<SearchableOption[]>(
    () => INDONESIA_PROVINCES.map((p) => ({ value: p.kode, label: p.nama })),
    [],
  );

  const regencyOptions = useMemo<SearchableOption[]>(
    () =>
      regencies.map((r) => ({
        value: r.kode,
        label: r.nama,
      })),
    [regencies],
  );

  const districtOptions = useMemo<SearchableOption[]>(
    () => districts.map((d) => ({ value: d.kode, label: d.nama })),
    [districts],
  );

  const villageOptions = useMemo<SearchableOption[]>(
    () =>
      villages.map((v) => ({
        value: v.kode,
        label: v.nama,
      })),
    [villages],
  );

  const unitOptions = useMemo<SearchableOption[]>(
    () =>
      units.map((u) => ({
        value: u.id,
        label: u.name,
        subLabel: u.type ? `(${u.type})` : undefined,
      })),
    [units],
  );

  // Fetch Structure Units (DPD) on Mount
  useEffect(() => {
    memberApi<{ data: { units: Unit[] } }>("/v1/public/structure")
      .then((result) => setUnits(result.data.units || []))
      .catch(() => setUnits([]));
  }, []);

  // Restore draft from localStorage on Mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.form) {
          setForm(parsed.form);
          if (parsed.currentStep >= 1 && parsed.currentStep <= 4) {
            setCurrentStep(parsed.currentStep);
          }
          setHasDraft(true);
          setDraftTime(
            parsed.savedAt
              ? new Date(parsed.savedAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null,
          );

          // Preload cascading dropdowns for saved Wilayah
          if (parsed.form.provinceKode) {
            fetch(
              `/api/v1/public/wilayah/regencies?province=${parsed.form.provinceKode}`,
            )
              .then((r) => r.json())
              .then((json) => {
                const list: WilayahRegency[] = json.data || [];
                regencyCache.set(parsed.form.provinceKode, list);
                setRegencies(list);
              })
              .catch(() => {});
          }
          if (parsed.form.regencyKode) {
            fetch(
              `/api/v1/public/wilayah/districts?regency=${parsed.form.regencyKode}`,
            )
              .then((r) => r.json())
              .then((json) => {
                const list: WilayahDistrict[] = json.data || [];
                districtCache.set(parsed.form.regencyKode, list);
                setDistricts(list);
              })
              .catch(() => {});
          }
          if (parsed.form.districtKode) {
            fetch(
              `/api/v1/public/wilayah/villages?district=${parsed.form.districtKode}`,
            )
              .then((r) => r.json())
              .then((json) => {
                const list: WilayahVillage[] = json.data || [];
                villageCache.set(parsed.form.districtKode, list);
                setVillages(list);
              })
              .catch(() => {});
          }
        }
      }
    } catch {
      // Storage access blocked or invalid JSON
    }
  }, []);

  // Auto-save draft on form / step change
  useEffect(() => {
    const hasAnyContent = Boolean(
      form.name ||
        form.email ||
        form.phone ||
        form.dateOfBirth ||
        form.provinceKode ||
        form.addressDetail,
    );

    if (!hasAnyContent) return;

    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          form,
          currentStep,
          savedAt: new Date().toISOString(),
        }),
      );
      setHasDraft(true);
      setDraftTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      // Storage access blocked
    }
  }, [form, currentStep]);

  // Reset Draft
  const handleResetDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Storage access blocked
    }
    setForm(initialFormState);
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    setErrors({});
    setTouched({});
    setCurrentStep(1);
    setHasDraft(false);
    setDraftTime(null);
    setLocationSuccessMsg(null);
    toast.info("Formulir pendaftaran berhasil direset.");
  };

  // Validation Logic
  const validateField = (
    field: keyof FormState,
    value: unknown,
    state: FormState,
  ): string | null => {
    switch (field) {
      case "name": {
        const v = String(value || "").trim();
        if (!v) return "Nama lengkap wajib diisi sesuai KTP.";
        if (v.length < 3) return "Nama lengkap minimal 3 karakter.";
        if (v.length > 120) return "Nama lengkap maksimal 120 karakter.";
        if (!/^[a-zA-Z\s.,'’`-]+$/.test(v))
          return "Nama hanya boleh berisi huruf, spasi, titik, koma, atau tanda petik.";
        return null;
      }
      case "email": {
        const v = String(value || "")
          .trim()
          .toLowerCase();
        if (!v) return "Alamat email aktif wajib diisi.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
          return "Format alamat email tidak valid (contoh: nama@domain.com).";
        return null;
      }
      case "phone": {
        const v = String(value || "")
          .trim()
          .replace(/[^\d+]/g, "");
        if (!v) return "Nomor WhatsApp / HP wajib diisi.";
        const cleanDigits = v.replace(/\D/g, "");
        if (cleanDigits.length < 10 || cleanDigits.length > 14)
          return "Nomor HP harus 10–14 digit angka (contoh: 081234567890).";
        if (!/^(08|628|\+628)/.test(v))
          return "Nomor HP harus diawali dengan 08 atau 628.";
        return null;
      }
      case "dateOfBirth": {
        const v = String(value || "").trim();
        if (!v) return "Tanggal lahir wajib diisi.";
        const dob = new Date(v);
        if (Number.isNaN(dob.getTime())) return "Tanggal lahir tidak valid.";
        const today = new Date();
        if (dob > today) return "Tanggal lahir tidak boleh di masa depan.";
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 17) return "Minimal usia pendaftar adalah 17 tahun.";
        if (age > 100) return "Tanggal lahir tidak realistis.";
        return null;
      }
      case "unitId": {
        const v = String(value || "").trim();
        if (!v) return "Pilih Pengurus Daerah (DPD Pengampu) domisili Anda.";
        return null;
      }
      case "provinceKode": {
        const v = String(value || "").trim();
        if (!v) return "Provinsi domisili wajib dipilih.";
        return null;
      }
      case "regencyKode": {
        const v = String(value || "").trim();
        if (!v) return "Kabupaten / Kota domisili wajib dipilih.";
        return null;
      }
      case "districtKode": {
        const v = String(value || "").trim();
        if (!v) return "Kecamatan domisili wajib dipilih.";
        return null;
      }
      case "villageKode": {
        const v = String(value || "").trim();
        if (!v) return "Kelurahan / Desa domisili wajib dipilih.";
        return null;
      }
      case "postalCode": {
        const v = String(value || "").trim();
        if (!v) return "Kode pos wajib terisi.";
        if (!/^\d{5}$/.test(v)) return "Kode pos harus 5 digit angka.";
        return null;
      }
      case "addressDetail": {
        const v = String(value || "").trim();
        if (!v) return "Alamat jalan / RT / RW wajib diisi.";
        if (v.length < 8)
          return "Alamat detail minimal 8 karakter agar lengkap.";
        return null;
      }
      case "password": {
        const v = String(value || "");
        if (!v) return "Kata sandi akun portal wajib dibuat.";
        if (v.length < 8) return "Kata sandi minimal 8 karakter.";
        if (!/[a-zA-Z]/.test(v) || !/\d/.test(v))
          return "Kata sandi wajib mengandung kombinasi huruf dan angka.";
        return null;
      }
      case "confirmPassword": {
        const v = String(value || "");
        if (!v) return "Konfirmasi kata sandi wajib diisi.";
        if (v !== state.password) return "Konfirmasi kata sandi tidak cocok.";
        return null;
      }
      case "consent": {
        if (!value) return "Anda wajib menyetujui AD/ART dan Pakta Integritas.";
        return null;
      }
      default:
        return null;
    }
  };

  const validateStep = (stepNumber: number, state: FormState): ValidationErrors => {
    const errs: ValidationErrors = {};
    let fieldsToCheck: Array<keyof FormState> = [];

    if (stepNumber === 1) {
      fieldsToCheck = ["name", "email", "phone", "dateOfBirth"];
    } else if (stepNumber === 2) {
      fieldsToCheck = [
        "provinceKode",
        "regencyKode",
        "districtKode",
        "villageKode",
        "postalCode",
        "addressDetail",
      ];
    } else if (stepNumber === 3) {
      fieldsToCheck = ["unitId"];
    } else if (stepNumber === 4) {
      fieldsToCheck = ["password", "confirmPassword", "consent"];
    }

    for (const f of fieldsToCheck) {
      const err = validateField(f, state[f], state);
      if (err) errs[f] = err;
    }
    return errs;
  };

  const validateAll = (state: FormState): ValidationErrors => {
    const errs: ValidationErrors = {};
    const fields: Array<keyof FormState> = [
      "name",
      "email",
      "phone",
      "dateOfBirth",
      "provinceKode",
      "regencyKode",
      "districtKode",
      "villageKode",
      "postalCode",
      "addressDetail",
      "unitId",
      "password",
      "confirmPassword",
      "consent",
    ];
    for (const f of fields) {
      const err = validateField(f, state[f], state);
      if (err) errs[f] = err;
    }
    return errs;
  };

  const handleChange = (
    field: keyof FormState,
    value: string | boolean | number | null,
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      const err = validateField(field, value, next);
      setErrors((prevErr) => ({ ...prevErr, [field]: err || undefined }));
      return next;
    });
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field], form);
    setErrors((prev) => ({ ...prev, [field]: err || undefined }));
  };

  // Province change -> fetch regencies
  const handleProvinceChange = async (provKode: string) => {
    const prov = INDONESIA_PROVINCES.find((p) => p.kode === provKode);
    const provNama = prov ? prov.nama : "";

    setForm((prev) => ({
      ...prev,
      provinceKode: provKode,
      provinceNama: provNama,
      regencyKode: "",
      regencyNama: "",
      districtKode: "",
      districtNama: "",
      villageKode: "",
      villageNama: "",
      postalCode: "",
    }));

    // Auto select matching DPD if found
    if (provNama) {
      const matchedUnit = units.find((u) => {
        const uName = u.name.toLowerCase();
        const pName = provNama.toLowerCase();
        return uName.includes(pName) || pName.includes(uName);
      });
      if (matchedUnit) {
        setForm((prev) => ({ ...prev, unitId: matchedUnit.id }));
      }
    }

    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    if (!provKode) return;

    if (regencyCache.has(provKode)) {
      setRegencies(regencyCache.get(provKode)!);
      return;
    }

    setLoadingRegencies(true);
    try {
      const res = await fetch(
        `/api/v1/public/wilayah/regencies?province=${provKode}`,
      );
      const json = await res.json();
      const list: WilayahRegency[] = json.data || [];
      regencyCache.set(provKode, list);
      setRegencies(list);
    } catch {
      toast.error("Gagal memuat daftar kabupaten/kota.");
    } finally {
      setLoadingRegencies(false);
    }
  };

  // Regency change -> fetch districts
  const handleRegencyChange = async (regKode: string) => {
    const reg = regencies.find((r) => r.kode === regKode);
    const regNama = reg ? reg.nama : "";

    setForm((prev) => ({
      ...prev,
      regencyKode: regKode,
      regencyNama: regNama,
      districtKode: "",
      districtNama: "",
      villageKode: "",
      villageNama: "",
      postalCode: "",
    }));

    setDistricts([]);
    setVillages([]);

    if (!regKode) return;

    if (districtCache.has(regKode)) {
      setDistricts(districtCache.get(regKode)!);
      return;
    }

    setLoadingDistricts(true);
    try {
      const res = await fetch(
        `/api/v1/public/wilayah/districts?regency=${regKode}`,
      );
      const json = await res.json();
      const list: WilayahDistrict[] = json.data || [];
      districtCache.set(regKode, list);
      setDistricts(list);
    } catch {
      toast.error("Gagal memuat daftar kecamatan.");
    } finally {
      setLoadingDistricts(false);
    }
  };

  // District change -> fetch villages
  const handleDistrictChange = async (distKode: string) => {
    const dist = districts.find((d) => d.kode === distKode);
    const distNama = dist ? dist.nama : "";

    setForm((prev) => ({
      ...prev,
      districtKode: distKode,
      districtNama: distNama,
      villageKode: "",
      villageNama: "",
      postalCode: "",
    }));

    setVillages([]);

    if (!distKode) return;

    if (villageCache.has(distKode)) {
      setVillages(villageCache.get(distKode)!);
      return;
    }

    setLoadingVillages(true);
    try {
      const res = await fetch(
        `/api/v1/public/wilayah/villages?district=${distKode}`,
      );
      const json = await res.json();
      const list: WilayahVillage[] = json.data || [];
      villageCache.set(distKode, list);
      setVillages(list);
    } catch {
      toast.error("Gagal memuat daftar kelurahan/desa.");
    } finally {
      setLoadingVillages(false);
    }
  };

  // Village change -> set postalCode
  const handleVillageChange = (villKode: string) => {
    const vill = villages.find((v) => v.kode === villKode);
    const villNama = vill ? vill.nama : "";
    const kodepos = vill ? vill.kodepos : "";

    setForm((prev) => ({
      ...prev,
      villageKode: villKode,
      villageNama: villNama,
      postalCode: kodepos || prev.postalCode,
    }));
  };

  // Geolocation Auto-Detection
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Browser Anda tidak mendukung deteksi lokasi (Geolocation).");
      return;
    }

    setDetectingLocation(true);
    setLocationSuccessMsg(null);

    const performReverseGeocode = async (latitude: number, longitude: number) => {
      try {
        const res = await fetch(
          `/api/v1/public/wilayah/reverse-geocode?latitude=${latitude}&longitude=${longitude}`,
        );
        if (!res.ok) {
          throw new Error("Gagal mengambil informasi wilayah dari server.");
        }
        const json = await res.json();
        const payload = json.data;

        if (!payload || !payload.province) {
          toast.warning(
            `Koordinat GPS terdeteksi (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), silakan pilih wilayah secara manual.`,
          );
          setForm((prev) => ({
            ...prev,
            latitude,
            longitude,
            addressDetail: prev.addressDetail || payload?.road || "",
          }));
          return;
        }

        const matchedProvince = payload.province;
        const matchedRegency = payload.regency;
        const matchedDistrict = payload.district;
        const matchedVillage = payload.village;

        const regList: WilayahRegency[] = payload.regencies || [];
        const distList: WilayahDistrict[] = payload.districts || [];
        const villList: WilayahVillage[] = payload.villages || [];

        // Update in-memory caches for fast sub-select switching
        if (matchedProvince?.kode && regList.length > 0) {
          regencyCache.set(matchedProvince.kode, regList);
        }
        if (matchedRegency?.kode && distList.length > 0) {
          districtCache.set(matchedRegency.kode, distList);
        }
        if (matchedDistrict?.kode && villList.length > 0) {
          villageCache.set(matchedDistrict.kode, villList);
        }

        // Auto-match DPD unit
        const matchedUnit = units.find((u) => {
          const uName = u.name.toLowerCase();
          const pName = matchedProvince.nama.toLowerCase();
          return uName.includes(pName) || pName.includes(uName);
        });

        setRegencies(regList);
        setDistricts(distList);
        setVillages(villList);

        setForm((prev) => ({
          ...prev,
          latitude,
          longitude,
          provinceKode: matchedProvince.kode,
          provinceNama: matchedProvince.nama,
          regencyKode: matchedRegency?.kode || "",
          regencyNama: matchedRegency?.nama || "",
          districtKode: matchedDistrict?.kode || "",
          districtNama: matchedDistrict?.nama || "",
          villageKode: matchedVillage?.kode || "",
          villageNama: matchedVillage?.nama || "",
          postalCode:
            matchedVillage?.kodepos ||
            payload.postalCode ||
            matchedRegency?.kodepos ||
            "",
          addressDetail: prev.addressDetail || payload.road || "",
          unitId: prev.unitId || matchedUnit?.id || prev.unitId,
        }));

        const locSummary = [
          matchedVillage?.nama ? `Kel. ${matchedVillage.nama}` : null,
          matchedDistrict?.nama ? `Kec. ${matchedDistrict.nama}` : null,
          matchedRegency?.nama,
          matchedProvince.nama,
        ]
          .filter(Boolean)
          .join(", ");

        setLocationSuccessMsg(locSummary);
        toast.success("Lokasi domisili Anda berhasil dideteksi otomatis!");
      } catch (err) {
        console.error("Auto detect location failed:", err);
        toast.error(
          "Gagal memproses detail alamat dari GPS. Silakan pilih wilayah secara manual.",
        );
      } finally {
        setDetectingLocation(false);
      }
    };

    const getGeoPosition = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          performReverseGeocode(pos.coords.latitude, pos.coords.longitude);
        },
        (geoErr) => {
          if (highAccuracy) {
            // Retry with standard WiFi/IP accuracy
            getGeoPosition(false);
            return;
          }
          setDetectingLocation(false);
          let msg = "Gagal mengakses GPS perangkat.";
          if (geoErr.code === geoErr.PERMISSION_DENIED) {
            msg =
              "Izin akses lokasi ditolak oleh browser. Silakan izinkan akses lokasi atau pilih wilayah secara manual.";
          } else if (geoErr.code === geoErr.TIMEOUT) {
            msg = "Waktu deteksi lokasi habis. Silakan coba lagi.";
          }
          toast.error(msg);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 8000 : 15000,
          maximumAge: 120000,
        },
      );
    };

    getGeoPosition(true);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Kosong", color: "#94a3b8" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z\d]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Lemah", color: "#ef4444" };
    if (score === 2) return { score: 2, label: "Sedang", color: "#f59e0b" };
    return { score: 3, label: "Kuat & Aman", color: "#10b981" };
  };

  const passwordStrength = getPasswordStrength(form.password);

  // Wizard Step Navigation
  const scrollToFormTop = () => {
    const el = document.getElementById("membership-registration-wizard");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(currentStep, form);
    if (Object.keys(stepErrors).length > 0) {
      // Mark fields in this step as touched
      const newTouched = { ...touched };
      Object.keys(stepErrors).forEach((k) => {
        newTouched[k as keyof FormState] = true;
      });
      setTouched(newTouched);
      setErrors((prev) => ({ ...prev, ...stepErrors }));

      const firstErr = Object.values(stepErrors)[0];
      toast.error(`Periksa data: ${firstErr}`);
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      scrollToFormTop();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      scrollToFormTop();
    }
  };

  const handleStepClick = (stepId: number) => {
    // Only allow jumping back to completed/previous steps or current step
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      scrollToFormTop();
    } else if (stepId > currentStep) {
      // Validate current step before advancing
      const stepErrors = validateStep(currentStep, form);
      if (Object.keys(stepErrors).length === 0) {
        setCurrentStep(stepId);
        scrollToFormTop();
      } else {
        toast.warning("Silakan lengkapi langkah aktif terlebih dahulu.");
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Mark all fields as touched
    const allTouched: Partial<Record<keyof FormState, boolean>> = {};
    Object.keys(form).forEach((k) => {
      allTouched[k as keyof FormState] = true;
    });
    setTouched(allTouched);

    const validationErrors = validateAll(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      if (!firstErrorField) return;
      const errorMsg = validationErrors[firstErrorField as keyof FormState];
      toast.error(`Mohon lengkapi formulir: ${errorMsg}`);

      // Determine which step has this error
      if (
        ["name", "email", "phone", "dateOfBirth"].includes(firstErrorField)
      ) {
        setCurrentStep(1);
      } else if (
        [
          "provinceKode",
          "regencyKode",
          "districtKode",
          "villageKode",
          "postalCode",
          "addressDetail",
        ].includes(firstErrorField)
      ) {
        setCurrentStep(2);
      } else if (["unitId"].includes(firstErrorField)) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
      return;
    }

    setPending(true);
    setError("");

    try {
      const fullAddressString = [
        form.addressDetail,
        form.villageNama ? `Kel. ${form.villageNama}` : null,
        form.districtNama ? `Kec. ${form.districtNama}` : null,
        form.regencyNama,
        form.provinceNama,
        form.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      await memberApi<{ data: { memberId?: string } }>(
        "/v1/public/membership/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            password: form.password,
            address: form.addressDetail.trim() || fullAddressString,
            province: form.provinceNama || null,
            regency: form.regencyNama || null,
            district: form.districtNama || null,
            village: form.villageNama || null,
            postalCode: form.postalCode || null,
            latitude: form.latitude,
            longitude: form.longitude,
            unitId: form.unitId || null,
            dateOfBirth: form.dateOfBirth || null,
            companyName: form.companyName.trim() || null,
            consent: form.consent,
          }),
        },
      );

      // Clear draft after successful submission
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Storage access blocked
      }

      toast.success(
        "Pendaftaran anggota berhasil dikirimkan ke Pengurus Daerah (DPD)!",
      );
      setStage("done");
    } catch (reason) {
      const msg =
        reason instanceof Error
          ? reason.message
          : "Pendaftaran gagal dikirimkan ke server.";
      setError(msg);
      toast.error(`Pendaftaran gagal: ${msg}`);
    } finally {
      setPending(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="member-success-card">
        <span>
          <UserCheck size={36} color="#0284c7" />
        </span>
        <p className="eyebrow text-sky-600 font-bold">Akun Terverifikasi</p>
        <h2>Anda Sudah Terdaftar Sebagai Anggota</h2>
        <p>
          Anda saat ini sedang login dengan akun <strong>{member?.name}</strong>{" "}
          {member?.memberNumber ? `(No. KTA: ${member.memberNumber})` : ""}.
          Anda tidak perlu mengisi formulir pendaftaran ulang.
        </p>
        <div className="gate-action-buttons mt-4">
          <Link className="button primary" href="/member">
            Buka Portal & KTA Digital Saya <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="member-success-card">
        <span>
          <BadgeCheck size={40} color="#16a34a" />
        </span>
        <p className="eyebrow text-emerald-600 font-bold">
          Pendaftaran Berhasil Terkirim
        </p>
        <h2>Permohonan Anggota Sedang Ditinjau</h2>
        <p>
          Tautan aktivasi akun dan verifikasi email resmi telah dikirimkan ke{" "}
          <strong>{form.email}</strong>. Silakan periksa kotak masuk atau folder
          spam email Anda untuk mengonfirmasi keanggotaan.
        </p>

        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "14px",
            padding: "16px",
            margin: "16px 0",
            textAlign: "left",
          }}
        >
          <h4
            style={{
              fontSize: "13.5px",
              fontWeight: 800,
              color: "#166534",
              margin: "0 0 8px",
            }}
          >
            Tahap Selanjutnya:
          </h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              fontSize: "12.5px",
              color: "#334155",
              lineHeight: 1.65,
            }}
          >
            <li>
              Buka email masuk Anda dan klik tautan konfirmasi verifikasi.
            </li>
            <li>
              Sekretariat Pengurus Daerah (DPD){" "}
              {form.provinceNama
                ? `DPD ${form.provinceNama}`
                : organizationName}{" "}
              akan memvalidasi kelengkapan berkas Anda.
            </li>
            <li>
              Setelah diverifikasi, Nomor KTA resmi dan barcode digital langsung
              aktif di portal anggota.
            </li>
          </ul>
        </div>
        <div className="gate-action-buttons mt-4">
          <Link className="button primary" href="/member/login">
            Masuk ke Portal Anggota <ArrowRight size={17} />
          </Link>
          <Link className="button secondary" href="/member/verify-email">
            Cek Status Verifikasi Email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      id="membership-registration-wizard"
      className="member-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Form Heading */}
      <div className="member-form-heading">
        <span className="member-form-icon">
          <Building2 size={24} color="#0284c7" />
        </span>
        <div>
          <p className="eyebrow">Formulir Registrasi Mandiri</p>
          <h2>Data Permohonan Anggota Baru</h2>
        </div>
      </div>

      {/* Auto-Save Draft Notification Badge */}
      {hasDraft && (
        <div className="wizard-draft-alert full">
          <div className="wizard-draft-info">
            <Save size={14} color="#16a34a" />
            <span>
              Draf tersimpan otomatis
              {draftTime ? ` (pukul ${draftTime})` : ""}
            </span>
          </div>
          <button
            type="button"
            className="wizard-draft-reset-btn"
            onClick={handleResetDraft}
            title="Hapus draf dan mulai isi dari awal"
          >
            Mulai Ulang Formulir
          </button>
        </div>
      )}

      {/* 4-Step Interactive Horizontal Stepper */}
      <div className="wizard-stepper full">
        {WIZARD_STEPS.map((step) => {
          const isCurrent = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              className={`wizard-step-pill ${isCurrent ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              onClick={() => handleStepClick(step.id)}
            >
              <div className="wizard-step-circle">
                {isCompleted ? <Check size={14} /> : step.id}
              </div>
              <div className="wizard-step-text">
                <span className="wizard-step-label">{step.label}</span>
                <span className="wizard-step-caption">{step.sub}</span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div
          className="form-error full"
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* =====================================================================
          STEP 1: DATA PRIBADI & IDENTITAS KTP
          ===================================================================== */}
      {currentStep === 1 && (
        <>
          <div className="wizard-step-header full">
            <span className="wizard-step-tag">Langkah 1 dari 4</span>
            <h3>Data Pribadi & Identitas KTP</h3>
            <p>
              Lengkapi informasi identitas diri Anda sesuai KTP yang masih
              berlaku.
            </p>
          </div>

          {/* Field: Name */}
          <label htmlFor="reg-name" data-field="name">
            <span className="field-label">
              <User size={13} color="#0284c7" /> Nama Lengkap (Sesuai KTP){" "}
              <span className="req">*</span>
            </span>
            <input
              id="reg-name"
              name="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="Contoh: Budi Santoso, S.T."
              className={touched.name && errors.name ? "input-invalid" : ""}
              autoComplete="name"
            />
            {touched.name && errors.name && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.name}
              </span>
            )}
          </label>

          {/* Field: Email */}
          <label htmlFor="reg-email" data-field="email">
            <span className="field-label">
              <Mail size={13} color="#0284c7" /> Alamat Email Aktif{" "}
              <span className="req">*</span>
            </span>
            <input
              id="reg-email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="email.aktif@domain.com"
              className={touched.email && errors.email ? "input-invalid" : ""}
              autoComplete="email"
            />
            {touched.email && errors.email && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.email}
              </span>
            )}
          </label>

          {/* Field: Phone */}
          <label htmlFor="reg-phone" data-field="phone">
            <span className="field-label">
              <Phone size={13} color="#0284c7" /> No. WhatsApp / HP Aktif{" "}
              <span className="req">*</span>
            </span>
            <input
              id="reg-phone"
              name="phone"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
              placeholder="081234567890"
              className={touched.phone && errors.phone ? "input-invalid" : ""}
              autoComplete="tel"
            />
            {touched.phone && errors.phone && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.phone}
              </span>
            )}
          </label>

          {/* Field: Date of Birth */}
          <label htmlFor="reg-dob" data-field="dateOfBirth">
            <span className="field-label">
              <Calendar size={13} color="#0284c7" /> Tanggal Lahir{" "}
              <span className="req">*</span>
            </span>
            <input
              id="reg-dob"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              onBlur={() => handleBlur("dateOfBirth")}
              className={
                touched.dateOfBirth && errors.dateOfBirth ? "input-invalid" : ""
              }
            />
            {touched.dateOfBirth && errors.dateOfBirth && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.dateOfBirth}
              </span>
            )}
          </label>
        </>
      )}

      {/* =====================================================================
          STEP 2: WILAYAH & ALAMAT DOMISILI
          ===================================================================== */}
      {currentStep === 2 && (
        <>
          <div className="wizard-step-header full">
            <span className="wizard-step-tag">Langkah 2 dari 4</span>
            <h3>Wilayah & Alamat Domisili</h3>
            <p>
              Pilih wilayah administrasi atau gunakan tombol deteksi lokasi GPS untuk pengisian otomatis.
            </p>
          </div>

          {/* GPS Assist Bar */}
          <div className="gps-assist-box full">
            <div className="gps-assist-info">
              <div className="gps-assist-icon">
                <Compass size={18} />
              </div>
              <div className="gps-assist-text">
                <h4>Deteksi Otomatis Lokasi GPS</h4>
                <p>Ambil koordinat perangkat untuk auto-fill provinsi hingga kelurahan</p>
              </div>
            </div>
            <button
              type="button"
              className="button-detect-location"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              title="Deteksi lokasi koordinat GPS secara otomatis"
            >
              {detectingLocation ? (
                <>
                  <Loader2 size={14} className="animate-spin text-sky-600" />
                  <span>Mendeteksi Lokasi...</span>
                </>
              ) : (
                <>
                  <Navigation size={14} color="#0284c7" />
                  <span>Deteksi Lokasi Saya</span>
                </>
              )}
            </button>
          </div>

          {locationSuccessMsg && (
            <div className="location-detected-banner full">
              <div className="location-detected-content">
                <CheckCircle2 size={16} color="#16a34a" />
                <span>{locationSuccessMsg}</span>
              </div>
              <span className="location-detected-tag">Auto-Filled</span>
            </div>
          )}

          {/* Row 1: Provinsi & Kabupaten */}
          <label htmlFor="reg-province" data-field="provinceKode">
            <span className="field-label">
              <MapPin size={13} color="#0284c7" /> Provinsi Domisili <span className="req">*</span>
            </span>
            <SearchableSelect
              id="reg-province"
              name="provinceKode"
              value={form.provinceKode}
              onChange={handleProvinceChange}
              onBlur={() => handleBlur("provinceKode")}
              options={provinceOptions}
              placeholder="Pilih Provinsi..."
              searchPlaceholder="Cari Provinsi di Indonesia..."
              error={Boolean(touched.provinceKode && errors.provinceKode)}
            />
            {touched.provinceKode && errors.provinceKode && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.provinceKode}
              </span>
            )}
          </label>

          <label htmlFor="reg-regency" data-field="regencyKode">
            <span className="field-label">
              Kabupaten / Kota <span className="req">*</span>
            </span>
            <SearchableSelect
              id="reg-regency"
              name="regencyKode"
              value={form.regencyKode}
              onChange={handleRegencyChange}
              onBlur={() => handleBlur("regencyKode")}
              options={regencyOptions}
              placeholder={
                !form.provinceKode
                  ? "Pilih Provinsi terlebih dahulu..."
                  : loadingRegencies
                    ? "Memuat data Kabupaten/Kota..."
                    : "Pilih Kabupaten / Kota..."
              }
              searchPlaceholder="Cari Kabupaten atau Kota..."
              disabled={!form.provinceKode || loadingRegencies}
              loading={loadingRegencies}
              error={Boolean(touched.regencyKode && errors.regencyKode)}
            />
            {touched.regencyKode && errors.regencyKode && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.regencyKode}
              </span>
            )}
          </label>

          {/* Row 2: Kecamatan & Kelurahan */}
          <label htmlFor="reg-district" data-field="districtKode">
            <span className="field-label">
              Kecamatan <span className="req">*</span>
            </span>
            <SearchableSelect
              id="reg-district"
              name="districtKode"
              value={form.districtKode}
              onChange={handleDistrictChange}
              onBlur={() => handleBlur("districtKode")}
              options={districtOptions}
              placeholder={
                !form.regencyKode
                  ? "Pilih Kab/Kota terlebih dahulu..."
                  : loadingDistricts
                    ? "Memuat data Kecamatan..."
                    : "Pilih Kecamatan..."
              }
              searchPlaceholder="Cari Kecamatan..."
              disabled={!form.regencyKode || loadingDistricts}
              loading={loadingDistricts}
              error={Boolean(touched.districtKode && errors.districtKode)}
            />
            {touched.districtKode && errors.districtKode && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.districtKode}
              </span>
            )}
          </label>

          <label htmlFor="reg-village" data-field="villageKode">
            <span className="field-label">
              Kelurahan / Desa <span className="req">*</span>
            </span>
            <SearchableSelect
              id="reg-village"
              name="villageKode"
              value={form.villageKode}
              onChange={handleVillageChange}
              onBlur={() => handleBlur("villageKode")}
              options={villageOptions}
              placeholder={
                !form.districtKode
                  ? "Pilih Kecamatan terlebih dahulu..."
                  : loadingVillages
                    ? "Memuat data Kelurahan/Desa..."
                    : "Pilih Kelurahan / Desa..."
              }
              searchPlaceholder="Cari Kelurahan atau Desa..."
              disabled={!form.districtKode || loadingVillages}
              loading={loadingVillages}
              error={Boolean(touched.villageKode && errors.villageKode)}
            />
            {touched.villageKode && errors.villageKode && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.villageKode}
              </span>
            )}
          </label>

          {/* Row 3: Detail Alamat (1.4fr) & Kode Pos (0.6fr) in full-width row */}
          <div className="address-postal-row full">
            <label htmlFor="reg-address" data-field="addressDetail">
              <span className="field-label">
                Alamat Jalan, No. Rumah, RT / RW <span className="req">*</span>
              </span>
              <input
                id="reg-address"
                name="addressDetail"
                value={form.addressDetail}
                onChange={(e) => handleChange("addressDetail", e.target.value)}
                onBlur={() => handleBlur("addressDetail")}
                placeholder="Nama jalan, nomor rumah, gedung, RT/RW, atau patokan..."
                className={
                  touched.addressDetail && errors.addressDetail
                    ? "input-invalid"
                    : ""
                }
                autoComplete="street-address"
              />
              {touched.addressDetail && errors.addressDetail && (
                <span className="field-error-msg">
                  <AlertCircle size={12} /> {errors.addressDetail}
                </span>
              )}
            </label>

            <label htmlFor="reg-postal" data-field="postalCode">
              <span className="field-label">
                Kode Pos <span className="req">*</span>
              </span>
              <input
                id="reg-postal"
                name="postalCode"
                value={form.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                onBlur={() => handleBlur("postalCode")}
                placeholder="5 digit..."
                maxLength={5}
                className={
                  touched.postalCode && errors.postalCode ? "input-invalid" : ""
                }
              />
              {touched.postalCode && errors.postalCode && (
                <span className="field-error-msg">
                  <AlertCircle size={12} /> {errors.postalCode}
                </span>
              )}
            </label>
          </div>
        </>
      )}

      {/* =====================================================================
          STEP 3: PENGURUS DAERAH & BENGKEL / WORKSHOP
          ===================================================================== */}
      {currentStep === 3 && (
        <>
          <div className="wizard-step-header full">
            <span className="wizard-step-tag">Langkah 3 dari 4</span>
            <h3>Pengurus Daerah & Bengkel / Workshop</h3>
            <p>
              Pilih DPD pengampu domisili dan nama usaha teknisi pendingin Anda
              (bila ada).
            </p>
          </div>

          {/* Field: DPD / Unit Selection with SearchableSelect */}
          <label htmlFor="reg-unit" className="full" data-field="unitId">
            <span className="field-label">
              <MapPin size={13} color="#0284c7" /> Pengurus Daerah (DPD Pengampu){" "}
              <span className="req">*</span>
            </span>
            <SearchableSelect
              id="reg-unit"
              name="unitId"
              value={form.unitId}
              onChange={(val) => {
                handleChange("unitId", val);
              }}
              onBlur={() => handleBlur("unitId")}
              options={unitOptions}
              placeholder="Pilih Pengurus Daerah Terdekat..."
              searchPlaceholder="Cari DPD Pengurus Daerah..."
              error={Boolean(touched.unitId && errors.unitId)}
            />
            {touched.unitId && errors.unitId && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.unitId}
              </span>
            )}
          </label>

          {/* Field: Workshop / Company Name */}
          <label htmlFor="reg-company" className="full" data-field="companyName">
            <span className="field-label">
              Nama Bengkel / Workshop / Instansi{" "}
              <small style={{ color: "#64748b" }}>(Opsional)</small>
            </span>
            <input
              id="reg-company"
              name="companyName"
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="Contoh: Berkah Teknik AC"
              autoComplete="organization"
            />
          </label>
        </>
      )}

      {/* =====================================================================
          STEP 4: KEAMANAN AKUN PORTAL & PAKTA INTEGRITAS
          ===================================================================== */}
      {currentStep === 4 && (
        <>
          <div className="wizard-step-header full">
            <span className="wizard-step-tag">Langkah 4 dari 4</span>
            <h3>Keamanan Akun & Pakta Integritas</h3>
            <p>
              Buat kata sandi akun Portal Anggota dan setujui pakta integritas
              profesi.
            </p>
          </div>

          {/* Field: Password */}
          <label htmlFor="reg-password" data-field="password">
            <span className="field-label">
              <Lock size={13} color="#0284c7" /> Kata Sandi Akun Portal{" "}
              <span className="req">*</span>
            </span>
            <div style={{ position: "relative" }}>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="Minimal 8 karakter kombinasi huruf & angka"
                className={
                  touched.password && errors.password ? "input-invalid" : ""
                }
                autoComplete="new-password"
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Lihat kata sandi"
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="password-strength-indicator">
                <div className="strength-bar-track">
                  <div
                    className="strength-bar-fill"
                    style={{
                      width: `${(passwordStrength.score / 3) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span
                  style={{
                    color: passwordStrength.color,
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  Kekuatan: {passwordStrength.label}
                </span>
              </div>
            )}
            {touched.password && errors.password && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.password}
              </span>
            )}
          </label>

          {/* Field: Confirm Password */}
          <label htmlFor="reg-confirm-password" data-field="confirmPassword">
            <span className="field-label">
              <Lock size={13} color="#0284c7" /> Konfirmasi Kata Sandi{" "}
              <span className="req">*</span>
            </span>
            <input
              id="reg-confirm-password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Ulangi kata sandi di atas"
              className={
                touched.confirmPassword && errors.confirmPassword
                  ? "input-invalid"
                  : ""
              }
              autoComplete="new-password"
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="field-error-msg">
                <AlertCircle size={12} /> {errors.confirmPassword}
              </span>
            )}
          </label>

          {/* Consent Checkbox */}
          <div className="full" data-field="consent">
            <label
              htmlFor="reg-consent"
              className={`member-consent ${touched.consent && errors.consent ? "consent-invalid" : ""}`}
            >
              <input
                id="reg-consent"
                name="consent"
                type="checkbox"
                checked={form.consent}
                onChange={(e) => handleChange("consent", e.target.checked)}
                onBlur={() => handleBlur("consent")}
              />
              <span>
                Saya menyatakan bahwa seluruh data yang saya isikan adalah benar
                dan sah. Saya bersedia mematuhi <strong>AD/ART</strong> serta{" "}
                <strong>9 Butir Pakta Integritas Profesi</strong>{" "}
                {organizationName}.
              </span>
            </label>
            {touched.consent && errors.consent && (
              <span className="field-error-msg" style={{ marginTop: "4px" }}>
                <AlertCircle size={12} /> {errors.consent}
              </span>
            )}
          </div>
        </>
      )}

      {/* =====================================================================
          BOTTOM WIZARD NAVIGATION BAR
          ===================================================================== */}
      <div className="wizard-footer-nav full">
        {currentStep > 1 ? (
          <button
            type="button"
            className="wizard-btn-prev"
            onClick={handlePrevStep}
            disabled={pending}
          >
            <ArrowLeft size={16} />
            <span>Sebelumnya</span>
          </button>
        ) : (
          <span style={{ fontSize: "12.5px", color: "#64748b" }}>
            Sudah punya akun KTA?{" "}
            <Link
              href="/member/login"
              style={{ color: "#0284c7", fontWeight: 700 }}
            >
              Masuk Portal
            </Link>
          </span>
        )}

        <span className="wizard-step-counter">
          Langkah {currentStep} dari 4
        </span>

        {currentStep < 4 ? (
          <button
            type="button"
            className="wizard-btn-next"
            onClick={handleNextStep}
          >
            <span>Lanjut ke Langkah {currentStep + 1}</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="submit"
            className="wizard-btn-next"
            disabled={pending}
            style={{ minWidth: "220px" }}
          >
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <span>Kirim Pendaftaran Anggota</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
