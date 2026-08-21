import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config";
import * as schema from "./schema";

const client = postgres(config.DATABASE_URL, {
  max: config.NODE_ENV === "test" ? 2 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, { schema });
export const closeDatabase = () => client.end();
