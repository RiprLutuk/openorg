import type { Metadata } from "next";
import { MemberPortal } from "@/components/member-portal";

export const metadata: Metadata = { title: "Member portal" };

export default function MemberPage() {
  return (
    <section className="member-portal-page">
      <div className="wrap">
        <MemberPortal />
      </div>
    </section>
  );
}
