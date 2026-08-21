import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";
import { config } from "../config";
import { AppError } from "../lib/errors";

export default fp(async (app) => {
  await app.register(helmet, {
    global: true,
    ...(config.EXPOSE_API_DOCS ? { contentSecurityPolicy: false } : {}),
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
  await app.register(cors, {
    origin: [config.CMS_ORIGIN, config.WEB_ORIGIN],
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Organization", "X-Request-ID"],
  });
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute", ban: 3 });

  app.addHook("onRequest", async (request) => {
    if (
      !["POST", "PUT", "PATCH", "DELETE"].includes(request.method) ||
      !request.url.startsWith("/v1/admin")
    )
      return;
    const origin = request.headers.origin;
    if (origin && origin !== config.CMS_ORIGIN)
      throw new AppError(
        403,
        "ORIGIN_REJECTED",
        "Request origin is not allowed.",
      );
  });
});
