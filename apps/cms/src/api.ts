const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const _ORGANIZATION = import.meta.env.VITE_ORGANIZATION ?? "demo";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (typeof init?.body === "string" && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      response.status,
      payload?.error?.message ?? "The server could not complete this request.",
    );
  return payload as T;
}

export type Session = {
  user: { id: string; name: string; email: string; avatarUrl?: string };
  organization: { id: string; name: string; slug: string };
  permissions: string[];
};

export type DashboardData = {
  counts: {
    pages: number;
    contents: number;
    members: number;
    events: number;
    inbox: number;
    applications: number;
  };
  recentContent: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    updatedAt: string;
  }>;
};

export type CmsMembershipApplication = {
  id: string;
  memberId: string;
  status: "applicant" | "pending" | "active" | "inactive" | "rejected";
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  reviewerNotes: string | null;
  consent: Record<string, unknown>;
  unitName: string | null;
  member: {
    id: string;
    memberNumber: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    biography: string | null;
    status: "applicant" | "pending" | "active" | "inactive" | "rejected";
    customFields: Record<string, unknown>;
    socialLinks: Array<{ platform: string; url: string }>;
  };
};

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  isHomepage: boolean;
  sections: Array<Record<string, unknown>>;
  seo: Record<string, unknown>;
  updatedAt: string;
};

export type CmsContent = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  featured: boolean;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  authorName: string | null;
  sourceUrl: string | null;
  seo: Record<string, unknown>;
  updatedAt: string;
};

export type CmsMedia = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  publicUrl: string;
  createdAt: string;
};

export type CmsOrganization = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  locale: string;
  timezone: string;
  theme: import("@openorg/contracts").Theme;
};

export type CmsPublicSettings = import("@openorg/contracts").PublicSettings;

export type CmsGovernanceUnit = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CmsGovernancePosition = {
  id: string;
  unitId: string | null;
  parentId: string | null;
  title: string;
  description: string | null;
  sortOrder: number;
};

export type CmsGovernanceMember = {
  id: string;
  name: string;
  memberNumber: string;
  unitId: string | null;
};

export type CmsGovernanceAssignment = {
  id: string;
  positionId: string;
  memberId: string;
  startsAt: string | null;
  endsAt: string | null;
  isPrimary: boolean;
  member: Omit<CmsGovernanceMember, "unitId"> & { avatarUrl: string | null };
};

export type CmsGovernanceData = {
  units: CmsGovernanceUnit[];
  positions: CmsGovernancePosition[];
  assignments: CmsGovernanceAssignment[];
  members: CmsGovernanceMember[];
};

export type CmsCreditScheme = {
  id: string;
  code: string;
  name: string;
  unitLabel: string;
  description: string | null;
  validityMonths: number | null;
  isActive: boolean;
};

export type CmsLearningActivity = {
  id: string;
  creditSchemeId: string | null;
  code: string;
  title: string;
  description: string | null;
  category: string;
  deliveryMode: "onsite" | "online" | "hybrid" | "self_paced";
  locationName: string | null;
  meetingUrl: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number | null;
  creditAmount: number;
  status: "draft" | "open" | "in_progress" | "completed" | "cancelled";
  scheme: CmsCreditScheme | null;
};

export type CmsLearningEnrollment = {
  id: string;
  activityId: string;
  memberId: string;
  status: "registered" | "waitlisted" | "confirmed" | "completed" | "cancelled";
  member: { id: string; name: string; memberNumber: string };
  attendance: {
    id: string;
    status: "present" | "late" | "absent" | "excused";
    minutesAttended: number | null;
  } | null;
};

export type CmsLearningData = {
  schemes: CmsCreditScheme[];
  activities: CmsLearningActivity[];
  enrollments: CmsLearningEnrollment[];
  members: Array<{ id: string; name: string; memberNumber: string }>;
};

export type CmsRevenueProduct = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  currency: string;
  billingInterval: string;
  entitlementKey: string | null;
  entitlementLabel: string | null;
  entitlementDurationMonths: number | null;
  isActive: boolean;
};

export type CmsInvoice = {
  id: string;
  memberId: string;
  invoiceNumber: string;
  status: string;
  effectiveStatus: string;
  currency: string;
  issuedAt: string;
  dueAt: string | null;
  total: number;
  paid: number;
  notes: string | null;
  member: { id: string; name: string; memberNumber: string };
  lines: Array<{
    id: string;
    description: string;
    quantity: number;
    lineTotal: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    reference: string | null;
    paidAt: string;
  }>;
};

export type CmsRevenueData = {
  products: CmsRevenueProduct[];
  invoices: CmsInvoice[];
  entitlements: Array<{
    id: string;
    memberId: string;
    label: string;
    status: string;
    startsAt: string;
    endsAt: string | null;
  }>;
  members: Array<{
    id: string;
    name: string;
    memberNumber: string;
    email: string | null;
    phone: string | null;
  }>;
  segments: Array<{
    id: string;
    name: string;
    description: string | null;
    criteria: {
      membershipStatuses?: string[];
      membershipTypes?: string[];
      hasEntitlement?: string;
    };
  }>;
  campaigns: Array<{
    id: string;
    segmentId: string;
    name: string;
    channel: string;
    subject: string | null;
    message: string;
    status: string;
    recipientCount: number;
    createdAt: string;
  }>;
};

export type CmsEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  locationName: string | null;
  address: string | null;
  meetingUrl: string | null;
  registrationUrl: string | null;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  capacity: number | null;
  updatedAt: string;
};

export type CmsUnit = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
};

export type CmsMember = {
  id: string;
  unitId: string | null;
  unitName: string | null;
  memberNumber: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  address: string | null;
  biography: string | null;
  joinedAt: string | null;
  status: "applicant" | "pending" | "active" | "inactive" | "rejected";
  isPublic: boolean;
  customFields: Record<string, unknown>;
  socialLinks: Array<{ platform: string; url: string }>;
  updatedAt: string;
};

export type CmsSubmission = {
  id: string;
  formId: string;
  formName: string;
  payload: Record<string, unknown>;
  status: "new" | "in_progress" | "resolved" | "spam";
  createdAt: string;
  resolvedAt: string | null;
};

export type CmsCredentialField = {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "url" | "select";
  required: boolean;
  options?: string[];
};

export type CmsCredentialScheme = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  subjectType: "person" | "organization";
  category: string;
  issuerName: string | null;
  validityMonths: number | null;
  renewalWindowDays: number;
  minimumVerificationLevel:
    | "self_declared"
    | "document_checked"
    | "issuer_confirmed"
    | "api_verified"
    | "cryptographically_verified";
  fields: CmsCredentialField[];
  isActive: boolean;
};

export type CmsCredentialRequirement = {
  id: string;
  schemeId: string;
  membershipType: string;
  rule: "required" | "one_of" | "optional";
  groupKey: string | null;
  requiredVerificationLevel: CmsCredentialScheme["minimumVerificationLevel"];
  gracePeriodDays: number;
  blocksApproval: boolean;
  sortOrder: number;
  scheme: CmsCredentialScheme;
};

export type CmsMemberCredential = {
  id: string;
  memberId: string;
  schemeId: string;
  credentialNumber: string | null;
  issuerName: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  status:
    | "draft"
    | "submitted"
    | "verified"
    | "rejected"
    | "expired"
    | "revoked";
  effectiveStatus:
    | "draft"
    | "submitted"
    | "verified"
    | "rejected"
    | "expired"
    | "revoked";
  verificationLevel: CmsCredentialScheme["minimumVerificationLevel"];
  sourceUrl: string | null;
  data: Record<string, unknown>;
  updatedAt: string;
  scheme: CmsCredentialScheme;
  member: {
    id: string;
    name: string;
    memberNumber: string;
    status: CmsMember["status"];
  };
  unitName: string | null;
};

export type CmsRegulation = {
  id: string;
  title: string;
  slug: string;
  category:
    | "regulasi_pemerintah"
    | "se_organisasi"
    | "ad_art"
    | "posisi_kebijakan";
  number: string | null;
  issuedDate: string | null;
  fileUrl: string | null;
  summary: string | null;
  status: string;
  downloadCount: number;
  createdAt: string;
};

export type CmsComplaint = {
  id: string;
  ticketNumber: string;
  complainantName: string;
  complainantEmail: string;
  complainantPhone: string | null;
  targetType: "member" | "technician" | "lender" | "company";
  targetIdentifier: string;
  category: "kode_etik" | "layanan_teknisi" | "penagihan" | "sengketa";
  description: string;
  evidenceFileUrl: string | null;
  status: "new" | "under_review" | "mediated" | "resolved" | "dismissed";
  responseNotes: string | null;
  createdAt: string;
};

export type CmsTechnician = {
  id: string;
  name: string;
  ktaNumber: string;
  skillLevel: string;
  province: string;
  city: string;
  phone: string | null;
  workshopName: string | null;
  rating: string | null;
  certifiedBnsp: boolean;
  isAvailable: boolean;
  createdAt: string;
};

export type CmsClub = {
  id: string;
  clubName: string;
  codeTkt: string;
  province: string;
  category: string;
  chairName: string | null;
  activeMembers: number;
  status: string;
  createdAt: string;
};

export type CmsChampionship = {
  id: string;
  seasonYear: number;
  category: string;
  participantName: string;
  teamName: string | null;
  unitName: string | null;
  points: number;
  rank: number;
  achievements: string | null;
  createdAt: string;
};

export type CmsWorkingGroup = {
  id: string;
  name: string;
  slug: string;
  chairName: string | null;
  category: string;
  description: string | null;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
};

export type CmsLender = {
  id: string;
  brandName: string;
  companyName: string;
  licenseNumber: string;
  sectorType: string;
  ojkStatus: string;
  websiteUrl: string | null;
  isAfpiMember: boolean;
  createdAt: string;
};

export type CmsStatistic = {
  id: string;
  metricKey: string;
  metricLabel: string;
  metricValue: string;
  metricUnit: string | null;
  trendDirection: "up" | "down" | "stable" | null;
  trendPercentage: string | null;
  category: string;
  period: string | null;
  sortOrder: number;
  createdAt: string;
};

export type CmsProvince = {
  kode: string;
  nama: string;
  ibukota: string;
  kodepos: string;
  kodeposRange: string;
  createdAt: string;
  updatedAt: string;
};

export type CmsRegency = {
  kode: string;
  provinceKode: string;
  nama: string;
  ibukota: string;
  kodepos: string;
  kodeposRange: string;
  kodeposList: string[];
  createdAt: string;
  updatedAt: string;
};

export const getWilayahProvinces = (search?: string) =>
  api<{ data: CmsProvince[] }>(
    `/v1/admin/wilayah/provinces${search ? `?search=${encodeURIComponent(search)}` : ""}`,
  );

export const getWilayahRegencies = (province?: string, search?: string) => {
  const params = new URLSearchParams();
  if (province) params.set("province", province);
  if (search) params.set("search", search);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return api<{ data: CmsRegency[] }>(`/v1/admin/wilayah/regencies${qs}`);
};

export const saveWilayahProvince = (province: {
  kode: string;
  nama: string;
  ibukota?: string;
  kodepos?: string;
  kodeposRange?: string;
}) =>
  api<{ data: CmsProvince }>("/v1/admin/wilayah/provinces", {
    method: "POST",
    body: JSON.stringify(province),
  });

export const saveWilayahRegency = (regency: {
  kode: string;
  provinceKode: string;
  nama: string;
  ibukota?: string;
  kodepos?: string;
  kodeposRange?: string;
  kodeposList?: string[];
}) =>
  api<{ data: CmsRegency }>("/v1/admin/wilayah/regencies", {
    method: "POST",
    body: JSON.stringify(regency),
  });

export type CmsDistrict = {
  kode: string;
  regencyKode: string;
  provinceKode: string;
  nama: string;
  createdAt: string;
  updatedAt: string;
};

export type CmsVillage = {
  kode: string;
  districtKode: string;
  regencyKode: string;
  provinceKode: string;
  nama: string;
  kodepos: string;
  createdAt: string;
  updatedAt: string;
};

export const getWilayahDistricts = (
  regency?: string,
  province?: string,
  search?: string,
) => {
  const params = new URLSearchParams();
  if (regency) params.set("regency", regency);
  if (province) params.set("province", province);
  if (search) params.set("search", search);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return api<{ data: CmsDistrict[] }>(`/v1/admin/wilayah/districts${qs}`);
};

export const getWilayahVillages = (
  district?: string,
  regency?: string,
  search?: string,
  kodepos?: string,
) => {
  const params = new URLSearchParams();
  if (district) params.set("district", district);
  if (regency) params.set("regency", regency);
  if (search) params.set("search", search);
  if (kodepos) params.set("kodepos", kodepos);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return api<{ data: CmsVillage[] }>(`/v1/admin/wilayah/villages${qs}`);
};

export const saveWilayahDistrict = (district: {
  kode: string;
  regencyKode: string;
  provinceKode: string;
  nama: string;
}) =>
  api<{ data: CmsDistrict }>("/v1/admin/wilayah/districts", {
    method: "POST",
    body: JSON.stringify(district),
  });

export const saveWilayahVillage = (village: {
  kode: string;
  districtKode: string;
  regencyKode: string;
  provinceKode: string;
  nama: string;
  kodepos?: string;
}) =>
  api<{ data: CmsVillage }>("/v1/admin/wilayah/villages", {
    method: "POST",
    body: JSON.stringify(village),
  });
