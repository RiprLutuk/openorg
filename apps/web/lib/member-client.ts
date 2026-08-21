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
  organization: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${MEMBER_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Organization": organization,
      ...init?.headers,
    },
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
