import type { Metadata } from "next";
import { Suspense } from "react";
import { MemberPortal } from "@/components/member-portal";

export const metadata: Metadata = {
  title: "Portal Anggota Resmi | APTI Indonesia",
};

export default function MemberPage() {
  return (
    <section className="member-portal-page">
      <div className="wrap">
        <Suspense
          fallback={
            <div className="portal-loading-card">
              <div className="portal-spinner" />
              <p>Memuat dasbor anggota...</p>
            </div>
          }
        >
          <MemberPortal />
        </Suspense>
      </div>
    </section>
  );
}
