import { createHmac, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import fp from "fastify-plugin";
import { config } from "../config";
import { db } from "../db/client";
import { memberAccounts, memberSessions, members } from "../db/schema";
import { AppError } from "../lib/errors";

export const MEMBER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export function hashMemberSessionToken(token: string) {
  return createHmac("sha256", config.SESSION_SECRET)
    .update(`member:${token}`)
    .digest();
}

export function newMemberSessionToken() {
  return randomBytes(32).toString("base64url");
}

export default fp(async (app) => {
  app.decorateRequest("currentMember", null);
  app.decorate("authenticateMember", async (request, reply) => {
    const token = request.cookies[config.MEMBER_SESSION_COOKIE_NAME];
    if (!token)
      throw new AppError(
        401,
        "MEMBER_UNAUTHENTICATED",
        "Please sign in to your member account.",
      );
    const [result] = await db
      .select({ member: members })
      .from(memberSessions)
      .innerJoin(
        memberAccounts,
        eq(memberSessions.memberAccountId, memberAccounts.id),
      )
      .innerJoin(members, eq(memberAccounts.memberId, members.id))
      .where(
        and(
          eq(memberSessions.tokenHash, hashMemberSessionToken(token)),
          gt(memberSessions.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!result) {
      reply.clearCookie(config.MEMBER_SESSION_COOKIE_NAME, { path: "/" });
      throw new AppError(
        401,
        "MEMBER_SESSION_EXPIRED",
        "Your member session has expired.",
      );
    }
    request.currentMember = result.member;
  });
});
