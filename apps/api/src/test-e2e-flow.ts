import { eq, or } from "drizzle-orm";
import { buildApp } from "./app";
import { db } from "./db/client";
import {
  memberAccounts,
  memberApplications,
  members,
  membershipCards,
} from "./db/schema";
import { hashMemberSessionToken } from "./plugins/member-auth";

async function runE2ETest() {
  console.log("=================================================");
  console.log(
    "🚀 STARTING E2E TEST: REGISTER -> VERIFY -> LOGIN -> APPROVE -> KTA",
  );
  console.log("=================================================\n");

  const app = await buildApp();
  const testEmail = "dew.i850195@gmail.com";
  const testPassword = "Password123!";
  const testName = "Dewi Lestari";
  const testPhone = "+6281234567890";

  // Clean up any existing test user with this email or phone first
  console.log(
    `🧹 Cleaning up previous test data for ${testEmail} / ${testPhone}...`,
  );
  await db
    .delete(memberApplications)
    .where(eq(memberApplications.email, testEmail));
  await db.delete(memberAccounts).where(eq(memberAccounts.email, testEmail));
  await db
    .delete(members)
    .where(or(eq(members.email, testEmail), eq(members.phone, testPhone)));
  console.log("✅ Cleanup done.\n");

  // -------------------------------------------------------------
  // STEP 1: REGISTER MEMBER
  // -------------------------------------------------------------
  console.log(
    "Step 1: Pendaftaran Anggota Baru (POST /v1/public/membership/register)...",
  );
  const regRes = await app.inject({
    method: "POST",
    url: "/v1/public/membership/register",
    payload: {
      name: testName,
      email: testEmail,
      phone: testPhone,
      password: testPassword,
      companyName: "PT Pandan Teknik Mandiri",
      consent: true,
    },
  });

  console.log(`HTTP Status: ${regRes.statusCode}`);
  const regBody = JSON.parse(regRes.body);
  console.log("Response:", regBody);

  if (regRes.statusCode !== 201) {
    throw new Error(`Registration failed: ${regRes.body}`);
  }
  console.log(
    "✅ Step 1 SUCCESS: Pendaftaran berhasil & email verifikasi telah dikirim via Resend!\n",
  );

  // Fetch the verification token from database to test the verify endpoint
  const [accountInDb] = await db
    .select()
    .from(memberAccounts)
    .where(eq(memberAccounts.email, testEmail))
    .limit(1);

  if (!accountInDb) throw new Error("Account not found in DB!");

  // -------------------------------------------------------------
  // STEP 2: LOGIN BEFORE EMAIL VERIFICATION
  // -------------------------------------------------------------
  console.log(
    "Step 2: Login Anggota Sebelum Verifikasi Email (POST /v1/public/membership/login)...",
  );
  const loginPreRes = await app.inject({
    method: "POST",
    url: "/v1/public/membership/login",
    payload: {
      email: testEmail,
      password: testPassword,
    },
  });

  console.log(`HTTP Status: ${loginPreRes.statusCode}`);
  const memberCookie = loginPreRes.cookies.find(
    (c) => c.name === "openorg_member_session",
  );

  const sessionPreRes = await app.inject({
    method: "GET",
    url: "/v1/member/session",
    cookies: memberCookie ? { [memberCookie.name]: memberCookie.value } : {},
  });
  const sessionPreBody = JSON.parse(sessionPreRes.body);
  console.log("Session Data (Unverified):", {
    memberName: sessionPreBody.data?.member?.name,
    status: sessionPreBody.data?.member?.status,
    emailVerified: sessionPreBody.data?.emailVerified,
  });

  if (sessionPreBody.data?.emailVerified !== false) {
    throw new Error("Expected emailVerified to be false before verification!");
  }
  console.log(
    "✅ Step 2 SUCCESS: Login berhasil dan status email terdeteksi belum verifikasi (emailVerified: false)!\n",
  );

  // -------------------------------------------------------------
  // STEP 3: VERIFY EMAIL (VIA TOKEN)
  // -------------------------------------------------------------
  console.log(
    "Step 3: Verifikasi Email Anggota (POST /v1/public/membership/verify-email)...",
  );
  // We simulate clicking the verification link received in email/WhatsApp
  // If token is in verificationUrl, we extract or simulate token verification
  const verificationUrl = regBody.data?.verificationUrl;
  let token = "";
  if (verificationUrl) {
    const parsed = new URL(verificationUrl);
    token = parsed.searchParams.get("token") || "";
  }

  const verifyRes = await app.inject({
    method: "POST",
    url: "/v1/public/membership/verify-email",
    payload: { token },
  });

  console.log(`HTTP Status: ${verifyRes.statusCode}`);
  const verifyBody = JSON.parse(verifyRes.body);
  console.log("Response:", verifyBody);

  if (verifyRes.statusCode !== 200 || !verifyBody.data?.verified) {
    throw new Error(`Email verification failed: ${verifyRes.body}`);
  }
  console.log("✅ Step 3 SUCCESS: Email berhasil diverifikasi!\n");

  // -------------------------------------------------------------
  // STEP 4: CHECK SESSION AFTER VERIFICATION
  // -------------------------------------------------------------
  console.log(
    "Step 4: Cek Sesi Anggota Setelah Verifikasi (GET /v1/member/session)...",
  );
  const sessionPostRes = await app.inject({
    method: "GET",
    url: "/v1/member/session",
    cookies: memberCookie ? { [memberCookie.name]: memberCookie.value } : {},
  });
  const sessionPostBody = JSON.parse(sessionPostRes.body);
  console.log("Session Data (Verified):", {
    memberName: sessionPostBody.data?.member?.name,
    email: sessionPostBody.data?.member?.email,
    emailVerified: sessionPostBody.data?.emailVerified,
  });

  if (sessionPostBody.data?.emailVerified !== true) {
    throw new Error("Expected emailVerified to be true after verification!");
  }
  console.log(
    "✅ Step 4 SUCCESS: Akun anggota kini berstatus emailVerified: true!\n",
  );

  // -------------------------------------------------------------
  // STEP 5: ADMIN APPROVES APPLICATION & ISSUES KTA DIGITAL
  // -------------------------------------------------------------
  console.log(
    "Step 5: Admin Menyetujui Permohonan & Menerbitkan KTA (POST /v1/admin/membership/applications/:id/review)...",
  );
  // 5a. Admin Login
  const adminLoginRes = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    payload: {
      email: "admin@demo.openorg",
      password: "OpenOrg!2026Demo",
    },
  });
  const adminCookie = adminLoginRes.cookies.find(
    (c) => c.name === "openorg_session",
  );

  // 5b. Find application
  const [appRow] = await db
    .select()
    .from(memberApplications)
    .where(eq(memberApplications.email, testEmail))
    .limit(1);

  if (!appRow) throw new Error("Application not found!");

  // 5c. Approve application
  const approveRes = await app.inject({
    method: "PATCH",
    url: `/v1/admin/membership/applications/${appRow.id}/review`,
    cookies: adminCookie ? { [adminCookie.name]: adminCookie.value } : {},
    payload: {
      decision: "approve",
      reviewerNotes: "Dokumen dan email telah diverifikasi valid.",
    },
  });

  console.log(`HTTP Status: ${approveRes.statusCode}`);
  const approveBody = JSON.parse(approveRes.body);
  console.log("Approval Response:", {
    memberNumber: approveBody.data?.memberNumber,
    cardCode: approveBody.data?.card?.code,
    status: approveBody.data?.application?.status,
  });

  if (approveRes.statusCode !== 200 || !approveBody.data?.card) {
    throw new Error(`Admin approval failed: ${approveRes.body}`);
  }
  const issuedKtaCode = approveBody.data.card.code;
  console.log(
    "✅ Step 5 SUCCESS: Permohonan disetujui & KTA Digital diterbitkan!\n",
  );

  // -------------------------------------------------------------
  // STEP 6: PUBLIC KTA VERIFICATION (COMPLYFLOW / VERIFY)
  // -------------------------------------------------------------
  console.log(
    `Step 6: Verifikasi Publik KTA Digital di ComplyFlow (GET /v1/public/membership/card/${issuedKtaCode})...`,
  );
  const cardVerifyRes = await app.inject({
    method: "GET",
    url: `/v1/public/membership/card/${issuedKtaCode}`,
  });

  console.log(`HTTP Status: ${cardVerifyRes.statusCode}`);
  const cardVerifyBody = JSON.parse(cardVerifyRes.body);
  console.log("Public KTA Verification Result:", {
    valid: cardVerifyBody.data?.valid,
    memberName: cardVerifyBody.data?.member?.name,
    memberNumber: cardVerifyBody.data?.member?.memberNumber,
    cardCode: cardVerifyBody.data?.card?.code,
    issuedAt: cardVerifyBody.data?.card?.issuedAt,
  });

  if (!cardVerifyBody.data?.valid) {
    throw new Error(`Public card verification failed: ${cardVerifyRes.body}`);
  }
  console.log(
    "✅ Step 6 SUCCESS: KTA Digital valid dan terverifikasi secara publik!\n",
  );

  console.log("=================================================");
  console.log("🎉 ALL E2E LIFECYCLE TESTS PASSED 100% SUCCESSFULLY!");
  console.log("=================================================");

  await app.close();
}

runE2ETest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ E2E TEST FAILED:", err);
    process.exit(1);
  });
