"use client";

import { useEffect, useState } from "react";
import { memberApi } from "./member-client";

export interface LoggedInMember {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  memberNumber: string;
  status: string;
}

let cachedMember: LoggedInMember | null = null;
let hasChecked = false;
const listeners = new Set<(member: LoggedInMember | null) => void>();

function notify(member: LoggedInMember | null) {
  cachedMember = member;
  hasChecked = true;
  for (const listener of listeners) {
    listener(member);
  }
}

export function isMemberLoginHintPresent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem("openorg_member_logged_in") === "1") return true;
    if (document.cookie.includes("openorg_member_active=1")) return true;
    if (window.location.pathname.startsWith("/member")) return true;
  } catch {
    // Storage access blocked or SSR
  }
  return false;
}

let inFlightAuthPromise: Promise<LoggedInMember | null> | null = null;

export function checkMemberAuth(force = false) {
  if (inFlightAuthPromise) return inFlightAuthPromise;

  // Skip network call for public guests who have not logged in
  if (!force && !isMemberLoginHintPresent()) {
    notify(null);
    return Promise.resolve(null);
  }

  inFlightAuthPromise = memberApi<{ data: { member: LoggedInMember } }>(
    "/v1/member/session",
  )
    .then((res) => {
      try {
        localStorage.setItem("openorg_member_logged_in", "1");
      } catch {
        // Storage access blocked
      }
      notify(res.data.member);
      return res.data.member;
    })
    .catch(() => {
      try {
        localStorage.removeItem("openorg_member_logged_in");
        document.cookie =
          "openorg_member_active=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch {
        // Storage access blocked
      }
      notify(null);
      return null;
    })
    .finally(() => {
      inFlightAuthPromise = null;
    });

  return inFlightAuthPromise;
}

export function useMemberAuth() {
  const [mounted, setMounted] = useState(false);
  const [member, setMember] = useState<LoggedInMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setMember(cachedMember);
    setLoading(!hasChecked);

    const handleUpdate = (updatedMember: LoggedInMember | null) => {
      setMember(updatedMember);
      setLoading(false);
    };

    listeners.add(handleUpdate);

    if (!hasChecked) {
      checkMemberAuth();
    } else {
      setMember(cachedMember);
      setLoading(false);
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    isLoggedIn: mounted ? Boolean(member) : false,
    member: mounted ? member : null,
    loading: mounted ? loading : true,
    refresh: checkMemberAuth,
  };
}
