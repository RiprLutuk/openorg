import { createHmac, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { config } from "../config";
import { db } from "../db/client";
import {
  permissions,
  rolePermissions,
  sessions,
  userRoles,
  users,
} from "../db/schema";
import { AppError } from "../lib/errors";

export const SESSION_TTL_SECONDS = 60 * 60 * 12;

export function hashSessionToken(token: string) {
  return createHmac("sha256", config.SESSION_SECRET).update(token).digest();
}

export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}

export default fp(async (app) => {
  const permissionsByRequest = new WeakMap<FastifyRequest, Set<string>>();
  app.decorateRequest("currentUser", null);
  app.decorateRequest("permissions", {
    getter() {
      return permissionsByRequest.get(this) ?? new Set<string>();
    },
    setter(value) {
      permissionsByRequest.set(this, value);
    },
  });

  app.decorate("authenticate", async (request, reply) => {
    const token = request.cookies[config.SESSION_COOKIE_NAME];
    if (!token)
      throw new AppError(401, "UNAUTHENTICATED", "Please sign in to continue.");
    const [result] = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, hashSessionToken(token)),
          eq(users.status, "active"),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!result) {
      reply.clearCookie(config.SESSION_COOKIE_NAME, { path: "/" });
      throw new AppError(
        401,
        "SESSION_EXPIRED",
        "Your session has expired. Please sign in again.",
      );
    }
    request.currentUser = result.user;
    const rows = await db
      .select({ key: permissions.key })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, result.user.id));
    request.permissions = new Set(rows.map((row) => row.key));
  });

  app.decorate("authorize", (permission: string) => async (request, reply) => {
    await app.authenticate(request, reply);
    if (!request.permissions.has(permission) && !request.permissions.has("*")) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have permission to perform this action.",
      );
    }
  });
});
