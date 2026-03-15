import type { FastifyInstance } from "fastify";
import { BudgetsController } from "./budgets.controller";

const PUBLIC_ROUTES = ["/health", "/docs"];

export async function registerBudgetsRoutes(app: FastifyInstance) {
  const controller = new BudgetsController();

  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublicRoute = PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
    if (isPublicRoute) return;

    // Only apply JWT verification to /budgets routes
    if (!path.startsWith("/budgets")) return;

    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  app.get(
    "/budgets",
    {
      schema: {
        description: "Lista orçamentos do usuário",
        tags: ["Budgets"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            month: { type: "integer", description: "Mês (1-12)" },
            year: { type: "integer", description: "Ano" },
          },
        },
      },
    },
    controller.list,
  );

  app.post(
    "/budgets",
    {
      schema: {
        description: "Cria um novo orçamento",
        tags: ["Budgets"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["categoryId", "amount", "month", "year"],
          properties: {
            categoryId: { type: "string", format: "uuid" },
            subcategoryId: { type: "string", format: "uuid" },
            amount: { type: "number" },
            month: { type: "integer", minimum: 1, maximum: 12 },
            year: { type: "integer" },
          },
        },
      },
    },
    controller.create,
  );

  app.put(
    "/budgets/:id",
    {
      schema: {
        description: "Atualiza um orçamento",
        tags: ["Budgets"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["amount"],
          properties: {
            amount: { type: "number" },
          },
        },
      },
    },
    controller.update,
  );

  app.delete(
    "/budgets/:id",
    {
      schema: {
        description: "Deleta um orçamento",
        tags: ["Budgets"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
      },
    },
    controller.delete,
  );
}
