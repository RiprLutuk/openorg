import type { Metadata } from "next";
import { MembershipVerification } from "@/components/membership-verification";
import { getSite } from "@/lib/api";

export const metadata: Metadata = { title: "Verify member card" };

export default async function VerifyMemberPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [{ code }, site] = await Promise.all([params, getSite()]);
  return (
    <section className="member-page-shell verification-page">
      <div className="wrap verification-wrap">
        <MembershipVerification
          code={code}
          organization={site.organization.slug}
        />
      </div>
    </section>
  );
}
