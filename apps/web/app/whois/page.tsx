import type { Metadata } from "next";
import { getPublicSite } from "../../lib/api";
import { Globe2, Search, Server, Activity, Cpu, ShieldCheck } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: `Pencarian WHOIS IP/ASN & Traffic IIX - ${site.organization.name}`,
    description: "Layanan lookup WHOIS alokasi IP address, AS Number (ASN), dan statistik traffic peering IIX nasional.",
  };
}

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

async function getWhois(): Promise<WhoisData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/v1/public/whois`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function WhoisPage() {
  const site = await getPublicSite();
  const whoisInfo = await getWhois();

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
            Mesin query publik untuk memeriksa alokasi blok IPv4/IPv6, Autonomous System Number (ASN), serta pemantauan traffic internet exchange nasional.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="whois-body">
        <div className="wrap">
          <div className="whois-card-container">
            {/* Search Input Box */}
            <div className="whois-search-box">
              <div className="search-input-wrap">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Masukkan IP Address (misal 103.28.144.1) atau Nomor ASN (AS134371)..."
                  defaultValue="AS134371"
                  className="whois-input"
                />
              </div>
              <button type="button" className="btn-search-whois">
                Cek WHOIS
              </button>
            </div>

            {/* Simulated WHOIS Output */}
            {whoisInfo && (
              <div className="whois-output-card">
                <div className="output-header">
                  <Server size={20} />
                  <h3>Hasil Lookup WHOIS: {whoisInfo.query}</h3>
                </div>
                <div className="output-grid">
                  <div className="output-item">
                    <span className="item-label">Autonomous System Number (ASN)</span>
                    <strong className="item-value">{whoisInfo.asn}</strong>
                  </div>
                  <div className="output-item">
                    <span className="item-label">Organisasi Terdaftar</span>
                    <strong className="item-value">{whoisInfo.organization}</strong>
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
                    <strong className="item-value traffic">{whoisInfo.iixTrafficPeakGbps}</strong>
                  </div>
                  <div className="output-item">
                    <span className="item-label">Status Koneksi Node</span>
                    <strong className="item-value">{whoisInfo.peeringStatus}</strong>
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
