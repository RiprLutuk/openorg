"use client";

import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Copy,
  Droplets,
  ExternalLink,
  Flame,
  Gauge,
  HelpCircle,
  Info,
  Maximize2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DynamicBottomCta } from "@/components/dynamic-bottom-cta";

interface RefrigerantData {
  name: string;
  chemicalFormula: string;
  type: string;
  suctionPsi: string;
  dischargePsi: string;
  gwp: number;
  odp: number;
  oilType: string;
  safetyClass:
    | "A1 (Non-Flammable)"
    | "A2L (Mildly Flammable)"
    | "A3 (Flammable Eco)";
  statusKlhk: string;
  description: string;
  recommendedUse: string;
}

const REFRIGERANTS: Record<string, RefrigerantData> = {
  R32: {
    name: "R-32 (Difluoromethane)",
    chemicalFormula: "CH₂F₂",
    type: "HFC Murni",
    suctionPsi: "115 - 135 PSI",
    dischargePsi: "320 - 380 PSI",
    gwp: 675,
    odp: 0,
    oilType: "Synthetic POE (Polyolester)",
    safetyClass: "A2L (Mildly Flammable)",
    statusKlhk: "Standar Utama AC Residensial Ramah Ozon",
    description:
      "Refrigeran generasi baru dengan efisiensi volumetrik tinggi, kapasitas pendinginan 1.5x lebih besar dari R410A, dan GWP 1/3 lebih rendah.",
    recommendedUse:
      "AC Split Inverter & Non-Inverter Residensial, Komersial Ringan",
  },
  R410A: {
    name: "R-410A (Blend R32/R125)",
    chemicalFormula: "50% CH₂F₂ / 50% CHF₂CF₃",
    type: "HFC Near-Azeotropic",
    suctionPsi: "110 - 130 PSI",
    dischargePsi: "330 - 390 PSI",
    gwp: 2088,
    odp: 0,
    oilType: "Synthetic POE",
    safetyClass: "A1 (Non-Flammable)",
    statusKlhk: "Dibatasi Bertahap Menuju Rendah GWP",
    description:
      "Refrigeran tekanan tinggi bebas klorin. Memerlukan ketebalan pipa tembaga minimal 0.61 mm (Inverter Grade) untuk menahan tekanan kerja.",
    recommendedUse: "VRV / VRF Central, AC Cassette, Ducted Split",
  },
  R290: {
    name: "R-290 (Propane Grade K3)",
    chemicalFormula: "C₃H₈",
    type: "Hydrocarbon Alami (HC)",
    suctionPsi: "65 - 80 PSI",
    dischargePsi: "200 - 240 PSI",
    gwp: 3,
    odp: 0,
    oilType: "Mineral Oil / Alkylbenzene / POE",
    safetyClass: "A3 (Flammable Eco)",
    statusKlhk: "Masa Depan Eco-Refrigerant Mandiri (Zero ODP / Ultra Low GWP)",
    description:
      "Refrigeran hidrokarbon murni dengan beban pengisian hanya 40-50% dari R22. Wajib menggunakan peralatan kerja antistatis dan bersertifikasi BNSP R290.",
    recommendedUse: "AC Portable, Chiller Komersial Tertutup, Cold Showcase",
  },
  R134a: {
    name: "R-134a (Tetrafluoroethane)",
    chemicalFormula: "CH₂FCF₃",
    type: "HFC Murni",
    suctionPsi: "25 - 45 PSI",
    dischargePsi: "150 - 190 PSI",
    gwp: 1430,
    odp: 0,
    oilType: "Synthetic POE / PAG",
    safetyClass: "A1 (Non-Flammable)",
    statusKlhk: "Digunakan Khusus Suhu Sedang & Cold Storage",
    description:
      "Standar industri untuk pendingin temperatur menengah (chilled), evaporator kulkas rumah tangga, dan sistem pendingin mobil.",
    recommendedUse:
      "Kulkas Rumah Tangga, Showcase, Cold Storage Sayur/Buah, AC Mobil",
  },
  R22: {
    name: "R-22 (Chlorodifluoromethane)",
    chemicalFormula: "CHClF₂",
    type: "HCFC (Mengandung Klorin)",
    suctionPsi: "65 - 75 PSI",
    dischargePsi: "220 - 260 PSI",
    gwp: 1810,
    odp: 0.055,
    oilType: "Mineral Oil (SUNISO 3GS/4GS)",
    safetyClass: "A1 (Non-Flammable)",
    statusKlhk: "Dilarang Impor & Produksi Unit Baru (Permen LHK)",
    description:
      "Refrigeran lama yang merusak lapisan ozon. Hanya diperbolehkan untuk servis unit eksisting menggunakan freon daur ulang resmi.",
    recommendedUse: "Servis Unit AC Lama (Transisi ke R32/R290)",
  },
  R404A: {
    name: "R-404A (Blend R125/R143a/R134a)",
    chemicalFormula: "44% R125 / 52% R143a / 4% R134a",
    type: "HFC Near-Azeotropic",
    suctionPsi: "18 - 30 PSI (Low Temp)",
    dischargePsi: "240 - 290 PSI",
    gwp: 3922,
    odp: 0,
    oilType: "Synthetic POE",
    safetyClass: "A1 (Non-Flammable)",
    statusKlhk: "Fase Penurunan Kuota (High GWP)",
    description:
      "Refrigeran khusus temperatur rendah (freezing/deep freeze). Memiliki kapasitas pendinginan tinggi pada suhu evaporator -20°C hingga -40°C.",
    recommendedUse:
      "Blast Freezer, Cold Storage Daging/Ikan, Supermarket Rack System",
  },
};

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<"pk" | "refrigerants" | "sop">(
    "pk",
  );

  // Calculator State
  const [length, setLength] = useState<number>(4);
  const [width, setWidth] = useState<number>(3);
  const [height, setHeight] = useState<number>(3);
  const [occupants, setOccupants] = useState<number>(2);
  const [sunExposure, setSunExposure] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [electronics, setElectronics] = useState<number>(1);
  const [roomType, setRoomType] = useState<
    "bedroom" | "living" | "office" | "server"
  >("bedroom");

  // Selected Refrigerant
  const [selectedRef, setSelectedRef] = useState<string>("R32");

  // Calculation Logic (Indonesian Standard HVAC Sizing)
  // Base: Area * 500 BTU (Standard Indonesian Tropical Climate)
  const area = length * width;
  const volume = area * height;

  // Base BTU calculation:
  // Standard factor: 500 BTU/m² for normal room, 600 for living, 700 for office, 900 for server
  const roomFactors = {
    bedroom: 500,
    living: 600,
    office: 700,
    server: 950,
  };

  const sunMultipliers = {
    low: 1.0, // Terlindung / Hadap Timur
    medium: 1.1, // Normal / Jendela Standar
    high: 1.25, // Hadap Barat / Lantai Atas Langsung Dak Beton
  };

  const baseBtu = area * roomFactors[roomType];
  const ceilingAdjustment = height > 3 ? (height - 3) * area * 120 : 0;
  const occupantHeat = (occupants - 1 > 0 ? occupants - 1 : 0) * 500;
  const electronicsHeat = electronics * 400;

  const totalRawBtu = Math.round(
    (baseBtu + ceilingAdjustment + occupantHeat + electronicsHeat) *
      sunMultipliers[sunExposure],
  );

  // Determine Recommended PK
  const getPkRecommendation = (btu: number) => {
    if (btu <= 5500)
      return {
        pk: "½ PK (0.5 PK)",
        btuRating: "5.000 BTU/h",
        wattEstimate: "350 - 410 W",
        inverterWatt: "180 - 380 W",
      };
    if (btu <= 7500)
      return {
        pk: "¾ PK (0.75 PK)",
        btuRating: "7.000 BTU/h",
        wattEstimate: "530 - 620 W",
        inverterWatt: "220 - 580 W",
      };
    if (btu <= 10000)
      return {
        pk: "1 PK",
        btuRating: "9.000 BTU/h",
        wattEstimate: "720 - 840 W",
        inverterWatt: "280 - 750 W",
      };
    if (btu <= 13500)
      return {
        pk: "1.5 PK",
        btuRating: "12.000 BTU/h",
        wattEstimate: "1.020 - 1.180 W",
        inverterWatt: "350 - 1.050 W",
      };
    if (btu <= 19500)
      return {
        pk: "2 PK",
        btuRating: "18.000 BTU/h",
        wattEstimate: "1.520 - 1.780 W",
        inverterWatt: "450 - 1.600 W",
      };
    if (btu <= 26000)
      return {
        pk: "2.5 PK",
        btuRating: "24.000 BTU/h",
        wattEstimate: "1.980 - 2.300 W",
        inverterWatt: "580 - 2.100 W",
      };
    return {
      pk: "3+ PK / Multi-Split",
      btuRating: "28.000+ BTU/h",
      wattEstimate: "2.500+ W",
      inverterWatt: "800 - 2.800 W",
    };
  };

  const recommendation = getPkRecommendation(totalRawBtu);
  const activeRefrigerant: RefrigerantData =
    REFRIGERANTS[selectedRef] ?? REFRIGERANTS.R32!;

  return (
    <div className="calculator-page-suite">
      {/* 1. Flagship Dark Hero Header */}
      <header className="tech-hero calc-hero-refined">
        <div className="wrap tech-hero-inner">
          <div className="tech-hero-pill">
            <Calculator size={15} color="#38bdf8" />
            <span>PORTAL PERALATAN TEKNIS & STANDAR BEBAN HVAC/R</span>
          </div>

          <h1 className="tech-hero-title">
            Kalkulator Beban AC &{" "}
            <span className="text-gradient">Data Teknis Refrigeran</span>
          </h1>

          <p className="tech-hero-lead">
            Alat bantu teknisi profesional dan konsumen untuk menghitung
            kapasitas PK AC yang presisi sesuai iklim tropis Indonesia, tabel
            tekanan freon SNI, serta SOP keselamatan kerja K3.
          </p>

          {/* Impact Metrics Bar */}
          <div className="tech-hero-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Gauge size={22} color="#38bdf8" />
              </div>
              <div>
                <strong>Standar Tropis SNI</strong>
                <small>Beban Kalor Presisi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Droplets size={22} color="#34d399" />
              </div>
              <div>
                <strong>6 Jenis Freon Resmi</strong>
                <small>Tekanan & K3 Klasifikasi</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Wind size={22} color="#818cf8" />
              </div>
              <div>
                <strong>Target Vakum &lt;500µ</strong>
                <small>SOP Bebas Udara & Lembab</small>
              </div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-icon">
                <Zap size={22} color="#f59e0b" />
              </div>
              <div>
                <strong>Estimasi Daya Hemat</strong>
                <small>Kalkulasi Watt Inverter</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Interactive Workspace Section */}
      <section className="tech-body section-space">
        <div className="wrap">
          {/* Workspace Tabs */}
          <div className="directory-controls-row">
            <div className="directory-cat-pills">
              <button
                type="button"
                className={`dir-cat-btn ${activeTab === "pk" ? "active" : ""}`}
                onClick={() => setActiveTab("pk")}
              >
                <Calculator size={15} />
                <span>Kalkulator PK & BTU/h</span>
              </button>

              <button
                type="button"
                className={`dir-cat-btn ${activeTab === "refrigerants" ? "active" : ""}`}
                onClick={() => setActiveTab("refrigerants")}
              >
                <Droplets size={15} />
                <span>Database Freon & Tekanan</span>
              </button>

              <button
                type="button"
                className={`dir-cat-btn ${activeTab === "sop" ? "active" : ""}`}
                onClick={() => setActiveTab("sop")}
              >
                <ShieldCheck size={15} />
                <span>Standar SOP Vakum & K3</span>
              </button>
            </div>
          </div>

          {/* TAB 1: KALKULATOR PK AC */}
          {activeTab === "pk" && (
            <div className="calc-workspace-grid slide-in-up">
              {/* Input Form Panel */}
              <div className="calc-form-card">
                <div className="calc-card-header">
                  <div className="calc-header-title">
                    <Maximize2 size={20} color="#0284c7" />
                    <h3>Parameter Ruangan & Beban Panas</h3>
                  </div>
                  <button
                    type="button"
                    className="calc-reset-btn"
                    onClick={() => {
                      setLength(4);
                      setWidth(3);
                      setHeight(3);
                      setOccupants(2);
                      setSunExposure("medium");
                      setElectronics(1);
                      setRoomType("bedroom");
                    }}
                    title="Reset form ke pengaturan standar"
                  >
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="calc-inputs-grid">
                  {/* Dimensi Ruangan */}
                  <div className="calc-field-group">
                    <label>Panjang Ruangan (meter)</label>
                    <div className="calc-number-input">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        step="0.5"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value) || 1)}
                      />
                      <span>meter</span>
                    </div>
                  </div>

                  <div className="calc-field-group">
                    <label>Lebar Ruangan (meter)</label>
                    <div className="calc-number-input">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        step="0.5"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value) || 1)}
                      />
                      <span>meter</span>
                    </div>
                  </div>

                  <div className="calc-field-group">
                    <label>Tinggi Plafon (meter)</label>
                    <div className="calc-number-input">
                      <input
                        type="number"
                        min="2"
                        max="8"
                        step="0.1"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value) || 2)}
                      />
                      <span>meter</span>
                    </div>
                  </div>

                  {/* Jenis Ruangan */}
                  <div className="calc-field-group">
                    <label>Fungsi / Jenis Ruangan</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value as any)}
                      className="calc-select-input"
                    >
                      <option value="bedroom">
                        Kamar Tidur (Normal - 500 BTU/m²)
                      </option>
                      <option value="living">
                        Ruang Tamu / Keluarga (600 BTU/m²)
                      </option>
                      <option value="office">
                        Kantor / Ruang Kerja (700 BTU/m²)
                      </option>
                      <option value="server">
                        Server Room / Komputer (950 BTU/m²)
                      </option>
                    </select>
                  </div>

                  {/* Jumlah Orang */}
                  <div className="calc-field-group">
                    <label>Jumlah Penghuni Rutin</label>
                    <div className="calc-number-input">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={occupants}
                        onChange={(e) =>
                          setOccupants(Number(e.target.value) || 1)
                        }
                      />
                      <span>orang</span>
                    </div>
                  </div>

                  {/* Paparan Sinar Matahari */}
                  <div className="calc-field-group">
                    <label>Paparan Sinar Matahari</label>
                    <select
                      value={sunExposure}
                      onChange={(e) => setSunExposure(e.target.value as any)}
                      className="calc-select-input"
                    >
                      <option value="low">
                        Terlindung / Menghadap Timur (+0%)
                      </option>
                      <option value="medium">
                        Normal / Jendela Sedang (+10%)
                      </option>
                      <option value="high">
                        Hadap Barat / Langsung Dak Beton (+25%)
                      </option>
                    </select>
                  </div>

                  {/* Elektronik Panas */}
                  <div className="calc-field-group">
                    <label>Perangkat Elektronik Aktif (PC/TV/Dispenser)</label>
                    <div className="calc-number-input">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={electronics}
                        onChange={(e) =>
                          setElectronics(Number(e.target.value) || 0)
                        }
                      />
                      <span>unit</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Recommendation Card */}
              <div className="calc-result-card">
                <div className="calc-result-badge">
                  <Sparkles size={16} />
                  <span>HASIL KALKULASI REKOMENDASI ASOSIASI</span>
                </div>

                <div className="calc-hero-pk">
                  <small>Kapasitas AC Disarankan:</small>
                  <h2>{recommendation.pk}</h2>
                  <span className="calc-btu-chip">
                    {totalRawBtu.toLocaleString("id-ID")} BTU/h Diperlukan
                  </span>
                </div>

                <div className="calc-specs-list">
                  <div className="calc-spec-item">
                    <small>Luas & Volume Ruangan</small>
                    <strong>
                      {area.toFixed(1)} m² ({volume.toFixed(1)} m³)
                    </strong>
                  </div>

                  <div className="calc-spec-item">
                    <small>Standar Output Unit AC</small>
                    <strong>{recommendation.btuRating}</strong>
                  </div>

                  <div className="calc-spec-item">
                    <small>Estimasi Daya (AC Standar/Low Watt)</small>
                    <strong>{recommendation.wattEstimate}</strong>
                  </div>

                  <div className="calc-spec-item">
                    <small>Estimasi Daya (AC Inverter Hemat Energi)</small>
                    <strong style={{ color: "#16a34a" }}>
                      {recommendation.inverterWatt}
                    </strong>
                  </div>
                </div>

                {/* Practical Advice Note */}
                <div className="calc-advice-box">
                  <Info size={18} color="#0284c7" />
                  <p>
                    {totalRawBtu > 18000
                      ? "Ruangan besar disarankan menggunakan 2 unit AC terpisah atau sistem Multi-Split agar distribusi hembusan dingin lebih merata."
                      : "Gunakan pipa tembaga tebal minimum 0.61mm (grade Inverter) dan lakukan proses vakum minimum 15 menit untuk garansi kompresor optimal."}
                  </p>
                </div>

                {/* Action CTA */}
                <div className="calc-result-actions">
                  <Link
                    href="/technicians"
                    className="button primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <Users size={16} />
                    <span>Cari Teknisi Terdekat untuk Pemasangan</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE REFRIGERAN (FREON) */}
          {activeTab === "refrigerants" && (
            <div className="refrigerants-suite slide-in-up">
              {/* Refrigerant Selector Chips */}
              <div className="ref-selector-bar">
                {Object.keys(REFRIGERANTS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`ref-tab-btn ${selectedRef === key ? "active" : ""}`}
                    onClick={() => setSelectedRef(key)}
                  >
                    <span>{key}</span>
                    <small>{REFRIGERANTS[key]?.type}</small>
                  </button>
                ))}
              </div>

              {/* Dossier Card for Selected Refrigerant */}
              <div className="ref-dossier-card">
                <div className="ref-dossier-header">
                  <div>
                    <span className="ref-category-tag">
                      {activeRefrigerant.type}
                    </span>
                    <h2>{activeRefrigerant.name}</h2>
                    <p className="ref-formula">
                      Formula Kimia:{" "}
                      <strong>{activeRefrigerant.chemicalFormula}</strong>
                    </p>
                  </div>

                  <div
                    className={`ref-safety-badge ${activeRefrigerant.safetyClass.includes("A1") ? "safe-a1" : activeRefrigerant.safetyClass.includes("A2L") ? "warn-a2l" : "flame-a3"}`}
                  >
                    <Flame size={15} />
                    <span>{activeRefrigerant.safetyClass}</span>
                  </div>
                </div>

                <div className="ref-specs-grid">
                  <div className="ref-spec-box">
                    <small>Tekanan Suction (Tekanan Rendah)</small>
                    <strong style={{ color: "#0284c7" }}>
                      {activeRefrigerant.suctionPsi}
                    </strong>
                  </div>

                  <div className="ref-spec-box">
                    <small>Tekanan Discharge (Tekanan Tinggi)</small>
                    <strong style={{ color: "#d97706" }}>
                      {activeRefrigerant.dischargePsi}
                    </strong>
                  </div>

                  <div className="ref-spec-box">
                    <small>Potensi Pemanasan Global (GWP)</small>
                    <strong>
                      {activeRefrigerant.gwp}{" "}
                      {activeRefrigerant.gwp < 10 ? "(Ultra Rendah)" : ""}
                    </strong>
                  </div>

                  <div className="ref-spec-box">
                    <small>Potensi Perusak Ozon (ODP)</small>
                    <strong
                      style={{
                        color:
                          activeRefrigerant.odp === 0 ? "#16a34a" : "#ef4444",
                      }}
                    >
                      {activeRefrigerant.odp === 0
                        ? "0 (Bebas Ozon)"
                        : activeRefrigerant.odp}
                    </strong>
                  </div>

                  <div className="ref-spec-box">
                    <small>Jenis Oli Kompresor Wajib</small>
                    <strong>{activeRefrigerant.oilType}</strong>
                  </div>

                  <div className="ref-spec-box">
                    <small>Peruntukan Sistem Utama</small>
                    <strong>{activeRefrigerant.recommendedUse}</strong>
                  </div>
                </div>

                <div className="ref-description-box">
                  <h4>Karakteristik & Regulasi KLHK:</h4>
                  <p>{activeRefrigerant.description}</p>
                  <div className="ref-klhk-status">
                    <ShieldCheck size={16} color="#16a34a" />
                    <span>
                      Status Regulasi:{" "}
                      <strong>{activeRefrigerant.statusKlhk}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STANDAR SOP VAKUM & K3 */}
          {activeTab === "sop" && (
            <div className="sop-workspace-grid slide-in-up">
              <div className="sop-card">
                <div className="sop-badge">
                  <Gauge size={16} />
                  <span>SOP WAJIB INSTALASI AC</span>
                </div>
                <h3>Prosedur Standar Pemvakuman Pipa (&lt;500 Micron)</h3>
                <p>
                  Sesuai AD/ART APTI dan standar garansi prinsipal AC nasional,
                  pemvakuman pipa pendingin adalah wajib untuk membuang uap air
                  (moisture) dan gas non-kondensabel sebelum freon dilepaskan.
                </p>

                <div className="sop-steps-list">
                  <div className="sop-step-item">
                    <span className="step-num">1</span>
                    <div>
                      <strong>Gunakan Pompa Vakum Dual Stage</strong>
                      <p>
                        Kapasitas minimum 2 CFM dengan oli vakum jernih. Jangan
                        gunakan kompresor kulkas bekas sebagai alat vakum.
                      </p>
                    </div>
                  </div>

                  <div className="sop-step-item">
                    <span className="step-num">2</span>
                    <div>
                      <strong>Target Tekanan Di Bawah 500 Micron</strong>
                      <p>
                        Gunakan micron gauge digital. Pastikan jarum manifold
                        analog mencapai batas vakum maksimal (-30 inHg) selama
                        minimal 15-20 menit.
                      </p>
                    </div>
                  </div>

                  <div className="sop-step-item">
                    <span className="step-num">3</span>
                    <div>
                      <strong>Uji Tahan Vakum (Vacuum Hold Test)</strong>
                      <p>
                        Tutup kran manifold dan matikan pompa vakum. Amati jarum
                        selama 5-10 menit. Jika jarum naik kembali ke 0, berarti
                        terjadi kebocoran pada flaring atau sambungan nepel.
                      </p>
                    </div>
                  </div>

                  <div className="sop-step-item">
                    <span className="step-num">4</span>
                    <div>
                      <strong>Buka Valve & Periksa Kebocoran Freon</strong>
                      <p>
                        Buka valve kran outdoor L-key, lalu lakukan deteksi busa
                        sabun atau electronic leak detector pada setiap
                        sambungan flaring.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* K3 Safety Rules */}
              <div className="sop-k3-card">
                <div className="sop-badge warning">
                  <Flame size={16} />
                  <span>STANDAR K3 KESELAMATAN FREON</span>
                </div>
                <h3>Protokol K3 Freon Mudah Terbakar (R32 / R290)</h3>

                <ul className="sop-k3-list">
                  <li>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <span>
                      Dilarang menyalakan api las/brazing saat sistem pendingin
                      masih terisi freon R32 atau R290.
                    </span>
                  </li>
                  <li>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <span>
                      Selalu gunakan gas Nitrogen (N2) murni sebagai purging
                      saat proses pengelasan pipa tembaga.
                    </span>
                  </li>
                  <li>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <span>
                      Pastikan sirkulasi udara dan ventilasi ruangan terbuka
                      saat melakukan recovery atau pengisian refrigeran.
                    </span>
                  </li>
                  <li>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <span>
                      Gunakan timbangan digital (charging scale) presisi untuk
                      memastikan takaran freon sesuai nameplate pabrikan (gram).
                    </span>
                  </li>
                </ul>

                <div className="sop-k3-footer">
                  <Link
                    href="/events"
                    className="button secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <span>Ikuti Workshop Sertifikasi K3 & BNSP</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <DynamicBottomCta
        organizationName="APTI Indonesia"
        guestTitle="Perlu Bantuan Konsultasi Teknis & Sertifikasi?"
        guestDescription="Konsultasikan permasalahan teknis pendingin atau daftarkan bengkel Anda untuk memperoleh pelatihan resmi SOP standar nasional."
        guestPrimaryCta={{ label: "Daftar Anggota Teknisi", href: "/join" }}
        guestSecondaryCta={{
          label: "Cari Teknisi Bersertifikat",
          href: "/technicians",
        }}
        memberTitle="Akses Repositori Manual Book & Standar SOP"
        memberDescription="Anggota resmi KTA memiliki akses penuh ke dokumen panduan servis prinsipal AC dan modul pelatihan lanjutan."
        memberPrimaryCta={{ label: "Buka Portal Anggota", href: "/member" }}
        memberSecondaryCta={{ label: "Regulasi & SE", href: "/regulations" }}
      />
    </div>
  );
}
