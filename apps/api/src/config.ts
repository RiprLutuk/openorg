import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const developmentSecret = "development-only-secret-change-me-now";

function isSecureProductionUrl(value: string) {
  const url = new URL(value);
  return (
    url.protocol === "https:" ||
    ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
  );
}

const configSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z
      .string()
      .url()
      .default("postgresql://lutuk@localhost:1921/openorg"),
    API_HOST: z.string().default("0.0.0.0"),
    API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    API_PUBLIC_URL: z.string().url().default("http://localhost:4000"),
    CMS_ORIGIN: z.string().url().default("http://localhost:5173"),
    WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
    SESSION_COOKIE_NAME: z.string().min(3).default("openorg_session"),
    MEMBER_SESSION_COOKIE_NAME: z
      .string()
      .min(3)
      .default("openorg_member_session"),
    SESSION_SECRET: z.string().min(32).default(developmentSecret),
    TRUST_PROXY: booleanString,
    EXPOSE_API_DOCS: booleanString,
    STORAGE_LOCAL_PATH: z.string().min(1).default("apps/api/uploads"),
    STORAGE_PUBLIC_URL: z
      .string()
      .url()
      .default("http://localhost:4000/uploads"),
    DEFAULT_ORGANIZATION_SLUG: z.string().min(2).default("demo"),
    WAHA_API_URL: z.string().url().optional(),
    WAHA_API_KEY: z.string().optional(),
    WAHA_SESSION: z.string().default("default"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().default("APTI Indonesia <no-reply@apti.or.id>"),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM: z
      .string()
      .default(process.env.RESEND_FROM || "onboarding@resend.dev"),
  })
  .superRefine((value, context) => {
    if (
      value.NODE_ENV === "production" &&
      value.SESSION_SECRET === developmentSecret
    )
      context.addIssue({
        code: "custom",
        path: ["SESSION_SECRET"],
        message: "A unique SESSION_SECRET is required in production.",
      });
    if (value.NODE_ENV === "production") {
      for (const key of [
        "API_PUBLIC_URL",
        "CMS_ORIGIN",
        "WEB_ORIGIN",
        "STORAGE_PUBLIC_URL",
      ] as const) {
        if (!isSecureProductionUrl(value[key]))
          context.addIssue({
            code: "custom",
            path: [key],
            message: `${key} must use HTTPS in production.`,
          });
      }
    }
  });

export const config = configSchema.parse(process.env);
