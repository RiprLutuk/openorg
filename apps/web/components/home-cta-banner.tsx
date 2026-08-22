"use client";

import { ArrowRight, CreditCard, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemberAuth } from "@/lib/use-member-auth";

interface HomeCtaBannerProps {
  organizationName: string;
}

export function HomeCtaBanner({ organizationName }: HomeCtaBannerProps) {
  const { isLoggedIn, member } = useMemberAuth();

  return (
    <section className="home-cta-banner-section">
      <div className="wrap">
        <div className="cta-banner-glow-card">
          <div className="cta-banner-content">
            <span className="cta-pill">
              <Sparkles size={14} />{" "}
              {isLoggedIn ? "Keanggotaan Aktif" : "Keanggotaan Resmi"}
            </span>

            {isLoggedIn ? (
              <>
                <h2>Selamat Datang Kembali, {member?.name || "Anggota"}!</h2>
                <p>
                  Akses langsung KTA digital resmi Anda, cek sertifikasi
                  kredensial, dan kelola layanan organisasi {organizationName}.
                </p>
                <div className="cta-buttons-row">
                  <Link href="/member" className="btn-cta-white">
                    <CreditCard size={16} />
                    <span>Buka Portal & KTA Saya</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2>Bergabung Bersama {organizationName}</h2>
                <p>
                  Dapatkan akses langsung ke jejaring profesional, pelatihan
                  terakreditasi, dan KTA digital resmi.
                </p>
                <div className="cta-buttons-row">
                  <Link href="/join" className="btn-cta-white">
                    <UserPlus size={16} />
                    <span>Daftar Anggota</span>
                  </Link>
                  <Link href="/member/login" className="btn-cta-ghost">
                    <span>Masuk</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
