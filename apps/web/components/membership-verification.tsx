"use client";

import { BadgeCheck, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { memberApi } from "@/lib/member-client";

type Verification = {
  valid: true;
  member: {
    name: string;
    memberNumber: string;
    avatarUrl: string | null;
    unitName: string | null;
    joinedAt: string | null;
  };
  card: { issuedAt: string; expiresAt: string | null; version: number };
  organization: { name: string; logoUrl: string | null };
};

export function MembershipVerification({
  code,
  organization,
}: {
  code: string;
  organization: string;
}) {
  const [result, setResult] = useState<Verification | null>(null);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    memberApi<{ data: Verification }>(
      `/v1/public/membership/cards/${encodeURIComponent(code)}`,
      organization,
    )
      .then((response) => setResult(response.data))
      .catch(() => setInvalid(true));
  }, [code, organization]);

  if (invalid)
    return (
      <div className="verification-card invalid">
        <span>
          <ShieldAlert size={30} />
        </span>
        <p className="eyebrow">Verification failed</p>
        <h1>This card is not active.</h1>
        <p>
          The code is invalid, expired, revoked, or belongs to another
          organization.
        </p>
      </div>
    );
  if (!result)
    return (
      <div className="portal-loading">Checking membership credential…</div>
    );
  return (
    <div className="verification-card">
      <span>
        <BadgeCheck size={30} />
      </span>
      <p className="eyebrow">Verified credential</p>
      <h1>Membership is active.</h1>
      <p>This card was issued by {result.organization.name}.</p>
      <dl>
        <div>
          <dt>Member</dt>
          <dd>{result.member.name}</dd>
        </div>
        <div>
          <dt>Member number</dt>
          <dd>{result.member.memberNumber}</dd>
        </div>
        <div>
          <dt>Organization unit</dt>
          <dd>{result.member.unitName ?? "—"}</dd>
        </div>
        <div>
          <dt>Issued</dt>
          <dd>{new Date(result.card.issuedAt).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt>Valid until</dt>
          <dd>
            {result.card.expiresAt
              ? new Date(result.card.expiresAt).toLocaleDateString()
              : "No expiry"}
          </dd>
        </div>
      </dl>
      <small>Card version {result.card.version} · Live verification</small>
    </div>
  );
}
