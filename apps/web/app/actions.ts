"use server";

export type PublicFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string>;
};

export async function submitPublicForm(
  organizationSlug: string,
  formSlug: string,
  _previousState: PublicFormState,
  formData: FormData,
): Promise<PublicFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const message = String(formData.get("message") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  if (website)
    return {
      status: "success",
      message: "Thank you. Your message has been received.",
    };

  const errors: Record<string, string> = {};
  if (name.length < 2 || name.length > 160)
    errors.name = "Enter a name between 2 and 160 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320)
    errors.email = "Enter a valid email address.";
  if (message.length < 10 || message.length > 5_000)
    errors.message = "Write a message between 10 and 5,000 characters.";
  if (Object.keys(errors).length)
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors,
    };

  const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:4000";
  try {
    const response = await fetch(
      `${apiUrl}/v1/public/forms/${encodeURIComponent(formSlug)}/submissions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Organization": organizationSlug,
        },
        body: JSON.stringify({ name, email, message }),
        cache: "no-store",
      },
    );
    const result = await response.json().catch(() => null);
    if (!response.ok)
      return {
        status: "error",
        message:
          result?.error?.message ??
          "Your message could not be sent. Please try again.",
      };
    return {
      status: "success",
      message:
        result?.data?.message ?? "Thank you. Your message has been received.",
    };
  } catch {
    return {
      status: "error",
      message:
        "The service is temporarily unavailable. Please try again shortly.",
    };
  }
}
