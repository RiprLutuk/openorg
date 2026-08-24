"use client";

import {
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
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
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { MemberApiError, memberApi } from "@/lib/member-client";
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

export function MemberPortal() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState("");
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [learning, setLearning] = useState<LearningData | null>(null);
  const [billing, setBilling] = useState<BillingData | null>(null);

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

  useEffect(() => loadPortal(), [loadPortal]);

  const logout = async () => {
    try {
      localStorage.removeItem("openorg_member_logged_in");
    } catch {
      // storage blocked
    }
    await memberApi("/v1/member/logout", { method: "POST" });
    window.location.assign("/member/login");
  };

  if (loading)
    return (
      <div className="portal-loading">
        <span className="spinner-dot" />
        Memuat ruang kerja portal anggota…
      </div>
    );
  if (unauthorized || !data)
    return (
      <div className="member-success-card portal-gate">
        <span>
          <ShieldCheck size={32} />
        </span>
        <p className="eyebrow">Portal Anggota Resmi</p>
        <h2>Silakan Masuk Terlebih Dahulu</h2>
        <p>
          Akses kartu KTA digital, status sertifikasi BNSP, riwayat kredit SKP,
          dan profil keanggotaan Anda tersimpan aman dan privat.
        </p>
        <div className="gate-action-buttons">
          <Link className="button primary" href="/member/login">
            Masuk ke Akun
          </Link>
          <Link className="button secondary" href="/join">
            Daftar Anggota Baru
          </Link>
        </div>
        {error && <p className="form-error mt-4">{error}</p>}
      </div>
    );

  const applicationStatus = data.application?.status ?? data.member.status;
  return (
    <div className="member-dashboard">
      <div className="member-dashboard-head">
        <div>
          <p className="eyebrow">Member workspace</p>
          <h1>Hello, {data.member.name.split(" ")[0]}.</h1>
          <p>Manage your membership with {data.organization.name}.</p>
        </div>
        <button className="button member-logout" type="button" onClick={logout}>
          <LogOut size={17} /> Sign out
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
        <span>
          <small>Membership status</small>
          <strong>{applicationStatus.replace("_", " ")}</strong>
        </span>
        <span className={`public-status ${applicationStatus}`}>
          {applicationStatus}
        </span>
      </div>
      <div className="member-dashboard-grid">
        <section className="portal-panel profile-panel">
          <div className="portal-panel-head">
            <span>
              <UserRound size={19} />
            </span>
            <div>
              <h2>Profile</h2>
              <p>Your registered information</p>
            </div>
          </div>
          <dl className="portal-details">
            <div>
              <dt>Member number</dt>
              <dd>{data.member.memberNumber}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{data.member.email ?? "—"}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{data.member.phone ?? "—"}</dd>
            </div>
            <div>
              <dt>Address</dt>
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
              <h2>Application</h2>
              <p>Review progress and decision</p>
            </div>
          </div>
          <ol className="application-timeline">
            <li className="complete">
              <span />
              Application received
            </li>
            <li className={data.emailVerified ? "complete" : ""}>
              <span />
              Email verified
            </li>
            <li className={applicationStatus === "active" ? "complete" : ""}>
              <span />
              Reviewed by the organization
            </li>
            <li className={data.card ? "complete" : ""}>
              <span />
              Member card issued
            </li>
          </ol>
          {data.application?.rejectionReason && (
            <p className="application-feedback">
              <strong>Review note:</strong> {data.application.rejectionReason}
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
              <p className="eyebrow">Digital Credential</p>
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
          <p className="eyebrow">Billing & benefits</p>
          <h2>Your financial membership record</h2>
          <p>
            Review official invoices, confirmed payments, and access unlocked by
            settlement.
          </p>
        </div>
      </div>
      <div className="member-benefit-strip">
        <span>
          <WalletCards size={20} />
        </span>
        <div>
          <small>Active benefits</small>
          <strong>
            {activeBenefits.length
              ? activeBenefits.map((item) => item.label).join(" · ")
              : "No paid benefit package yet"}
          </strong>
        </div>
      </div>
      <div className="member-billing-grid">
        <div className="member-billing-panel">
          <div className="member-learning-head">
            <div className="member-learning-head-copy">
              <ReceiptText size={18} />
              <strong>Invoices</strong>
            </div>
            <small>{outstanding.length} awaiting settlement</small>
          </div>
          <div className="member-invoice-list">
            {data.invoices.map((invoice) => (
              <article key={invoice.id}>
                <div>
                  <span className={`billing-status ${invoice.effectiveStatus}`}>
                    {invoice.effectiveStatus}
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
                      ? `${formatMemberMoney(invoice.outstanding)} outstanding`
                      : "Settled"}
                  </small>
                </div>
              </article>
            ))}
            {!data.invoices.length && (
              <p className="learning-empty">
                No invoice has been issued to this account.
              </p>
            )}
          </div>
        </div>
        <div className="member-billing-panel">
          <div className="member-learning-head">
            <div className="member-learning-head-copy">
              <BadgeCheck size={18} />
              <strong>Benefit wallet</strong>
            </div>
            <small>Access granted from paid products</small>
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
                    {item.effectiveStatus} ·{" "}
                    {item.endsAt
                      ? `until ${formatDate(item.endsAt)}`
                      : "no expiry"}
                  </small>
                </div>
              </article>
            ))}
            {!data.entitlements.length && (
              <p className="learning-empty">
                Benefits will appear here automatically after a qualifying
                invoice is paid.
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
      setError(reason instanceof Error ? reason.message : "Enrollment failed.");
    } finally {
      setPendingId(null);
    }
  };
  return (
    <section className="portal-learning-section">
      <div className="portal-section-heading">
        <div>
          <p className="eyebrow">Academy & Credit Ledger</p>
          <h2>Catatan Pelatihan & Kredit SKP</h2>
          <p>
            Daftar kegiatan pelatihan teknis, sertifikasi BNSP, dan pantau
            akumulasi kredit poin SKP/CPD resmi Anda.
          </p>
        </div>
      </div>

      {!emailVerified && (
        <div className="portal-lock-banner">
          <ShieldAlert size={20} className="text-amber-500" />
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
            Verifikasi Email
          </Link>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
      <div className="member-credit-balances">
        {data.balances.map((balance) => (
          <article key={balance.scheme.id}>
            <span>
              <Award size={19} />
            </span>
            <div>
              <strong>{balance.amount}</strong>
              <small>{balance.scheme.unitLabel}</small>
            </div>
            <p>{balance.scheme.name}</p>
          </article>
        ))}
        {!data.balances.length && (
          <article className="empty-credit-balance">
            <span>
              <Award size={19} />
            </span>
            <div>
              <strong>0</strong>
              <small>verified credits</small>
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
                      undefined,
                      { month: "short" },
                    )}
                  </small>
                </span>
                <div>
                  <strong>{item.activity.title}</strong>
                  <small>
                    {item.status}
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
                    {new Date(activity.startsAt).toLocaleDateString(undefined, {
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
                    "Joining…"
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
];

const POPULAR_WORKSHOP_SERVICES = [
  "Cuci AC Inverter Bebas Bau",
  "Vakum Standar SKKNI (Dua Tahap)",
  "Recovery Freon R32 / R410A",
  "Uji Tekanan Nitrogen K3",
  "Bongkar Pasang AC Split",
  "Perbaikan Modul PCB Inverter",
  "Instalasi AC Cassette / Standing",
  "Servis Chiller & VRV Komersial",
  "Penyedia Sparepart & Freon Asli",
];

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
    existingMeta.workshopName || member.companyName || `${member.name.split(" ")[0]} Cooling Workshop`,
  );
  const [tagline, setTagline] = useState(
    existingMeta.tagline || "Solusi Tata Udara Profesional, Berlisensi & Bergaransi",
  );
  const [category, setCategory] = useState(
    existingMeta.category || WORKSHOP_CATEGORIES[0],
  );
  const [city, setCity] = useState(existingMeta.city || "Jakarta Selatan");
  const [province, setProvince] = useState(existingMeta.province || "DKI Jakarta");
  const [address, setAddress] = useState(
    existingMeta.address || member.address || "Jl. Raya Workshop Pendingin No. 18",
  );
  const [phone, setPhone] = useState(existingMeta.phone || member.phone || "0812-3456-7890");
  const [whatsapp, setWhatsapp] = useState(
    existingMeta.whatsapp || member.phone || "0812-3456-7890",
  );
  const [operatingHours, setOperatingHours] = useState(
    existingMeta.operatingHours || "Senin - Sabtu: 08.00 - 18.00 | Siap 24 Jam Panggilan",
  );
  const [description, setDescription] = useState(
    existingMeta.description ||
      "Bengkel pendingin resmi bersertifikat APTI Indonesia. Melayani servis berkala, pengadaan sparepart asli, dan perbaikan AC inverter bergaransi.",
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    existingMeta.services || [
      "Cuci AC Inverter Bebas Bau",
      "Vakum Standar SKKNI (Dua Tahap)",
      "Recovery Freon R32 / R410A",
      "Perbaikan Modul PCB Inverter",
    ],
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    existingMeta.isPublished ?? true,
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv],
    );
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
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      operatingHours: operatingHours.trim(),
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
            <label>
              Kategori Usaha *
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {WORKSHOP_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
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
            <label>
              Kota / Kabupaten *
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Surabaya"
              />
            </label>
            <label>
              Provinsi *
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Contoh: Jawa Timur"
              />
            </label>
          </div>

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

          <div className="form-row-2">
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
            <label>
              Jam Operasional & Kesiapan
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="Senin - Sabtu 08.00 - 18.00"
              />
            </label>
          </div>

          <label>
            Layanan & Keahlian Unggulan (Pilih yang disediakan)
            <div className="service-tags-selector">
              {POPULAR_WORKSHOP_SERVICES.map((srv) => {
                const active = selectedServices.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    className={`tag-chip ${active ? "active" : ""}`}
                    onClick={() => toggleService(srv)}
                  >
                    {active ? <Check size={13} /> : <Plus size={13} />}
                    <span>{srv}</span>
                  </button>
                );
              })}
            </div>
          </label>

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
                <span>{city}, {province}</span>
              </div>
              <div className="meta-item">
                <Phone size={14} color="#64748b" />
                <span>{whatsapp}</span>
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
          <p className="eyebrow">ComplyFlow</p>
          <h2>Credentials & requirements</h2>
          <p>
            Requirement set: {data.membershipType.replaceAll("-", " ")}.
            Verification status is checked against the configured trust level.
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
                <Plus size={17} /> Submit credential
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
                  {requirement.rule.replace("_", " ")} · requires{" "}
                  {requirement.requiredVerificationLevel.replaceAll("_", " ")}
                </small>
                <h3>{requirement.scheme.name}</h3>
                <p>
                  {credential
                    ? `${credential.credentialNumber ?? "No number"} · ${credential.effectiveStatus.replaceAll("_", " ")}`
                    : requirement.scheme.description}
                </p>
              </div>
              <span
                className={`credential-result ${requirement.satisfied ? "satisfied" : ""}`}
              >
                {requirement.satisfied ? "Satisfied" : "Action needed"}
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
                  "Renew / replace"
                ) : (
                  "Submit"
                )}
              </button>
            </article>
          );
        })}
        {!data.requirements.length && (
          <div className="credential-none">
            <ShieldCheck size={22} />
            <p>
              No credential requirements are assigned to this membership type.
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
              <p className="eyebrow">Submit for verification</p>
              <h2>{selectedScheme.name}</h2>
            </div>
          </div>
          {error && <p className="form-error full">{error}</p>}
          <label htmlFor="portal-cred-number">
            Credential number
            <input id="portal-cred-number" name="credentialNumber" />
          </label>
          <label htmlFor="portal-cred-issuer">
            Issuer
            <input
              id="portal-cred-issuer"
              name="issuerName"
              defaultValue={selectedScheme.issuerName ?? ""}
            />
          </label>
          <label htmlFor="portal-cred-issued-at">
            Issued date
            <input id="portal-cred-issued-at" name="issuedAt" type="date" />
          </label>
          <label htmlFor="portal-cred-expires-at">
            Expiry date
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
                  <option value="">Select…</option>
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
            Official registry / source URL
            <input
              id="portal-cred-source-url"
              name="sourceUrl"
              type="url"
              placeholder="https://"
            />
          </label>
          <label htmlFor="portal-cred-evidence-label">
            Evidence label
            <input
              id="portal-cred-evidence-label"
              name="evidenceLabel"
              placeholder="Certificate or registry record"
            />
          </label>
          <label htmlFor="portal-cred-evidence-url">
            Evidence URL
            <input
              id="portal-cred-evidence-url"
              name="evidenceUrl"
              type="url"
              placeholder="https://"
            />
          </label>
          <div className="member-form-actions full">
            <button
              className="button"
              type="button"
              onClick={() => setSelectedScheme(null)}
            >
              Cancel
            </button>
            <button className="button primary" type="submit" disabled={pending}>
              {pending ? "Submitting…" : "Submit for verification"}
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
