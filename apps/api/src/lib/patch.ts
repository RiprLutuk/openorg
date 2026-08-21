export function onlyProvided<T extends Record<string, unknown>>(
  parsed: T,
  body: unknown,
): Partial<T> {
  const raw =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  return Object.fromEntries(
    Object.entries(parsed).filter(([key]) => Object.hasOwn(raw, key)),
  ) as Partial<T>;
}
