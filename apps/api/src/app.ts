import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { sql } from "drizzle-orm";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { config } from "./config";
import { db } from "./db/client";
import { registerErrorHandler } from "./lib/errors";
import authPlugin from "./plugins/auth";
import memberAuthPlugin from "./plugins/member-auth";
import securityPlugin from "./plugins/security";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import {
  adminCredentialRoutes,
  memberCredentialRoutes,
} from "./routes/credentials";
import { governanceRoutes } from "./routes/governance";
import { adminLearningRoutes, memberLearningRoutes } from "./routes/learning";
import { mediaRoutes } from "./routes/media";
import {
  adminMembershipRoutes,
  memberPortalRoutes,
  publicMembershipRoutes,
} from "./routes/membership";
import { publicRoutes } from "./routes/public";
import { adminRevenueRoutes, memberRevenueRoutes } from "./routes/revenue";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === "development" ? "debug" : "info",
      redact: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers.set-cookie",
        "body.password",
      ],
    },
    trustProxy: config.TRUST_PROXY,
    requestIdHeader: "x-request-id",
    bodyLimit: 12_582_912,
  });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandler(app);
  await app.register(cookie);
  await app.register(multipart, {
    limits: { files: 10, fileSize: 10_485_760, fields: 10 },
  });
  await app.register(securityPlugin);
  if (config.EXPOSE_API_DOCS) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "OpenOrg API",
          description: "Standalone organization CMS and public REST API",
          version: "0.1.0",
        },
        servers: [{ url: config.API_PUBLIC_URL }],
      },
    });
    await app.register(swaggerUi, { routePrefix: "/documentation" });
  }
  await app.register(authPlugin);
  await app.register(memberAuthPlugin);
  await app.register(mediaRoutes);

  app.get("/health/live", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));
  const readiness = async () => {
    await db.execute(sql`select 1`);
    return { status: "ready", timestamp: new Date().toISOString() };
  };
  app.get("/health", readiness);
  app.get("/health/ready", readiness);
  await app.register(authRoutes, { prefix: "/v1/auth" });
  await app.register(publicRoutes, { prefix: "/v1/public" });
  await app.register(adminRoutes, { prefix: "/v1/admin" });
  await app.register(publicMembershipRoutes, {
    prefix: "/v1/public/membership",
  });
  await app.register(memberPortalRoutes, { prefix: "/v1/member" });
  await app.register(adminMembershipRoutes, {
    prefix: "/v1/admin/membership",
  });
  await app.register(adminCredentialRoutes, {
    prefix: "/v1/admin/credentials",
  });
  await app.register(governanceRoutes, { prefix: "/v1/admin/governance" });
  await app.register(adminLearningRoutes, { prefix: "/v1/admin/learning" });
  await app.register(memberLearningRoutes, { prefix: "/v1/member" });
  await app.register(memberCredentialRoutes, { prefix: "/v1/member" });
  await app.register(adminRevenueRoutes, { prefix: "/v1/admin/revenue" });
  await app.register(memberRevenueRoutes, { prefix: "/v1/member" });
  return app;
}
