"use client";

import {
  AlertTriangle,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  ReceiptText,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  UserRound,
  WalletCards,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MemberLogin } from "@/components/member-login";
import { MemberApiError, memberApi } from "@/lib/member-client";
import {
  fetchDistrictsFromApi,
  fetchVillagesFromApi,
  findProvince,
  getProvinces,
  getRegenciesByProvince,
  type WilayahDistrict,
  type WilayahVillage,
} from "@/lib/indonesia-wilayah";
import { MemberPortraitCard } from "./member-portrait-card";

type PortalData = {
  member: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    memberNumber: string;
    avatarUrl: string | null;
    address: string | null;
    biography: string | null;
    joinedAt: string | null;
    status: string;
    companyName?: string | null;
    metadata?: Record<string, unknown> | null;
  };
  application: {
    status: string;
    submittedAt: string;
    reviewedAt: string | null;
    rejectionReason: string | null;
  } | null;
  card: {
    code: string;
    cardNumber?: string;
    verificationCode?: string;
    issuedAt: string;
    expiresAt: string | null;
  } | null;
  emailVerified: boolean;
  organization: {
    name: string;
    logoUrl: string | null;
  };
};

type CredentialScheme = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  issuerName: string | null;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "date" | "number" | "url" | "select";
    required: boolean;
    options?: string[];
  }>;
};

type ComplianceData = {
  membershipType: string;
  requirements: Array<{
    id: string;
    schemeId: string;
    rule: "required" | "one_of" | "optional";
    requiredVerificationLevel: string;
    blocksApproval: boolean;
    satisfied: boolean;
    scheme: CredentialScheme;
  }>;
  credentials: Array<{
    id: string;
    schemeId: string;
    credentialNumber: string | null;
    issuerName: string | null;
    issuedAt: string | null;
    expiresAt: string | null;
    effectiveStatus: string;
    verificationLevel: string;
    scheme: CredentialScheme;
  }>;
};

type LearningData = {
  catalog: Array<{
    id: string;
    title: string;
    code: string;
    description: string | null;
    deliveryMode: string;
    locationName: string | null;
    startsAt: string;
    capacity: number | null;
    creditAmount: number;
    scheme: {
      id: string;
      code: string;
      name: string;
      unitLabel: string;
    } | null;
  }>;
  enrollments: Array<{
    id: string;
    activityId: string;
    status: string;
    activity: {
      id: string;
      title: string;
      startsAt: string;
      creditAmount: number;
    };
    scheme: { code: string; unitLabel: string } | null;
    attendance: { status: string } | null;
  }>;
  balances: Array<{
    amount: number;
    scheme: { id: string; code: string; name: string; unitLabel: string };
  }>;
  ledger: Array<{
    id: string;
    amount: number;
    entryType: string;
    reason: string;
    postedAt: string;
    activityTitle: string | null;
    scheme: { code: string; unitLabel: string };
  }>;
};

type BillingData = {
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    status: string;
    effectiveStatus: string;
    issuedAt: string;
    dueAt: string | null;
    total: number;
    paid: number;
    outstanding: number;
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
  }>;
  entitlements: Array<{
    id: string;
    entitlementKey: string;
    label: string;
    effectiveStatus: string;
    startsAt: string;
    endsAt: string | null;
  }>;
};

function getMemberDisplayName(fullName?: string | null): string {
  if (!fullName) return "Anggota";
  const cleaned = fullName.trim();
  if (!cleaned) return "Anggota";
  const parts = cleaned.split(/\s+/);
  for (const part of parts) {
    const lower = part.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    if (
      !["ir", "dr", "drs", "dra", "h", "hj", "prof", "kh", "st", "se", "sh", "skm", "spd", "mt", "mm", "phd", "msc", "bsc", "bba", "mba", "s", "pt", "cv"].includes(lower) &&
      !part.endsWith(".") &&
      part.length > 1
    ) {
      return part.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    }
  }
  const first = parts[0];
  return (first ? first.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") : "") || "Anggota";
}

export function MemberPortal() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState("");
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [learning, setLearning] = useState<LearningData | null>(null);
  const [billing, setBilling] = useState<BillingData | null>(null);
  const router = useRouter();

  const loadPortal = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      memberApi<{ data: PortalData }>("/v1/member/session"),
      memberApi<{ data: ComplianceData }>("/v1/member/credentials").catch(
        () => ({
          data: {
            membershipType: "regular",
            requirements: [],
            credentials: [],
          },
        }),
      ),
      memberApi<{ data: LearningData }>("/v1/member/learning").catch(() => ({
        data: { catalog: [], enrollments: [], balances: [], ledger: [] },
      })),
      memberApi<{ data: BillingData }>("/v1/member/billing").catch(() => ({
        data: { invoices: [], entitlements: [] },
      })),
    ])
      .then(([session, credentials, learningData, billingData]) => {
        setData(session.data);
        setCompliance(credentials.data);
        setLearning(learningData.data);
        setBilling(billingData.data);
      })
      .catch((reason: unknown) => {
        const errorObj = reason as { status?: number; message?: string } | null;
        const status = errorObj?.status;
        const msg = String(errorObj?.message || reason || "");
        if (
          status === 401 ||
          msg.includes("401") ||
          msg.includes("UNAUTHENTICATED") ||
          msg.includes("sign in") ||
          msg.includes("expired") ||
          reason instanceof MemberApiError
        ) {
          setUnauthorized(true);
        } else {
          setError(msg || "Gagal memuat portal anggota.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPortal();
  }, [loadPortal]);

  const logout = async () => {
    try {
      localStorage.removeItem("openorg_member_logged_in");
      document.cookie =
        "openorg_member_active=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {
      // storage blocked
    }
    try {
      await memberApi("/v1/member/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setData(null);
    setUnauthorized(true);
    router.push("/member/login");
  };

  if (loading)
    return (
      <div className="member-portal-page wrap">
        <div className="portal-loading-card">
          <div className="portal-spinner" />
          <p>Memuat dasbor anggota...</p>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="login-page-suite" style={{ minHeight: "65vh", padding: "1rem 0 3rem" }}>
        <div className="login-ambient-glow" />
        <div className="wrap login-page-inner">
          <MemberLogin organizationName="APTI Indonesia" />
        </div>
      </div>
    );

  const applicationStatus = data.application?.status ?? data.member.status;
  const memberFirstName = getMemberDisplayName(data.member.name);

  return (
    <div className="member-dashboard">
      <div className="member-dashboard-head">
        <div>
          <p className="eyebrow">Portal Anggota</p>
          <h1>Halo, {memberFirstName}</h1>
          <p>Kelola keanggotaan, KTA Digital, dan layanan kompetensi di {data.organization.name}.</p>
        </div>
        <button className="button member-logout" type="button" onClick={logout}>
          <LogOut size={16} /> <span>Keluar</span>
        </button>
      </div>

      {!data.emailVerified && (
        <div className="email-unverified-alert">
          <div className="alert-copy">
            <strong>⚠️ Email Akun Belum Diverifikasi</strong>
            <p>
              Untuk mengamankan akun dan mencegah pembatalan KTA Digital,
              silakan lakukan verifikasi email/WhatsApp Anda.
            </p>
          </div>
          <Link
            className="button secondary verify-btn"
            href="/member/verify-email"
          >
            Verifikasi Sekarang
          </Link>
        </div>
      )}

      <div className="member-status-strip">
        <span className="member-status-icon">
          <BadgeCheck size={22} />
        </span>
        <div className="member-status-details">
          <small>Status Keanggotaan</small>
          <strong>
            {data.member.memberNumber ? `No. KTA: ${data.member.memberNumber}` : "Anggota Terdaftar"}
          </strong>
        </div>
        <span className={`public-status ${applicationStatus}`}>
          ● {applicationStatus === "active" ? "Aktif" : applicationStatus === "pending" ? "Menunggu Verifikasi" : applicationStatus.replace("_", " ")}
        </span>
      </div>
      <div className="member-dashboard-grid">
        <section className="portal-panel profile-panel">
          <div className="portal-panel-head">
            <span>
              <UserRound size={19} />
            </span>
            <div>
              <h2>Profil Anggota</h2>
              <p>Informasi data resmi terdaftar</p>
            </div>
          </div>
          <dl className="portal-details">
            <div>
              <dt>Nomor KTA</dt>
              <dd>{data.member.memberNumber}</dd>
            </div>
            <div>
              <dt>Alamat Email</dt>
              <dd>{data.member.email ?? "—"}</dd>
            </div>
            <div>
              <dt>No. WhatsApp / Telepon</dt>
              <dd>{data.member.phone ?? "—"}</dd>
            </div>
            <div>
              <dt>Alamat Domisili</dt>
              <dd>{data.member.address ?? "—"}</dd>
            </div>
          </dl>
        </section>
        <section className="portal-panel timeline-panel">
          <div className="portal-panel-head">
            <span>
              <CalendarDays size={19} />
            </span>
            <div>
              <h2>Status Pengajuan</h2>
              <p>Progres verifikasi dan penerbitan</p>
            </div>
          </div>
          <ol className="application-timeline">
            <li className="complete">
              <span />
              Pendaftaran Diterima
            </li>
            <li className={data.emailVerified ? "complete" : ""}>
              <span />
              Email Terverifikasi
            </li>
            <li className={applicationStatus === "active" ? "complete" : ""}>
              <span />
              Verifikasi Berkas Organisasi
            </li>
            <li className={data.card ? "complete" : ""}>
              <span />
              KTA Digital Diterbitkan
            </li>
          </ol>
          {data.application?.rejectionReason && (
            <p className="application-feedback">
              <strong>Catatan Peninjauan:</strong> {data.application.rejectionReason}
            </p>
          )}
        </section>
      </div>
      {compliance && (
        <MemberCredentials
          data={compliance}
          emailVerified={data.emailVerified}
          onReload={loadPortal}
        />
      )}
      {learning && (
        <MemberLearning
          data={learning}
          emailVerified={data.emailVerified}
          onReload={loadPortal}
        />
      )}

      {/* 4. Workshop / Store Promotion Benefit Showcase */}
      <MemberWorkshopPromo
        member={data.member}
        emailVerified={data.emailVerified}
        organization={data.organization}
        onReload={loadPortal}
      />

      {billing && <MemberBilling data={billing} />}

      {data.card ? (
        <section className="portal-card-section">
          <div className="portal-section-heading">
            <div>
              <p className="eyebrow">KTA Digital Resmi</p>
              <h2>Kartu Tanda Anggota (KTA) Digital</h2>
              <p>
                Kartu anggota resmi berstandar ID Card. Download kartu (PNG)
                atau scan QR Code untuk verifikasi keaslian.
              </p>
            </div>
          </div>

          {!data.emailVerified ? (
            <div className="kta-locked-security-container">
              <div className="kta-blurred-backdrop">
                <MemberPortraitCard
                  member={{
                    name: data.member.name,
                    memberNumber: data.member.memberNumber || data.card.code,
                    avatarUrl: data.member.avatarUrl,
                    unitName: (data.member as { unitName?: string }).unitName,
                    positionName: "ANGGOTA RESMI",
                    status: data.member.status,
                  }}
                  card={data.card}
                  organization={data.organization}
                />
              </div>

              <div className="kta-security-lock-overlay">
                <div className="lock-icon-circle">
                  <ShieldAlert size={36} color="#ef4444" />
                </div>
                <span className="lock-security-badge">
                  <Lock size={12} />
                  KTA DIKUNCI SEMENTARA
                </span>
                <h3>Verifikasi Email Diperlukan</h3>
                <p>
                  Untuk memastikan keaslian data keanggotaan dan mengaktifkan
                  QR Code verifikasi publik Anda, silakan lakukan verifikasi
                  alamat email terlebih dahulu.
                </p>
                <div className="lock-overlay-actions">
                  <Link
                    href="/member/verify-email"
                    className="button primary"
                  >
                    Verifikasi Email Sekarang
                  </Link>
                  <Link
                    href="/member/verify-email"
                    className="button secondary"
                  >
                    Kirim Ulang Link / OTP
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="membership-card-print-area">
              <MemberPortraitCard
                member={{
                  name: data.member.name,
                  memberNumber: data.member.memberNumber || data.card.code,
                  avatarUrl: data.member.avatarUrl,
                  unitName: (data.member as { unitName?: string }).unitName,
                  positionName: "ANGGOTA RESMI",
                  status: data.member.status,
                }}
                card={data.card}
                organization={data.organization}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="card-awaiting">
          <CreditCard size={25} />
          <div>
            <h2>Kartu KTA Sedang Diproses</h2>
            <p>
              KTA Digital akan otomatis terbit setelah verifikasi email dan
              persetujuan berkas keanggotaan oleh DPP/DPD.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function MemberBilling({ data }: { data: BillingData }) {
  const activeBenefits = data.entitlements.filter(
    (item) => item.effectiveStatus === "active",
  );
  const outstanding = data.invoices.filter(
    (item) => item.outstanding > 0 && item.status !== "void",
  );
  return (
    <section className="portal-billing-section">
      <div className="portal-section-heading">
        <div>
          <p className="eyebrow">Iuran & Manfaat</p>
          <h2>Catatan Iuran & Manfaat Anggota</h2>
          <p>
            Pantau tagihan resmi, status pembayaran iuran tahunan, dan hak benefit keanggotaan aktif Anda.
          </p>
        </div>
      </div>
      <div className="member-benefit-strip">
        <span>
          <WalletCards size={20} />
        </span>
        <div>
          <small>Manfaat & Hak Aktif</small>
          <strong>
            {activeBenefits.length
              ? activeBenefits.map((item) => item.label).join(" · ")
              : "Belum ada paket manfaat aktif"}
          </strong>
        </div>
      </div>
      <div className="member-billing-grid">
        <div className="member-billing-panel">
          <div className="member-learning-head">
            <div className="member-learning-head-copy">
              <ReceiptText size={18} />
              <strong>Daftar Tagihan & Iuran</strong>
            </div>
            <small>{outstanding.length > 0 ? `${outstanding.length} menunggu pembayaran` : "Semua Lunas"}</small>
          </div>
          <div className="member-invoice-list">
            {data.invoices.map((invoice) => (
              <article key={invoice.id}>
                <div>
                  <span className={`billing-status ${invoice.effectiveStatus}`}>
                    {invoice.effectiveStatus === "paid" ? "Lunas" : invoice.effectiveStatus === "pending" ? "Menunggu" : invoice.effectiveStatus}
                  </span>
                  <strong>{invoice.invoiceNumber}</strong>
                  <small>
                    {invoice.lines.map((line) => line.description).join(", ")}
                  </small>
                </div>
                <div>
                  <strong>{formatMemberMoney(invoice.total)}</strong>
                  <small>
                    {invoice.outstanding > 0
                      ? `${formatMemberMoney(invoice.outstanding)} belum dibayar`
                      : "Lunas"}
                  </small>
                </div>
              </article>
            ))}
            {!data.invoices.length && (
              <p className="learning-empty">
                Belum ada tagihan atau iuran yang diterbitkan untuk akun ini.
              </p>
            )}
          </div>
        </div>
        <div className="member-billing-panel">
          <div className="member-learning-head">
            <div className="member-learning-head-copy">
              <BadgeCheck size={18} />
              <strong>Dompet Hak & Akses Manfaat</strong>
            </div>
            <small>Akses aktif dari status anggota</small>
          </div>
          <div className="member-entitlement-list">
            {data.entitlements.map((item) => (
              <article key={item.id}>
                <span>
                  <BadgeCheck size={18} />
                </span>
                <div>
                  <strong>{item.label}</strong>
                  <small>
                    {item.effectiveStatus === "active" ? "Aktif" : item.effectiveStatus} ·{" "}
                    {item.endsAt
                      ? `s/d ${formatDate(item.endsAt)}`
                      : "Berlaku Permanen"}
                  </small>
                </div>
              </article>
            ))}
            {!data.entitlements.length && (
              <p className="learning-empty">
                Daftar manfaat keanggotaan akan otomatis tampil di sini setelah iuran diverifikasi.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatMemberMoney(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function MemberLearning({
  data,
  emailVerified,
  onReload,
}: {
  data: LearningData;
  emailVerified: boolean;
  onReload: () => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const enrolledIds = new Set(data.enrollments.map((item) => item.activityId));
  const available = data.catalog.filter((item) => !enrolledIds.has(item.id));
  const enroll = async (activityId: string) => {
    if (!emailVerified) {
      setError("Wajib verifikasi email terlebih dahulu untuk mendaftar pelatihan.");
      return;
    }
    setPendingId(activityId);
    setError("");
    try {
      await memberApi(`/v1/member/learning/activities/${activityId}/enroll`, {
        method: "POST",
        body: "{}",
      });
      onReload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Pendaftaran pelatihan gagal.");
    } finally {
      setPendingId(null);
    }
  };
  return (
    <section className="portal-learning-section">
      <div className="portal-section-heading">
        <div>
          <p className="eyebrow">Akademi & Kredit SKP</p>
          <h2>Catatan Pelatihan & Kredit SKP</h2>
          <p>
            Daftar kegiatan pelatihan teknis, sertifikasi BNSP, dan pantau
            akumulasi kredit poin SKP/CPD resmi Anda.
          </p>
        </div>
      </div>

      {!emailVerified && (
        <div className="portal-lock-banner">
          <ShieldAlert size={20} className="text-amber-500 flex-shrink-0" />
          <div className="portal-lock-banner-copy">
            <strong>Pendaftaran Pelatihan Terkunci</strong>
            <p>
              Akun Anda belum diverifikasi. Silakan verifikasi email untuk
              membuka akses pendaftaran pelatihan dan akumulasi poin SKP.
            </p>
          </div>
          <Link
            href="/member/verify-email"
            className="button secondary portal-lock-verify-btn"
          >
            Verifikasi Email Sekarang
          </Link>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
      <div className="member-credit-balances">
        {data.balances.map((balance) => (
          <article key={balance.scheme.id}>
            <div className="credit-balance-top">
              <span>
                <Award size={19} />
              </span>
              <div>
                <strong>{balance.amount}</strong>
                <small>{balance.scheme.unitLabel || "SKP"}</small>
              </div>
            </div>
            <p>{balance.scheme.name}</p>
          </article>
        ))}
        {!data.balances.length && (
          <article className="empty-credit-balance">
            <div className="credit-balance-top">
              <span>
                <Award size={19} />
              </span>
              <div>
                <strong>0</strong>
                <small>SKP</small>
              </div>
            </div>
            <p>Poin SKP pelatihan yang selesai akan tampil otomatis di sini.</p>
          </article>
        )}
      </div>
      <div className="member-learning-grid">
        <div className="member-learning-panel">
          <div className="member-learning-head">
            <div className="member-learning-head-copy">
              <BookOpen size={18} />
              <strong>Pelatihan Saya</strong>
            </div>
            <small>{data.enrollments.length} terdaftar</small>
          </div>
          <div className="member-learning-list">
            {data.enrollments.map((item) => (
              <article key={item.id}>
                <span className="learning-calendar">
                  <strong>{new Date(item.activity.startsAt).getDate()}</strong>
                  <small>
                    {new Date(item.activity.startsAt).toLocaleDateString(
                      "id-ID",
                      { month: "short" },
                    )}
                  </small>
                </span>
                <div>
                  <strong>{item.activity.title}</strong>
                  <small>
                    {item.status === "enrolled" ? "Terdaftar" : item.status}
                    {item.attendance ? ` · ${item.attendance.status}` : ""}
                    {item.scheme
                      ? ` · ${item.activity.creditAmount} ${item.scheme.unitLabel}`
                      : ""}
                  </small>
                </div>
              </article>
            ))}
            {!data.enrollments.length && (
              <p className="learning-empty">Belum ada agenda pelatihan yang diikuti.</p>
            )}
          </div>
        </div>
        <div className="member-learning-panel">
          <div className="member-learning-head">
            <div className="member-learning-head-copy">
              <Plus size={18} />
              <strong>Katalog Agenda Buka</strong>
            </div>
            <small>{available.length} tersedia</small>
          </div>
          <div className="member-learning-list catalog-list">
            {available.slice(0, 4).map((activity) => (
              <article key={activity.id}>
                <span className="learning-calendar">
                  <strong>{new Date(activity.startsAt).getDate()}</strong>
                  <small>
                    {new Date(activity.startsAt).toLocaleDateString("id-ID", {
                      month: "short",
                    })}
                  </small>
                </span>
                <div>
                  <strong>{activity.title}</strong>
                  <small>
                    {activity.deliveryMode.replace("_", " ")}
                    {activity.scheme
                      ? ` · ${activity.creditAmount} ${activity.scheme.unitLabel}`
                      : ""}
                  </small>
                </div>
                <button
                  type="button"
                  className={`button ${!emailVerified ? "btn-gated-locked" : ""}`}
                  disabled={pendingId === activity.id || !emailVerified}
                  onClick={() => emailVerified && enroll(activity.id)}
                  title={!emailVerified ? "Verifikasi email untuk mendaftar" : undefined}
                >
                  {!emailVerified ? (
                    <span className="btn-locked-chip">
                      <Lock size={12} />
                      <span>Terkunci</span>
                    </span>
                  ) : pendingId === activity.id ? (
                    "Mendaftar…"
                  ) : (
                    "Daftar"
                  )}
                </button>
              </article>
            ))}
            {!available.length && (
              <p className="learning-empty">
                Belum ada agenda pelatihan baru yang dibuka.
              </p>
            )}
          </div>
        </div>
      </div>
      {data.ledger.length > 0 && (
        <div className="member-ledger">
          <div className="member-learning-head">
            <div className="member-learning-head-copy">
              <Award size={18} />
              <strong>Buku Besar Riwayat Poin SKP</strong>
            </div>
          </div>
          {data.ledger.slice(0, 6).map((entry) => (
            <div key={entry.id}>
              <span>
                <strong>{entry.activityTitle ?? entry.reason}</strong>
                <small>
                  {formatDate(entry.postedAt)} · {entry.entryType}
                </small>
              </span>
              <strong className={entry.amount >= 0 ? "positive" : "negative"}>
                {entry.amount >= 0 ? "+" : ""}
                {entry.amount} {entry.scheme.unitLabel}
              </strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const WORKSHOP_CATEGORIES = [
  "Bengkel Servis AC Residensial & Rumah Tangga",
  "Bengkel Spesialis AC Komersial (VRV/VRF/Chiller)",
  "Toko Sparepart & Freon Ramah Lingkungan",
  "Rental Alat Ukur & Manifold Digital",
  "Penyedia Modul PCB & Elektronik Pendingin",
  "Kontraktor Tata Udara & Cold Storage Industri",
  "Layanan Uji Kebocoran & Retrofit Hydrocarbon R290",
  "Konsultan Efisiensi Energi HVAC",
];

const POPULAR_WORKSHOP_SERVICES = [
  "Cuci AC Inverter Bebas Bau",
  "Vakum Standar SKKNI (Dua Tahap)",
  "Recovery Freon R32 / R410A / R290",
  "Uji Tekanan Nitrogen K3",
  "Bongkar Pasang AC Split",
  "Perbaikan Modul PCB Inverter",
  "Instalasi AC Cassette / Standing / Ducting",
  "Servis Chiller & VRV/VRF Komersial",
  "Retrofit Hydrocarbon R290 Ramah Lingkungan",
  "Perawatan Cold Storage & Freezer Room",
  "Pembersihan Saluran Ducting HVAC",
  "Uji Kebocoran Freon Elektronik",
  "Penggantian Kompresor Inverter & Scroll",
  "Kalibrasi Sensor & Thermostat Digital",
  "Penyedia Sparepart & Freon Asli",
];

interface SearchableMultiSelectProps {
  label: string;
  placeholder?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowCustom?: boolean;
}

function SearchableMultiSelect({
  label,
  placeholder = "Ketik untuk mencari atau menambah layanan...",
  options,
  selected,
  onChange,
  allowCustom = true,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, search]);

  const hasExactMatch = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (
      options.some((opt) => opt.toLowerCase() === q) ||
      selected.some((s) => s.toLowerCase() === q)
    );
  }, [options, selected, search]);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((item) => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const removeOption = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== opt));
  };

  const handleAddCustom = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        const target = filteredOptions[0];
        if (target) {
          toggleOption(target);
          setSearch("");
        }
      } else if (allowCustom && search.trim()) {
        handleAddCustom();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="searchable-multi-select-wrap" ref={containerRef}>
      <span className="searchable-multi-select-label">{label}</span>
      <div
        className={`searchable-multi-select-box ${isOpen ? "focused" : ""}`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="searchable-multi-select-tags">
          {selected.map((item) => (
            <span key={item} className="searchable-tag-chip">
              <Wrench size={11} className="tag-icon" />
              <span className="tag-text">{item}</span>
              <button
                type="button"
                className="tag-remove-btn"
                onClick={(e) => removeOption(item, e)}
                title={`Hapus ${item}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <div className="search-inline-box">
            <Search size={13} className="search-inline-icon" />
            <input
              ref={inputRef}
              type="text"
              className="search-inline-input"
              placeholder={
                selected.length === 0
                  ? placeholder
                  : "Cari atau tambah layanan lainnya…"
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <div className="searchable-multi-select-controls">
          {selected.length > 0 && (
            <button
              type="button"
              className="clear-all-tags-btn"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              title="Bersihkan semua pilihan"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`chevron-icon ${isOpen ? "rotated" : ""}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="searchable-multi-select-dropdown">
          <div className="dropdown-toolbar">
            <small>
              {selected.length} dari {options.length} layanan unggulan dipilih
            </small>
            <div className="dropdown-quick-links">
              <button
                type="button"
                className="quick-link"
                onClick={(e) => {
                  e.preventDefault();
                  onChange(Array.from(new Set([...options, ...selected])));
                }}
              >
                Pilih Semua
              </button>
              {selected.length > 0 && (
                <button
                  type="button"
                  className="quick-link reset-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onChange([]);
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="dropdown-items-scroll">
            {filteredOptions.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <div
                  key={opt}
                  className={`dropdown-item-row ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleOption(opt)}
                >
                  <div className={`option-check-square ${isSelected ? "checked" : ""}`}>
                    {isSelected && <Check size={12} />}
                  </div>
                  <span className="option-text">{opt}</span>
                </div>
              );
            })}

            {allowCustom && search.trim() && !hasExactMatch && (
              <div
                className="dropdown-item-row add-new-custom"
                onClick={handleAddCustom}
              >
                <Plus size={14} className="add-icon" />
                <span>
                  Tambahkan <strong>&quot;{search.trim()}&quot;</strong> sebagai keahlian khusus
                </span>
              </div>
            )}

            {filteredOptions.length === 0 && (!allowCustom || !search.trim()) && (
              <div className="dropdown-empty-row">
                Tidak ada layanan yang cocok dengan kata kunci.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchableSingleSelectProps {
  label: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; sublabel?: string | undefined }>;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

function SearchableSingleSelect({
  label,
  placeholder = "Pilih atau cari…",
  options,
  value,
  onChange,
  required = false,
  disabled = false,
}: SearchableSingleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value || opt.label === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, search]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="searchable-single-select-wrap" ref={containerRef}>
      <span className="searchable-single-select-label">
        {label} {required && "*"}
      </span>
      <div
        className={`searchable-single-select-box ${isOpen ? "focused" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => {
          if (disabled) return;
          const nextState = !isOpen;
          setIsOpen(nextState);
          if (nextState) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
      >
        <span
          className={`selected-value-text ${!selectedOption ? "placeholder" : ""}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`chevron-icon ${isOpen ? "rotated" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="searchable-single-select-dropdown">
          <div className="single-select-search-bar">
            <Search size={14} className="search-inline-icon" />
            <input
              ref={inputRef}
              type="text"
              className="single-select-search-input"
              placeholder={`Cari dari ${options.length} data…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <button
                type="button"
                className="single-select-clear-search"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch("");
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="single-select-options-list">
            {filteredOptions.map((opt) => {
              const isSelected = opt.value === value || opt.label === value;
              return (
                <div
                  key={opt.value}
                  className={`single-select-option-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <div className="option-label-group">
                    <span className="option-main-label">{opt.label}</span>
                    {opt.sublabel && (
                      <small className="option-sublabel">{opt.sublabel}</small>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-sky-600 flex-shrink-0" />
                  )}
                </div>
              );
            })}
            {filteredOptions.length === 0 && (
              <div className="single-select-empty">
                Tidak ada data wilayah yang cocok.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface DaySchedule {
  day: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu";
  shortDay: "Sen" | "Sel" | "Rab" | "Kam" | "Jum" | "Sab" | "Min";
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  is24Hours: boolean;
}

const DEFAULT_DAILY_SCHEDULE: DaySchedule[] = [
  { day: "Senin", shortDay: "Sen", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
  { day: "Selasa", shortDay: "Sel", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
  { day: "Rabu", shortDay: "Rab", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
  { day: "Kamis", shortDay: "Kam", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
  { day: "Jumat", shortDay: "Jum", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
  { day: "Sabtu", shortDay: "Sab", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
  { day: "Minggu", shortDay: "Min", isOpen: false, openTime: "08:00", closeTime: "18:00", is24Hours: false },
];

export function formatScheduleSummary(
  schedule: DaySchedule[],
  emergency24h: boolean,
): string {
  const openDays = schedule.filter((d) => d.isOpen);
  if (openDays.length === 0) {
    return emergency24h
      ? "Tutup Rutin (🚨 Siap Panggilan 24 Jam)"
      : "Tutup Sementara";
  }

  let baseSummary = "";
  if (openDays.length === 7 && openDays.every((d) => d.is24Hours)) {
    baseSummary = "Buka 24 Jam Setiap Hari";
  } else {
    const monSat = schedule.slice(0, 6);
    const sun = schedule[6];
    const firstMon = schedule[0]!;
    const monSatSame =
      monSat.every(
        (d) =>
          d.isOpen &&
          d.openTime === firstMon.openTime &&
          d.closeTime === firstMon.closeTime &&
          d.is24Hours === firstMon.is24Hours,
      ) && !sun?.isOpen;

    const monFri = schedule.slice(0, 5);
    const monFriSame =
      monFri.every(
        (d) =>
          d.isOpen &&
          d.openTime === firstMon.openTime &&
          d.closeTime === firstMon.closeTime &&
          d.is24Hours === firstMon.is24Hours,
      ) &&
      !schedule[5]?.isOpen &&
      !sun?.isOpen;

    const all7Same =
      openDays.length === 7 &&
      schedule.every(
        (d) =>
          d.openTime === firstMon.openTime &&
          d.closeTime === firstMon.closeTime &&
          d.is24Hours === firstMon.is24Hours,
      );

    if (all7Same) {
      const timeStr = firstMon.is24Hours
        ? "24 Jam"
        : `${firstMon.openTime} - ${firstMon.closeTime}`;
      baseSummary = `Setiap Hari: ${timeStr}`;
    } else if (monSatSame) {
      const timeStr = firstMon.is24Hours
        ? "24 Jam"
        : `${firstMon.openTime} - ${firstMon.closeTime}`;
      baseSummary = `Senin - Sabtu: ${timeStr} (Minggu Libur)`;
    } else if (monFriSame) {
      const timeStr = firstMon.is24Hours
        ? "24 Jam"
        : `${firstMon.openTime} - ${firstMon.closeTime}`;
      baseSummary = `Senin - Jumat: ${timeStr} | Sab - Min: Libur`;
    } else {
      const chunks: string[] = [];
      for (const d of schedule) {
        if (!d.isOpen) {
          chunks.push(`${d.shortDay}: Libur`);
        } else if (d.is24Hours) {
          chunks.push(`${d.shortDay}: 24 Jam`);
        } else {
          chunks.push(`${d.shortDay}: ${d.openTime}-${d.closeTime}`);
        }
      }
      baseSummary = chunks.join(" | ");
    }
  }

  if (emergency24h) {
    baseSummary += " · 🚨 Siap Panggilan 24 Jam";
  }

  return baseSummary;
}

interface DailyScheduleBuilderProps {
  schedule: DaySchedule[];
  emergency24h: boolean;
  onScheduleChange: (newSchedule: DaySchedule[]) => void;
  onEmergencyChange: (newEmergency: boolean) => void;
}

function DailyScheduleBuilder({
  schedule,
  emergency24h,
  onScheduleChange,
  onEmergencyChange,
}: DailyScheduleBuilderProps) {
  const summaryText = useMemo(
    () => formatScheduleSummary(schedule, emergency24h),
    [schedule, emergency24h],
  );

  const applyPreset = (type: "workshop" | "office" | "everyday" | "24h") => {
    let updated: DaySchedule[] = [];
    if (type === "workshop") {
      updated = [
        { day: "Senin", shortDay: "Sen", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
        { day: "Selasa", shortDay: "Sel", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
        { day: "Rabu", shortDay: "Rab", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
        { day: "Kamis", shortDay: "Kam", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
        { day: "Jumat", shortDay: "Jum", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
        { day: "Sabtu", shortDay: "Sab", isOpen: true, openTime: "08:00", closeTime: "18:00", is24Hours: false },
        { day: "Minggu", shortDay: "Min", isOpen: false, openTime: "08:00", closeTime: "18:00", is24Hours: false },
      ];
    } else if (type === "office") {
      updated = [
        { day: "Senin", shortDay: "Sen", isOpen: true, openTime: "08:00", closeTime: "17:00", is24Hours: false },
        { day: "Selasa", shortDay: "Sel", isOpen: true, openTime: "08:00", closeTime: "17:00", is24Hours: false },
        { day: "Rabu", shortDay: "Rab", isOpen: true, openTime: "08:00", closeTime: "17:00", is24Hours: false },
        { day: "Kamis", shortDay: "Kam", isOpen: true, openTime: "08:00", closeTime: "17:00", is24Hours: false },
        { day: "Jumat", shortDay: "Jum", isOpen: true, openTime: "08:00", closeTime: "17:00", is24Hours: false },
        { day: "Sabtu", shortDay: "Sab", isOpen: false, openTime: "08:00", closeTime: "15:00", is24Hours: false },
        { day: "Minggu", shortDay: "Min", isOpen: false, openTime: "08:00", closeTime: "15:00", is24Hours: false },
      ];
    } else if (type === "everyday") {
      updated = schedule.map((d) => ({
        ...d,
        isOpen: true,
        openTime: "08:00",
        closeTime: "20:00",
        is24Hours: false,
      }));
    } else if (type === "24h") {
      updated = schedule.map((d) => ({
        ...d,
        isOpen: true,
        is24Hours: true,
      }));
      onEmergencyChange(true);
    }
    onScheduleChange(updated);
  };

  const updateDay = (idx: number, patch: Partial<DaySchedule>) => {
    const next = [...schedule];
    const item = next[idx];
    if (item) {
      next[idx] = { ...item, ...patch };
      onScheduleChange(next);
    }
  };

  const copyMondayToWeekdays = () => {
    const monday = schedule[0];
    if (!monday) return;
    const next = schedule.map((d, i) => {
      if (i >= 1 && i <= 4) {
        return {
          ...d,
          isOpen: monday.isOpen,
          openTime: monday.openTime,
          closeTime: monday.closeTime,
          is24Hours: monday.is24Hours,
        };
      }
      return d;
    });
    onScheduleChange(next);
  };

  return (
    <div className="daily-schedule-container">
      <div className="daily-schedule-header">
        <div className="daily-schedule-title-row">
          <strong>
            <Clock size={16} color="#0284c7" />
            <span>Jam Operasional & Jadwal Kustom Harian</span>
          </strong>
          <span className="schedule-live-summary-badge">{summaryText}</span>
        </div>

        {/* Quick Presets Bar */}
        <div className="schedule-presets-bar">
          <span className="schedule-preset-label">Template Cepat:</span>
          <button
            type="button"
            className="schedule-preset-btn"
            onClick={() => applyPreset("workshop")}
          >
            🛠️ Sen - Sab (08:00 - 18:00)
          </button>
          <button
            type="button"
            className="schedule-preset-btn"
            onClick={() => applyPreset("office")}
          >
            🏢 Sen - Jum (08:00 - 17:00)
          </button>
          <button
            type="button"
            className="schedule-preset-btn"
            onClick={() => applyPreset("everyday")}
          >
            🌟 Setiap Hari (08:00 - 20:00)
          </button>
          <button
            type="button"
            className="schedule-preset-btn"
            onClick={() => applyPreset("24h")}
          >
            🕒 24 Jam Nonstop
          </button>
        </div>
      </div>

      {/* Emergency 24H Callout Readiness Card */}
      <div className="emergency-callout-box">
        <div className="emergency-callout-info">
          <AlertTriangle size={18} color="#b45309" className="flex-shrink-0 mt-0.5" />
          <div>
            <strong>Kesiapan Layanan Darurat 24 Jam (Emergency Callout)</strong>
            <small>
              Aktifkan jika workshop Anda menerima panggilan darurat malam/hari libur (bocor freon, chiller mati, dsb).
            </small>
          </div>
        </div>
        <button
          type="button"
          className={`emergency-toggle-btn ${emergency24h ? "active" : "inactive"}`}
          onClick={() => onEmergencyChange(!emergency24h)}
        >
          <span>{emergency24h ? "🚨 Siap 24 Jam Aktif" : "Nonaktif"}</span>
        </button>
      </div>

      {/* 7-Day Interactive Row Grid */}
      <div className="daily-schedule-list">
        {schedule.map((dayItem, idx) => (
          <div
            key={dayItem.day}
            className={`day-schedule-row ${!dayItem.isOpen ? "closed" : ""}`}
          >
            <div className="day-name-badge">
              <strong>{dayItem.day}</strong>
              <button
                type="button"
                className={`day-status-pill ${dayItem.isOpen ? "open" : "closed"}`}
                onClick={() => updateDay(idx, { isOpen: !dayItem.isOpen })}
              >
                {dayItem.isOpen ? "Buka" : "Libur"}
              </button>
            </div>

            <div className="day-controls-group">
              {dayItem.isOpen ? (
                <>
                  {!dayItem.is24Hours ? (
                    <div className="time-range-group">
                      <input
                        type="time"
                        value={dayItem.openTime}
                        onChange={(e) =>
                          updateDay(idx, { openTime: e.target.value })
                        }
                      />
                      <span className="time-separator">s/d</span>
                      <input
                        type="time"
                        value={dayItem.closeTime}
                        onChange={(e) =>
                          updateDay(idx, { closeTime: e.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <span
                      className="schedule-live-summary-badge"
                      style={{
                        background: "#f0fdf4",
                        borderColor: "#bbf7d0",
                        color: "#166534",
                      }}
                    >
                      Buka 24 Jam Penuh
                    </span>
                  )}

                  <button
                    type="button"
                    className={`twentyfour-toggle-btn ${dayItem.is24Hours ? "active" : ""}`}
                    onClick={() =>
                      updateDay(idx, { is24Hours: !dayItem.is24Hours })
                    }
                  >
                    24 Jam
                  </button>

                  {idx === 0 && (
                    <button
                      type="button"
                      className="btn-copy-mon-fri"
                      onClick={copyMondayToWeekdays}
                      title="Salin jam Senin ke Selasa - Jumat"
                    >
                      (Salin ke Sen-Jum)
                    </button>
                  )}
                </>
              ) : (
                <span className="day-closed-msg">Tutup / Libur Operasional</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberWorkshopPromo({
  member,
  emailVerified,
  organization,
  onReload,
}: {
  member: PortalData["member"];
  emailVerified: boolean;
  organization: PortalData["organization"];
  onReload: () => void;
}) {
  const existingMeta = (member.metadata?.workshopAd as Record<string, any>) || {};

  const [workshopName, setWorkshopName] = useState(
    existingMeta.workshopName || member.companyName || `Bengkel Pendingin ${getMemberDisplayName(member.name)}`,
  );
  const [tagline, setTagline] = useState(
    existingMeta.tagline || "Solusi Tata Udara Profesional, Berlisensi & Bergaransi",
  );
  const [category, setCategory] = useState(
    existingMeta.category || WORKSHOP_CATEGORIES[0],
  );
  const [province, setProvince] = useState(existingMeta.province || "DKI Jakarta");
  const [city, setCity] = useState(existingMeta.city || "Kota Administrasi Jakarta Selatan");
  const [district, setDistrict] = useState(existingMeta.district || "");
  const [village, setVillage] = useState(existingMeta.village || "");
  const [districtList, setDistrictList] = useState<WilayahDistrict[]>([]);
  const [villageList, setVillageList] = useState<WilayahVillage[]>([]);
  const [postalCode, setPostalCode] = useState(
    existingMeta.postalCode || "12110",
  );
  const [address, setAddress] = useState(
    existingMeta.address || member.address || "Jl. Raya Workshop Pendingin No. 18",
  );
  const [phone, setPhone] = useState(existingMeta.phone || member.phone || "0812-3456-7890");
  const [whatsapp, setWhatsapp] = useState(
    existingMeta.whatsapp || member.phone || "0812-3456-7890",
  );
  const [dailySchedule, setDailySchedule] = useState<DaySchedule[]>(
    existingMeta.dailySchedule || DEFAULT_DAILY_SCHEDULE,
  );
  const [emergency24h, setEmergency24h] = useState<boolean>(
    existingMeta.emergency24h ?? true,
  );
  const [description, setDescription] = useState(
    existingMeta.description ||
      "Bengkel pendingin resmi bersertifikat APTI Indonesia. Melayani servis berkala, pengadaan sparepart asli, dan perbaikan AC inverter bergaransi.",
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    existingMeta.services || [
      "Cuci AC Inverter Bebas Bau",
      "Vakum Standar SKKNI (Dua Tahap)",
      "Recovery Freon R32 / R410A / R290",
      "Perbaikan Modul PCB Inverter",
    ],
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    existingMeta.isPublished ?? true,
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  const categoryOptions = useMemo(() => {
    return WORKSHOP_CATEGORIES.map((cat) => ({
      value: cat,
      label: cat,
    }));
  }, []);

  const provinceOptions = useMemo(() => {
    return getProvinces().map((p) => ({
      value: p.nama,
      label: p.nama,
      sublabel: `Ibukota: ${p.ibukota} · Kode Pos: ${p.kodeposRange}`,
    }));
  }, []);

  const regencyOptions = useMemo(() => {
    return getRegenciesByProvince(province).map((r) => ({
      value: r.nama,
      label: r.nama,
      sublabel: `Ibukota: ${r.ibukota} · Kode Pos: ${r.kodeposRange || r.kodepos}`,
    }));
  }, [province]);

  useEffect(() => {
    const regs = getRegenciesByProvince(province);
    const foundReg = regs.find((r) => r.nama === city);
    if (foundReg?.kode) {
      fetchDistrictsFromApi(foundReg.kode).then((dists) => {
        setDistrictList(dists);
      });
    } else {
      setDistrictList([]);
    }
  }, [province, city]);

  useEffect(() => {
    const foundDist = districtList.find(
      (d) =>
        d.nama === district ||
        `Kec. ${d.nama}` === district ||
        d.kode === district ||
        d.nama.toLowerCase() === district.toLowerCase(),
    );
    if (foundDist?.kode) {
      fetchVillagesFromApi(foundDist.kode).then((vils) => {
        setVillageList(vils);
      });
    } else {
      setVillageList([]);
    }
  }, [district, districtList]);

  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const availableRegs = getRegenciesByProvince(newProv);
    const firstReg = availableRegs[0];
    if (!availableRegs.some((r) => r.nama === city)) {
      const selectedReg = firstReg?.nama || "";
      setCity(selectedReg);
      setDistrict("");
      setVillage("");
      if (firstReg?.kodepos) {
        setPostalCode(firstReg.kodepos);
      }
    }
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setDistrict("");
    setVillage("");
    const regs = getRegenciesByProvince(province);
    const foundReg = regs.find((r) => r.nama === newCity);
    if (foundReg?.kodepos) {
      setPostalCode(foundReg.kodepos);
    }
  };

  const operatingHoursSummary = useMemo(() => {
    return formatScheduleSummary(dailySchedule, emergency24h);
  }, [dailySchedule, emergency24h]);

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    setVillage("");
  };

  const handleVillageChange = (newVil: string) => {
    setVillage(newVil);
    const foundVil = villageList.find((v) => v.nama === newVil);
    if (foundVil?.kodepos) {
      setPostalCode(foundVil.kodepos);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailVerified) {
      setError("Wajib verifikasi email terlebih dahulu untuk menayangkan iklan bengkel.");
      return;
    }
    setSaving(true);
    setError("");
    setSavedSuccess(false);

    const workshopData = {
      workshopName: workshopName.trim(),
      tagline: tagline.trim(),
      category,
      city: city.trim(),
      province: province.trim(),
      district: district.trim(),
      village: village.trim(),
      postalCode: postalCode.trim(),
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      operatingHours: operatingHoursSummary,
      dailySchedule,
      emergency24h,
      description: description.trim(),
      services: selectedServices,
      isPublished,
      memberNumber: member.memberNumber,
      ownerName: member.name,
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Save to member profile API
      await memberApi("/v1/member/profile", {
        method: "PATCH",
        body: JSON.stringify({
          companyName: workshopName.trim(),
          metadata: {
            ...((member.metadata as Record<string, unknown>) || {}),
            workshopAd: workshopData,
          },
        }),
      });

      // 2. Also save to local storage for instant public showcase access
      try {
        const storedAds = JSON.parse(
          localStorage.getItem("openorg_member_workshops_list") || "[]",
        );
        const filteredAds = storedAds.filter(
          (ad: any) => ad.memberNumber !== member.memberNumber,
        );
        if (isPublished) {
          filteredAds.unshift(workshopData);
        }
        localStorage.setItem(
          "openorg_member_workshops_list",
          JSON.stringify(filteredAds),
        );
      } catch {
        // local storage fallback
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      onReload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan iklan bengkel.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="portal-panel portal-workshop-promo-section">
      <div className="portal-section-heading">
        <div>
          <div className="benefit-badge-pill">
            <Sparkles size={14} color="#0284c7" />
            <span>BENEFIT EKSKLUSIF ANGGOTA RESMI</span>
          </div>
          <h2>Promosi & Iklan Bengkel / Toko Saya</h2>
          <p>
            Pasang profil usaha bengkel pendingin, toko suku cadang, atau jasa
            HVAC Anda di direktori resmi {organization.name} untuk menjangkau
            pelanggan dan mitra bisnis secara gratis.
          </p>
        </div>
      </div>

      {!emailVerified && (
        <div className="portal-lock-banner">
          <ShieldAlert size={20} className="text-amber-500" />
          <div className="portal-lock-banner-copy">
            <strong>Penayangan Iklan Terkunci</strong>
            <p>
              Iklan bengkel/toko hanya dapat ditayangkan ke publik setelah alamat
              email akun Anda terverifikasi untuk menjamin validitas bisnis.
            </p>
          </div>
          <Link
            href="/member/verify-email"
            className="button secondary portal-lock-verify-btn"
          >
            Verifikasi Email Sekarang
          </Link>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
      {savedSuccess && (
        <div className="portal-success-alert">
          <CheckCircle2 size={18} color="#10b981" />
          <span>
            Profil iklan bengkel/toko Anda berhasil disimpan & aktif tayang di
            direktori publik!
          </span>
        </div>
      )}

      <div className="workshop-promo-layout-grid">
        {/* Left Column: Workshop Ad Editor Form */}
        <form className="workshop-promo-form" onSubmit={handleSave}>
          <div className="form-row-2">
            <label>
              Nama Bengkel / Toko / Usaha *
              <input
                type="text"
                required
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                placeholder="Contoh: Sentosa Jaya Teknik AC"
              />
            </label>
            <SearchableSingleSelect
              label="Kategori Usaha"
              required
              placeholder="Pilih kategori usaha…"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
            />
          </div>

          <label>
            Slogan / Tagline Usaha
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Contoh: Ahli AC Inverter, Cepat, Jujur & Bergaransi"
            />
          </label>

          <div className="form-row-2">
            <SearchableSingleSelect
              label="Provinsi"
              required
              placeholder="Pilih atau cari provinsi (38 Provinsi)…"
              options={provinceOptions}
              value={province}
              onChange={handleProvinceChange}
            />
            <SearchableSingleSelect
              label="Kota / Kabupaten"
              required
              placeholder={`Pilih Kota/Kabupaten (${regencyOptions.length} wilayah)…`}
              options={regencyOptions}
              value={city}
              onChange={handleCityChange}
              disabled={regencyOptions.length === 0}
            />
          </div>

          <div className="form-row-2">
            <SearchableSingleSelect
              label="Kecamatan"
              placeholder={
                districtList.length > 0
                  ? `Pilih Kecamatan (${districtList.length} kecamatan)…`
                  : "Pilih Kota/Kabupaten terlebih dahulu"
              }
              options={districtList.map((d) => ({
                value: d.nama,
                label: `Kec. ${d.nama}`,
                sublabel: `Kode: ${d.kode}`,
              }))}
              value={district}
              onChange={handleDistrictChange}
              disabled={districtList.length === 0}
            />
            <SearchableSingleSelect
              label="Kelurahan / Desa"
              placeholder={
                villageList.length > 0
                  ? `Pilih Kelurahan/Desa (${villageList.length} kelurahan)…`
                  : "Pilih Kecamatan terlebih dahulu"
              }
              options={villageList.map((v) => ({
                value: v.nama,
                label: v.nama,
                sublabel: v.kodepos ? `Kode Pos: ${v.kodepos}` : undefined,
              }))}
              value={village}
              onChange={handleVillageChange}
              disabled={villageList.length === 0}
            />
          </div>

          <div className="form-row-2">
            <label>
              Alamat Lengkap Workshop / Toko *
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Raya Utama No. 123"
              />
            </label>
            <label>
              Kode Pos Wilayah *
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Contoh: 12110"
              />
            </label>
          </div>

          <div className="form-row-1" style={{ marginBottom: "10px" }}>
            <label>
              Nomor WhatsApp Pemesanan *
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="0812-xxxx-xxxx"
              />
            </label>
          </div>

          <DailyScheduleBuilder
            schedule={dailySchedule}
            emergency24h={emergency24h}
            onScheduleChange={setDailySchedule}
            onEmergencyChange={setEmergency24h}
          />

          <SearchableMultiSelect
            label="Layanan & Keahlian Unggulan (Pencarian & Multi-Select)"
            placeholder="Cari atau ketik layanan baru..."
            options={POPULAR_WORKSHOP_SERVICES}
            selected={selectedServices}
            onChange={setSelectedServices}
            allowCustom={true}
          />

          <label>
            Deskripsi Profil Usaha
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan keunggulan workshop, pengalaman teknisi, jaminan garansi, dsb."
            />
          </label>

          <div className="publish-toggle-box">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                disabled={!emailVerified}
              />
              <span className="toggle-slider" />
              <div>
                <strong>Tayangkan di Direktori Publik</strong>
                <small>
                  Profil bengkel akan otomatis muncul di direktori website dan
                  halaman mitra teknisi.
                </small>
              </div>
            </label>
          </div>

          <div className="form-actions-row">
            <button
              type="submit"
              className="button primary save-promo-btn"
              disabled={saving || !emailVerified}
            >
              <Save size={16} />
              <span>{saving ? "Menyimpan…" : "Simpan & Publikasikan Iklan"}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Real-time Public Card Preview */}
        <div className="workshop-ad-preview-side">
          <div className="preview-header-label">
            <Eye size={14} color="#0284c7" />
            <span>PRATINJAU TAMPILAN IKLAN DI WEBSITE</span>
          </div>

          <div className="public-workshop-card-mockup">
            <div className="workshop-card-top">
              <div className="workshop-brand-badge">
                <Store size={18} color="#0284c7" />
                <span className="workshop-cat-label">{category}</span>
              </div>
              {emergency24h && (
                <span className="emergency-preview-chip">
                  🚨 Siap Panggilan 24 Jam
                </span>
              )}
              <span
                className={`published-indicator ${isPublished && emailVerified ? "live" : "draft"}`}
              >
                ● {isPublished && emailVerified ? "Iklan Tayang" : "Draf / Terkunci"}
              </span>
            </div>

            <h3 className="workshop-card-title">{workshopName || "Nama Bengkel Anda"}</h3>
            <p className="workshop-card-tagline">{tagline}</p>

            <div className="workshop-card-meta">
              <div className="meta-item">
                <MapPin size={14} color="#64748b" />
                <span>{[village, district, city, province].filter(Boolean).join(", ")}</span>
              </div>
              <div className="meta-item">
                <Phone size={14} color="#64748b" />
                <span>{whatsapp}</span>
              </div>
              <div className="meta-item">
                <Clock size={14} color="#64748b" />
                <span>{operatingHoursSummary}</span>
              </div>
            </div>

            <p className="workshop-card-desc">{description}</p>

            <div className="workshop-card-services">
              {selectedServices.slice(0, 4).map((srv) => (
                <span key={srv} className="mini-service-chip">
                  <Wrench size={11} color="#0284c7" />
                  {srv}
                </span>
              ))}
              {selectedServices.length > 4 && (
                <span className="mini-service-chip count-chip">
                  +{selectedServices.length - 4} lainnya
                </span>
              )}
            </div>

            <div className="workshop-card-footer">
              <div className="owner-verified-pill">
                <ShieldCheck size={14} color="#10b981" />
                <span>Mitra Terdaftar APTI · KTA: {member.memberNumber || "Valid"}</span>
              </div>
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="btn-contact-mock"
              >
                <MessageSquare size={14} />
                <span>Chat WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="preview-hint-box">
            <p>
              💡 <strong>Keuntungan Anggota:</strong> Iklan bengkel Anda akan
              mendapat lencana resmi <em>&quot;Mitra Terverifikasi APTI&quot;</em> yang
              meningkatkan kepercayaan calon pelanggan dan kontraktor proyek.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MemberCredentials({
  data,
  emailVerified,
  onReload,
}: {
  data: ComplianceData;
  emailVerified: boolean;
  onReload: () => void;
}) {
  const [selectedScheme, setSelectedScheme] = useState<CredentialScheme | null>(
    null,
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailVerified) {
      setError("Wajib verifikasi email terlebih dahulu untuk mengajukan kredensial.");
      return;
    }
    if (!selectedScheme) return;
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    const dynamicData = Object.fromEntries(
      selectedScheme.fields.map((field) => [
        field.key,
        field.type === "number" && value(`field:${field.key}`)
          ? Number(value(`field:${field.key}`))
          : value(`field:${field.key}`),
      ]),
    );
    try {
      await memberApi("/v1/member/credentials", {
        method: "POST",
        body: JSON.stringify({
          schemeId: selectedScheme.id,
          credentialNumber: value("credentialNumber") || null,
          issuerName: value("issuerName") || null,
          issuedAt: value("issuedAt")
            ? new Date(value("issuedAt")).toISOString()
            : null,
          expiresAt: value("expiresAt")
            ? new Date(value("expiresAt")).toISOString()
            : null,
          sourceUrl: value("sourceUrl") || null,
          evidenceLabel: value("evidenceLabel") || null,
          evidenceUrl: value("evidenceUrl") || null,
          data: dynamicData,
        }),
      });
      setSelectedScheme(null);
      onReload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Submission failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="portal-credentials-section">
      <div className="portal-section-heading">
        <div>
          <p className="eyebrow">Kepatuhan & Sertifikasi</p>
          <h2>Standar Kualifikasi & Sertifikasi Profesi</h2>
          <p>
            Persyaratan kompetensi teknis dan verifikasi dokumen sertifikasi resmi untuk status keanggotaan Anda.
          </p>
        </div>
        {data.requirements.length > 0 && (
          <button
            className={`button primary ${!emailVerified ? "btn-gated-locked" : ""}`}
            type="button"
            onClick={() => {
              if (emailVerified) {
                setSelectedScheme(data.requirements[0]?.scheme ?? null);
              }
            }}
            disabled={!emailVerified}
          >
            {!emailVerified ? (
              <>
                <Lock size={14} /> Wajib Verifikasi Email
              </>
            ) : (
              <>
                <Plus size={17} /> Ajukan Sertifikat
              </>
            )}
          </button>
        )}
      </div>
      <div className="credential-requirement-list">
        {data.requirements.map((requirement) => {
          const credential = data.credentials.find(
            (item) => item.schemeId === requirement.schemeId,
          );
          return (
            <article key={requirement.id}>
              <span
                className={`credential-check ${requirement.satisfied ? "satisfied" : ""}`}
              >
                {requirement.satisfied ? (
                  <BadgeCheck size={20} />
                ) : (
                  <ShieldCheck size={20} />
                )}
              </span>
              <div>
                <small>
                  {requirement.rule === "required" ? "Wajib Dipenuhi" : requirement.rule === "optional" ? "Opsional" : "Salah Satu (Pilihan)"} · Verifikasi {requirement.requiredVerificationLevel.replaceAll("_", " ")}
                </small>
                <h3>{requirement.scheme.name}</h3>
                <p>
                  {credential
                    ? `${credential.credentialNumber ?? "Tanpa nomor"} · ${credential.effectiveStatus === "active" ? "Aktif" : credential.effectiveStatus.replaceAll("_", " ")}`
                    : requirement.scheme.description}
                </p>
              </div>
              <span
                className={`credential-result ${requirement.satisfied ? "satisfied" : ""}`}
              >
                {requirement.satisfied ? "Terverifikasi" : "Perlu Diajukan"}
              </span>
              <button
                type="button"
                className={`button credential-renew ${!emailVerified ? "btn-gated-locked" : ""}`}
                onClick={() => {
                  if (emailVerified) {
                    setSelectedScheme(requirement.scheme);
                  }
                }}
                disabled={!emailVerified}
                title={!emailVerified ? "Verifikasi email untuk mengajukan" : undefined}
              >
                {!emailVerified ? (
                  <>
                    <Lock size={12} /> Terkunci
                  </>
                ) : credential ? (
                  "Perbarui Berkas"
                ) : (
                  "Ajukan"
                )}
              </button>
            </article>
          );
        })}
        {!data.requirements.length && (
          <div className="credential-none">
            <span className="credential-none-icon">
              <BadgeCheck size={24} />
            </span>
            <strong>Standar Kualifikasi Terpenuhi</strong>
            <p>
              Tipe keanggotaan Anda saat ini tidak memerlukan berkas verifikasi sertifikasi tambahan.
            </p>
          </div>
        )}
      </div>
      {selectedScheme && (
        <form className="member-form portal-credential-form" onSubmit={submit}>
          <div className="member-form-heading">
            <span className="member-form-icon">
              <ShieldCheck size={23} />
            </span>
            <div>
              <p className="eyebrow">Pengajuan Dokumen Verifikasi</p>
              <h2>{selectedScheme.name}</h2>
            </div>
          </div>
          {error && <p className="form-error full">{error}</p>}
          <label htmlFor="portal-cred-number">
            Nomor Sertifikat / Registrasi
            <input id="portal-cred-number" name="credentialNumber" placeholder="Contoh: REG-BNSP-2026-XXXX" />
          </label>
          <label htmlFor="portal-cred-issuer">
            Lembaga Penerbit
            <input
              id="portal-cred-issuer"
              name="issuerName"
              placeholder="Contoh: BNSP / LSP TPTU"
              defaultValue={selectedScheme.issuerName ?? ""}
            />
          </label>
          <label htmlFor="portal-cred-issued-at">
            Tanggal Terbit
            <input id="portal-cred-issued-at" name="issuedAt" type="date" />
          </label>
          <label htmlFor="portal-cred-expires-at">
            Tanggal Kedaluwarsa
            <input id="portal-cred-expires-at" name="expiresAt" type="date" />
          </label>
          {selectedScheme.fields.map((field) => (
            <label key={field.key} htmlFor={`credential-field-${field.key}`}>
              {field.label}
              {field.type === "select" ? (
                <select
                  id={`credential-field-${field.key}`}
                  name={`field:${field.key}`}
                  required={field.required}
                  defaultValue=""
                >
                  <option value="">Pilih…</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`credential-field-${field.key}`}
                  name={`field:${field.key}`}
                  type={field.type}
                  required={field.required}
                />
              )}
            </label>
          ))}
          <label htmlFor="portal-cred-source-url" className="full">
            Tautan Registri / Verifikasi Resmi (Opsional)
            <input
              id="portal-cred-source-url"
              name="sourceUrl"
              type="url"
              placeholder="https://..."
            />
          </label>
          <label htmlFor="portal-cred-evidence-label">
            Keterangan Dokumen Bukti
            <input
              id="portal-cred-evidence-label"
              name="evidenceLabel"
              placeholder="Sertifikat Fisik / Transkrip Uji Kompetensi"
            />
          </label>
          <label htmlFor="portal-cred-evidence-url">
            Tautan File Bukti / Dokumen PDF (Opsional)
            <input
              id="portal-cred-evidence-url"
              name="evidenceUrl"
              type="url"
              placeholder="https://..."
            />
          </label>
          <div className="member-form-actions full">
            <button
              className="button"
              type="button"
              onClick={() => setSelectedScheme(null)}
            >
              Batal
            </button>
            <button className="button primary" type="submit" disabled={pending}>
              {pending ? "Mengirimkan…" : "Kirim Dokumen Verifikasi"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
