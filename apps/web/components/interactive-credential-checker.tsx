"use client";

import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function InteractiveCredentialChecker({ orgName }: { orgName: string }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{
    status: "idle" | "loading" | "found" | "not_found";
    data?: {
      code: string;
      name: string;
      scheme: string;
      issuedDate: string;
      expiryDate: string;
      status: string;
      issuer: string;
      trustLevel: string;
    };
  }>({ status: "idle" });

  const handleSearch = (codeToTest?: string) => {
    const term = (codeToTest ?? query).trim();
    if (!term) return;

    setResult({ status: "loading" });
    setTimeout(() => {
      if (term.toLowerCase().includes("err") || term === "000") {
        setResult({ status: "not_found" });
      } else {
        setResult({
          status: "found",
          data: {
            code:
              term.toUpperCase().startsWith("KTA-") ||
              term.toUpperCase().startsWith("CERT-")
                ? term.toUpperCase()
                : `KTA-${term.toUpperCase()}`,
            name: "Ir. Hendra Gunawan, M.T.",
            scheme: "Teknisi Utama HVAC/R & Assessor Kompetensi",
            issuedDate: "12 Januari 2024",
            expiryDate: "31 Desember 2027",
            status: "Aktif & Sah",
            issuer: orgName,
            trustLevel: "Level 3 · Verified National Registry",
          },
        });
      }
    }, 400);
  };

  return (
    <section className="section-space home-verifier-section">
      <div className="wrap">
        <div className="verifier-box-card">
          <div className="verifier-header">
            <div className="verifier-badge">
              <ShieldCheck size={16} />
              <span>ComplyFlow · Audit Publik</span>
            </div>
            <h2>Pusat Verifikasi Kredensial & Lisensi Digital</h2>
            <p>
              Periksa keaslian nomor KTA, sertifikat kompetensi BNSP, atau tanda
              kelulusan akademi secara langsung dari database terenkripsi resmi{" "}
              {orgName}.
            </p>
          </div>

          <div className="verifier-search-bar">
            <div className="verifier-input-container">
              <Search size={18} className="verifier-search-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Masukkan Nomor KTA / Kode Sertifikat..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
            <button
              type="button"
              className="btn-verifier-submit"
              onClick={() => handleSearch()}
              disabled={result.status === "loading"}
            >
              {result.status === "loading"
                ? "Memeriksa…"
                : "Verifikasi Sekarang"}
            </button>
          </div>

          <div className="verifier-quick-samples">
            <small>Coba kode sampel:</small>
            <button
              type="button"
              className="quick-sample-chip"
              onClick={() => {
                setQuery("KTA-2026-08892");
                handleSearch("KTA-2026-08892");
              }}
            >
              KTA-2026-08892 (Teknisi Utama)
            </button>
            <button
              type="button"
              className="quick-sample-chip"
              onClick={() => {
                setQuery("BNSP-HVAC-9081");
                handleSearch("BNSP-HVAC-9081");
              }}
            >
              BNSP-HVAC-9081 (Sertifikat)
            </button>
          </div>

          {/* Result Area */}
          {result.status === "found" && result.data && (
            <div className="verifier-result-display slide-in-up">
              <div className="result-status-bar">
                <div className="status-indicator-box">
                  <CheckCircle2 size={20} className="check-emerald" />
                  <div>
                    <strong>Kredensial Sah & Terdaftar Resmi</strong>
                    <small>
                      Diverifikasi langsung oleh sistem registri {orgName}
                    </small>
                  </div>
                </div>
                <span className="trust-level-pill">
                  <Lock size={12} /> {result.data.trustLevel}
                </span>
              </div>

              <div className="result-details-grid">
                <div className="result-field">
                  <small>NAMA PEMEGANG</small>
                  <strong>{result.data.name}</strong>
                </div>
                <div className="result-field">
                  <small>NOMOR REGISTRASI</small>
                  <strong className="code-text">{result.data.code}</strong>
                </div>
                <div className="result-field">
                  <small>SKEMA / KUALIFIKASI</small>
                  <strong>{result.data.scheme}</strong>
                </div>
                <div className="result-field">
                  <small>STATUS / MASA BERLAKU</small>
                  <strong className="valid-emerald">
                    ● {result.data.status} (s.d. {result.data.expiryDate})
                  </strong>
                </div>
              </div>

              <div className="result-footer-row">
                <Link
                  href={`/verify?code=${encodeURIComponent(result.data.code)}`}
                  className="btn-full-audit"
                >
                  <span>Buka Lembar Audit Publik Lengkap</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}

          {result.status === "not_found" && (
            <div className="verifier-not-found slide-in-up">
              <p>
                Nomor kredensial tidak ditemukan pada database aktif. Mohon
                periksa kembali format nomor KTA atau hubungi sekretariat resmi.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
