"use client";

import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Lender {
  id: string;
  brandName: string;
  companyName: string;
  licenseNumber: string;
  sectorType: string;
  ojkStatus: string;
  websiteUrl: string | null;
  isAfpiMember: boolean;
}

export default function LendersPage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLenders = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiUrl}/v1/public/lenders`);
        if (!res.ok) throw new Error("Failed to load lenders");
        const json = await res.json();
        setLenders(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchLenders();
  }, []);

  const filtered = lenders.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.brandName.toLowerCase().includes(q) ||
      item.companyName.toLowerCase().includes(q) ||
      item.licenseNumber.toLowerCase().includes(q) ||
      item.sectorType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="lenders-hero">
        <div className="wrap">
          <div className="hero-pill">
            <ShieldCheck size={14} />
            <span>Portal Proteksi Konsumen & Verifikasi Izin OJK</span>
          </div>
          <h1>Cek Legalitas Platform Fintech & Pembiayaan</h1>
          <p className="hero-lead">
            Pastikan entitas fintech pendanaan dan pembiayaan yang Anda gunakan
            telah memiliki izin resmi Otoritas Jasa Keuangan (OJK) serta patuh
            pada Kode Etik Asosiasi.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="lenders-body">
        <div className="wrap">
          {/* Search Bar */}
          <div className="directory-filter-bar mb-6">
            <div className="search-input-wrap flex-1">
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari nama platform, nama PT, atau nomor izin OJK..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="directory-search-input"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={32} className="animate-spin text-muted" />
            </div>
          ) : (
            <div className="lender-grid">
              {filtered.length > 0 ? (
                filtered.map((lender) => (
                  <div key={lender.id} className="lender-card">
                    <div className="lender-header">
                      <Building2 size={24} className="lender-icon" />
                      <div>
                        <h2>{lender.brandName}</h2>
                        <span className="company-sub">
                          {lender.companyName}
                        </span>
                      </div>
                    </div>

                    <div className="lender-license-badge">
                      <CheckCircle2 size={14} /> {lender.ojkStatus} (
                      {lender.licenseNumber})
                    </div>

                    <p className="sector-tag">{lender.sectorType}</p>

                    <div className="lender-card-footer">
                      {lender.isAfpiMember && (
                        <span className="member-status-pill">
                          Anggota Resmi
                        </span>
                      )}
                      {lender.websiteUrl && (
                        <a
                          href={lender.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-visit-site"
                        >
                          Kunjungi Situs <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Building2 size={48} />
                  <h3>Tidak Ada Platform Ditemukan</h3>
                  <p>
                    Coba sesuaikan kata kunci pencarian atau periksa ejaan nama
                    platform.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
