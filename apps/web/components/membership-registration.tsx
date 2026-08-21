"use client";

import { ArrowRight, BadgeCheck, Building2, MailCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { memberApi } from "@/lib/member-client";

type Unit = { id: string; name: string; type: string };

export function MembershipRegistration({
  organization,
  organizationName,
}: {
  organization: string;
  organizationName: string;
}) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [stage, setStage] = useState<"register" | "verify" | "done">(
    "register",
  );
  const [email, setEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    memberApi<{ data: { units: Unit[] } }>("/v1/public/structure", organization)
      .then((result) => setUnits(result.data.units))
      .catch(() => setUnits([]));
  }, [organization]);

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const nextEmail = value("email").toLowerCase();
    try {
      const result = await memberApi<{
        data: { verificationToken?: string };
      }>("/v1/public/membership/register", organization, {
        method: "POST",
        body: JSON.stringify({
          name: value("name"),
          email: nextEmail,
          phone: value("phone"),
          password: value("password"),
          address: value("address") || null,
          unitId: value("unitId") || null,
          dateOfBirth: value("dateOfBirth") || null,
          companyName: value("companyName") || null,
          companyDescription: value("companyDescription") || null,
          companyAddress: value("companyAddress") || null,
          companyWebsite: value("companyWebsite") || null,
          consent: data.get("consent") === "on",
        }),
      });
      setEmail(nextEmail);
      setVerificationToken(result.data.verificationToken ?? "");
      setStage("verify");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Registration failed.",
      );
    } finally {
      setPending(false);
    }
  };

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await memberApi("/v1/public/membership/verify-email", organization, {
        method: "POST",
        body: JSON.stringify({
          email,
          token: String(data.get("token") ?? "").trim(),
        }),
      });
      setStage("done");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Verification failed.",
      );
    } finally {
      setPending(false);
    }
  };

  if (stage === "done") {
    return (
      <div className="member-success-card">
        <span>
          <BadgeCheck size={28} />
        </span>
        <p className="eyebrow">Application submitted</p>
        <h2>Your email is verified.</h2>
        <p>
          The {organizationName} team can now review your application. Sign in
          anytime to see its status and complete your profile.
        </p>
        <Link className="button primary" href="/member/login">
          Open member portal <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  if (stage === "verify") {
    return (
      <form className="member-form compact-member-form" onSubmit={verify}>
        <div className="member-form-heading">
          <span className="member-form-icon">
            <MailCheck size={23} />
          </span>
          <div>
            <p className="eyebrow">One final step</p>
            <h2>Verify your email</h2>
          </div>
        </div>
        <p className="form-intro">
          We sent a verification link to <strong>{email}</strong>. Enter the
          token from that email below.
        </p>
        {verificationToken && (
          <div className="development-token">
            <strong>Development preview token</strong>
            <code>{verificationToken}</code>
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
        <label>
          Verification token
          <input
            name="token"
            required
            minLength={32}
            defaultValue={verificationToken}
            autoComplete="one-time-code"
          />
        </label>
        <button className="button primary" type="submit" disabled={pending}>
          {pending ? "Verifying…" : "Verify & submit for review"}
        </button>
      </form>
    );
  }

  return (
    <form className="member-form" onSubmit={register}>
      <div className="member-form-heading">
        <span className="member-form-icon">
          <Building2 size={23} />
        </span>
        <div>
          <p className="eyebrow">Membership application</p>
          <h2>Tell us about yourself</h2>
        </div>
      </div>
      {error && <p className="form-error full">{error}</p>}
      <label>
        Full name
        <input name="name" required minLength={2} autoComplete="name" />
      </label>
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Mobile number
        <input name="phone" required minLength={8} autoComplete="tel" />
      </label>
      <label>
        Date of birth
        <input name="dateOfBirth" type="date" />
      </label>
      <label>
        Organization unit
        <select name="unitId" defaultValue="">
          <option value="">Choose later</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name} · {unit.type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Company / institution
        <input name="companyName" autoComplete="organization" />
      </label>
      <label className="full">
        Address
        <textarea name="address" rows={3} autoComplete="street-address" />
      </label>
      <label className="full">
        Company / activity description
        <textarea name="companyDescription" rows={3} />
      </label>
      <label>
        Company address
        <input name="companyAddress" />
      </label>
      <label>
        Website
        <input name="companyWebsite" type="url" placeholder="https://" />
      </label>
      <label>
        Create password
        <input
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
        />
        <small>
          At least 10 characters with uppercase, lowercase, and a number.
        </small>
      </label>
      <label>
        Confirm password
        <input
          name="passwordConfirmation"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          onInput={(event) => {
            const form = event.currentTarget.form;
            const password = form?.elements.namedItem("password");
            event.currentTarget.setCustomValidity(
              password instanceof HTMLInputElement &&
                password.value !== event.currentTarget.value
                ? "Passwords do not match."
                : "",
            );
          }}
        />
      </label>
      <label className="member-consent full">
        <input name="consent" type="checkbox" required />
        <span>
          I confirm this information is accurate and consent to its use for
          membership administration.
        </span>
      </label>
      <div className="member-form-actions full">
        <span>
          Already registered? <Link href="/member/login">Sign in</Link>
        </span>
        <button className="button primary" type="submit" disabled={pending}>
          {pending ? "Creating application…" : "Continue to verification"}
          {!pending && <ArrowRight size={17} />}
        </button>
      </div>
    </form>
  );
}
