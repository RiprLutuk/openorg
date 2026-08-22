"use client";

import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CreditCard,
  LogOut,
  Plus,
  Printer,
  ReceiptText,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { MemberApiError, memberApi } from "@/lib/member-client";

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
  const [qrCode, setQrCode] = useState("");
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

  useEffect(() => {
    if (!data?.card) return;
    const verificationUrl = `${window.location.origin}/verify?code=${encodeURIComponent(data.card.code)}`;
    QRCode.toDataURL(verificationUrl, {
      width: 220,
      margin: 1,
      color: { dark: "#182230", light: "#ffffff" },
    }).then(setQrCode);
  }, [data]);

  const logout = async () => {
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
        <MemberCredentials data={compliance} onReload={loadPortal} />
      )}
      {learning && <MemberLearning data={learning} onReload={loadPortal} />}
      {billing && <MemberBilling data={billing} />}
      {data.card ? (
        <section className="portal-card-section">
          <div className="portal-section-heading">
            <div>
              <p className="eyebrow">Digital credential</p>
              <h2>Your membership card</h2>
              <p>Print it directly or verify its status from the QR code.</p>
            </div>
            <button
              className="button primary no-print"
              type="button"
              onClick={() => window.print()}
            >
              <Printer size={17} /> Print card
            </button>
          </div>
          <div className="membership-card-print-area">
            <article className="membership-card">
              <div className="membership-card-brand">
                {data.organization.logoUrl ? (
                  <img src={data.organization.logoUrl} alt="" />
                ) : (
                  <span>
                    {data.organization.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div>
                  <small>Official member</small>
                  <strong>{data.organization.name}</strong>
                </div>
                <CreditCard size={25} />
              </div>
              <div className="membership-card-body">
                <div className="membership-photo">
                  {data.member.avatarUrl ? (
                    <img src={data.member.avatarUrl} alt={data.member.name} />
                  ) : (
                    <span>{data.member.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="membership-identity">
                  <small>Member name</small>
                  <h3>{data.member.name}</h3>
                  <small>Member number / KTA Code</small>
                  <strong>{data.card.code}</strong>
                  <div>
                    <span>
                      <small>Issued</small>
                      {formatDate(data.card.issuedAt)}
                    </span>
                    <span>
                      <small>Valid until</small>
                      {data.card.expiresAt
                        ? formatDate(data.card.expiresAt)
                        : "No expiry"}
                    </span>
                  </div>
                </div>
                <div className="membership-qr">
                  {qrCode && (
                    <img src={qrCode} alt="QR code to verify membership" />
                  )}
                  <small>Scan to verify</small>
                </div>
              </div>
              <div className="membership-card-footer">
                <ShieldCheck size={14} /> Active digital membership credential
              </div>
            </article>
          </div>
        </section>
      ) : (
        <section className="card-awaiting">
          <CreditCard size={25} />
          <div>
            <h2>Your card will appear here</h2>
            <p>
              It is issued automatically after the organization approves your
              application.
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
              <ReceiptText size={19} />
              <div>
                <h3>Invoices</h3>
                <p>{outstanding.length} awaiting settlement</p>
              </div>
            </div>
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
              <BadgeCheck size={19} />
              <div>
                <h3>Benefit wallet</h3>
                <p>Access granted from paid products</p>
              </div>
            </div>
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
  onReload,
}: {
  data: LearningData;
  onReload: () => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const enrolledIds = new Set(data.enrollments.map((item) => item.activityId));
  const available = data.catalog.filter((item) => !enrolledIds.has(item.id));
  const enroll = async (activityId: string) => {
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
          <h2>Your learning record</h2>
          <p>
            Enroll in activities and track verified professional credits from an
            append-only ledger.
          </p>
        </div>
      </div>
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
            <p>Completed learning credits will appear here.</p>
          </article>
        )}
      </div>
      <div className="member-learning-grid">
        <div className="member-learning-panel">
          <div className="member-learning-head">
            <div className="member-learning-head-copy">
              <BookOpen size={18} />
              <strong>My activities</strong>
            </div>
            <small>{data.enrollments.length} registrations</small>
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
              <p className="learning-empty">No activity registrations yet.</p>
            )}
          </div>
        </div>
        <div className="member-learning-panel">
          <div className="member-learning-head">
            <div className="member-learning-head-copy">
              <Plus size={18} />
              <strong>Open enrollment</strong>
            </div>
            <small>{available.length} available</small>
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
                  className="button"
                  disabled={pendingId === activity.id}
                  onClick={() => enroll(activity.id)}
                >
                  {pendingId === activity.id ? "Joining…" : "Enroll"}
                </button>
              </article>
            ))}
            {!available.length && (
              <p className="learning-empty">
                No additional activities are open.
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
              <strong>Recent credit ledger</strong>
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

function MemberCredentials({
  data,
  onReload,
}: {
  data: ComplianceData;
  onReload: () => void;
}) {
  const [selectedScheme, setSelectedScheme] = useState<CredentialScheme | null>(
    null,
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
            className="button primary"
            type="button"
            onClick={() =>
              setSelectedScheme(data.requirements[0]?.scheme ?? null)
            }
          >
            <Plus size={17} /> Submit credential
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
                className="button credential-renew"
                onClick={() => setSelectedScheme(requirement.scheme)}
              >
                {credential ? "Renew / replace" : "Submit"}
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
          <label>
            Credential number
            <input name="credentialNumber" />
          </label>
          <label>
            Issuer
            <input
              name="issuerName"
              defaultValue={selectedScheme.issuerName ?? ""}
            />
          </label>
          <label>
            Issued date
            <input name="issuedAt" type="date" />
          </label>
          <label>
            Expiry date
            <input name="expiresAt" type="date" />
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
          <label className="full">
            Official registry / source URL
            <input name="sourceUrl" type="url" placeholder="https://" />
          </label>
          <label>
            Evidence label
            <input
              name="evidenceLabel"
              placeholder="Certificate or registry record"
            />
          </label>
          <label>
            Evidence URL
            <input name="evidenceUrl" type="url" placeholder="https://" />
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
