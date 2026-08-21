"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { memberApi } from "@/lib/member-client";

export function MemberLogin({ organization }: { organization: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await memberApi("/v1/public/membership/login", organization, {
        method: "POST",
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
        }),
      });
      window.location.assign("/member");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in failed.");
      setPending(false);
    }
  };
  return (
    <form className="member-form compact-member-form" onSubmit={submit}>
      <div className="member-form-heading">
        <span className="member-form-icon">
          <ShieldCheck size={23} />
        </span>
        <div>
          <p className="eyebrow">Member portal</p>
          <h2>Welcome back</h2>
        </div>
      </div>
      <p className="form-intro">
        Track your application, update your profile, and access your member
        card.
      </p>
      {error && <p className="form-error">{error}</p>}
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>
      <button className="button primary" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
        {!pending && <ArrowRight size={17} />}
      </button>
      <p className="form-footnote">
        New here? <Link href="/join">Apply for membership</Link>
      </p>
    </form>
  );
}
