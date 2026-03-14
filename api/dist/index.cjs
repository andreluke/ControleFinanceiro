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
var __copyProps = (to, from, except, desc4) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc4 = __getOwnPropDesc(from, key)) || desc4.enumerable });
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
var import_cors = __toESM(require("@fastify/cors"), 1);
var import_cookie = __toESM(require("@fastify/cookie"), 1);
var import_jwt = __toESM(require("@fastify/jwt"), 1);
var import_swagger = __toESM(require("@fastify/swagger"), 1);
var import_swagger_ui = __toESM(require("@fastify/swagger-ui"), 1);
var import_fastify = __toESM(require("fastify"), 1);

// src/errors/AppError.ts
var AppError = class extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.name = "AppError";
  }
};

// src/errors/errorHandler.ts
var import_zod = require("zod");
var isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
var errorMessages = {
  DEFAULT: "Algo deu errado. Tente novamente mais tarde.",
  DB_CONNECTION: "Erro de conex\xE3o com o banco de dados.",
  DB_QUERY: "Erro ao processar sua solicita\xE7\xE3o.",
  AUTH_INVALID: "E-mail ou senha incorretos.",
  AUTH_EMAIL_EXISTS: "Este e-mail j\xE1 est\xE1 cadastrado.",
  AUTH_UNAUTHORIZED: "Voc\xEA precisa estar autenticado para acessar este recurso.",
  NOT_FOUND: "Registro n\xE3o encontrado.",
  VALIDATION: "Dados inv\xE1lidos. Verifique os campos obrigat\xF3rios."
};
async function errorHandler(error, _request, reply) {
  const err = error;
  if (err.name === "ZodError" || err instanceof import_zod.ZodError) {
    const zodErr = err;
    const firstError = zodErr.errors[0];
    let message2 = "Dados inv\xE1lidos.";
    if (firstError) {
      const field = firstError.path.join(".");
      const fieldName = field ? field.replace(/.*\./, "") : "campo";
      if (firstError.code === "invalid_type") {
        message2 = `O campo "${fieldName}" \xE9 obrigat\xF3rio.`;
      } else if (firstError.code === "invalid_enum_value") {
        const validOptions = firstError.options?.join(", ") || "valores v\xE1lidos";
        message2 = `Valor inv\xE1lido para "${fieldName}". Use: ${validOptions}`;
      } else {
        message2 = firstError.message || "Dados inv\xE1lidos.";
      }
    }
    return reply.status(400).send({
      statusCode: 400,
      error: "Validation Error",
      message: message2,
      details: isDevelopment ? zodErr.errors : void 0
    });
  }
  if (error instanceof AppError) {
    const friendlyMessage = errorMessages[error.message.toUpperCase().replace(/ /g, "_")] || error.message;
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.statusCode === 401 ? "Unauthorized" : "Bad Request",
      message: friendlyMessage
    });
  }
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Validation Error",
      message: errorMessages.VALIDATION,
      details: isDevelopment ? error.validation : void 0
    });
  }
  const statusCode = error.statusCode ?? 500;
  const message = statusCode >= 500 ? errorMessages.DEFAULT : error.message;
  if (isDevelopment) {
    reply.log.error(error);
  }
  return reply.status(statusCode).send({
    statusCode,
    error: statusCode >= 500 ? "Internal Server Error" : "Error",
    message
  });
}

// src/settings/env.ts
var import_zod2 = require("zod");
var envSchema = import_zod2.z.object({
  PORT: import_zod2.z.coerce.number().default(3e3),
  DATABASE_URL: import_zod2.z.string().url(),
  JWT_SECRET: import_zod2.z.string().min(32),
  CORS_ORIGIN: import_zod2.z.string().default("*")
});
var env = envSchema.parse(process.env);

// src/utils/catchError.ts
async function catchError(promise) {
  try {
    const result = await promise;
    return [null, result];
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return [error, null];
  }
}

// src/modules/auth/auth.model.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_drizzle_orm = require("drizzle-orm");

// src/drizzle/client.ts
var import_postgres_js = require("drizzle-orm/postgres-js");
var import_postgres = __toESM(require("postgres"), 1);

// src/drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  frequencyEnum: () => frequencyEnum,
  paymentMethods: () => paymentMethods,
  recurringTransactions: () => recurringTransactions,
  transactionTypeEnum: () => transactionTypeEnum,
  transactions: () => transactions,
  users: () => users
});
var import_pg_core = require("drizzle-orm/pg-core");
var transactionTypeEnum = (0, import_pg_core.pgEnum)("transaction_type", [
  "income",
  "expense"
]);
var frequencyEnum = (0, import_pg_core.pgEnum)("frequency_type", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom"
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
var recurringTransactions = (0, import_pg_core.pgTable)("recurring_transactions", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  subDescription: (0, import_pg_core.text)("sub_description"),
  amount: (0, import_pg_core.numeric)("amount", { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  categoryId: (0, import_pg_core.uuid)("category_id").references(() => categories.id),
  paymentMethodId: (0, import_pg_core.uuid)("payment_method_id").references(
    () => paymentMethods.id
  ),
  frequency: frequencyEnum("frequency").notNull(),
  customIntervalDays: (0, import_pg_core.numeric)("custom_interval_days"),
  dayOfMonth: (0, import_pg_core.numeric)("day_of_month").notNull(),
  dayOfWeek: (0, import_pg_core.numeric)("day_of_week"),
  startDate: (0, import_pg_core.timestamp)("start_date").notNull(),
  endDate: (0, import_pg_core.timestamp)("end_date"),
  isActive: (0, import_pg_core.boolean)("is_active").notNull().default(true),
  lastGeneratedAt: (0, import_pg_core.timestamp)("last_generated_at"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});

// src/drizzle/client.ts
var client = (0, import_postgres.default)(env.DATABASE_URL);
var db = (0, import_postgres_js.drizzle)(client, { schema: schema_exports });

// src/modules/auth/auth.model.ts
var SALT_ROUNDS = 10;
var AuthModel = class {
  async findByEmail(email) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.email, email)).limit(1);
    return user;
  }
  async findById(id) {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    }).from(users).where((0, import_drizzle_orm.eq)(users.id, id)).limit(1);
    return user;
  }
  async verifyPassword(password, hash) {
    return import_bcryptjs.default.compare(password, hash);
  }
  async createUser(data) {
    const hash = await import_bcryptjs.default.hash(data.password, SALT_ROUNDS);
    const [user] = await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hash
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    });
    return user;
  }
};

// src/modules/auth/auth.schema.ts
var import_zod3 = require("zod");
var registerSchema = import_zod3.z.object({
  name: import_zod3.z.string().min(1).max(120),
  email: import_zod3.z.string().email(),
  password: import_zod3.z.string().min(6).max(128)
});
var loginSchema = import_zod3.z.object({
  email: import_zod3.z.string().email(),
  password: import_zod3.z.string().min(6).max(128),
  rememberMe: import_zod3.z.boolean().optional()
});

// src/modules/auth/auth.controller.ts
var AuthController = class {
  constructor(authModel = new AuthModel()) {
    this.authModel = authModel;
  }
  register = async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const [errExisting, existing] = await catchError(
      this.authModel.findByEmail(body.email)
    );
    if (errExisting) throw new AppError("Erro ao verificar email", 500);
    if (existing) {
      throw new AppError("E-mail j\xE1 cadastrado", 409);
    }
    const [errCreate, user] = await catchError(this.authModel.createUser(body));
    if (errCreate || !user) throw new AppError("Erro ao criar usu\xE1rio", 500);
    return reply.status(201).send({ user });
  };
  login = async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const [errUser, user] = await catchError(
      this.authModel.findByEmail(body.email)
    );
    if (errUser) throw new AppError("Erro ao buscar usu\xE1rio", 500);
    if (!user) {
      throw new AppError("Credenciais inv\xE1lidas", 401);
    }
    const [errValid, isValid] = await catchError(
      this.authModel.verifyPassword(body.password, user.password)
    );
    if (errValid) throw new AppError("Erro ao verificar senha", 500);
    if (!isValid) {
      throw new AppError("Credenciais inv\xE1lidas", 401);
    }
    const expiresIn = body.rememberMe ? "30d" : "24h";
    const [errToken, token] = await catchError(
      reply.jwtSign(
        {
          sub: user.id,
          email: user.email
        },
        { expiresIn }
      )
    );
    if (errToken) throw new AppError("Erro ao gerar token", 500);
    reply.setCookie("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: body.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
    });
    return reply.send({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  };
  me = async (request, reply) => {
    await catchError(request.jwtVerify());
    const { sub } = request.user;
    const [errUser, user] = await catchError(this.authModel.findById(sub));
    if (errUser) throw new AppError("Erro ao buscar dados do usu\xE1rio", 500);
    if (!user) {
      throw new AppError("Usu\xE1rio n\xE3o encontrado", 404);
    }
    return reply.send({ user });
  };
  logout = async (_request, reply) => {
    reply.clearCookie("token", { path: "/" });
    return reply.send({ message: "Logout realizado" });
  };
};

// src/modules/auth/auth.routes.ts
async function registerAuthRoutes(app) {
  const authController = new AuthController();
  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);
  app.post("/auth/logout", authController.logout);
  app.get("/auth/me", authController.me);
}

// src/modules/categories/categories.model.ts
var import_drizzle_orm2 = require("drizzle-orm");
var CategoryModel = class {
  async findAll(userId) {
    return db.select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      icon: categories.icon
    }).from(categories).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(categories.userId, userId), (0, import_drizzle_orm2.isNull)(categories.deletedAt))).orderBy((0, import_drizzle_orm2.asc)(categories.name));
  }
  async findById(id, userId) {
    const [category] = await db.select().from(categories).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(categories.id, id), (0, import_drizzle_orm2.eq)(categories.userId, userId))).limit(1);
    return category;
  }
  async createCategory(userId, data) {
    const [category] = await db.insert(categories).values({
      userId,
      name: data.name,
      color: data.color || "#3B82F6",
      icon: data.icon
    }).returning();
    return category;
  }
  async updateCategory(id, userId, data) {
    const [updated] = await db.update(categories).set(data).where(
      (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(categories.id, id),
        (0, import_drizzle_orm2.eq)(categories.userId, userId),
        (0, import_drizzle_orm2.isNull)(categories.deletedAt)
      )
    ).returning();
    return updated;
  }
  async softDelete(id, userId) {
    const [deleted] = await db.update(categories).set({ deletedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(categories.id, id),
        (0, import_drizzle_orm2.eq)(categories.userId, userId),
        (0, import_drizzle_orm2.isNull)(categories.deletedAt)
      )
    ).returning();
    return deleted;
  }
  async restoreCategory(id, userId) {
    const [restored] = await db.update(categories).set({ deletedAt: null }).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(categories.id, id), (0, import_drizzle_orm2.eq)(categories.userId, userId))).returning();
    return restored;
  }
};

// src/modules/categories/categories.schema.ts
var import_zod4 = require("zod");
var createCategorySchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(100),
  color: import_zod4.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inv\xE1lida").optional(),
  icon: import_zod4.z.string().optional()
});
var updateCategorySchema = createCategorySchema.partial();

// src/modules/categories/categories.controller.ts
var CategoriesController = class {
  constructor(categoryModel = new CategoryModel()) {
    this.categoryModel = categoryModel;
  }
  listCategories = async (request, reply) => {
    const { sub: userId } = request.user;
    const [err, categories2] = await catchError(
      this.categoryModel.findAll(userId)
    );
    if (err) throw new AppError("Erro ao listar categorias", 500);
    return reply.send(categories2);
  };
  createCategory = async (request, reply) => {
    const { sub: userId } = request.user;
    const body = createCategorySchema.parse(request.body);
    const [err, category] = await catchError(
      this.categoryModel.createCategory(userId, body)
    );
    if (err) throw new AppError("Erro ao criar categoria", 500);
    return reply.status(201).send(category);
  };
  updateCategory = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const body = updateCategorySchema.parse(request.body);
    const [err, updated] = await catchError(
      this.categoryModel.updateCategory(id, userId, body)
    );
    if (err) throw new AppError("Erro ao atualizar categoria", 500);
    if (!updated) {
      throw new AppError("Categoria n\xE3o encontrada ou j\xE1 deletada", 404);
    }
    return reply.send(updated);
  };
  deleteCategory = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [err, deleted] = await catchError(
      this.categoryModel.softDelete(id, userId)
    );
    if (err) throw new AppError("Erro ao deletar categoria", 500);
    if (!deleted) {
      throw new AppError("Categoria n\xE3o encontrada ou j\xE1 deletada", 404);
    }
    return reply.send({ message: "Categoria deletada com sucesso" });
  };
  restoreCategory = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [err, restored] = await catchError(
      this.categoryModel.restoreCategory(id, userId)
    );
    if (err) throw new AppError("Erro ao restaurar categoria", 500);
    if (!restored) {
      throw new AppError("Categoria n\xE3o encontrada", 404);
    }
    return reply.send(restored);
  };
};

// src/modules/categories/categories.routes.ts
async function registerCategoriesRoutes(app) {
  const categoriesController = new CategoriesController();
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get("/categories", categoriesController.listCategories);
  app.post("/categories", categoriesController.createCategory);
  app.put("/categories/:id", categoriesController.updateCategory);
  app.delete("/categories/:id", categoriesController.deleteCategory);
  app.patch("/categories/:id/restore", categoriesController.restoreCategory);
}

// src/modules/payment-methods/payment-methods.model.ts
var import_drizzle_orm3 = require("drizzle-orm");
var PaymentMethodModel = class {
  async findAll(userId) {
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
  async findById(id, userId) {
    const [method] = await db.select().from(paymentMethods).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(paymentMethods.id, id), (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId))).limit(1);
    return method;
  }
  async createMethod(userId, data) {
    const [method] = await db.insert(paymentMethods).values({
      userId,
      name: data.name
    }).returning();
    return method;
  }
  async updateMethod(id, userId, data) {
    const [updated] = await db.update(paymentMethods).set(data).where(
      (0, import_drizzle_orm3.and)(
        (0, import_drizzle_orm3.eq)(paymentMethods.id, id),
        (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId),
        (0, import_drizzle_orm3.isNull)(paymentMethods.deletedAt)
      )
    ).returning();
    return updated;
  }
  async softDelete(id, userId) {
    const [deleted] = await db.update(paymentMethods).set({ deletedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm3.and)(
        (0, import_drizzle_orm3.eq)(paymentMethods.id, id),
        (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId),
        (0, import_drizzle_orm3.isNull)(paymentMethods.deletedAt)
      )
    ).returning();
    return deleted;
  }
  async restoreMethod(id, userId) {
    const [restored] = await db.update(paymentMethods).set({ deletedAt: null }).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(paymentMethods.id, id), (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId))).returning();
    return restored;
  }
};

// src/modules/payment-methods/payment-methods.schema.ts
var import_zod5 = require("zod");
var createPaymentMethodSchema = import_zod5.z.object({
  name: import_zod5.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(100)
});
var updatePaymentMethodSchema = createPaymentMethodSchema.partial();

// src/modules/payment-methods/payment-methods.controller.ts
var PaymentMethodsController = class {
  constructor(paymentMethodModel = new PaymentMethodModel()) {
    this.paymentMethodModel = paymentMethodModel;
  }
  listPaymentMethods = async (request, reply) => {
    const { sub: userId } = request.user;
    const [err, methods] = await catchError(
      this.paymentMethodModel.findAll(userId)
    );
    if (err) throw new AppError("Erro ao listar m\xE9todos de pagamento", 500);
    return reply.send(methods);
  };
  createPaymentMethod = async (request, reply) => {
    const { sub: userId } = request.user;
    const body = createPaymentMethodSchema.parse(request.body);
    const [err, method] = await catchError(
      this.paymentMethodModel.createMethod(userId, body)
    );
    if (err) throw new AppError("Erro ao criar m\xE9todo de pagamento", 500);
    return reply.status(201).send(method);
  };
  updatePaymentMethod = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const body = updatePaymentMethodSchema.parse(request.body);
    const [err, updated] = await catchError(
      this.paymentMethodModel.updateMethod(id, userId, body)
    );
    if (err) throw new AppError("Erro ao atualizar m\xE9todo de pagamento", 500);
    if (!updated) {
      throw new AppError(
        "M\xE9todo de pagamento n\xE3o encontrado ou j\xE1 deletado",
        404
      );
    }
    return reply.send(updated);
  };
  deletePaymentMethod = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [err, deleted] = await catchError(
      this.paymentMethodModel.softDelete(id, userId)
    );
    if (err) throw new AppError("Erro ao deletar m\xE9todo de pagamento", 500);
    if (!deleted) {
      throw new AppError(
        "M\xE9todo de pagamento n\xE3o encontrado ou j\xE1 deletado",
        404
      );
    }
    return reply.send({ message: "M\xE9todo de pagamento deletado com sucesso" });
  };
  restorePaymentMethod = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [err, restored] = await catchError(
      this.paymentMethodModel.restoreMethod(id, userId)
    );
    if (err) throw new AppError("Erro ao restaurar m\xE9todo de pagamento", 500);
    if (!restored) {
      throw new AppError("M\xE9todo de pagamento n\xE3o encontrado", 404);
    }
    return reply.send(restored);
  };
};

// src/modules/payment-methods/payment-methods.routes.ts
async function registerPaymentMethodsRoutes(app) {
  const paymentMethodsController = new PaymentMethodsController();
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get("/payment-methods", paymentMethodsController.listPaymentMethods);
  app.post("/payment-methods", paymentMethodsController.createPaymentMethod);
  app.put("/payment-methods/:id", paymentMethodsController.updatePaymentMethod);
  app.delete(
    "/payment-methods/:id",
    paymentMethodsController.deletePaymentMethod
  );
  app.patch(
    "/payment-methods/:id/restore",
    paymentMethodsController.restorePaymentMethod
  );
}

// src/modules/transactions/transactions.model.ts
var import_drizzle_orm4 = require("drizzle-orm");
var TransactionModel = class {
  async findAll(userId, filters) {
    const startDate = filters.startDate ? new Date(filters.startDate) : void 0;
    const endDate = filters.endDate ? new Date(filters.endDate) : void 0;
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
        filters.month ? import_drizzle_orm4.sql`to_char(${transactions.date}, 'YYYY-MM') = ${filters.month}` : void 0,
        startDate ? (0, import_drizzle_orm4.gte)(transactions.date, startDate) : void 0,
        endDate ? (0, import_drizzle_orm4.lte)(transactions.date, endDate) : void 0
      )
    ).orderBy((0, import_drizzle_orm4.desc)(transactions.date), (0, import_drizzle_orm4.desc)(transactions.createdAt)).limit(filters.limit).offset((filters.page - 1) * filters.limit);
    const countQuery = db.select({ count: (0, import_drizzle_orm4.count)() }).from(transactions).where(
      (0, import_drizzle_orm4.and)(
        (0, import_drizzle_orm4.eq)(transactions.userId, userId),
        filters.type ? (0, import_drizzle_orm4.eq)(transactions.type, filters.type) : void 0,
        filters.categoryId ? (0, import_drizzle_orm4.eq)(transactions.categoryId, filters.categoryId) : void 0,
        filters.paymentMethodId ? (0, import_drizzle_orm4.eq)(transactions.paymentMethodId, filters.paymentMethodId) : void 0,
        filters.month ? import_drizzle_orm4.sql`to_char(${transactions.date}, 'YYYY-MM') = ${filters.month}` : void 0,
        startDate ? (0, import_drizzle_orm4.gte)(transactions.date, startDate) : void 0,
        endDate ? (0, import_drizzle_orm4.lte)(transactions.date, endDate) : void 0
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
  async findById(id, userId) {
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
  async createTransaction(userId, data) {
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
  async updateTransaction(id, userId, data) {
    const updateData = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    if (data.amount) updateData.amount = data.amount.toString();
    const [updated] = await db.update(transactions).set(updateData).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(transactions.id, id), (0, import_drizzle_orm4.eq)(transactions.userId, userId))).returning();
    return updated;
  }
  async deleteTransaction(id, userId) {
    const [deleted] = await db.delete(transactions).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(transactions.id, id), (0, import_drizzle_orm4.eq)(transactions.userId, userId))).returning();
    return deleted;
  }
};

// src/modules/recurring/recurring.model.ts
var import_drizzle_orm5 = require("drizzle-orm");
var RecurringTransactionModel = class {
  async findAll(userId, filters) {
    let conditions = (0, import_drizzle_orm5.eq)(recurringTransactions.userId, userId);
    if (filters?.isActive !== void 0) {
      conditions = (0, import_drizzle_orm5.and)(
        conditions,
        (0, import_drizzle_orm5.eq)(recurringTransactions.isActive, filters.isActive)
      );
    }
    if (filters?.type) {
      conditions = (0, import_drizzle_orm5.and)(
        conditions,
        (0, import_drizzle_orm5.eq)(recurringTransactions.type, filters.type)
      );
    }
    return db.select({
      id: recurringTransactions.id,
      description: recurringTransactions.description,
      subDescription: recurringTransactions.subDescription,
      amount: recurringTransactions.amount,
      type: recurringTransactions.type,
      categoryId: recurringTransactions.categoryId,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon
      },
      paymentMethodId: recurringTransactions.paymentMethodId,
      paymentMethod: {
        id: paymentMethods.id,
        name: paymentMethods.name
      },
      frequency: recurringTransactions.frequency,
      customIntervalDays: recurringTransactions.customIntervalDays,
      dayOfMonth: recurringTransactions.dayOfMonth,
      dayOfWeek: recurringTransactions.dayOfWeek,
      startDate: recurringTransactions.startDate,
      endDate: recurringTransactions.endDate,
      isActive: recurringTransactions.isActive,
      lastGeneratedAt: recurringTransactions.lastGeneratedAt,
      createdAt: recurringTransactions.createdAt
    }).from(recurringTransactions).leftJoin(categories, (0, import_drizzle_orm5.eq)(recurringTransactions.categoryId, categories.id)).leftJoin(
      paymentMethods,
      (0, import_drizzle_orm5.eq)(recurringTransactions.paymentMethodId, paymentMethods.id)
    ).where(conditions).orderBy((0, import_drizzle_orm5.asc)(recurringTransactions.createdAt));
  }
  async findById(id, userId) {
    const [recurring] = await db.select({
      id: recurringTransactions.id,
      description: recurringTransactions.description,
      subDescription: recurringTransactions.subDescription,
      amount: recurringTransactions.amount,
      type: recurringTransactions.type,
      categoryId: recurringTransactions.categoryId,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon
      },
      paymentMethodId: recurringTransactions.paymentMethodId,
      paymentMethod: {
        id: paymentMethods.id,
        name: paymentMethods.name
      },
      frequency: recurringTransactions.frequency,
      customIntervalDays: recurringTransactions.customIntervalDays,
      dayOfMonth: recurringTransactions.dayOfMonth,
      dayOfWeek: recurringTransactions.dayOfWeek,
      startDate: recurringTransactions.startDate,
      endDate: recurringTransactions.endDate,
      isActive: recurringTransactions.isActive,
      lastGeneratedAt: recurringTransactions.lastGeneratedAt,
      createdAt: recurringTransactions.createdAt
    }).from(recurringTransactions).leftJoin(categories, (0, import_drizzle_orm5.eq)(recurringTransactions.categoryId, categories.id)).leftJoin(
      paymentMethods,
      (0, import_drizzle_orm5.eq)(recurringTransactions.paymentMethodId, paymentMethods.id)
    ).where(
      (0, import_drizzle_orm5.and)(
        (0, import_drizzle_orm5.eq)(recurringTransactions.id, id),
        (0, import_drizzle_orm5.eq)(recurringTransactions.userId, userId)
      )
    ).limit(1);
    return recurring;
  }
  async createRecurringTransaction(userId, data) {
    const [recurring] = await db.insert(recurringTransactions).values({
      userId,
      description: data.description,
      subDescription: data.subDescription,
      amount: data.amount.toString(),
      type: data.type,
      categoryId: data.categoryId,
      paymentMethodId: data.paymentMethodId,
      frequency: data.frequency,
      customIntervalDays: data.customIntervalDays?.toString(),
      dayOfMonth: data.dayOfMonth.toString(),
      dayOfWeek: data.dayOfWeek?.toString(),
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      isActive: true
    }).returning();
    return recurring;
  }
  async updateRecurringTransaction(id, userId, data) {
    const updateData = { ...data };
    if (data.amount !== void 0) {
      updateData.amount = data.amount.toString();
    }
    if (data.dayOfMonth !== void 0) {
      updateData.dayOfMonth = data.dayOfMonth.toString();
    }
    if (data.dayOfWeek !== void 0) {
      updateData.dayOfWeek = data.dayOfWeek.toString();
    }
    if (data.customIntervalDays !== void 0) {
      updateData.customIntervalDays = data.customIntervalDays.toString();
    }
    if (data.startDate !== void 0) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate !== void 0) {
      updateData.endDate = new Date(data.endDate);
    }
    updateData.updatedAt = /* @__PURE__ */ new Date();
    const [updated] = await db.update(recurringTransactions).set(updateData).where(
      (0, import_drizzle_orm5.and)(
        (0, import_drizzle_orm5.eq)(recurringTransactions.id, id),
        (0, import_drizzle_orm5.eq)(recurringTransactions.userId, userId)
      )
    ).returning();
    return updated;
  }
  async toggleActive(id, userId) {
    const existing = await this.findById(id, userId);
    if (!existing) return null;
    const [updated] = await db.update(recurringTransactions).set({ isActive: !existing.isActive, updatedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm5.and)(
        (0, import_drizzle_orm5.eq)(recurringTransactions.id, id),
        (0, import_drizzle_orm5.eq)(recurringTransactions.userId, userId)
      )
    ).returning();
    return updated;
  }
  async softDelete(id, userId) {
    const [deleted] = await db.update(recurringTransactions).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm5.and)(
        (0, import_drizzle_orm5.eq)(recurringTransactions.id, id),
        (0, import_drizzle_orm5.eq)(recurringTransactions.userId, userId)
      )
    ).returning();
    return deleted;
  }
};

// src/modules/recurring/recurring.schema.ts
var import_zod6 = require("zod");
var recurringTransactionBaseSchema = import_zod6.z.object({
  description: import_zod6.z.string().min(1, "Descri\xE7\xE3o \xE9 obrigat\xF3ria").max(120),
  subDescription: import_zod6.z.string().max(120).optional(),
  amount: import_zod6.z.number().positive("O valor deve ser positivo"),
  type: import_zod6.z.enum(["income", "expense"], {
    errorMap: () => ({ message: "O tipo deve ser income ou expense" })
  }),
  categoryId: import_zod6.z.string().uuid("ID de categoria inv\xE1lido").optional(),
  paymentMethodId: import_zod6.z.string().uuid("ID de m\xE9todo de pagamento inv\xE1lido").optional(),
  frequency: import_zod6.z.enum(["daily", "weekly", "monthly", "yearly", "custom"], {
    errorMap: () => ({ message: "Frequ\xEAncia inv\xE1lida" })
  }),
  customIntervalDays: import_zod6.z.number().min(1, "Intervalo deve ser pelo menos 1 dia").max(365, "Intervalo m\xE1ximo \xE9 365 dias").optional(),
  dayOfMonth: import_zod6.z.number().min(1, "Dia do m\xEAs deve ser entre 1 e 31").max(31, "Dia do m\xEAs deve ser entre 1 e 31"),
  dayOfWeek: import_zod6.z.number().min(0).max(6).optional(),
  startDate: import_zod6.z.string().datetime({
    message: "Data inicial deve ser ISO 8601 v\xE1lida"
  }),
  endDate: import_zod6.z.string().datetime({ message: "Data final deve ser ISO 8601 v\xE1lida" }).optional()
});
var createRecurringTransactionSchema = recurringTransactionBaseSchema.refine(
  (data) => {
    if (data.frequency === "custom") {
      return data.customIntervalDays !== void 0 && data.customIntervalDays > 0;
    }
    return true;
  },
  {
    message: "Intervalo personalizado \xE9 obrigat\xF3rio para frequ\xEAncia custom",
    path: ["customIntervalDays"]
  }
);
var updateRecurringTransactionSchema = recurringTransactionBaseSchema.partial();
var listRecurringTransactionsSchema = import_zod6.z.object({
  isActive: import_zod6.z.boolean().optional(),
  type: import_zod6.z.enum(["income", "expense"]).optional()
});

// src/modules/recurring/recurring.controller.ts
var RecurringTransactionController = class {
  constructor(recurringModel = new RecurringTransactionModel(), categoryModel = new CategoryModel(), paymentMethodModel = new PaymentMethodModel(), transactionModel = new TransactionModel()) {
    this.recurringModel = recurringModel;
    this.categoryModel = categoryModel;
    this.paymentMethodModel = paymentMethodModel;
    this.transactionModel = transactionModel;
  }
  listRecurringTransactions = async (request, reply) => {
    const { sub: userId } = request.user;
    const filters = listRecurringTransactionsSchema.parse(request.query);
    const [err, result] = await catchError(
      this.recurringModel.findAll(userId, filters)
    );
    if (err) throw new AppError(`Erro ao listar transa\xE7\xF5es recorrentes, ${err.message}`, 500);
    return reply.send(result);
  };
  getRecurringTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [err, recurring] = await catchError(
      this.recurringModel.findById(id, userId)
    );
    if (err) throw new AppError("Erro ao buscar transa\xE7\xE3o recorrente", 500);
    if (!recurring) {
      throw new AppError("Transa\xE7\xE3o recorrente n\xE3o encontrada", 404);
    }
    return reply.send(recurring);
  };
  createRecurringTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const body = createRecurringTransactionSchema.parse(request.body);
    if (body.categoryId) {
      const [errCat, category] = await catchError(
        this.categoryModel.findById(body.categoryId, userId)
      );
      if (errCat) throw new AppError("Erro ao validar categoria", 500);
      if (!category) throw new AppError("Categoria n\xE3o encontrada", 404);
    }
    if (body.paymentMethodId) {
      const [errPm, method] = await catchError(
        this.paymentMethodModel.findById(body.paymentMethodId, userId)
      );
      if (errPm) throw new AppError("Erro ao validar m\xE9todo de pagamento", 500);
      if (!method)
        throw new AppError("M\xE9todo de pagamento n\xE3o encontrado", 404);
    }
    const [errCreate, recurring] = await catchError(
      this.recurringModel.createRecurringTransaction(userId, body)
    );
    if (errCreate)
      throw new AppError("Erro ao criar transa\xE7\xE3o recorrente", 500);
    return reply.status(201).send(recurring);
  };
  updateRecurringTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const body = updateRecurringTransactionSchema.parse(request.body);
    if (body.categoryId) {
      const [errCat, category] = await catchError(
        this.categoryModel.findById(body.categoryId, userId)
      );
      if (errCat) throw new AppError("Erro ao validar categoria", 500);
      if (!category) throw new AppError("Categoria n\xE3o encontrada", 404);
    }
    if (body.paymentMethodId) {
      const [errPm, method] = await catchError(
        this.paymentMethodModel.findById(body.paymentMethodId, userId)
      );
      if (errPm) throw new AppError("Erro ao validar m\xE9todo de pagamento", 500);
      if (!method)
        throw new AppError("M\xE9todo de pagamento n\xE3o encontrado", 404);
    }
    const [errUpdate, updated] = await catchError(
      this.recurringModel.updateRecurringTransaction(id, userId, body)
    );
    if (errUpdate)
      throw new AppError("Erro ao atualizar transa\xE7\xE3o recorrente", 500);
    if (!updated) {
      throw new AppError("Transa\xE7\xE3o recorrente n\xE3o encontrada", 404);
    }
    const [errReload, reloaded] = await catchError(
      this.recurringModel.findById(id, userId)
    );
    if (errReload)
      throw new AppError(
        "Erro ao carregar transa\xE7\xE3o recorrente atualizada",
        500
      );
    return reply.send(reloaded);
  };
  toggleRecurringTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [err, toggled] = await catchError(
      this.recurringModel.toggleActive(id, userId)
    );
    if (err) throw new AppError("Erro ao alternar transa\xE7\xE3o recorrente", 500);
    if (!toggled) {
      throw new AppError("Transa\xE7\xE3o recorrente n\xE3o encontrada", 404);
    }
    return reply.send(toggled);
  };
  deleteRecurringTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [errDelete, deleted] = await catchError(
      this.recurringModel.softDelete(id, userId)
    );
    if (errDelete)
      throw new AppError("Erro ao deletar transa\xE7\xE3o recorrente", 500);
    if (!deleted) {
      throw new AppError("Transa\xE7\xE3o recorrente n\xE3o encontrada", 404);
    }
    return reply.send({
      message: "Transa\xE7\xE3o recorrente desativada com sucesso"
    });
  };
  processRecurringTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [errFind, recurring] = await catchError(
      this.recurringModel.findById(id, userId)
    );
    if (errFind) throw new AppError("Erro ao buscar transa\xE7\xE3o recorrente", 500);
    if (!recurring)
      throw new AppError("Transa\xE7\xE3o recorrente n\xE3o encontrada", 404);
    if (!recurring.isActive) {
      throw new AppError("Transa\xE7\xE3o recorrente est\xE1 inativa", 400);
    }
    const now = /* @__PURE__ */ new Date();
    const nextDate = this.calculateNextDate(recurring);
    if (!nextDate) {
      throw new AppError("N\xE3o h\xE1 pr\xF3xima data para gerar transa\xE7\xE3o", 400);
    }
    const [errCreate, transaction] = await catchError(
      this.transactionModel.createTransaction(userId, {
        description: recurring.description,
        subDescription: recurring.subDescription ?? void 0,
        amount: Number(recurring.amount),
        type: recurring.type,
        date: nextDate.toISOString(),
        categoryId: recurring.categoryId ?? void 0,
        paymentMethodId: recurring.paymentMethodId ?? void 0
      })
    );
    if (errCreate) throw new AppError("Erro ao gerar transa\xE7\xE3o", 500);
    await this.recurringModel.updateRecurringTransaction(id, userId, {
      lastGeneratedAt: now.toISOString()
    });
    return reply.status(201).send(transaction);
  };
  calculateNextDate(recurring) {
    const now = /* @__PURE__ */ new Date();
    const startDate = new Date(recurring.startDate);
    let nextDate = new Date(now);
    if (now < startDate) {
      nextDate = startDate;
    } else if (recurring.lastGeneratedAt) {
      const lastGen = new Date(recurring.lastGeneratedAt);
      switch (recurring.frequency) {
        case "daily":
          nextDate = new Date(lastGen);
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case "weekly":
          nextDate = new Date(lastGen);
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "monthly":
          nextDate = new Date(lastGen);
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "yearly":
          nextDate = new Date(lastGen);
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        case "custom": {
          const interval = Number.parseInt(recurring.customIntervalDays || "0", 10);
          if (interval > 0) {
            nextDate = new Date(lastGen);
            nextDate.setDate(nextDate.getDate() + interval);
          }
          break;
        }
      }
    } else {
      nextDate = startDate;
    }
    if (recurring.endDate && nextDate > new Date(recurring.endDate)) {
      return null;
    }
    return nextDate;
  }
};

// src/modules/recurring/recurring.routes.ts
async function registerRecurringRoutes(app) {
  const controller = new RecurringTransactionController();
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get("/recurring", controller.listRecurringTransactions);
  app.get("/recurring/:id", controller.getRecurringTransaction);
  app.post("/recurring", controller.createRecurringTransaction);
  app.put("/recurring/:id", controller.updateRecurringTransaction);
  app.patch("/recurring/:id/toggle", controller.toggleRecurringTransaction);
  app.delete("/recurring/:id", controller.deleteRecurringTransaction);
  app.post("/recurring/:id/process", controller.processRecurringTransaction);
}

// src/modules/summary/summary.model.ts
var import_drizzle_orm6 = require("drizzle-orm");
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
function parseMonthRange(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start2 = new Date(year, monthIndex - 1, 1);
  const endExclusive = new Date(year, monthIndex, 1);
  return { start: start2, endExclusive };
}
function resolveRange(filters) {
  if (filters.month) {
    const current = parseMonthRange(filters.month);
    const previousStart2 = new Date(
      current.start.getFullYear(),
      current.start.getMonth() - 1,
      1
    );
    const previousEndExclusive2 = new Date(
      current.start.getFullYear(),
      current.start.getMonth(),
      1
    );
    return {
      start: current.start,
      endExclusive: current.endExclusive,
      previousStart: previousStart2,
      previousEndExclusive: previousEndExclusive2
    };
  }
  if (filters.period === "7d" || filters.period === "30d") {
    const days = filters.period === "7d" ? 7 : 30;
    const todayStart = startOfDay(/* @__PURE__ */ new Date());
    const start3 = addDays(todayStart, -(days - 1));
    const endExclusive2 = addDays(todayStart, 1);
    const previousStart2 = addDays(start3, -days);
    const previousEndExclusive2 = start3;
    return { start: start3, endExclusive: endExclusive2, previousStart: previousStart2, previousEndExclusive: previousEndExclusive2 };
  }
  const baseDate = /* @__PURE__ */ new Date();
  if (filters.period === "previous") {
    baseDate.setMonth(baseDate.getMonth() - 1);
  }
  const start2 = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const endExclusive = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    1
  );
  const previousStart = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() - 1,
    1
  );
  const previousEndExclusive = start2;
  return { start: start2, endExclusive, previousStart, previousEndExclusive };
}
var SummaryModel = class {
  async getSummary(userId, filters = {}) {
    const range = resolveRange(filters);
    const [balanceResult] = await db.select({
      total: import_drizzle_orm6.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`
    }).from(transactions).where(
      (0, import_drizzle_orm6.and)(
        (0, import_drizzle_orm6.eq)(transactions.userId, userId),
        (0, import_drizzle_orm6.gte)(transactions.date, range.start),
        (0, import_drizzle_orm6.lt)(transactions.date, range.endExclusive)
      )
    );
    const [currentMonthTotals] = await db.select({
      income: import_drizzle_orm6.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
      expense: import_drizzle_orm6.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
    }).from(transactions).where(
      (0, import_drizzle_orm6.and)(
        (0, import_drizzle_orm6.eq)(transactions.userId, userId),
        (0, import_drizzle_orm6.gte)(transactions.date, range.start),
        (0, import_drizzle_orm6.lt)(transactions.date, range.endExclusive)
      )
    );
    const [previousMonthTotals] = await db.select({
      expense: import_drizzle_orm6.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
    }).from(transactions).where(
      (0, import_drizzle_orm6.and)(
        (0, import_drizzle_orm6.eq)(transactions.userId, userId),
        (0, import_drizzle_orm6.gte)(transactions.date, range.previousStart),
        (0, import_drizzle_orm6.lt)(transactions.date, range.previousEndExclusive)
      )
    );
    const expenseChange = previousMonthTotals.expense > 0 ? (currentMonthTotals.expense - previousMonthTotals.expense) / previousMonthTotals.expense * 100 : 0;
    return {
      totalBalance: Number(balanceResult.total),
      monthlyIncome: Number(currentMonthTotals.income),
      monthlyExpense: Number(currentMonthTotals.expense),
      monthlyChange: Number(expenseChange.toFixed(2))
    };
  }
  async getMonthlySummary(userId) {
    const result = await db.select({
      month: import_drizzle_orm6.sql`to_char(${transactions.date}, 'YYYY-MM')`,
      income: import_drizzle_orm6.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
      expense: import_drizzle_orm6.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
    }).from(transactions).where(
      (0, import_drizzle_orm6.and)(
        (0, import_drizzle_orm6.eq)(transactions.userId, userId),
        import_drizzle_orm6.sql`${transactions.date} >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'`
      )
    ).groupBy(import_drizzle_orm6.sql`to_char(${transactions.date}, 'YYYY-MM')`).orderBy(import_drizzle_orm6.sql`to_char(${transactions.date}, 'YYYY-MM')`);
    return result.map((r) => ({
      month: r.month,
      income: Number(r.income),
      expense: Number(r.expense),
      balance: Number(r.income) - Number(r.expense)
    }));
  }
  async getByCategorySummary(userId, filters = {}) {
    const range = resolveRange(filters);
    const expenses = await db.select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      color: categories.color,
      total: import_drizzle_orm6.sql`SUM(${transactions.amount})`
    }).from(transactions).leftJoin(categories, (0, import_drizzle_orm6.eq)(transactions.categoryId, categories.id)).where(
      (0, import_drizzle_orm6.and)(
        (0, import_drizzle_orm6.eq)(transactions.userId, userId),
        (0, import_drizzle_orm6.eq)(transactions.type, "expense"),
        (0, import_drizzle_orm6.gte)(transactions.date, range.start),
        (0, import_drizzle_orm6.lt)(transactions.date, range.endExclusive)
      )
    ).groupBy(transactions.categoryId, categories.name, categories.color).orderBy((0, import_drizzle_orm6.desc)(import_drizzle_orm6.sql`SUM(${transactions.amount})`));
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
var import_zod7 = require("zod");
var summaryPeriodSchema = import_zod7.z.enum(["7d", "30d", "month", "previous"]);
var summaryQuerySchema = import_zod7.z.object({
  month: import_zod7.z.string().regex(/^\d{4}-\d{2}$/, "Formato de m\xEAs inv\xE1lido (esperado: YYYY-MM)").optional(),
  period: summaryPeriodSchema.optional()
});

// src/modules/summary/summary.controller.ts
var SummaryController = class {
  constructor(summaryModel = new SummaryModel()) {
    this.summaryModel = summaryModel;
  }
  getSummary = async (request, reply) => {
    const { sub: userId } = request.user;
    const { month, period } = summaryQuerySchema.parse(request.query);
    const [err, summary] = await catchError(
      this.summaryModel.getSummary(userId, { month, period })
    );
    if (err) throw new AppError("Erro ao obter resumo", 500);
    return reply.send(summary);
  };
  getMonthlySummary = async (request, reply) => {
    const { sub: userId } = request.user;
    const [err, monthly] = await catchError(
      this.summaryModel.getMonthlySummary(userId)
    );
    if (err) throw new AppError("Erro ao obter resumo mensal", 500);
    return reply.send(monthly);
  };
  getByCategorySummary = async (request, reply) => {
    const { sub: userId } = request.user;
    const { month, period } = summaryQuerySchema.parse(request.query);
    const [err, byCategory] = await catchError(
      this.summaryModel.getByCategorySummary(userId, { month, period })
    );
    if (err) throw new AppError("Erro ao obter resumo por categoria", 500);
    return reply.send(byCategory);
  };
};

// src/modules/summary/summary.routes.ts
async function registerSummaryRoutes(app) {
  const summaryController = new SummaryController();
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get("/summary", summaryController.getSummary);
  app.get("/summary/monthly", summaryController.getMonthlySummary);
  app.get("/summary/by-category", summaryController.getByCategorySummary);
}

// src/modules/transactions/transactions.schema.ts
var import_zod8 = require("zod");
var createTransactionSchema = import_zod8.z.object({
  description: import_zod8.z.string().min(1, "Descri\xE7\xE3o \xE9 obrigat\xF3ria").max(120),
  subDescription: import_zod8.z.string().max(120).optional(),
  amount: import_zod8.z.number().positive("O valor deve ser positivo"),
  type: import_zod8.z.enum(["income", "expense"], {
    errorMap: () => ({ message: "O tipo deve ser income ou expense" })
  }),
  date: import_zod8.z.string().datetime({ message: "A data deve ser ISO 8601 v\xE1lida" }),
  categoryId: import_zod8.z.string().uuid("ID de categoria inv\xE1lido").optional(),
  paymentMethodId: import_zod8.z.string().uuid("ID de m\xE9todo de pagamento inv\xE1lido").optional()
});
var updateTransactionSchema = createTransactionSchema.partial();
var listTransactionsSchema = import_zod8.z.object({
  month: import_zod8.z.string().regex(/^\d{4}-\d{2}$/, "Formato de m\xEAs inv\xE1lido (esperado: YYYY-MM)").optional(),
  type: import_zod8.z.enum(["income", "expense"]).optional(),
  categoryId: import_zod8.z.string().uuid().optional(),
  paymentMethodId: import_zod8.z.string().uuid().optional(),
  startDate: import_zod8.z.string().datetime({ message: "startDate deve ser ISO 8601 v\xE1lida" }).optional(),
  endDate: import_zod8.z.string().datetime({ message: "endDate deve ser ISO 8601 v\xE1lida" }).optional(),
  page: import_zod8.z.coerce.number().min(1).default(1),
  limit: import_zod8.z.coerce.number().min(1).max(100).default(10)
});

// src/modules/transactions/transactions.controller.ts
var TransactionsController = class {
  constructor(transactionModel = new TransactionModel(), categoryModel = new CategoryModel(), paymentMethodModel = new PaymentMethodModel()) {
    this.transactionModel = transactionModel;
    this.categoryModel = categoryModel;
    this.paymentMethodModel = paymentMethodModel;
  }
  listTransactions = async (request, reply) => {
    const { sub: userId } = request.user;
    const filters = listTransactionsSchema.parse(request.query);
    const [err, result] = await catchError(
      this.transactionModel.findAll(userId, filters)
    );
    if (err) throw new AppError("Erro ao listar transa\xE7\xF5es", 500);
    return reply.send(result);
  };
  getTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [err, transaction] = await catchError(
      this.transactionModel.findById(id, userId)
    );
    if (err) throw new AppError("Erro ao buscar transa\xE7\xE3o", 500);
    if (!transaction) {
      throw new AppError("Transa\xE7\xE3o n\xE3o encontrada", 404);
    }
    return reply.send(transaction);
  };
  createTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const body = createTransactionSchema.parse(request.body);
    if (body.categoryId) {
      const [errCat, category] = await catchError(
        this.categoryModel.findById(body.categoryId, userId)
      );
      if (errCat) throw new AppError("Erro ao validar categoria", 500);
      if (!category) throw new AppError("Categoria n\xE3o encontrada", 404);
    }
    if (body.paymentMethodId) {
      const [errPm, method] = await catchError(
        this.paymentMethodModel.findById(body.paymentMethodId, userId)
      );
      if (errPm) throw new AppError("Erro ao validar m\xE9todo de pagamento", 500);
      if (!method)
        throw new AppError("M\xE9todo de pagamento n\xE3o encontrado", 404);
    }
    const [errCreate, transaction] = await catchError(
      this.transactionModel.createTransaction(userId, body)
    );
    if (errCreate) throw new AppError("Erro ao criar transa\xE7\xE3o", 500);
    return reply.status(201).send(transaction);
  };
  updateTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const body = updateTransactionSchema.parse(request.body);
    if (body.categoryId) {
      const [errCat, category] = await catchError(
        this.categoryModel.findById(body.categoryId, userId)
      );
      if (errCat) throw new AppError("Erro ao validar categoria", 500);
      if (!category) throw new AppError("Categoria n\xE3o encontrada", 404);
    }
    if (body.paymentMethodId) {
      const [errPm, method] = await catchError(
        this.paymentMethodModel.findById(body.paymentMethodId, userId)
      );
      if (errPm) throw new AppError("Erro ao validar m\xE9todo de pagamento", 500);
      if (!method)
        throw new AppError("M\xE9todo de pagamento n\xE3o encontrado", 404);
    }
    const [errUpdate, updated] = await catchError(
      this.transactionModel.updateTransaction(id, userId, body)
    );
    if (errUpdate) throw new AppError("Erro ao atualizar transa\xE7\xE3o", 500);
    if (!updated) {
      throw new AppError("Transa\xE7\xE3o n\xE3o encontrada", 404);
    }
    const [errReload, reloaded] = await catchError(
      this.transactionModel.findById(id, userId)
    );
    if (errReload)
      throw new AppError("Erro ao carregar transa\xE7\xE3o atualizada", 500);
    return reply.send(reloaded);
  };
  deleteTransaction = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [errDelete, deleted] = await catchError(
      this.transactionModel.deleteTransaction(id, userId)
    );
    if (errDelete) throw new AppError("Erro ao deletar transa\xE7\xE3o", 500);
    if (!deleted) {
      throw new AppError("Transa\xE7\xE3o n\xE3o encontrada", 404);
    }
    return reply.send({ message: "Transa\xE7\xE3o deletada com sucesso" });
  };
};

// src/modules/transactions/transactions.routes.ts
async function registerTransactionsRoutes(app) {
  const transactionsController = new TransactionsController();
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get("/transactions", transactionsController.listTransactions);
  app.get("/transactions/:id", transactionsController.getTransaction);
  app.post("/transactions", transactionsController.createTransaction);
  app.put("/transactions/:id", transactionsController.updateTransaction);
  app.delete("/transactions/:id", transactionsController.deleteTransaction);
}

// src/config/routes.ts
async function registerRoutes(app) {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }));
  await app.register(registerAuthRoutes);
  await app.register(registerCategoriesRoutes);
  await app.register(registerPaymentMethodsRoutes);
  await app.register(registerRecurringRoutes);
  await app.register(registerTransactionsRoutes);
  await app.register(registerSummaryRoutes);
}

// src/modules/seed/dashboard.export.model.ts
var import_drizzle_orm7 = require("drizzle-orm");
var import_exceljs = __toESM(require("exceljs"), 1);
var import_pdfkit = __toESM(require("pdfkit"), 1);
var DashboardExportModel = class {
  async getTransactionsForExport(userId, filters) {
    const startDate = filters.startDate ? new Date(filters.startDate) : void 0;
    const endDate = filters.endDate ? new Date(filters.endDate) : void 0;
    const rows = await db.select({
      date: transactions.date,
      description: transactions.description,
      category: categories.name,
      paymentMethod: paymentMethods.name,
      type: transactions.type,
      amount: transactions.amount
    }).from(transactions).leftJoin(categories, (0, import_drizzle_orm7.eq)(transactions.categoryId, categories.id)).leftJoin(
      paymentMethods,
      (0, import_drizzle_orm7.eq)(transactions.paymentMethodId, paymentMethods.id)
    ).where(
      (0, import_drizzle_orm7.and)(
        (0, import_drizzle_orm7.eq)(transactions.userId, userId),
        filters.type ? (0, import_drizzle_orm7.eq)(transactions.type, filters.type) : void 0,
        filters.categoryId ? (0, import_drizzle_orm7.eq)(transactions.categoryId, filters.categoryId) : void 0,
        startDate ? (0, import_drizzle_orm7.gte)(transactions.date, startDate) : void 0,
        endDate ? (0, import_drizzle_orm7.lte)(transactions.date, endDate) : void 0
      )
    ).orderBy((0, import_drizzle_orm7.desc)(transactions.date));
    return rows.map((row) => ({
      date: row.date.toLocaleDateString("pt-BR"),
      description: row.description,
      category: row.category || "-",
      type: row.type === "income" ? "Receita" : "Despesa",
      total: Number(row.amount).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })
    }));
  }
  async exportToExcel(userId, filters) {
    const startDate = filters.startDate ? new Date(filters.startDate) : void 0;
    const endDate = filters.endDate ? new Date(filters.endDate) : void 0;
    const rows = await db.select({
      date: transactions.date,
      description: transactions.description,
      category: categories.name,
      paymentMethod: paymentMethods.name,
      type: transactions.type,
      amount: transactions.amount
    }).from(transactions).leftJoin(categories, (0, import_drizzle_orm7.eq)(transactions.categoryId, categories.id)).leftJoin(
      paymentMethods,
      (0, import_drizzle_orm7.eq)(transactions.paymentMethodId, paymentMethods.id)
    ).where(
      (0, import_drizzle_orm7.and)(
        (0, import_drizzle_orm7.eq)(transactions.userId, userId),
        filters.type ? (0, import_drizzle_orm7.eq)(transactions.type, filters.type) : void 0,
        filters.categoryId ? (0, import_drizzle_orm7.eq)(transactions.categoryId, filters.categoryId) : void 0,
        startDate ? (0, import_drizzle_orm7.gte)(transactions.date, startDate) : void 0,
        endDate ? (0, import_drizzle_orm7.lte)(transactions.date, endDate) : void 0
      )
    ).orderBy((0, import_drizzle_orm7.desc)(transactions.date));
    const data = rows.map((row) => ({
      valor: Number(row.amount).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      }),
      descricao: row.description,
      categoria: row.category || "-",
      metodoPagamento: row.paymentMethod || "-",
      tipo: row.type === "income" ? "Receita" : "Despesa",
      data: row.date.toLocaleDateString("pt-BR"),
      total: Number(row.amount)
    }));
    const wb = new import_exceljs.default.Workbook();
    const ws = wb.addWorksheet("Transa\xE7\xF5es");
    ws.columns = [
      { header: "Data", key: "data", width: 12 },
      { header: "Descri\xE7\xE3o", key: "descricao", width: 35 },
      { header: "Categoria", key: "categoria", width: 15 },
      { header: "M\xE9todo", key: "metodoPagamento", width: 15 },
      { header: "Tipo", key: "tipo", width: 10 },
      { header: "Valor (R$)", key: "valor", width: 14 }
    ];
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2D5FF3" }
    };
    headerRow.alignment = { horizontal: "center" };
    data.forEach((row, idx) => {
      const rowIndex = idx + 2;
      ws.addRow(row);
      const addedRow = ws.getRow(rowIndex);
      addedRow.alignment = { vertical: "middle", horizontal: "left" };
    });
    ws.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });
    });
    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
  async exportToPdf(userId, filters) {
    const rows = await this.getTransactionsForExport(userId, filters);
    return new Promise((resolve, reject) => {
      try {
        const doc = new import_pdfkit.default({ size: "A4", margin: 50 });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.fontSize(18).text("Relat\xF3rio de Transa\xE7\xF5es", { align: "center" });
        doc.moveDown(2);
        const startX = 50;
        const rowY = 120;
        const colWidths = [70, 180, 80, 80];
        doc.rect(startX, rowY - 10, 520, 22).fill("#1A2035");
        doc.fillColor("#FFFFFF").fontSize(10);
        doc.text("Data", startX + 5, rowY - 6, { width: colWidths[0] });
        doc.text("Descri\xE7\xE3o", startX + colWidths[0] + 5, rowY - 6, {
          width: colWidths[1]
        });
        doc.text(
          "Categoria",
          startX + colWidths[0] + colWidths[1] + 10,
          rowY - 6,
          {
            width: colWidths[2]
          }
        );
        doc.text(
          "Valor",
          startX + colWidths[0] + colWidths[1] + colWidths[2] + 15,
          rowY - 6,
          {
            width: colWidths[3],
            align: "right"
          }
        );
        let y = rowY + 20;
        for (const r of rows.slice(0, 25)) {
          doc.fillColor("#000000").fontSize(9);
          doc.text(r.date, startX, y, { width: colWidths[0] });
          doc.text(r.description, startX + colWidths[0] + 5, y, {
            width: colWidths[1]
          });
          doc.text(r.category, startX + colWidths[0] + colWidths[1] + 10, y, {
            width: colWidths[2]
          });
          doc.text(
            r.total,
            startX + colWidths[0] + colWidths[1] + colWidths[2] + 15,
            y,
            {
              width: colWidths[3],
              align: "right"
            }
          );
          y += 16;
        }
        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }
};
var dashboard_export_model_default = new DashboardExportModel();

// src/modules/seed/dashboard.export.schema.ts
var import_zod9 = require("zod");
var exportFilterSchema = import_zod9.z.object({
  startDate: import_zod9.z.string().datetime({ message: "Data inicial deve ser ISO 8601 v\xE1lida" }).optional(),
  endDate: import_zod9.z.string().datetime({ message: "Data final deve ser ISO 8601 v\xE1lida" }).optional(),
  type: import_zod9.z.enum(["income", "expense"]).optional(),
  categoryId: import_zod9.z.string().uuid().optional()
});

// src/modules/seed/dashboard.seed.controller.ts
var DashboardSeedController = class {
  async importFromExcel(req, reply) {
    const payload = req.body || {};
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    reply.status(501).send({ ok: false, message: "Not implemented yet" });
  }
  async exportExcel(req, reply) {
    try {
      await req.jwtVerify();
    } catch {
      throw new AppError("Unauthorized", 401);
    }
    const userId = req.user.sub;
    const filters = exportFilterSchema.parse(req.query);
    const buffer = await dashboard_export_model_default.exportToExcel(userId, filters);
    reply.type(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    reply.header(
      "Content-Disposition",
      'attachment; filename="transacoes.xlsx"'
    );
    return reply.send(buffer);
  }
  async exportPdf(req, reply) {
    try {
      await req.jwtVerify();
    } catch {
      throw new AppError("Unauthorized", 401);
    }
    const userId = req.user.sub;
    const filters = exportFilterSchema.parse(req.query);
    const buffer = await dashboard_export_model_default.exportToPdf(userId, filters);
    reply.type("application/pdf");
    reply.header(
      "Content-Disposition",
      'attachment; filename="transacoes.pdf"'
    );
    return reply.send(buffer);
  }
};
var dashboard_seed_controller_default = new DashboardSeedController();

// src/modules/seed/dashboard.seed.routes.ts
async function registerSeedDashboardRoutes(app) {
  app.post(
    "/seed/dashboard/import",
    dashboard_seed_controller_default.importFromExcel.bind(dashboard_seed_controller_default)
  );
  app.get(
    "/seed/dashboard/export/excel",
    dashboard_seed_controller_default.exportExcel.bind(dashboard_seed_controller_default)
  );
  app.get(
    "/seed/dashboard/export/pdf",
    dashboard_seed_controller_default.exportPdf.bind(dashboard_seed_controller_default)
  );
}

// src/config/app.ts
async function buildApp() {
  const isTest = process.env.NODE_ENV === "test";
  const app = (0, import_fastify.default)({
    logger: isTest ? false : {
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          colorize: true
        }
      }
    }
  });
  await app.register(import_cookie.default);
  await app.register(import_cors.default, { origin: env.CORS_ORIGIN, credentials: true });
  await app.register(import_jwt.default, { secret: env.JWT_SECRET });
  await app.register(import_swagger.default, {
    openapi: {
      info: { title: "FinanceApp API", version: "1.0.0" },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  });
  await app.register(import_swagger_ui.default, {
    routePrefix: "/docs"
  });
  await registerRoutes(app);
  await registerSeedDashboardRoutes(app);
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
