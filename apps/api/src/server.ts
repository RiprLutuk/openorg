import { buildApp } from "./app";
import { config } from "./config";
import { closeDatabase } from "./db/client";

const app = await buildApp();

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "Shutting down");
  await app.close();
  await closeDatabase();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

await app.listen({ host: config.API_HOST, port: config.API_PORT });
