"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc3) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc3 = __getOwnPropDesc(from, key)) || desc3.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/config/app.ts
var import_fastify = __toESM(require("fastify"), 1);
var import_cors = __toESM(require("@fastify/cors"), 1);
var import_jwt = __toESM(require("@fastify/jwt"), 1);
var import_swagger = __toESM(require("@fastify/swagger"), 1);

// src/errors/AppError.ts
var AppError = class extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.name = "AppError";
  }
};

// src/modules/auth/auth.model.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_drizzle_orm = require("drizzle-orm");

// src/drizzle/client.ts
var import_postgres_js = require("drizzle-orm/postgres-js");
var import_postgres = __toESM(require("postgres"), 1);

// src/settings/env.ts
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  PORT: import_zod.z.coerce.number().default(3e3),
  DATABASE_URL: import_zod.z.string().url(),
  JWT_SECRET: import_zod.z.string().min(32),
  CORS_ORIGIN: import_zod.z.string().default("*")
});
var env = envSchema.parse(process.env);

// src/drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  paymentMethods: () => paymentMethods,
  transactionTypeEnum: () => transactionTypeEnum,
  transactions: () => transactions,
  users: () => users
});
var import_pg_core = require("drizzle-orm/pg-core");
var transactionTypeEnum = (0, import_pg_core.pgEnum)("transaction_type", [
  "income",
  "expense"
]);
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  name: (0, import_pg_core.text)("name").notNull(),
  email: (0, import_pg_core.text)("email").notNull().unique(),
  password: (0, import_pg_core.text)("password").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var categories = (0, import_pg_core.pgTable)("categories", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: (0, import_pg_core.text)("name").notNull(),
  color: (0, import_pg_core.text)("color").notNull().default("#3B82F6"),
  icon: (0, import_pg_core.text)("icon"),
  deletedAt: (0, import_pg_core.timestamp)("deleted_at")
});
var paymentMethods = (0, import_pg_core.pgTable)("payment_methods", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: (0, import_pg_core.text)("name").notNull(),
  deletedAt: (0, import_pg_core.timestamp)("deleted_at")
});
var transactions = (0, import_pg_core.pgTable)("transactions", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  categoryId: (0, import_pg_core.uuid)("category_id").references(() => categories.id),
  paymentMethodId: (0, import_pg_core.uuid)("payment_method_id").references(
    () => paymentMethods.id
  ),
  description: (0, import_pg_core.text)("description").notNull(),
  subDescription: (0, import_pg_core.text)("sub_description"),
  amount: (0, import_pg_core.numeric)("amount", { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  date: (0, import_pg_core.timestamp)("date").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});

// src/drizzle/client.ts
var client = (0, import_postgres.default)(env.DATABASE_URL);
var db = (0, import_postgres_js.drizzle)(client, { schema: schema_exports });

// src/modules/auth/auth.model.ts
var SALT_ROUNDS = 10;
var AuthModel = class {
  static async createUser(data) {
    const passwordHash = await import_bcryptjs.default.hash(data.password, SALT_ROUNDS);
    const [user] = await db.insert(users).values({
      name: data.name,
      email: data.email.toLowerCase(),
      password: passwordHash
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email
    });
    return user;
  }
  static async findByEmail(email) {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password
    }).from(users).where((0, import_drizzle_orm.eq)(users.email, email.toLowerCase()));
    return user;
  }
  static async verifyPassword(plain, hash) {
    return import_bcryptjs.default.compare(plain, hash);
  }
  static async findById(id) {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    }).from(users).where((0, import_drizzle_orm.eq)(users.id, id));
    return user;
  }
};

// src/modules/auth/auth.schema.ts
var import_zod2 = require("zod");
var registerSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(1).max(120),
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(6).max(128)
});
var loginSchema = import_zod2.z.object({
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(6).max(128)
});

// src/modules/auth/auth.controller.ts
async function registerHandler(request, reply) {
  const body = registerSchema.parse(request.body);
  const existing = await AuthModel.findByEmail(body.email);
  if (existing) {
    throw new AppError("E-mail j\xE1 cadastrado", 409);
  }
  const user = await AuthModel.createUser(body);
  return reply.status(201).send({ user });
}
async function loginHandler(request, reply) {
  const body = loginSchema.parse(request.body);
  const user = await AuthModel.findByEmail(body.email);
  if (!user) {
    throw new AppError("Credenciais inv\xE1lidas", 401);
  }
  const isValid = await AuthModel.verifyPassword(body.password, user.password);
  if (!isValid) {
    throw new AppError("Credenciais inv\xE1lidas", 401);
  }
  const token = await reply.jwtSign(
    {
      sub: user.id,
      email: user.email
    },
    { expiresIn: "7d" }
  );
  return reply.send({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
}
async function meHandler(request, reply) {
  await request.jwtVerify();
  const { sub } = request.user;
  const user = await AuthModel.findById(sub);
  if (!user) {
    throw new AppError("Usu\xE1rio n\xE3o encontrado", 404);
  }
  return reply.send({ user });
}

// src/modules/auth/auth.routes.ts
async function registerAuthRoutes(app) {
  app.post("/auth/register", registerHandler);
  app.post("/auth/login", loginHandler);
  app.get("/auth/me", meHandler);
}

// src/modules/categories/categories.model.ts
var import_drizzle_orm2 = require("drizzle-orm");
var CategoryModel = class {
  static async findAll(userId) {
    return db.select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      icon: categories.icon
    }).from(categories).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(categories.userId, userId), (0, import_drizzle_orm2.isNull)(categories.deletedAt))).orderBy((0, import_drizzle_orm2.asc)(categories.name));
  }
  static async findById(id, userId) {
    const [category] = await db.select().from(categories).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(categories.id, id), (0, import_drizzle_orm2.eq)(categories.userId, userId))).limit(1);
    return category;
  }
  static async createCategory(userId, data) {
    const [category] = await db.insert(categories).values({
      userId,
      name: data.name,
      color: data.color || "#3B82F6",
      icon: data.icon
    }).returning();
    return category;
  }
  static async updateCategory(id, userId, data) {
    const [updated] = await db.update(categories).set(data).where(
      (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(categories.id, id),
        (0, import_drizzle_orm2.eq)(categories.userId, userId),
        (0, import_drizzle_orm2.isNull)(categories.deletedAt)
      )
    ).returning();
    return updated;
  }
  static async softDelete(id, userId) {
    const [deleted] = await db.update(categories).set({ deletedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(categories.id, id),
        (0, import_drizzle_orm2.eq)(categories.userId, userId),
        (0, import_drizzle_orm2.isNull)(categories.deletedAt)
      )
    ).returning();
    return deleted;
  }
  static async restoreCategory(id, userId) {
    const [restored] = await db.update(categories).set({ deletedAt: null }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(categories.id, id), (0, import_drizzle_orm2.eq)(categories.userId, userId))).returning();
    return restored;
  }
};

// src/modules/categories/categories.schema.ts
var import_zod3 = require("zod");
var createCategorySchema = import_zod3.z.object({
  name: import_zod3.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(100),
  color: import_zod3.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inv\xE1lida").optional(),
  icon: import_zod3.z.string().optional()
});
var updateCategorySchema = createCategorySchema.partial();

// src/modules/categories/categories.controller.ts
async function listCategoriesHandler(request, reply) {
  const { sub: userId } = request.user;
  const categories2 = await CategoryModel.findAll(userId);
  return reply.send(categories2);
}
async function createCategoryHandler(request, reply) {
  const { sub: userId } = request.user;
  const body = createCategorySchema.parse(request.body);
  const category = await CategoryModel.createCategory(userId, body);
  return reply.status(201).send(category);
}
async function updateCategoryHandler(request, reply) {
  const { sub: userId } = request.user;
  const { id } = request.params;
  const body = updateCategorySchema.parse(request.body);
  const updated = await CategoryModel.updateCategory(id, userId, body);
  if (!updated) {
    throw new AppError("Categoria n\xE3o encontrada ou j\xE1 deletada", 404);
  }
  return reply.send(updated);
}
async function deleteCategoryHandler(request, reply) {
  const { sub: userId } = request.user;
  const { id } = request.params;
  const deleted = await CategoryModel.softDelete(id, userId);
  if (!deleted) {
    throw new AppError("Categoria n\xE3o encontrada ou j\xE1 deletada", 404);
  }
  return reply.send({ message: "Categoria deletada com sucesso" });
}
async function restoreCategoryHandler(request, reply) {
  const { sub: userId } = request.user;
  const { id } = request.params;
  const restored = await CategoryModel.restoreCategory(id, userId);
  if (!restored) {
    throw new AppError("Categoria n\xE3o encontrada", 404);
  }
  return reply.send(restored);
}

// src/modules/categories/categories.routes.ts
async function registerCategoriesRoutes(app) {
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get("/categories", listCategoriesHandler);
  app.post("/categories", createCategoryHandler);
  app.put("/categories/:id", updateCategoryHandler);
  app.delete("/categories/:id", deleteCategoryHandler);
  app.patch("/categories/:id/restore", restoreCategoryHandler);
}

// src/modules/payment-methods/payment-methods.model.ts
var import_drizzle_orm3 = require("drizzle-orm");
var PaymentMethodModel = class {
  static async findAll(userId) {
    return db.select({
      id: paymentMethods.id,
      name: paymentMethods.name
    }).from(paymentMethods).where(
      (0, import_drizzle_orm3.and)(
        (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId),
        (0, import_drizzle_orm3.isNull)(paymentMethods.deletedAt)
      )
    ).orderBy((0, import_drizzle_orm3.asc)(paymentMethods.name));
  }
  static async findById(id, userId) {
    const [method] = await db.select().from(paymentMethods).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(paymentMethods.id, id), (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId))).limit(1);
    return method;
  }
  static async createMethod(userId, data) {
    const [method] = await db.insert(paymentMethods).values({
      userId,
      name: data.name
    }).returning();
    return method;
  }
  static async updateMethod(id, userId, data) {
    const [updated] = await db.update(paymentMethods).set(data).where(
      (0, import_drizzle_orm3.and)(
        (0, import_drizzle_orm3.eq)(paymentMethods.id, id),
        (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId),
        (0, import_drizzle_orm3.isNull)(paymentMethods.deletedAt)
      )
    ).returning();
    return updated;
  }
  static async softDelete(id, userId) {
    const [deleted] = await db.update(paymentMethods).set({ deletedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm3.and)(
        (0, import_drizzle_orm3.eq)(paymentMethods.id, id),
        (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId),
        (0, import_drizzle_orm3.isNull)(paymentMethods.deletedAt)
      )
    ).returning();
    return deleted;
  }
  static async restoreMethod(id, userId) {
    const [restored] = await db.update(paymentMethods).set({ deletedAt: null }).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(paymentMethods.id, id), (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId))).returning();
    return restored;
  }
};

// src/modules/payment-methods/payment-methods.schema.ts
var import_zod4 = require("zod");
var createPaymentMethodSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(100)
});
var updatePaymentMethodSchema = createPaymentMethodSchema.partial();

// src/modules/payment-methods/payment-methods.controller.ts
async function listPaymentMethodsHandler(request, reply) {
  const { sub: userId } = request.user;
  const methods = await PaymentMethodModel.findAll(userId);
  return reply.send(methods);
}
async function createPaymentMethodHandler(request, reply) {
  const { sub: userId } = request.user;
  const body = createPaymentMethodSchema.parse(request.body);
  const method = await PaymentMethodModel.createMethod(userId, body);
  return reply.status(201).send(method);
}
async function updatePaymentMethodHandler(request, reply) {
  const { sub: userId } = request.user;
  const { id } = request.params;
  const body = updatePaymentMethodSchema.parse(request.body);
  const updated = await PaymentMethodModel.updateMethod(id, userId, body);
  if (!updated) {
    throw new AppError(
      "M\xE9todo de pagamento n\xE3o encontrado ou j\xE1 deletado",
      404
    );
  }
  return reply.send(updated);
}
async function deletePaymentMethodHandler(request, reply) {
  const { sub: userId } = request.user;
  const { id } = request.params;
  const deleted = await PaymentMethodModel.softDelete(id, userId);
  if (!deleted) {
    throw new AppError(
      "M\xE9todo de pagamento n\xE3o encontrado ou j\xE1 deletado",
      404
    );
  }
  return reply.send({ message: "M\xE9todo de pagamento deletado com sucesso" });
}
async function restorePaymentMethodHandler(request, reply) {
  const { sub: userId } = request.user;
  const { id } = request.params;
  const restored = await PaymentMethodModel.restoreMethod(id, userId);
  if (!restored) {
    throw new AppError("M\xE9todo de pagamento n\xE3o encontrado", 404);
  }
  return reply.send(restored);
}

// src/modules/payment-methods/payment-methods.routes.ts
async function registerPaymentMethodsRoutes(app) {
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get("/payment-methods", listPaymentMethodsHandler);
  app.post("/payment-methods", createPaymentMethodHandler);
  app.put("/payment-methods/:id", updatePaymentMethodHandler);
  app.delete("/payment-methods/:id", deletePaymentMethodHandler);
  app.patch("/payment-methods/:id/restore", restorePaymentMethodHandler);
}

// src/modules/transactions/transactions.model.ts
var import_drizzle_orm4 = require("drizzle-orm");
var TransactionModel = class {
  static async findAll(userId, filters) {
    const query = db.select({
      id: transactions.id,
      description: transactions.description,
      subDescription: transactions.subDescription,
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      categoryId: transactions.categoryId,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon
      },
      paymentMethodId: transactions.paymentMethodId,
      paymentMethod: {
        id: paymentMethods.id,
        name: paymentMethods.name
      },
      createdAt: transactions.createdAt
    }).from(transactions).leftJoin(categories, (0, import_drizzle_orm4.eq)(transactions.categoryId, categories.id)).leftJoin(
      paymentMethods,
      (0, import_drizzle_orm4.eq)(transactions.paymentMethodId, paymentMethods.id)
    ).where(
      (0, import_drizzle_orm4.and)(
        (0, import_drizzle_orm4.eq)(transactions.userId, userId),
        filters.type ? (0, import_drizzle_orm4.eq)(transactions.type, filters.type) : void 0,
        filters.categoryId ? (0, import_drizzle_orm4.eq)(transactions.categoryId, filters.categoryId) : void 0,
        filters.paymentMethodId ? (0, import_drizzle_orm4.eq)(transactions.paymentMethodId, filters.paymentMethodId) : void 0,
        filters.month ? import_drizzle_orm4.sql`to_char(${transactions.date}, 'YYYY-MM') = ${filters.month}` : void 0
      )
    ).orderBy((0, import_drizzle_orm4.desc)(transactions.date), (0, import_drizzle_orm4.desc)(transactions.createdAt)).limit(filters.limit).offset((filters.page - 1) * filters.limit);
    const countQuery = db.select({ count: (0, import_drizzle_orm4.count)() }).from(transactions).where(
      (0, import_drizzle_orm4.and)(
        (0, import_drizzle_orm4.eq)(transactions.userId, userId),
        filters.type ? (0, import_drizzle_orm4.eq)(transactions.type, filters.type) : void 0,
        filters.categoryId ? (0, import_drizzle_orm4.eq)(transactions.categoryId, filters.categoryId) : void 0,
        filters.paymentMethodId ? (0, import_drizzle_orm4.eq)(transactions.paymentMethodId, filters.paymentMethodId) : void 0,
        filters.month ? import_drizzle_orm4.sql`to_char(${transactions.date}, 'YYYY-MM') = ${filters.month}` : void 0
      )
    );
    const [data, [{ count: totalSize }]] = await Promise.all([
      query,
      countQuery
    ]);
    return {
      data,
      total: Number(totalSize)
    };
  }
  static async findById(id, userId) {
    const [transaction] = await db.select({
      id: transactions.id,
      description: transactions.description,
      subDescription: transactions.subDescription,
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      categoryId: transactions.categoryId,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon
      },
      paymentMethodId: transactions.paymentMethodId,
      paymentMethod: {
        id: paymentMethods.id,
        name: paymentMethods.name
      },
      createdAt: transactions.createdAt
    }).from(transactions).leftJoin(categories, (0, import_drizzle_orm4.eq)(transactions.categoryId, categories.id)).leftJoin(
      paymentMethods,
      (0, import_drizzle_orm4.eq)(transactions.paymentMethodId, paymentMethods.id)
    ).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(transactions.id, id), (0, import_drizzle_orm4.eq)(transactions.userId, userId))).limit(1);
    return transaction;
  }
  static async createTransaction(userId, data) {
    const [transaction] = await db.insert(transactions).values({
      userId,
      description: data.description,
      subDescription: data.subDescription,
      amount: data.amount.toString(),
      type: data.type,
      date: new Date(data.date),
      categoryId: data.categoryId,
      paymentMethodId: data.paymentMethodId
    }).returning();
    return transaction;
  }
  static async updateTransaction(id, userId, data) {
    const updateData = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    if (data.amount) updateData.amount = data.amount.toString();
    const [updated] = await db.update(transactions).set(updateData).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(transactions.id, id), (0, import_drizzle_orm4.eq)(transactions.userId, userId))).returning();
    return updated;
  }
  static async deleteTransaction(id, userId) {
    const [deleted] = await db.delete(transactions).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(transactions.id, id), (0, import_drizzle_orm4.eq)(transactions.userId, userId))).returning();
    return deleted;
  }
};

// src/modules/transactions/transactions.schema.ts
var import_zod5 = require("zod");
var createTransactionSchema = import_zod5.z.object({
  description: import_zod5.z.string().min(1, "Descri\xE7\xE3o \xE9 obrigat\xF3ria").max(120),
  subDescription: import_zod5.z.string().max(120).optional(),
  amount: import_zod5.z.number().positive("O valor deve ser positivo"),
  type: import_zod5.z.enum(["income", "expense"], {
    errorMap: () => ({ message: "O tipo deve ser income ou expense" })
  }),
  date: import_zod5.z.string().datetime({ message: "A data deve ser ISO 8601 v\xE1lida" }),
  categoryId: import_zod5.z.string().uuid("ID de categoria inv\xE1lido").optional(),
  paymentMethodId: import_zod5.z.string().uuid("ID de m\xE9todo de pagamento inv\xE1lido").optional()
});
var updateTransactionSchema = createTransactionSchema.partial();
var listTransactionsSchema = import_zod5.z.object({
  month: import_zod5.z.string().regex(/^\d{4}-\d{2}$/, "Formato de m\xEAs inv\xE1lido (esperado: YYYY-MM)").optional(),
  type: import_zod5.z.enum(["income", "expense"]).optional(),
  categoryId: import_zod5.z.string().uuid().optional(),
  paymentMethodId: import_zod5.z.string().uuid().optional(),
  page: import_zod5.z.coerce.number().min(1).default(1),
  limit: import_zod5.z.coerce.number().min(1).max(100).default(10)
});

// src/modules/transactions/transactions.controller.ts
async function listTransactionsHandler(request, reply) {
  const { sub: userId } = request.user;
  const filters = listTransactionsSchema.parse(request.query);
  const result = await TransactionModel.findAll(userId, filters);
  return reply.send(result);
}
async function getTransactionHandler(request, reply) {
  const { sub: userId } = request.user;
  const { id } = request.params;
  const transaction = await TransactionModel.findById(id, userId);
  if (!transaction) {
    throw new AppError("Transa\xE7\xE3o n\xE3o encontrada", 404);
  }
  return reply.send(transaction);
}
async function createTransactionHandler(request, reply) {
  const { sub: userId } = request.user;
  const body = createTransactionSchema.parse(request.body);
  if (body.categoryId) {
    const category = await CategoryModel.findById(body.categoryId, userId);
    if (!category) throw new AppError("Categoria n\xE3o encontrada", 404);
  }
  if (body.paymentMethodId) {
    const method = await PaymentMethodModel.findById(
      body.paymentMethodId,
      userId
    );
    if (!method) throw new AppError("M\xE9todo de pagamento n\xE3o encontrado", 404);
  }
  const transaction = await TransactionModel.createTransaction(userId, body);
  return reply.status(201).send(transaction);
}
async function updateTransactionHandler(request, reply) {
  const { sub: userId } = request.user;
  const { id } = request.params;
  const body = updateTransactionSchema.parse(request.body);
  if (body.categoryId) {
    const category = await CategoryModel.findById(body.categoryId, userId);
    if (!category) throw new AppError("Categoria n\xE3o encontrada", 404);
  }
  if (body.paymentMethodId) {
    const method = await PaymentMethodModel.findById(
      body.paymentMethodId,
      userId
    );
    if (!method) throw new AppError("M\xE9todo de pagamento n\xE3o encontrado", 404);
  }
  const updated = await TransactionModel.updateTransaction(id, userId, body);
  if (!updated) {
    throw new AppError("Transa\xE7\xE3o n\xE3o encontrada", 404);
  }
  const reloaded = await TransactionModel.findById(id, userId);
  return reply.send(reloaded);
}
async function deleteTransactionHandler(request, reply) {
  const { sub: userId } = request.user;
  const { id } = request.params;
  const deleted = await TransactionModel.deleteTransaction(id, userId);
  if (!deleted) {
    throw new AppError("Transa\xE7\xE3o n\xE3o encontrada", 404);
  }
  return reply.send({ message: "Transa\xE7\xE3o deletada com sucesso" });
}

// src/modules/transactions/transactions.routes.ts
async function registerTransactionsRoutes(app) {
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get("/transactions", listTransactionsHandler);
  app.get("/transactions/:id", getTransactionHandler);
  app.post("/transactions", createTransactionHandler);
  app.put("/transactions/:id", updateTransactionHandler);
  app.delete("/transactions/:id", deleteTransactionHandler);
}

// src/modules/summary/summary.model.ts
var import_drizzle_orm5 = require("drizzle-orm");
var SummaryModel = class {
  static async getSummary(userId, month) {
    const currentMonth = month || (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    const [prevYear, prevMonth] = currentMonth.split("-").map(Number);
    const previousMonth = prevMonth === 1 ? `${prevYear - 1}-12` : `${prevYear}-${String(prevMonth - 1).padStart(2, "0")}`;
    const monthFilter = import_drizzle_orm5.sql`to_char(${transactions.date}, 'YYYY-MM') = ${currentMonth}`;
    const previousMonthFilter = import_drizzle_orm5.sql`to_char(${transactions.date}, 'YYYY-MM') = ${previousMonth}`;
    const [balanceResult] = await db.select({
      total: import_drizzle_orm5.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`
    }).from(transactions).where((0, import_drizzle_orm5.eq)(transactions.userId, userId));
    const [currentMonthTotals] = await db.select({
      income: import_drizzle_orm5.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
      expense: import_drizzle_orm5.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
    }).from(transactions).where((0, import_drizzle_orm5.and)((0, import_drizzle_orm5.eq)(transactions.userId, userId), monthFilter));
    const [previousMonthTotals] = await db.select({
      expense: import_drizzle_orm5.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
    }).from(transactions).where((0, import_drizzle_orm5.and)((0, import_drizzle_orm5.eq)(transactions.userId, userId), previousMonthFilter));
    const expenseChange = previousMonthTotals.expense > 0 ? (currentMonthTotals.expense - previousMonthTotals.expense) / previousMonthTotals.expense * 100 : 0;
    return {
      totalBalance: Number(balanceResult.total),
      monthlyIncome: Number(currentMonthTotals.income),
      monthlyExpense: Number(currentMonthTotals.expense),
      monthlyChange: Number(expenseChange.toFixed(2))
    };
  }
  static async getMonthlySummary(userId) {
    const result = await db.select({
      month: import_drizzle_orm5.sql`to_char(${transactions.date}, 'YYYY-MM')`,
      income: import_drizzle_orm5.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
      expense: import_drizzle_orm5.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
    }).from(transactions).where(
      (0, import_drizzle_orm5.and)(
        (0, import_drizzle_orm5.eq)(transactions.userId, userId),
        import_drizzle_orm5.sql`${transactions.date} >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'`
      )
    ).groupBy(import_drizzle_orm5.sql`to_char(${transactions.date}, 'YYYY-MM')`).orderBy(import_drizzle_orm5.sql`to_char(${transactions.date}, 'YYYY-MM')`);
    return result.map((r) => ({
      month: r.month,
      income: Number(r.income),
      expense: Number(r.expense),
      balance: Number(r.income) - Number(r.expense)
    }));
  }
  static async getByCategorySummary(userId) {
    const expenses = await db.select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      color: categories.color,
      total: import_drizzle_orm5.sql`SUM(${transactions.amount})`
    }).from(transactions).leftJoin(categories, (0, import_drizzle_orm5.eq)(transactions.categoryId, categories.id)).where(
      (0, import_drizzle_orm5.and)(
        (0, import_drizzle_orm5.eq)(transactions.userId, userId),
        (0, import_drizzle_orm5.eq)(transactions.type, "expense"),
        import_drizzle_orm5.sql`${transactions.date} >= DATE_TRUNC('month', CURRENT_DATE)`
      )
    ).groupBy(transactions.categoryId, categories.name, categories.color).orderBy((0, import_drizzle_orm5.desc)(import_drizzle_orm5.sql`SUM(${transactions.amount})`));
    const totalExpense = expenses.reduce(
      (acc, curr) => acc + Number(curr.total),
      0
    );
    return expenses.map((e) => ({
      categoryId: e.categoryId || "others",
      categoryName: e.categoryName || "Outros",
      color: e.color || "#8892A4",
      total: Number(e.total),
      percentage: totalExpense > 0 ? Number((Number(e.total) / totalExpense * 100).toFixed(1)) : 0
    }));
  }
};

// src/modules/summary/summary.schema.ts
var import_zod6 = require("zod");
var summaryQuerySchema = import_zod6.z.object({
  month: import_zod6.z.string().regex(/^\d{4}-\d{2}$/, "Formato de m\xEAs inv\xE1lido (esperado: YYYY-MM)").optional()
});

// src/modules/summary/summary.controller.ts
async function getSummaryHandler(request, reply) {
  const { sub: userId } = request.user;
  const { month } = summaryQuerySchema.parse(request.query);
  const summary = await SummaryModel.getSummary(userId, month);
  return reply.send(summary);
}
async function getMonthlySummaryHandler(request, reply) {
  const { sub: userId } = request.user;
  const monthly = await SummaryModel.getMonthlySummary(userId);
  return reply.send(monthly);
}
async function getByCategorySummaryHandler(request, reply) {
  const { sub: userId } = request.user;
  const byCategory = await SummaryModel.getByCategorySummary(userId);
  return reply.send(byCategory);
}

// src/modules/summary/summary.routes.ts
async function registerSummaryRoutes(app) {
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get("/summary", getSummaryHandler);
  app.get("/summary/monthly", getMonthlySummaryHandler);
  app.get("/summary/by-category", getByCategorySummaryHandler);
}

// src/config/routes.ts
async function registerRoutes(app) {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }));
  await registerAuthRoutes(app);
  await registerCategoriesRoutes(app);
  await registerPaymentMethodsRoutes(app);
  await registerTransactionsRoutes(app);
  await registerSummaryRoutes(app);
}

// src/errors/errorHandler.ts
async function errorHandler(error, _request, reply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: "Bad Request",
      message: error.message
    });
  }
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Validation Error",
      message: error.message,
      details: error.validation
    });
  }
  const statusCode = error.statusCode ?? 500;
  reply.log.error(error);
  return reply.status(statusCode).send({
    statusCode,
    error: statusCode >= 500 ? "Internal Server Error" : "Error",
    message: statusCode >= 500 ? "An unexpected error occurred" : error.message
  });
}

// src/config/app.ts
async function buildApp() {
  const app = (0, import_fastify.default)({ logger: true });
  await app.register(import_cors.default, { origin: env.CORS_ORIGIN });
  await app.register(import_jwt.default, { secret: env.JWT_SECRET });
  await app.register(import_swagger.default, {
    openapi: {
      info: { title: "FinanceApp API", version: "1.0.0" }
    }
  });
  await registerRoutes(app);
  app.setErrorHandler(errorHandler);
  return app;
}

// src/index.ts
async function start() {
  const app = await buildApp();
  app.listen({ port: env.PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server running on port ${env.PORT}`);
  });
}
start();
