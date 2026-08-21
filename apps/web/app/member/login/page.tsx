import type { Metadata } from "next";
import { MemberLogin } from "@/components/member-login";
import { getSite } from "@/lib/api";

export const metadata: Metadata = { title: "Member sign in" };

export default async function MemberLoginPage() {
  const site = await getSite();
  return (
    <section className="member-page-shell login-member-page">
      <div className="wrap member-login-wrap">
        <MemberLogin organization={site.organization.slug} />
      </div>
    </section>
  );
}
