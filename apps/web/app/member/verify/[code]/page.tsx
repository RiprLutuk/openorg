import type { Metadata } from "next";
import { MembershipVerification } from "@/components/membership-verification";

export const metadata: Metadata = { title: "Verify member card" };

export default async function VerifyMemberPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <section className="member-page-shell verification-page">
      <div className="wrap verification-wrap">
        <MembershipVerification code={code} />
      </div>
    </section>
  );
}
