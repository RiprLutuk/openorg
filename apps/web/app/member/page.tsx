import type { Metadata } from "next";
import { MemberPortal } from "@/components/member-portal";
import { getSite } from "@/lib/api";

export const metadata: Metadata = { title: "Member portal" };

export default async function MemberPage() {
  const site = await getSite();
  return (
    <section className="member-portal-page">
      <div className="wrap">
        <MemberPortal organization={site.organization.slug} />
      </div>
    </section>
  );
}
