"use client";

import { BadgeCheck, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { memberApi } from "@/lib/member-client";
import { MemberPortraitCard } from "./member-portrait-card";

type Verification = {
  valid: true;
  member: {
    name: string;
    memberNumber: string;
    avatarUrl: string | null;
    unitName: string | null;
    joinedAt: string | null;
  };
  card: {
    code?: string;
    issuedAt: string;
    expiresAt: string | null;
    version: number;
  };
  organization: { name: string; logoUrl: string | null };
};

export function MembershipVerification({ code }: { code: string }) {
  const [result, setResult] = useState<Verification | null>(null);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    memberApi<{ data: Verification }>(
      `/v1/public/membership/cards/${encodeURIComponent(code)}`,
    )
      .then((response) => setResult(response.data))
      .catch(() => setInvalid(true));
  }, [code]);

  if (invalid)
    return (
      <div className="verification-card invalid">
        <span>
          <ShieldAlert size={30} />
        </span>
        <p className="eyebrow">Verification failed</p>
        <h1>This card is not active.</h1>
        <p>The code is invalid, expired, revoked, or does not exist.</p>
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
      <p className="eyebrow">Verified Credential</p>
      <h1>Keanggotaan Terverifikasi Aktif</h1>
      <p>
        Kartu Tanda Anggota (KTA) Digital Resmi diterbitkan oleh{" "}
        <strong>{result.organization.name}</strong>.
      </p>

      <div style={{ marginTop: "24px" }}>
        <MemberPortraitCard
          member={{
            name: result.member.name,
            memberNumber: result.member.memberNumber || code,
            avatarUrl: result.member.avatarUrl,
            unitName: result.member.unitName,
            positionName: "ANGGOTA RESMI",
            status: "active",
          }}
          card={{
            code: result.card.code || code,
            issuedAt: result.card.issuedAt,
            expiresAt: result.card.expiresAt,
            version: result.card.version,
          }}
          organization={result.organization}
        />
      </div>

      <small style={{ marginTop: "16px", display: "block" }}>
        Card version {result.card.version} · Live Verification Engine
      </small>
    </div>
  );
}
