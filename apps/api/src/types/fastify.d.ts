import type { InferSelectModel } from "drizzle-orm";
import type { members, users } from "../db/schema";

declare module "fastify" {
  interface FastifyRequest {
    currentUser: InferSelectModel<typeof users> | null;
    currentMember: InferSelectModel<typeof members> | null;
    permissions: Set<string>;
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    authorize: (
      permission: string,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateMember: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}
