"use client";

import { Globe2, Loader2, Search, Server } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

interface WhoisData {
  query: string;
  asn: string;
  organization: string;
  ipRange: string;
  status: string;
  iixTrafficPeakGbps: string;
  peeringStatus: string;
  updatedAt: string;
}

export default function WhoisPage() {
  const [query, setQuery] = useState("AS134371");
  const [isLoading, setIsLoading] = useState(false);
  const [whoisInfo, setWhoisInfo] = useState<WhoisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWhois = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(
        `${apiUrl}/v1/public/whois?query=${encodeURIComponent(searchQuery)}`,
      );
      if (!res.ok)
        throw new Error("Lookup gagal atau entitas tidak ditemukan.");
      const json = await res.json();
      setWhoisInfo(json.data ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data WHOIS.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchWhois("AS134371");
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      void fetchWhois(query.trim());
    }
  };

  return (
    <div className="page-shell">
      {/* Hero Header */}
      <section className="whois-hero">
        <div className="wrap">
          <div className="hero-pill">
            <Globe2 size={14} />
            <span>IDNIC NIR & IIX Peering Traffic Hub</span>
          </div>
          <h1>Pencarian WHOIS IP/ASN & Peering IIX</h1>
          <p className="hero-lead">
            Mesin query publik untuk memeriksa alokasi blok IPv4/IPv6,
            Autonomous System Number (ASN), serta pemantauan traffic internet
            exchange nasional.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="whois-body">
        <div className="wrap">
          <div className="whois-card-container">
            {/* Search Input Box */}
            <form onSubmit={handleSearch} className="whois-search-box">
              <div className="search-input-wrap">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Masukkan IP Address (misal 103.28.144.1) atau Nomor ASN (AS134371)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="whois-input"
                />
              </div>
              <button
                type="submit"
                className="btn-search-whois"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Cek WHOIS"
                )}
              </button>
            </form>

            {error && (
              <div className="track-error-box mt-4">
                <span>{error}</span>
              </div>
            )}

            {/* WHOIS Output */}
            {whoisInfo && (
              <div className="whois-output-card">
                <div className="output-header">
                  <Server size={20} />
                  <h3>Hasil Lookup WHOIS: {whoisInfo.query}</h3>
                </div>
                <div className="output-grid">
                  <div className="output-item">
                    <span className="item-label">
                      Autonomous System Number (ASN)
                    </span>
                    <strong className="item-value">{whoisInfo.asn}</strong>
                  </div>
                  <div className="output-item">
                    <span className="item-label">Organisasi Terdaftar</span>
                    <strong className="item-value">
                      {whoisInfo.organization}
                    </strong>
                  </div>
                  <div className="output-item">
                    <span className="item-label">Rentang Blok IP (CIDR)</span>
                    <strong className="item-value">{whoisInfo.ipRange}</strong>
                  </div>
                  <div className="output-item">
                    <span className="item-label">Status Alokasi IDNIC</span>
                    <span className="status-pill">{whoisInfo.status}</span>
                  </div>
                  <div className="output-item">
                    <span className="item-label">Peak Peering Traffic IIX</span>
                    <strong className="item-value traffic">
                      {whoisInfo.iixTrafficPeakGbps}
                    </strong>
                  </div>
                  <div className="output-item">
                    <span className="item-label">Status Koneksi Node</span>
                    <strong className="item-value">
                      {whoisInfo.peeringStatus}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
