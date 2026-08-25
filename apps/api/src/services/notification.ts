import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
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

function readEnvDirect(key: string): string | null {
  try {
    const candidates = [
      resolve(process.cwd(), ".env"),
      resolve(process.cwd(), "apps/api/.env"),
      resolve(process.cwd(), "../../apps/api/.env"),
    ];
    for (const envPath of candidates) {
      if (existsSync(envPath)) {
        const content = readFileSync(envPath, "utf8");
        const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
        if (match && match[1]) {
          return match[1].trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function getResendClient(): Resend | null {
  const apiKey =
    process.env.RESEND_API_KEY ||
    config.RESEND_API_KEY ||
    readEnvDirect("RESEND_API_KEY");
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getResendFrom(): string {
  return (
    process.env.RESEND_FROM ||
    config.RESEND_FROM ||
    readEnvDirect("RESEND_FROM") ||
    "APTI Indonesia <no-reply@openorg.demo.pandanteknik.com>"
  );
}

/**
 * Send transactional email via Resend API (or mock output when not configured)
 */
export async function sendEmailMessage(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const client = getResendClient();
  if (client) {
    try {
      const from = getResendFrom();
      const { data, error } = await client.emails.send({
        from,
        to,
        subject,
        html,
      });
      if (error) {
        process.stderr.write(
          `[Resend Error] Failed to send email to ${to} from ${from}: ${error.message}\n`,
        );
        return false;
      }
      process.stdout.write(
        `[Resend Success] Email sent to ${to} from ${from} (ID: ${data?.id})\n`,
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
 * Send approval & KTA Digital notification (via Email + WhatsApp)
 */
export async function sendApplicationApprovedNotification(
  payload: ApprovalNotificationPayload,
): Promise<void> {
  const { name, email, phone, memberNumber, cardCode, cardUrl, portalUrl } =
    payload;

  const emailSubject = `Selamat! Keanggotaan Anda di APTI Indonesia Telah Disetujui (No. KTA: ${memberNumber})`;
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Keanggotaan Disetujui</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 12px;">
            KEANGGOTAAN RESMI AKTIF
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.3;">Selamat, Permohonan KTA Anda Telah Disetujui! 🎉</h1>
          <p style="margin: 8px 0 0; font-size: 14px; color: #e0f2fe;">Asosiasi Pengusaha & Teknisi Pendingin Indonesia (APTI)</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px 28px;">
          <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Halo <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Kami dengan bangga memberitahukan bahwa permohonan keanggotaan Anda di <strong>APTI Indonesia</strong> telah <strong>diverifikasi dan resmi disetujui</strong> oleh Pengurus.
          </p>

          <!-- KTA Number Highlight Box -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
              Nomor KTA Resmi
            </div>
            <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: 1px; margin-bottom: 8px;">
              ${memberNumber}
            </div>
            <div style="font-size: 13px; color: #64748b;">
              Kode KTA Digital: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${cardCode}</code>
            </div>
          </div>

          <!-- Benefits Bullet Points -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin-bottom: 28px;">
            <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 8px;">✨ Fasilitas & Hak Anggota Aktif:</div>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #15803d; line-height: 1.6;">
              <li>Kartu Tanda Anggota (KTA) Digital resmi ber-QR Code untuk verifikasi publik.</li>
              <li>Akses pelatihan teknis, sertifikasi BNSP, & akumulasi kredit SKP/CPD.</li>
              <li>Pencantuman profil terverifikasi pada Direktori Teknisi Resmi Indonesia.</li>
              <li>Akses musyawarah, workshop, dan jaringan mitra distributor resmi asosiasi.</li>
            </ul>
          </div>

          <!-- CTA Buttons -->
          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="${cardUrl}" style="background: #0284c7; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; margin: 6px; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3);">
              Buka KTA Digital & QR Code
            </a>
            <a href="${portalUrl}" style="background: #0f172a; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; margin: 6px;">
              Masuk Portal Anggota
            </a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
            Tautan langsung verifikasi kartu:<br/>
            <a href="${cardUrl}" style="color: #0284c7; word-break: break-all;">${cardUrl}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 4px;"><strong>Dewan Pimpinan Pusat (DPP) APTI Indonesia</strong></p>
          <p style="margin: 0;">Asosiasi Pengusaha & Teknisi Pendingin Indonesia</p>
        </div>

      </div>
    </body>
    </html>
  `;

  // 1. Send Email via Resend
  await sendEmailMessage(email, emailSubject, emailHtml).catch((err) => {
    process.stderr.write(
      `[Notification Error] Failed to send approval email: ${String(err)}\n`,
    );
  });

  // 2. Send WhatsApp message via WAHA if phone is provided
  if (phone) {
    const waText =
      `🎉 *Selamat Sdr/i ${name}!*\n\n` +
      `Pendaftaran keanggotaan Anda di *APTI Indonesia* telah resmi *DISETUJUI*.\n\n` +
      `📌 *Nomor KTA Resmi:* ${memberNumber}\n` +
      `🪪 *Kode KTA Digital:* ${cardCode}\n\n` +
      `Akses Kartu KTA Digital Anda dengan QR Code verifikasi publik:\n` +
      `👉 ${cardUrl}\n\n` +
      `Masuk ke Portal Anggota untuk memantau kredit SKP dan agenda:\n` +
      `👉 ${portalUrl}\n\n` +
      `Salam hangat,\nPengurus DPP & Sekretariat APTI Indonesia`;

    void sendWhatsAppMessage(phone, waText).catch(() => {});
  }
}
