import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ?? "postgresql://lutuk@localhost:1921/openorg",
  },
  strict: true,
  verbose: true,
});
