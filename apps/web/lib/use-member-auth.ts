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

export function checkMemberAuth() {
  return memberApi<{ data: { member: LoggedInMember } }>("/v1/member/session")
    .then((res) => {
      notify(res.data.member);
      return res.data.member;
    })
    .catch(() => {
      notify(null);
      return null;
    });
}

export function useMemberAuth() {
  const [member, setMember] = useState<LoggedInMember | null>(cachedMember);
  const [loading, setLoading] = useState(!hasChecked);

  useEffect(() => {
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
    isLoggedIn: Boolean(member),
    member,
    loading,
    refresh: checkMemberAuth,
  };
}
