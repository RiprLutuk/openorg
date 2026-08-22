"use client";

import { BadgeCheck, Download, Printer, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { downloadKtaCard } from "@/lib/kta-generator";
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
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!result) return;
    try {
      setIsDownloading(true);
      await downloadKtaCard({
        memberName: result.member.name,
        memberNumber: result.member.memberNumber || code,
        cardCode: code,
        unitName: result.member.unitName,
        issuedAt: result.card.issuedAt,
        expiresAt: result.card.expiresAt,
        orgName: result.organization.name,
        avatarUrl: result.member.avatarUrl,
      });
    } catch (err) {
      console.error("Gagal mengunduh KTA:", err);
    } finally {
      setIsDownloading(false);
    }
  };

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
      <div
        className="kta-action-group no-print"
        style={{
          marginTop: "24px",
          display: "flex",
          gap: "12px",
          justifyContent: "center",
        }}
      >
        <button
          className="button primary"
          type="button"
          disabled={isDownloading}
          onClick={handleDownload}
        >
          <Download size={16} />{" "}
          {isDownloading ? "Membuat KTA HD..." : "Unduh KTA (PNG)"}
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => window.print()}
        >
          <Printer size={16} /> Cetak Kartu
        </button>
      </div>
      <small style={{ marginTop: "16px", display: "block" }}>
        Card version {result.card.version} · Live verification
      </small>
    </div>
  );
}
