export const MEMBER_API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class MemberApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function memberApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (
    init?.body &&
    !(typeof FormData !== "undefined" && init.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${MEMBER_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new MemberApiError(
      body?.error?.message ?? "We could not complete this request.",
      response.status,
    );
  }
  return body as T;
}
