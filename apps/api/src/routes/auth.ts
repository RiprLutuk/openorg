import { verify } from "@node-rs/argon2";
import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { config } from "../config";
import { db } from "../db/client";
import { sessions, users } from "../db/schema";
import { AppError } from "../lib/errors";
import {
  hashSessionToken,
  newSessionToken,
  SESSION_TTL_SECONDS,
} from "../plugins/auth";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(8).max(200),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/login",
    { config: { rateLimit: { max: 6, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const input = loginSchema.parse(request.body);
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.organizationId, request.organization.id),
            eq(users.email, input.email),
            eq(users.status, "active"),
          ),
        )
        .limit(1);
      if (!user || !(await verify(user.passwordHash, input.password))) {
        throw new AppError(
          401,
          "INVALID_CREDENTIALS",
          "Email or password is incorrect.",
        );
      }
      const token = newSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
      await db.transaction(async (tx) => {
        await tx.insert(sessions).values({
          userId: user.id,
          organizationId: user.organizationId,
          tokenHash: hashSessionToken(token),
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"]?.slice(0, 500),
          expiresAt,
        });
        await tx
          .update(users)
          .set({ lastLoginAt: new Date(), updatedAt: new Date() })
          .where(eq(users.id, user.id));
      });
      reply.setCookie(config.SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
      });
      return {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          organizationId: user.organizationId,
        },
      };
    },
  );

  app.get("/session", { preHandler: app.authenticate }, async (request) => ({
    data: {
      user: {
        id: request.currentUser?.id,
        name: request.currentUser?.name,
        email: request.currentUser?.email,
        avatarUrl: request.currentUser?.avatarUrl,
      },
      organization: {
        id: request.organization.id,
        name: request.organization.name,
        slug: request.organization.slug,
      },
      permissions: [...request.permissions],
    },
  }));

  app.post(
    "/logout",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const token = request.cookies[config.SESSION_COOKIE_NAME];
      if (token)
        await db
          .delete(sessions)
          .where(eq(sessions.tokenHash, hashSessionToken(token)));
      reply.clearCookie(config.SESSION_COOKIE_NAME, { path: "/" });
      return reply.status(204).send();
    },
  );
};
