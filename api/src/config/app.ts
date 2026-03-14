import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { errorHandler } from "../errors/errorHandler";
import { env } from "../settings/env";
import { registerRoutes } from "./routes";
import { registerSeedDashboardRoutes } from "../modules/seed/dashboard.seed.routes";

export async function buildApp() {
  const isTest = process.env.NODE_ENV === "test";

  const app = Fastify({
    logger: isTest
      ? false
      : {
          transport: {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
              colorize: true,
            },
          },
        },
  });
  
  await app.register(cookie);
  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  await app.register(jwt, { secret: env.JWT_SECRET });

  await app.register(swagger, {
    openapi: {
      info: { title: "FinanceApp API", version: "1.0.0" },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  await registerRoutes(app);
  // Seed dashboard routes (Excel/CSV import and sample)
  await registerSeedDashboardRoutes(app);
  app.setErrorHandler(errorHandler);

  return app;
}
