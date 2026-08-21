import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "The submitted data is invalid.",
          details: error.flatten(),
        },
        requestId: request.id,
      });
    }
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        requestId: request.id,
      });
    }
    const clientError = error as {
      statusCode?: unknown;
      code?: unknown;
      message?: unknown;
    };
    if (
      typeof clientError.statusCode === "number" &&
      clientError.statusCode >= 400 &&
      clientError.statusCode < 500
    )
      return reply.status(clientError.statusCode).send({
        error: {
          code:
            typeof clientError.code === "string"
              ? clientError.code
              : "REQUEST_ERROR",
          message:
            typeof clientError.message === "string"
              ? clientError.message
              : "The request could not be processed.",
        },
        requestId: request.id,
      });
    request.log.error({ err: error }, "Unhandled request error");
    return reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
      requestId: request.id,
    });
  });
}
