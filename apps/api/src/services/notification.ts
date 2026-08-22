import { Resend } from "resend";
import { config } from "../config";

const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

export interface VerificationNotificationPayload {
  name: string;
  email: string;
  phone?: string | null;
  token: string;
  verificationUrl: string;
}

export interface ApprovalNotificationPayload {
  name: string;
  email: string;
  phone?: string | null;
  memberNumber: string;
  cardCode: string;
  cardUrl: string;
  portalUrl: string;
}

/**
 * Format Indonesian phone number to international WhatsApp format (e.g. 0812... -> 62812... or +62812... -> 62812...)
 */
export function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = `62${cleaned.slice(1)}`;
  }
  return cleaned;
}

/**
 * Send WhatsApp message using WAHA (WhatsApp HTTP API)
 */
async function sendWhatsAppMessage(
  to: string,
  message: string,
): Promise<boolean> {
  if (!config.WAHA_API_URL) {
    process.stdout.write(
      `[WAHA Mock] To: ${to}\n[WAHA Message]:\n${message}\n---\n`,
    );
    return false;
  }

  const cleanNumber = formatWhatsAppNumber(to);
  const chatId = cleanNumber.includes("@")
    ? cleanNumber
    : `${cleanNumber}@c.us`;

  try {
    const endpoint = `${config.WAHA_API_URL.replace(/\/$/, "")}/api/sendText`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.WAHA_API_KEY) {
      headers["X-Api-Key"] = config.WAHA_API_KEY;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        session: config.WAHA_SESSION || "default",
        chatId,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      process.stderr.write(
        `[WAHA Error] Failed to send WA to ${chatId}: ${response.status} ${errorText}\n`,
      );
      return false;
    }
    return true;
  } catch (error) {
    process.stderr.write(
      `[WAHA Network Error] Could not connect to WAHA server: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    return false;
  }
}

/**
 * Send transactional email via Resend API (or mock output when not configured)
 */
export async function sendEmailMessage(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: config.RESEND_FROM || "onboarding@resend.dev",
        to,
        subject,
        html,
      });
      if (error) {
        process.stderr.write(
          `[Resend Error] Failed to send email to ${to}: ${error.message}\n`,
        );
        return false;
      }
      process.stdout.write(
        `[Resend Success] Email sent to ${to} (ID: ${data?.id})\n`,
      );
      return true;
    } catch (err) {
      process.stderr.write(
        `[Resend Network Error] ${err instanceof Error ? err.message : String(err)}\n`,
      );
      return false;
    }
  }

  // Fallback / Mock
  process.stdout.write(
    `[Email Mock Dispatch] To: ${to} | Subject: ${subject}\n[Email Body]:\n${html.replace(/<[^>]+>/g, " ").slice(0, 300)}...\n---\n`,
  );
  return true;
}

/**
 * Send email validation message to user upon registration (via Email + WhatsApp)
 */
export async function sendEmailVerificationNotification(
  payload: VerificationNotificationPayload,
): Promise<void> {
  const { name, email, phone, token, verificationUrl } = payload;

  const emailSubject = "Verifikasi Alamat Email Anda - APTI Indonesia";
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0;">Verifikasi Email Pendaftaran Anggota</h2>
      <p>Halo <strong>${name}</strong>,</p>
      <p>Terima kasih telah mendaftar di <strong>Asosiasi Praktisi Tata Udara & Pendingin Indonesia (APTI)</strong>.</p>
      <p>Untuk memastikan keabsahan akun dan mencegah penyalahgunaan/spam, silakan klik tombol di bawah untuk memverifikasi email Anda:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationUrl}" style="background: #0284c7; color: #ffffff; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">Verifikasi Email Saya</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">Atau salin tautan berikut ke peramban Anda:<br/><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p style="font-size: 13px; color: #64748b;">Kode verifikasi token: <code>${token}</code> (Berlaku selama 24 jam).</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">Jika Anda tidak merasa mendaftar di OpenOrg / APTI, silakan abaikan email ini.</p>
    </div>
  `;

  // 1. Send Email
  void sendEmailMessage(email, emailSubject, emailHtml).catch(() => {});

  // 2. Send WhatsApp message if phone is provided
  if (phone) {
    const waText =
      `Halo Sdr/i *${name}*,\n\n` +
      `Terima kasih telah mendaftar di *APTI Indonesia*.\n\n` +
      `Untuk memverifikasi email Anda dan mengaktifkan permohonan keanggotaan, silakan klik tautan verifikasi berikut:\n` +
      `👉 ${verificationUrl}\n\n` +
      `Kode verifikasi: *${token}*\n\n` +
      `Setelah email terverifikasi, data Anda akan segera diproses oleh tim sekretariat.`;

    void sendWhatsAppMessage(phone, waText).catch(() => {});
  }
}

/**
 * Send approval & KTA Digital notification (via WhatsApp + Email)
 */
export async function sendApplicationApprovedNotification(
  payload: ApprovalNotificationPayload,
): Promise<void> {
  const { name, email, phone, memberNumber, cardCode, cardUrl, portalUrl } =
    payload;

  const emailSubject =
    "Selamat! Keanggotaan Anda di APTI Indonesia Telah Disetujui (KTA Digital)";
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #15803d; margin-top: 0;">🎉 Pendaftaran Keanggotaan Disetujui!</h2>
      <p>Halo <strong>${name}</strong>,</p>
      <p>Selamat! Permohonan keanggotaan Anda di <strong>Asosiasi Praktisi Tata Udara & Pendingin Indonesia (APTI)</strong> telah resmi disetujui dan diverifikasi.</p>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Nomor Registrasi Anggota:</strong> <span style="color: #0284c7; font-weight: bold;">${memberNumber}</span></p>
        <p style="margin: 4px 0;"><strong>Kode KTA Digital:</strong> <code>${cardCode}</code></p>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${cardUrl}" style="background: #166534; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 12px;">Lihat KTA Digital & QR Code</a>
        <a href="${portalUrl}" style="background: #0284c7; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">Masuk Portal Anggota</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">Simpan nomor anggota dan KTA Digital Anda untuk keperluan verifikasi kompetensi, keikutsertaan workshop, dan fasilitas asosiasi.</p>
    </div>
  `;

  // 1. Send Email
  void sendEmailMessage(email, emailSubject, emailHtml).catch(() => {});

  // 2. Send WhatsApp message via WAHA
  if (phone) {
    const waText =
      `🎉 *Selamat Sdr/i ${name}!*\n\n` +
      `Pendaftaran keanggotaan Anda di *APTI Indonesia* telah resmi *DISETUJUI*.\n\n` +
      `📌 *No. Anggota:* ${memberNumber}\n` +
      `🪪 *Kode KTA:* ${cardCode}\n\n` +
      `Akses Kartu KTA Digital Anda dengan QR Code verifikasi:\n` +
      `👉 ${cardUrl}\n\n` +
      `Masuk ke Portal Anggota untuk memantau kredit SKP dan agenda:\n` +
      `👉 ${portalUrl}\n\n` +
      `Salam hangat,\nPengurus DPP & Sekretariat APTI Indonesia`;

    void sendWhatsAppMessage(phone, waText).catch(() => {});
  }
}
