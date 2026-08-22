import QRCode from "qrcode";

export interface KtaCardRenderData {
  memberName: string;
  memberNumber: string;
  cardCode: string;
  unitName?: string | null;
  issuedAt: string;
  expiresAt?: string | null;
  orgName: string;
  avatarUrl?: string | null;
}

/**
 * Generates an ultra-crisp, high-DPI (300 DPI equivalent) digital membership card (CR-80 standard format)
 * on an HTML5 canvas and triggers an automatic PNG download.
 */
export async function downloadKtaCard(data: KtaCardRenderData): Promise<void> {
  const width = 1012;
  const height = 638;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not initialize 2D canvas context");
  }

  // 1. Draw Card Background with Rounded Corners
  const radius = 28;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, height - radius);
  ctx.quadraticCurveTo(width, height, width - radius, height);
  ctx.lineTo(radius, height);
  ctx.quadraticCurveTo(0, height, 0, height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();

  // Premium Deep Blue Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#091428");
  gradient.addColorStop(0.4, "#0f172a");
  gradient.addColorStop(0.8, "#1e293b");
  gradient.addColorStop(1, "#0284c7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Geometric Security Grid Lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.stroke();
  }

  // Inner Subtle Golden Stroke Border
  ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // 2. Header Section
  // Organization Badge / Pill
  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("KARTU TANDA ANGGOTA RESMI (DIGITAL ID)", 40, 52);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  const orgTitle = (data.orgName || "APTI INDONESIA").toUpperCase();
  ctx.fillText(orgTitle, 40, 88);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "Asosiasi Praktisi Tata Udara & Pendingin Indonesia · Official Credential Registry",
    40,
    110,
  );

  // Divider Line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 130);
  ctx.lineTo(width - 40, 130);
  ctx.stroke();

  // 3. Member Photo (Left Column)
  const photoX = 40;
  const photoY = 155;
  const photoW = 180;
  const photoH = 220;

  // Photo Frame Shadow & Background
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 14);
  ctx.fill();
  ctx.stroke();

  // Draw Avatar or Initials
  let photoDrawn = false;
  const avatarUrl = data.avatarUrl;
  if (avatarUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = avatarUrl;
      });
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX + 2, photoY + 2, photoW - 4, photoH - 4, 12);
      ctx.clip();
      ctx.drawImage(img, photoX, photoY, photoW, photoH);
      ctx.restore();
      photoDrawn = true;
    } catch {
      photoDrawn = false;
    }
  }

  if (!photoDrawn) {
    // Draw Initials
    const initials = data.memberName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 56px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(initials, photoX + photoW / 2, photoY + photoH / 2 + 18);
    ctx.textAlign = "left";
  }

  // Active Status Pill under photo
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.roundRect(photoX, photoY + photoH + 16, photoW, 36, 18);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("● ANGGOTA AKTIF", photoX + photoW / 2, photoY + photoH + 39);
  ctx.textAlign = "left";

  // 4. Middle Column (Member Details)
  const detailX = 260;
  let currentY = 175;

  // Field: Member Name
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("NAMA LENGKAP / FULL NAME", detailX, currentY);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  ctx.fillText(data.memberName, detailX, currentY + 30);

  currentY += 75;

  // Field: Member Number
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("NOMOR REGISTRASI ANGGOTA (KTA)", detailX, currentY);

  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 24px monospace";
  ctx.fillText(data.memberNumber || data.cardCode, detailX, currentY + 28);

  currentY += 70;

  // Field: Unit / Region
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("UNIT ORGANISASI / WILAYAH", detailX, currentY);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 18px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    data.unitName || "DPD APTI / Seluruh Indonesia",
    detailX,
    currentY + 24,
  );

  currentY += 65;

  // Dates (Issued & Validity)
  const issuedText = new Date(data.issuedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const expiryText = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Seumur Hidup / Tidak Terbatas";

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.fillText("TERBIT: " + issuedText.toUpperCase(), detailX, currentY);
  ctx.fillText("BERLAKU: " + expiryText.toUpperCase(), detailX + 260, currentY);

  // 5. Right Column (QR Code for Live Verification)
  const qrBoxX = width - 220;
  const qrBoxY = 160;
  const qrBoxSize = 180;

  // QR Frame Box
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 14);
  ctx.fill();

  // Generate and draw QR Code
  const verifyUrl = `${window.location.origin}/verify?code=${encodeURIComponent(data.cardCode)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: qrBoxSize - 24,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  const qrImg = new Image();
  await new Promise<void>((resolve) => {
    qrImg.onload = () => resolve();
    qrImg.src = qrDataUrl;
  });
  ctx.drawImage(
    qrImg,
    qrBoxX + 12,
    qrBoxY + 12,
    qrBoxSize - 24,
    qrBoxSize - 24,
  );

  // QR Code Subtitle
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "SCAN UNTUK VERIFIKASI",
    qrBoxX + qrBoxSize / 2,
    qrBoxY + qrBoxSize + 22,
  );

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px monospace";
  ctx.fillText(data.cardCode, qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 40);
  ctx.textAlign = "left";

  // 6. Bottom Security Ribbon & Verification Footer
  const footerY = height - 55;
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(0, footerY, width, 55);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(width, footerY);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "🔒 Dokumen digital resmi dan sah ini diterbitkan secara elektronik melalui sistem ComplyFlow OpenOrg.",
    40,
    footerY + 32,
  );

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "right";
  ctx.fillText("SECURE DIGITAL WATERMARK", width - 40, footerY + 32);
  ctx.textAlign = "left";

  ctx.restore();

  // 7. Trigger Direct Download
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  const safeFileName = `KTA-${data.memberNumber || data.cardCode}-${data.memberName.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
  link.download = safeFileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
