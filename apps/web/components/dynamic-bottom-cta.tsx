"use client";

import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useMemberAuth } from "@/lib/use-member-auth";

interface DynamicBottomCtaProps {
  organizationName?: string;
  guestTitle?: string;
  guestDescription?: string;
  guestPrimaryCta?: { label: string; href: string };
  guestSecondaryCta?: { label: string; href: string };
  memberTitle?: string;
  memberDescription?: string;
  memberPrimaryCta?: { label: string; href: string };
  memberSecondaryCta?: { label: string; href: string };
}

export function DynamicBottomCta({
  organizationName = "APTI Indonesia",
  guestTitle = "Tingkatkan Legitimasi Profesionalisme Usaha Anda",
  guestDescription = "Bergabunglah bersama ribuan praktisi dan workshop pendingin terakreditasi di seluruh Indonesia dengan KTA Digital resmi.",
  guestPrimaryCta = { label: "Daftar Jadi Anggota", href: "/join" },
  guestSecondaryCta = { label: "Cek Validitas KTA", href: "/verify" },
  memberTitle,
  memberDescription,
  memberPrimaryCta = { label: "Buka Portal & KTA Saya", href: "/member" },
  memberSecondaryCta = { label: "Agenda & Uji Kompetensi", href: "/events" },
}: DynamicBottomCtaProps) {
  const { isLoggedIn, member } = useMemberAuth();

  return (
    <section className="tech-bottom-cta">
      <div className="wrap">
        <div className="tech-cta-shell">
          <div className="tech-cta-content">
            {isLoggedIn ? (
              <>
                <h2>
                  {memberTitle ||
                    `Selamat Datang Kembali, ${member?.name ? member.name.split(" ")[0] : "Anggota"}!`}
                </h2>
                <p>
                  {memberDescription ||
                    `Anda saat ini terdaftar aktif ${member?.memberNumber ? `(No. KTA: ${member.memberNumber})` : ""} di ${organizationName}. Kelola profil, cetak KTA digital, dan pantau kredit SKP Anda.`}
                </p>
              </>
            ) : (
              <>
                <h2>{guestTitle}</h2>
                <p>{guestDescription}</p>
              </>
            )}
          </div>

          <div className="tech-cta-actions">
            {isLoggedIn ? (
              <>
                <Link
                  href={memberPrimaryCta.href}
                  className="button primary btn-cta-main"
                >
                  <CreditCard size={17} />
                  <span>{memberPrimaryCta.label}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href={memberSecondaryCta.href}
                  className="button secondary btn-cta-sec"
                >
                  <CalendarDays size={16} />
                  <span>{memberSecondaryCta.label}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={guestPrimaryCta.href}
                  className="button primary btn-cta-main"
                >
                  <UserPlus size={17} />
                  <span>{guestPrimaryCta.label}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href={guestSecondaryCta.href}
                  className="button secondary btn-cta-sec"
                >
                  <BadgeCheck size={16} />
                  <span>{guestSecondaryCta.label}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
