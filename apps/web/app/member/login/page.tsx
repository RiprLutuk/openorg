import type { Metadata } from "next";
import { MemberLogin } from "@/components/member-login";

export const metadata: Metadata = { title: "Member sign in" };

export default function MemberLoginPage() {
  return (
    <section className="member-page-shell login-member-page">
      <div className="wrap member-login-wrap">
        <MemberLogin />
      </div>
    </section>
  );
}
