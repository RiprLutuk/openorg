import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { and, desc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { config } from "../config";
import { db } from "../db/client";
import { auditLogs, media } from "../db/schema";
import { AppError } from "../lib/errors";
import { detectSupportedImage } from "../lib/media";

const publicMediaParams = z.object({
  organizationId: z.string().uuid(),
  filename: z.string().regex(/^[0-9a-f-]{36}\.(?:gif|jpg|png|webp)$/),
});
const idParams = z.object({ id: z.string().uuid() });
const storageRoot = resolve(config.STORAGE_LOCAL_PATH);

function absoluteStoragePath(storageKey: string) {
  const candidate = resolve(storageRoot, storageKey);
  if (!candidate.startsWith(`${storageRoot}/`))
    throw new AppError(400, "INVALID_STORAGE_KEY", "Invalid media path.");
  return candidate;
}

export const mediaRoutes: FastifyPluginAsync = async (app) => {
  app.get("/uploads/:organizationId/:filename", async (request, reply) => {
    const { organizationId, filename } = publicMediaParams.parse(
      request.params,
    );
    const storageKey = `${organizationId}/${filename}`;
    const [asset] = await db
      .select({ mimeType: media.mimeType, storageKey: media.storageKey })
      .from(media)
      .where(
        and(
          eq(media.organizationId, organizationId),
          eq(media.storageKey, storageKey),
        ),
      )
      .limit(1);
    if (!asset)
      throw new AppError(404, "MEDIA_NOT_FOUND", "Media was not found.");
    try {
      const bytes = await readFile(absoluteStoragePath(asset.storageKey));
      return reply
        .header("Cache-Control", "public, max-age=31536000, immutable")
        .type(asset.mimeType)
        .send(bytes);
    } catch (error) {
      request.log.error({ error, storageKey }, "Stored media file is missing");
      throw new AppError(404, "MEDIA_NOT_FOUND", "Media was not found.");
    }
  });

  app.get(
    "/v1/admin/media",
    { preHandler: app.authorize("contents.read") },
    async (request) => {
      const items = await db
        .select()
        .from(media)
        .where(eq(media.organizationId, request.organization.id))
        .orderBy(desc(media.createdAt))
        .limit(100);
      return { data: items };
    },
  );

  app.post(
    "/v1/admin/media",
    { preHandler: app.authorize("contents.write") },
    async (request, reply) => {
      const upload = await request.file();
      if (!upload)
        throw new AppError(
          422,
          "MEDIA_FILE_REQUIRED",
          "Choose an image to upload.",
        );
      const bytes = await upload.toBuffer();
      if (bytes.length === 0 || bytes.length > 5_242_880)
        throw new AppError(
          413,
          "MEDIA_TOO_LARGE",
          "Images may not exceed 5 MB.",
        );
      const detected = detectSupportedImage(bytes);
      if (!detected)
        throw new AppError(
          415,
          "UNSUPPORTED_MEDIA_TYPE",
          "Only PNG, JPEG, WebP, and GIF images are supported.",
        );
      const id = randomUUID();
      const filename = `${id}.${detected.extension}`;
      const storageKey = `${request.organization.id}/${filename}`;
      const target = absoluteStoragePath(storageKey);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes, { flag: "wx" });
      try {
        const [created] = await db
          .insert(media)
          .values({
            id,
            organizationId: request.organization.id,
            kind: "image",
            filename: upload.filename.slice(0, 255),
            mimeType: detected.mimeType,
            size: bytes.length,
            storageKey,
            publicUrl: `${config.STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${storageKey}`,
            uploadedBy: request.currentUser?.id,
          })
          .returning();
        await db.insert(auditLogs).values({
          organizationId: request.organization.id,
          actorId: request.currentUser?.id,
          action: "media.upload",
          resourceType: "media",
          resourceId: id,
          after: created,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"]?.slice(0, 500),
          requestId: request.id,
        });
        return reply.status(201).send({ data: created });
      } catch (error) {
        await unlink(target).catch(() => undefined);
        throw error;
      }
    },
  );

  app.delete(
    "/v1/admin/media/:id",
    { preHandler: app.authorize("contents.write") },
    async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const [asset] = await db
        .delete(media)
        .where(
          and(
            eq(media.id, id),
            eq(media.organizationId, request.organization.id),
          ),
        )
        .returning();
      if (!asset)
        throw new AppError(404, "MEDIA_NOT_FOUND", "Media was not found.");
      await unlink(absoluteStoragePath(asset.storageKey)).catch((error) =>
        request.log.warn({ error, mediaId: id }, "Could not remove media file"),
      );
      await db.insert(auditLogs).values({
        organizationId: request.organization.id,
        actorId: request.currentUser?.id,
        action: "media.delete",
        resourceType: "media",
        resourceId: id,
        before: asset,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]?.slice(0, 500),
        requestId: request.id,
      });
      return reply.status(204).send();
    },
  );
};
