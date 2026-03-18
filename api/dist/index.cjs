"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc5) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc5 = __getOwnPropDesc(from, key)) || desc5.enumerable });
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

// node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "17.3.1",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run tests/**/*.js --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run tests/**/*.js --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/lib/main.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var crypto2 = require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var TIPS = [
      "\u{1F510} encrypt with Dotenvx: https://dotenvx.com",
      "\u{1F510} prevent committing .env to code: https://dotenvx.com/precommit",
      "\u{1F510} prevent building .env in docker: https://dotenvx.com/prebuild",
      "\u{1F916} agentic secret storage: https://dotenvx.com/as2",
      "\u26A1\uFE0F secrets for agents: https://dotenvx.com/as2",
      "\u{1F6E1}\uFE0F auth for agents: https://vestauth.com",
      "\u{1F6E0}\uFE0F  run anywhere with `dotenvx run -- yourcommand`",
      "\u2699\uFE0F  specify custom .env file path with { path: '/custom/path/.env' }",
      "\u2699\uFE0F  enable debug logging with { debug: true }",
      "\u2699\uFE0F  override existing env vars with { override: true }",
      "\u2699\uFE0F  suppress all logs with { quiet: true }",
      "\u2699\uFE0F  write to custom object with { processEnv: myObject }",
      "\u2699\uFE0F  load multiple .env files with { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text2) {
      return supportsAnsi() ? `\x1B[2m${text2}\x1B[0m` : text2;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path2} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`-- tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto2.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/lib/env-options.js"(exports2, module2) {
    "use strict";
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_QUIET != null) {
      options.quiet = process.env.DOTENV_CONFIG_QUIET;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
    }
    module2.exports = options;
  }
});

// node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/lib/cli-options.js"(exports2, module2) {
    "use strict";
    var re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
    module2.exports = function optionMatcher(args) {
      const options = args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
      if (!("quiet" in options)) {
        options.quiet = "true";
      }
      return options;
    };
  }
});

// node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// src/config/app.ts
var import_cookie = __toESM(require("@fastify/cookie"), 1);
var import_cors = __toESM(require("@fastify/cors"), 1);
var import_jwt = __toESM(require("@fastify/jwt"), 1);
var import_swagger = __toESM(require("@fastify/swagger"), 1);
var import_swagger_ui = __toESM(require("@fastify/swagger-ui"), 1);
var import_fastify = __toESM(require("fastify"), 1);

// src/errors/errorHandler.ts
var import_zod = require("zod");

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

// src/modules/budgets/budgets.model.ts
var import_drizzle_orm = require("drizzle-orm");

// src/drizzle/client.ts
var import_postgres_js = require("drizzle-orm/postgres-js");
var import_postgres = __toESM(require("postgres"), 1);

// src/settings/env.ts
var import_zod2 = require("zod");
var envSchema = import_zod2.z.object({
  PORT: import_zod2.z.coerce.number().default(8080),
  DATABASE_URL: import_zod2.z.string().url(),
  JWT_SECRET: import_zod2.z.string().min(32),
  CORS_ORIGIN: import_zod2.z.string().default("*")
});
var env = envSchema.parse(process.env);

// src/drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  budgetPeriodEnum: () => budgetPeriodEnum,
  budgets: () => budgets,
  categories: () => categories,
  frequencyEnum: () => frequencyEnum,
  goalContributions: () => goalContributions,
  goals: () => goals,
  paymentMethods: () => paymentMethods,
  recurringTransactions: () => recurringTransactions,
  subcategories: () => subcategories,
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
var budgetPeriodEnum = (0, import_pg_core.pgEnum)("budget_period", [
  "monthly"
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
var subcategories = (0, import_pg_core.pgTable)("subcategories", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  categoryId: (0, import_pg_core.uuid)("category_id").references(() => categories.id, { onDelete: "cascade" }).notNull(),
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
  subcategoryId: (0, import_pg_core.uuid)("subcategory_id").references(() => subcategories.id),
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
  subcategoryId: (0, import_pg_core.uuid)("subcategory_id").references(() => subcategories.id),
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
var budgets = (0, import_pg_core.pgTable)("budgets", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  categoryId: (0, import_pg_core.uuid)("category_id").references(() => categories.id).notNull(),
  subcategoryId: (0, import_pg_core.uuid)("subcategory_id").references(() => subcategories.id),
  amount: (0, import_pg_core.numeric)("amount", { precision: 12, scale: 2 }).notNull(),
  baseAmount: (0, import_pg_core.numeric)("base_amount", { precision: 12, scale: 2 }),
  period: budgetPeriodEnum("period").notNull().default("monthly"),
  month: (0, import_pg_core.numeric)("month", { precision: 2 }).notNull(),
  year: (0, import_pg_core.numeric)("year", { precision: 4 }).notNull(),
  isRecurring: (0, import_pg_core.boolean)("is_recurring").notNull().default(false),
  isActive: (0, import_pg_core.boolean)("is_active").notNull().default(true),
  recurringGroupId: (0, import_pg_core.uuid)("recurring_group_id"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var goals = (0, import_pg_core.pgTable)("goals", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: (0, import_pg_core.text)("name").notNull(),
  description: (0, import_pg_core.text)("description"),
  targetAmount: (0, import_pg_core.numeric)("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: (0, import_pg_core.numeric)("current_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  deadline: (0, import_pg_core.timestamp)("deadline"),
  icon: (0, import_pg_core.text)("icon"),
  color: (0, import_pg_core.text)("color").notNull().default("#3B82F6"),
  isActive: (0, import_pg_core.boolean)("is_active").notNull().default(true),
  categoryId: (0, import_pg_core.uuid)("category_id").references(() => categories.id),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var goalContributions = (0, import_pg_core.pgTable)("goal_contributions", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  goalId: (0, import_pg_core.uuid)("goal_id").references(() => goals.id, { onDelete: "cascade" }).notNull(),
  transactionId: (0, import_pg_core.uuid)("transaction_id").references(() => transactions.id, { onDelete: "cascade" }).notNull(),
  type: (0, import_pg_core.text)("type").notNull().default("deposit"),
  amount: (0, import_pg_core.numeric)("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});

// src/drizzle/client.ts
var client = (0, import_postgres.default)(env.DATABASE_URL);
var db = (0, import_postgres_js.drizzle)(client, { schema: schema_exports });

// src/modules/budgets/budgets.model.ts
function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value === null || value === void 0) return 0;
  return 0;
}
var BudgetsModel = class {
  async recalculateParentBudget(userId, categoryId, month, year) {
    const categoryBudgets = await db.select().from(budgets).where(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.eq)(budgets.userId, userId),
        (0, import_drizzle_orm.eq)(budgets.categoryId, categoryId),
        (0, import_drizzle_orm.eq)(budgets.month, String(month)),
        (0, import_drizzle_orm.eq)(budgets.year, String(year))
      )
    );
    const parentBudget = categoryBudgets.find((b) => !b.subcategoryId);
    const subcategoryBudgets = categoryBudgets.filter((b) => b.subcategoryId);
    if (parentBudget) {
      const subcategoriesTotal = subcategoryBudgets.reduce(
        (sum2, b) => sum2 + toNumber(b.amount),
        0
      );
      const baseAmount = toNumber(parentBudget.baseAmount);
      const newTotal = baseAmount + subcategoriesTotal;
      await db.update(budgets).set({ amount: String(newTotal), updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(budgets.id, parentBudget.id));
    }
  }
  async create(data) {
    const isSubcategory = !!data.subcategoryId;
    const baseAmount = isSubcategory ? 0 : data.baseAmount ?? data.amount;
    let amount = isSubcategory ? data.amount : data.amount;
    let existingSubcategoriesTotal = 0;
    if (!isSubcategory) {
      const existingBudgets = await db.select({ amount: budgets.amount, subcategoryId: budgets.subcategoryId }).from(budgets).where(
        (0, import_drizzle_orm.and)(
          (0, import_drizzle_orm.eq)(budgets.userId, data.userId),
          (0, import_drizzle_orm.eq)(budgets.categoryId, data.categoryId),
          (0, import_drizzle_orm.eq)(budgets.month, String(data.month)),
          (0, import_drizzle_orm.eq)(budgets.year, String(data.year))
        )
      );
      const existingSubs = existingBudgets.filter((b) => b.subcategoryId);
      existingSubcategoriesTotal = existingSubs.reduce((sum2, b) => sum2 + toNumber(b.amount), 0);
      amount = baseAmount + existingSubcategoriesTotal;
    }
    let recurringGroupId = null;
    const [created] = await db.insert(budgets).values({
      userId: data.userId,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId || null,
      amount: String(amount),
      baseAmount: isSubcategory ? null : String(baseAmount),
      month: String(data.month),
      year: String(data.year),
      isRecurring: data.isRecurring ?? false,
      isActive: true
    }).returning();
    if (data.isRecurring) {
      recurringGroupId = created.id;
      await db.update(budgets).set({ recurringGroupId }).where((0, import_drizzle_orm.eq)(budgets.id, created.id));
    }
    if (isSubcategory) {
      await this.recalculateParentBudget(
        data.userId,
        data.categoryId,
        data.month,
        data.year
      );
    }
    return { ...created, recurringGroupId };
  }
  async findById(id) {
    const [budget] = await db.select().from(budgets).where((0, import_drizzle_orm.eq)(budgets.id, id));
    return budget;
  }
  async findByUserAndPeriod(userId, month, year) {
    return db.select().from(budgets).where(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.eq)(budgets.userId, userId),
        (0, import_drizzle_orm.eq)(budgets.month, String(month)),
        (0, import_drizzle_orm.eq)(budgets.year, String(year))
      )
    ).orderBy((0, import_drizzle_orm.desc)(budgets.createdAt));
  }
  async findByUser(userId) {
    return db.select().from(budgets).where((0, import_drizzle_orm.eq)(budgets.userId, userId)).orderBy((0, import_drizzle_orm.desc)(budgets.year), (0, import_drizzle_orm.desc)(budgets.month));
  }
  async findRecurringByUser(userId) {
    return db.select().from(budgets).where(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.eq)(budgets.userId, userId),
        (0, import_drizzle_orm.eq)(budgets.isRecurring, true)
      )
    );
  }
  async ensureRecurringBudgetsExist(userId, month, year) {
    const recurringBudgets = await this.findRecurringByUser(userId);
    if (recurringBudgets.length === 0) return;
    const existingBudgets = await this.findByUserAndPeriod(userId, month, year);
    const existingGroupIds = existingBudgets.map((b) => b.recurringGroupId).filter((id) => id !== null);
    const recurringGroupIds = recurringBudgets.map((b) => b.recurringGroupId).filter((id) => id !== null);
    const missingGroupIds = recurringGroupIds.filter(
      (id) => !existingGroupIds.includes(id)
    );
    for (const groupId of missingGroupIds) {
      const templateBudget = recurringBudgets.find(
        (b) => b.recurringGroupId === groupId
      );
      if (!templateBudget) continue;
      const [isActive] = await db.select({ isActive: budgets.isActive }).from(budgets).where((0, import_drizzle_orm.eq)(budgets.id, groupId)).limit(1);
      await db.insert(budgets).values({
        userId,
        categoryId: templateBudget.categoryId,
        subcategoryId: templateBudget.subcategoryId,
        amount: templateBudget.amount,
        baseAmount: templateBudget.baseAmount,
        month: String(month),
        year: String(year),
        isRecurring: true,
        isActive: isActive?.isActive ?? true,
        recurringGroupId: groupId
      });
    }
  }
  async getWithCategory(userId, month, year) {
    await this.ensureRecurringBudgetsExist(userId, month, year);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const userBudgets = await db.select({
      id: budgets.id,
      amount: budgets.amount,
      baseAmount: budgets.baseAmount,
      month: budgets.month,
      year: budgets.year,
      categoryId: budgets.categoryId,
      subcategoryId: budgets.subcategoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      subcategoryName: subcategories.name,
      subcategoryColor: subcategories.color,
      isRecurring: budgets.isRecurring,
      isActive: budgets.isActive,
      recurringGroupId: budgets.recurringGroupId,
      createdAt: budgets.createdAt
    }).from(budgets).leftJoin(categories, (0, import_drizzle_orm.eq)(budgets.categoryId, categories.id)).leftJoin(subcategories, (0, import_drizzle_orm.eq)(budgets.subcategoryId, subcategories.id)).where(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.eq)(budgets.userId, userId),
        (0, import_drizzle_orm.eq)(budgets.month, String(month)),
        (0, import_drizzle_orm.eq)(budgets.year, String(year))
      )
    );
    const subcategoryBudgets = userBudgets.filter((b) => b.subcategoryId);
    const subcategoriesTotalByCategory = /* @__PURE__ */ new Map();
    for (const sub of subcategoryBudgets) {
      const current = subcategoriesTotalByCategory.get(sub.categoryId) || 0;
      subcategoriesTotalByCategory.set(sub.categoryId, current + toNumber(sub.amount));
    }
    const budgetsWithSpent = await Promise.all(
      userBudgets.map(async (budget) => {
        const amountNum = toNumber(budget.amount);
        const baseAmountNum = toNumber(budget.baseAmount);
        const conditions = [
          (0, import_drizzle_orm.eq)(transactions.userId, userId),
          (0, import_drizzle_orm.eq)(transactions.categoryId, budget.categoryId),
          (0, import_drizzle_orm.eq)(transactions.type, "expense"),
          (0, import_drizzle_orm.gte)(transactions.date, startDate),
          (0, import_drizzle_orm.lte)(transactions.date, endDate)
        ];
        if (budget.subcategoryId) {
          conditions.push((0, import_drizzle_orm.eq)(transactions.subcategoryId, budget.subcategoryId));
        }
        const [result] = await db.select({ total: (0, import_drizzle_orm.sum)(transactions.amount) }).from(transactions).where((0, import_drizzle_orm.and)(...conditions));
        const spent = toNumber(result?.total);
        const percentage = amountNum > 0 ? spent / amountNum * 100 : 0;
        const subcategoriesTotal = !budget.subcategoryId ? subcategoriesTotalByCategory.get(budget.categoryId) || 0 : void 0;
        return {
          id: budget.id,
          amount: amountNum,
          baseAmount: budget.subcategoryId ? void 0 : baseAmountNum,
          month: toNumber(budget.month),
          year: toNumber(budget.year),
          categoryId: budget.categoryId,
          subcategoryId: budget.subcategoryId,
          categoryName: budget.categoryName || "Sem categoria",
          categoryColor: budget.categoryColor || "#6B7280",
          subcategoryName: budget.subcategoryName || null,
          subcategoryColor: budget.subcategoryColor || null,
          spent,
          percentage,
          remaining: amountNum - spent,
          isOverBudget: spent > amountNum,
          isRecurring: budget.isRecurring,
          isActive: budget.isActive,
          recurringGroupId: budget.recurringGroupId,
          createdAt: budget.createdAt || /* @__PURE__ */ new Date(),
          subcategoriesTotal
        };
      })
    );
    return budgetsWithSpent;
  }
  async getSummary(userId, month, year) {
    const budgetsWithCategory = await this.getWithCategory(userId, month, year);
    const parentBudgets = budgetsWithCategory.filter((b) => !b.subcategoryId);
    const totalBudgeted = parentBudgets.reduce((sum2, b) => sum2 + b.amount, 0);
    const totalSpent = parentBudgets.reduce((sum2, b) => sum2 + b.spent, 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const overBudgetCount = parentBudgets.filter((b) => b.isOverBudget).length;
    const nearLimitCount = parentBudgets.filter(
      (b) => b.percentage >= 80 && b.percentage <= 100
    ).length;
    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      nearLimitCount,
      budgets: budgetsWithCategory
    };
  }
  async update(id, userId, data) {
    const budget = await this.findById(id);
    if (!budget || budget.userId !== userId) return void 0;
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    if (data.baseAmount !== void 0) {
      updateData.baseAmount = String(data.baseAmount);
      const subcategoriesTotal = await this.getSubcategoriesTotal(
        userId,
        budget.categoryId,
        toNumber(budget.month),
        toNumber(budget.year),
        id
      );
      updateData.amount = String(data.baseAmount + subcategoriesTotal);
    }
    if (data.amount !== void 0 && data.baseAmount === void 0) {
      if (budget.subcategoryId) {
        updateData.amount = String(data.amount);
      } else {
        updateData.baseAmount = String(data.amount);
        updateData.amount = String(data.amount);
      }
    }
    if (data.isActive !== void 0) {
      updateData.isActive = data.isActive;
    }
    if (data.isRecurring !== void 0) {
      if (data.isRecurring && !budget.isRecurring) {
        updateData.isRecurring = true;
        updateData.isActive = true;
        const newGroupId = crypto.randomUUID();
        updateData.recurringGroupId = newGroupId;
        const [updated2] = await db.update(budgets).set(updateData).where((0, import_drizzle_orm.eq)(budgets.id, id)).returning();
        if (updated2) {
          await db.update(budgets).set({ recurringGroupId: newGroupId }).where((0, import_drizzle_orm.eq)(budgets.id, id));
        }
        if (budget.subcategoryId) {
          await this.recalculateParentBudget(
            userId,
            budget.categoryId,
            toNumber(budget.month),
            toNumber(budget.year)
          );
        }
        return { ...updated2, recurringGroupId: newGroupId };
      } else {
        updateData.isRecurring = data.isRecurring;
        if (!data.isRecurring) {
          updateData.recurringGroupId = null;
        }
      }
    }
    const [updated] = await db.update(budgets).set(updateData).where((0, import_drizzle_orm.eq)(budgets.id, id)).returning();
    if (data.isActive !== void 0 && budget.recurringGroupId && data.isActive === false) {
      await db.update(budgets).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(
        (0, import_drizzle_orm.and)(
          (0, import_drizzle_orm.eq)(budgets.recurringGroupId, budget.recurringGroupId),
          (0, import_drizzle_orm.or)(
            (0, import_drizzle_orm.eq)(budgets.isRecurring, true),
            import_drizzle_orm.sql`${budgets.id} != ${budget.id}`
          )
        )
      );
    }
    if (budget.subcategoryId && data.amount !== void 0) {
      await this.recalculateParentBudget(
        userId,
        budget.categoryId,
        toNumber(budget.month),
        toNumber(budget.year)
      );
    }
    return updated;
  }
  async getSubcategoriesTotal(userId, categoryId, month, year, excludeBudgetId) {
    const categoryBudgets = await db.select({ amount: budgets.amount, id: budgets.id }).from(budgets).where(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.eq)(budgets.userId, userId),
        (0, import_drizzle_orm.eq)(budgets.categoryId, categoryId),
        (0, import_drizzle_orm.eq)(budgets.month, String(month)),
        (0, import_drizzle_orm.eq)(budgets.year, String(year)),
        import_drizzle_orm.sql`${budgets.subcategoryId} IS NOT NULL`
      )
    );
    return categoryBudgets.filter((b) => b.id !== excludeBudgetId).reduce((sum2, b) => sum2 + toNumber(b.amount), 0);
  }
  async toggleActive(id, userId) {
    const budget = await this.findById(id);
    if (!budget || budget.userId !== userId) return void 0;
    const newIsActive = !budget.isActive;
    await db.update(budgets).set({ isActive: newIsActive, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(budgets.id, id));
    return { ...budget, isActive: newIsActive };
  }
  async delete(id) {
    const budget = await this.findById(id);
    const result = await db.delete(budgets).where((0, import_drizzle_orm.eq)(budgets.id, id));
    const rowCount = result.rowCount;
    if (rowCount !== void 0 && rowCount > 0 && budget?.subcategoryId) {
      await this.recalculateParentBudget(
        budget.userId,
        budget.categoryId,
        toNumber(budget.month),
        toNumber(budget.year)
      );
    }
    return rowCount !== void 0 && rowCount > 0;
  }
};
var budgets_model_default = new BudgetsModel();

// src/modules/budgets/budgets.schema.ts
var import_zod3 = require("zod");
var createBudgetSchema = import_zod3.z.object({
  categoryId: import_zod3.z.string().uuid("ID da categoria inv\xE1lido"),
  subcategoryId: import_zod3.z.string().uuid("ID da subcategoria inv\xE1lido").optional(),
  amount: import_zod3.z.number().positive("Valor deve ser positivo"),
  month: import_zod3.z.number().int().min(1).max(12, "M\xEAs inv\xE1lido"),
  year: import_zod3.z.number().int().min(2020).max(2100, "Ano inv\xE1lido"),
  isRecurring: import_zod3.z.boolean().optional().default(false)
});
var updateBudgetSchema = import_zod3.z.object({
  amount: import_zod3.z.number().positive("Valor deve ser positivo").optional(),
  isActive: import_zod3.z.boolean().optional(),
  isRecurring: import_zod3.z.boolean().optional()
});
var toggleBudgetActiveSchema = import_zod3.z.object({
  isActive: import_zod3.z.boolean()
});
var budgetQuerySchema = import_zod3.z.object({
  month: import_zod3.z.coerce.number().int().min(1).max(12).optional(),
  year: import_zod3.z.coerce.number().int().min(2020).optional()
});

// src/modules/budgets/budgets.controller.ts
var BudgetsController = class {
  async list(req, reply) {
    const userId = req.user.sub;
    const query = budgetQuerySchema.parse(req.query || {});
    const now = /* @__PURE__ */ new Date();
    const month = query.month ?? now.getMonth() + 1;
    const year = query.year ?? now.getFullYear();
    const summary = await budgets_model_default.getSummary(userId, month, year);
    return reply.send(summary);
  }
  async create(req, reply) {
    const userId = req.user.sub;
    const data = createBudgetSchema.parse(req.body);
    const existing = await budgets_model_default.findByUserAndPeriod(
      userId,
      data.month,
      data.year
    );
    if (data.subcategoryId) {
      const hasSubcategoryBudget = existing.find(
        (b) => b.subcategoryId && b.subcategoryId === data.subcategoryId
      );
      if (hasSubcategoryBudget) {
        throw new AppError(
          "J\xE1 existe or\xE7amento para esta subcategoria neste m\xEAs",
          409
        );
      }
      const hasParentBudget = existing.find(
        (b) => b.categoryId === data.categoryId && !b.subcategoryId
      );
      if (!hasParentBudget) {
        await budgets_model_default.create({
          userId,
          categoryId: data.categoryId,
          subcategoryId: void 0,
          amount: 0,
          month: data.month,
          year: data.year
        });
      }
    } else {
      const hasCategory = existing.find(
        (b) => b.categoryId === data.categoryId
      );
      if (hasCategory) {
        throw new AppError(
          "J\xE1 existe or\xE7amento para esta categoria neste m\xEAs",
          409
        );
      }
    }
    const [err, budget] = await catchError(
      budgets_model_default.create({
        userId,
        ...data
      })
    );
    if (err) {
      console.error("Error creating budget:", err);
      throw new AppError("Erro ao criar or\xE7amento", 500);
    }
    return reply.status(201).send({ budget });
  }
  async update(req, reply) {
    const { id } = req.params;
    const data = updateBudgetSchema.parse(req.body);
    const existing = await budgets_model_default.findById(id);
    if (!existing) {
      throw new AppError("Or\xE7amento n\xE3o encontrado", 404);
    }
    const userId = req.user.sub;
    if (existing.userId !== userId) {
      throw new AppError("N\xE3o autorizado", 403);
    }
    const [err, updated] = await catchError(
      budgets_model_default.update(id, userId, data)
    );
    if (err) {
      throw new AppError("Erro ao atualizar or\xE7amento", 500);
    }
    return reply.send({ budget: updated });
  }
  async toggleActive(req, reply) {
    const { id } = req.params;
    const existing = await budgets_model_default.findById(id);
    if (!existing) {
      throw new AppError("Or\xE7amento n\xE3o encontrado", 404);
    }
    const userId = req.user.sub;
    if (existing.userId !== userId) {
      throw new AppError("N\xE3o autorizado", 403);
    }
    if (!existing.isRecurring) {
      throw new AppError(
        "S\xF3 \xE9 poss\xEDvel desativar or\xE7amentos recorrentes",
        400
      );
    }
    const [err, toggled] = await catchError(
      budgets_model_default.toggleActive(id, userId)
    );
    if (err) {
      throw new AppError("Erro ao desativar or\xE7amento", 500);
    }
    return reply.send({ budget: toggled });
  }
  async delete(req, reply) {
    const { id } = req.params;
    const existing = await budgets_model_default.findById(id);
    if (!existing) {
      throw new AppError("Or\xE7amento n\xE3o encontrado", 404);
    }
    const userId = req.user.sub;
    if (existing.userId !== userId) {
      throw new AppError("N\xE3o autorizado", 403);
    }
    const deletedSubcategoryId = existing.subcategoryId;
    const deletedCategoryId = existing.categoryId;
    const deletedAmount = Number(existing.amount);
    const [err] = await catchError(budgets_model_default.delete(id));
    if (err) {
      throw new AppError("Erro ao excluir or\xE7amento", 500);
    }
    if (deletedSubcategoryId && deletedAmount === 0) {
      const allBudgets = await budgets_model_default.findByUserAndPeriod(
        userId,
        Number(existing.month),
        Number(existing.year)
      );
      const remainingSubcategoryBudgets = allBudgets.filter(
        (b) => b.categoryId === deletedCategoryId && b.subcategoryId && b.id !== id
      );
      if (remainingSubcategoryBudgets.length === 0) {
        const parentBudget = allBudgets.find(
          (b) => b.categoryId === deletedCategoryId && !b.subcategoryId
        );
        if (parentBudget && Number(parentBudget.amount) === 0) {
          await budgets_model_default.delete(parentBudget.id);
        }
      }
    }
    return reply.status(204).send();
  }
};
var budgets_controller_default = new BudgetsController();

// src/modules/budgets/budgets.routes.ts
var PUBLIC_ROUTES = ["/health", "/docs"];
async function registerBudgetsRoutes(app) {
  const controller = new BudgetsController();
  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublicRoute = PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
    if (isPublicRoute) return;
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
        description: "Lista or\xE7amentos do usu\xE1rio",
        tags: ["Budgets"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            month: { type: "integer", description: "M\xEAs (1-12)" },
            year: { type: "integer", description: "Ano" }
          }
        }
      }
    },
    controller.list
  );
  app.post(
    "/budgets",
    {
      schema: {
        description: "Cria um novo or\xE7amento",
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
            isRecurring: { type: "boolean", description: "Se o or\xE7amento deve se repetir mensalmente" }
          }
        }
      }
    },
    controller.create
  );
  app.put(
    "/budgets/:id",
    {
      schema: {
        description: "Atualiza um or\xE7amento",
        tags: ["Budgets"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        },
        body: {
          type: "object",
          properties: {
            amount: { type: "number" },
            isActive: { type: "boolean", description: "Ativar/desativar or\xE7amento recorrente" },
            isRecurring: { type: "boolean" }
          }
        }
      }
    },
    controller.update
  );
  app.patch(
    "/budgets/:id/toggle",
    {
      schema: {
        description: "Ativa ou desativa um or\xE7amento recorrente",
        tags: ["Budgets"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.toggleActive
  );
  app.delete(
    "/budgets/:id",
    {
      schema: {
        description: "Deleta um or\xE7amento",
        tags: ["Budgets"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.delete
  );
}

// src/modules/goals/goals.model.ts
var import_drizzle_orm5 = require("drizzle-orm");

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
  async findByName(name, userId) {
    const [category] = await db.select().from(categories).where(
      (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(categories.name, name),
        (0, import_drizzle_orm2.eq)(categories.userId, userId),
        (0, import_drizzle_orm2.isNull)(categories.deletedAt)
      )
    ).limit(1);
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
  async findByName(name, userId) {
    const [method] = await db.select().from(paymentMethods).where(
      (0, import_drizzle_orm3.and)(
        (0, import_drizzle_orm3.eq)(paymentMethods.userId, userId),
        (0, import_drizzle_orm3.eq)(paymentMethods.name, name),
        (0, import_drizzle_orm3.isNull)(paymentMethods.deletedAt)
      )
    ).limit(1);
    return method;
  }
};

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
      subcategoryId: transactions.subcategoryId,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon
      },
      subcategory: {
        id: subcategories.id,
        name: subcategories.name,
        color: subcategories.color
      },
      paymentMethodId: transactions.paymentMethodId,
      paymentMethod: {
        id: paymentMethods.id,
        name: paymentMethods.name
      },
      createdAt: transactions.createdAt
    }).from(transactions).leftJoin(categories, (0, import_drizzle_orm4.eq)(transactions.categoryId, categories.id)).leftJoin(subcategories, (0, import_drizzle_orm4.eq)(transactions.subcategoryId, subcategories.id)).leftJoin(
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
      subcategoryId: data.subcategoryId,
      paymentMethodId: data.paymentMethodId
    }).returning();
    return transaction;
  }
  async updateTransaction(id, userId, data) {
    const updateData = {};
    if (data.description !== void 0) updateData.description = data.description;
    if (data.subDescription !== void 0) updateData.subDescription = data.subDescription;
    if (data.amount !== void 0) updateData.amount = data.amount.toString();
    if (data.type !== void 0) updateData.type = data.type;
    if (data.date !== void 0) updateData.date = new Date(data.date);
    if (data.categoryId !== void 0) updateData.categoryId = data.categoryId;
    if (data.subcategoryId !== void 0) updateData.subcategoryId = data.subcategoryId;
    if (data.paymentMethodId !== void 0) updateData.paymentMethodId = data.paymentMethodId;
    const [updated] = await db.update(transactions).set(updateData).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(transactions.id, id), (0, import_drizzle_orm4.eq)(transactions.userId, userId))).returning();
    return updated;
  }
  async deleteTransaction(id, userId) {
    const [deleted] = await db.delete(transactions).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(transactions.id, id), (0, import_drizzle_orm4.eq)(transactions.userId, userId))).returning();
    return deleted;
  }
};
var transactionModel = new TransactionModel();

// src/modules/goals/goals.model.ts
var GoalsModel = class {
  constructor(categoryModel = new CategoryModel(), paymentMethodModel = new PaymentMethodModel(), transactionModel2 = new TransactionModel()) {
    this.categoryModel = categoryModel;
    this.paymentMethodModel = paymentMethodModel;
    this.transactionModel = transactionModel2;
  }
  async findAll(userId) {
    const result = await db.select({
      id: goals.id,
      name: goals.name,
      description: goals.description,
      targetAmount: goals.targetAmount,
      currentAmount: goals.currentAmount,
      deadline: goals.deadline,
      icon: goals.icon,
      color: goals.color,
      isActive: goals.isActive,
      createdAt: goals.createdAt,
      updatedAt: goals.updatedAt
    }).from(goals).where((0, import_drizzle_orm5.eq)(goals.userId, userId)).orderBy(goals.createdAt);
    return result;
  }
  async findById(id) {
    const [result] = await db.select({
      id: goals.id,
      userId: goals.userId,
      name: goals.name,
      description: goals.description,
      targetAmount: goals.targetAmount,
      currentAmount: goals.currentAmount,
      deadline: goals.deadline,
      categoryId: goals.categoryId,
      icon: goals.icon,
      color: goals.color,
      isActive: goals.isActive,
      createdAt: goals.createdAt,
      updatedAt: goals.updatedAt
    }).from(goals).where((0, import_drizzle_orm5.eq)(goals.id, id)).limit(1);
    return result;
  }
  async create(userId, data) {
    const [result] = await db.insert(goals).values({
      userId,
      name: data.name,
      description: data.description,
      targetAmount: data.targetAmount.toString(),
      currentAmount: "0",
      deadline: data.deadline ? new Date(data.deadline) : void 0,
      icon: data.icon,
      color: data.color || "#3B82F6",
      isActive: data.isActive ?? true
    }).returning();
    return result;
  }
  async update(id, data) {
    const updateData = {};
    if (data.name !== void 0) updateData.name = data.name;
    if (data.description !== void 0)
      updateData.description = data.description;
    if (data.targetAmount !== void 0)
      updateData.targetAmount = data.targetAmount.toString();
    if (data.deadline !== void 0)
      updateData.deadline = data.deadline ? new Date(data.deadline) : void 0;
    if (data.icon !== void 0) updateData.icon = data.icon;
    if (data.color !== void 0) updateData.color = data.color;
    if (data.isActive !== void 0) updateData.isActive = data.isActive;
    const [result] = await db.update(goals).set(updateData).where((0, import_drizzle_orm5.eq)(goals.id, id)).returning();
    return result;
  }
  async contribute(userId, id, amount) {
    const goal = await this.findById(id);
    if (!goal || goal.userId !== userId) return null;
    let categoryId = goal.categoryId;
    if (!categoryId) {
      let category = await this.categoryModel.findByName("Meta", userId);
      if (!category) {
        category = await this.categoryModel.createCategory(userId, {
          name: "Meta",
          color: "#6B7280"
        });
      }
      categoryId = category.id;
    }
    let paymentMethod = await this.paymentMethodModel.findByName("Interno", userId);
    if (!paymentMethod) {
      paymentMethod = await this.paymentMethodModel.createMethod(userId, {
        name: "Interno"
      });
    }
    const transaction = await this.transactionModel.createTransaction(userId, {
      description: `Meta: ${goal.name}`,
      amount,
      type: "expense",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      categoryId,
      paymentMethodId: paymentMethod.id
    });
    const newAmount = Number(goal.currentAmount) + amount;
    await db.update(goals).set({
      currentAmount: newAmount.toString(),
      categoryId
    }).where((0, import_drizzle_orm5.eq)(goals.id, id));
    const [contribution] = await db.insert(goalContributions).values({
      goalId: id,
      transactionId: transaction.id,
      type: "deposit",
      amount: amount.toString()
    }).returning();
    return { contribution, goal: { ...goal, currentAmount: newAmount.toString() } };
  }
  async withdraw(userId, id, amount) {
    const goal = await this.findById(id);
    if (!goal || goal.userId !== userId) return null;
    const currentAmount = Number(goal.currentAmount);
    if (amount > currentAmount) {
      throw new Error("Valor maior que o saldo dispon\xEDvel");
    }
    let categoryId = goal.categoryId;
    if (!categoryId) {
      let category = await this.categoryModel.findByName("Meta", userId);
      if (!category) {
        category = await this.categoryModel.createCategory(userId, {
          name: "Meta",
          color: "#6B7280"
        });
      }
      categoryId = category.id;
    }
    let paymentMethod = await this.paymentMethodModel.findByName("Interno", userId);
    if (!paymentMethod) {
      paymentMethod = await this.paymentMethodModel.createMethod(userId, {
        name: "Interno"
      });
    }
    const transaction = await this.transactionModel.createTransaction(userId, {
      description: `Saque: ${goal.name}`,
      amount,
      type: "income",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      categoryId,
      paymentMethodId: paymentMethod.id
    });
    const newAmount = currentAmount - amount;
    await db.update(goals).set({
      currentAmount: newAmount.toString()
    }).where((0, import_drizzle_orm5.eq)(goals.id, id));
    const [withdrawal] = await db.insert(goalContributions).values({
      goalId: id,
      transactionId: transaction.id,
      type: "withdrawal",
      amount: amount.toString()
    }).returning();
    return { withdrawal, goal: { ...goal, currentAmount: newAmount.toString() } };
  }
  async findContributionsByGoalId(goalId) {
    const result = await db.select({
      id: goalContributions.id,
      goalId: goalContributions.goalId,
      transactionId: goalContributions.transactionId,
      type: goalContributions.type,
      amount: goalContributions.amount,
      createdAt: goalContributions.createdAt
    }).from(goalContributions).where((0, import_drizzle_orm5.eq)(goalContributions.goalId, goalId)).orderBy(goalContributions.createdAt);
    return result;
  }
  async removeContribution(userId, contributionId) {
    const [contribution] = await db.select().from(goalContributions).where((0, import_drizzle_orm5.eq)(goalContributions.id, contributionId)).limit(1);
    if (!contribution) return null;
    const goal = await this.findById(contribution.goalId);
    if (!goal || goal.userId !== userId) return null;
    await this.transactionModel.deleteTransaction(contribution.transactionId, userId);
    const newAmount = Number(goal.currentAmount) - Number(contribution.amount);
    await db.update(goals).set({ currentAmount: newAmount.toString() }).where((0, import_drizzle_orm5.eq)(goals.id, goal.id));
    await db.delete(goalContributions).where((0, import_drizzle_orm5.eq)(goalContributions.id, contributionId));
    return { removed: contribution, goal: { ...goal, currentAmount: newAmount.toString() } };
  }
  async delete(id) {
    const [result] = await db.delete(goals).where((0, import_drizzle_orm5.eq)(goals.id, id)).returning();
    return result;
  }
};
var goalsModel = new GoalsModel();

// src/modules/goals/goals.schema.ts
var import_zod4 = require("zod");
var createGoalSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(255),
  description: import_zod4.z.string().max(500).optional(),
  targetAmount: import_zod4.z.number().positive("Valor alvo deve ser positivo"),
  deadline: import_zod4.z.string().datetime().optional(),
  icon: import_zod4.z.string().max(50).optional(),
  color: import_zod4.z.string().max(20).optional(),
  isActive: import_zod4.z.boolean().optional()
});
var updateGoalSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(255),
  description: import_zod4.z.string().max(500).optional(),
  targetAmount: import_zod4.z.number().positive("Valor alvo deve ser positivo"),
  deadline: import_zod4.z.string().datetime().optional(),
  icon: import_zod4.z.string().max(50).optional(),
  color: import_zod4.z.string().max(20).optional(),
  isActive: import_zod4.z.boolean().optional()
});
var contributeGoalSchema = import_zod4.z.object({
  amount: import_zod4.z.number().positive("Valor deve ser positivo")
});
var withdrawGoalSchema = import_zod4.z.object({
  amount: import_zod4.z.number().positive("Valor deve ser positivo")
});

// src/modules/goals/goals.controller.ts
var GoalsController = class {
  goalsModel = new GoalsModel();
  list = async (req, reply) => {
    const userId = req.user.sub;
    const [err, goals2] = await catchError(this.goalsModel.findAll(userId));
    if (err) {
      throw new AppError("Erro ao listar metas", 500);
    }
    return reply.send({ goals: goals2 });
  };
  create = async (req, reply) => {
    const userId = req.user.sub;
    const data = createGoalSchema.parse(req.body);
    const [err, goal] = await catchError(this.goalsModel.create(userId, data));
    if (err) {
      throw new AppError("Erro ao criar meta", 500);
    }
    return reply.status(201).send({ goal });
  };
  get = async (req, reply) => {
    const { id } = req.params;
    const [err, goal] = await catchError(this.goalsModel.findById(id));
    if (err) {
      throw new AppError("Erro ao buscar meta", 500);
    }
    if (!goal) {
      throw new AppError("Meta n\xE3o encontrada", 404);
    }
    return reply.send({ goal });
  };
  update = async (req, reply) => {
    const userId = req.user.sub;
    const { id } = req.params;
    const data = updateGoalSchema.parse(req.body);
    const [error, existing] = await catchError(this.goalsModel.findById(id));
    if (error) {
      throw new AppError("Erro ao buscar meta", 500);
    }
    if (!existing) {
      throw new AppError("Meta n\xE3o encontrada", 404);
    }
    if (existing.userId !== userId) {
      throw new AppError("N\xE3o autorizado", 403);
    }
    const [err, goal] = await catchError(this.goalsModel.update(id, data));
    if (err) {
      throw new AppError("Erro ao atualizar meta", 500);
    }
    return reply.send({ goal });
  };
  contribute = async (req, reply) => {
    const userId = req.user.sub;
    const { id } = req.params;
    const data = contributeGoalSchema.parse(req.body);
    const [error, existing] = await catchError(this.goalsModel.findById(id));
    if (error) {
      throw new AppError("Erro ao buscar meta", 500);
    }
    if (!existing) {
      throw new AppError("Meta n\xE3o encontrada", 404);
    }
    if (existing.userId !== userId) {
      throw new AppError("N\xE3o autorizado", 403);
    }
    const [err, goal] = await catchError(
      this.goalsModel.contribute(userId, id, data.amount)
    );
    if (err) {
      throw new AppError("Erro ao contribuir com meta", 500);
    }
    return reply.send({ goal });
  };
  withdraw = async (req, reply) => {
    const userId = req.user.sub;
    const { id } = req.params;
    const data = withdrawGoalSchema.parse(req.body);
    const [error, existing] = await catchError(this.goalsModel.findById(id));
    if (error) {
      throw new AppError("Erro ao buscar meta", 500);
    }
    if (!existing) {
      throw new AppError("Meta n\xE3o encontrada", 404);
    }
    if (existing.userId !== userId) {
      throw new AppError("N\xE3o autorizado", 403);
    }
    const [err, result] = await catchError(
      this.goalsModel.withdraw(userId, id, data.amount)
    );
    if (err) {
      if (err.message === "Valor maior que o saldo dispon\xEDvel") {
        throw new AppError(err.message, 400);
      }
      throw new AppError("Erro ao sacar da meta", 500);
    }
    return reply.send({ goal: result?.goal });
  };
  delete = async (req, reply) => {
    const userId = req.user.sub;
    const { id } = req.params;
    const [error, existing] = await catchError(this.goalsModel.findById(id));
    if (error) {
      throw new AppError("Erro ao buscar meta", 500);
    }
    if (!existing) {
      throw new AppError("Meta n\xE3o encontrada", 404);
    }
    if (existing.userId !== userId) {
      throw new AppError("N\xE3o autorizado", 403);
    }
    const [err] = await catchError(this.goalsModel.delete(id));
    if (err) {
      throw new AppError("Erro ao excluir meta", 500);
    }
    return reply.status(204).send();
  };
  listContributions = async (req, reply) => {
    const userId = req.user.sub;
    const { id } = req.params;
    const [error, goal] = await catchError(this.goalsModel.findById(id));
    if (error) {
      throw new AppError("Erro ao buscar meta", 500);
    }
    if (!goal) {
      throw new AppError("Meta n\xE3o encontrada", 404);
    }
    if (goal.userId !== userId) {
      throw new AppError("N\xE3o autorizado", 403);
    }
    const [err, contributions] = await catchError(
      this.goalsModel.findContributionsByGoalId(id)
    );
    if (err) {
      throw new AppError("Erro ao listar contribui\xE7\xF5es", 500);
    }
    return reply.send({ contributions });
  };
  removeContribution = async (req, reply) => {
    const userId = req.user.sub;
    const { id } = req.params;
    const [err, result] = await catchError(
      this.goalsModel.removeContribution(userId, id)
    );
    if (err) {
      throw new AppError("Erro ao remover contribui\xE7\xE3o", 500);
    }
    if (!result) {
      throw new AppError("Contribui\xE7\xE3o n\xE3o encontrada", 404);
    }
    return reply.send({ goal: result.goal });
  };
};
var goals_controller_default = new GoalsController();

// src/modules/goals/goals.routes.ts
async function registerGoalsRoutes(app) {
  const controller = new GoalsController();
  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublicRoute = path === "/health" || path === "/docs" || path.startsWith("/docs/");
    if (isPublicRoute) return;
    if (!path.startsWith("/goals")) return;
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get(
    "/goals",
    {
      schema: {
        description: "Lista metas do usu\xE1rio",
        tags: ["Goals"],
        security: [{ bearerAuth: [] }]
      }
    },
    controller.list
  );
  app.post(
    "/goals",
    {
      schema: {
        description: "Cria uma nova meta",
        tags: ["Goals"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name", "targetAmount"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 255 },
            description: { type: "string", maxLength: 500 },
            targetAmount: { type: "number", exclusiveMinimum: 0 },
            deadline: { type: "string", format: "date-time" },
            icon: { type: "string", maxLength: 50 },
            color: { type: "string", maxLength: 20 }
          }
        }
      }
    },
    controller.create
  );
  app.get(
    "/goals/:id",
    {
      schema: {
        description: "Detalha uma meta",
        tags: ["Goals"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.get
  );
  app.put(
    "/goals/:id",
    {
      schema: {
        description: "Atualiza uma meta",
        tags: ["Goals"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 255 },
            description: { type: "string", maxLength: 500 },
            targetAmount: { type: "number", exclusiveMinimum: 0 },
            deadline: { type: "string", format: "date-time" },
            icon: { type: "string", maxLength: 50 },
            color: { type: "string", maxLength: 20 },
            isActive: { type: "boolean" }
          }
        }
      }
    },
    controller.update
  );
  app.post(
    "/goals/:id/contribute",
    {
      schema: {
        description: "Adiciona valor a uma meta",
        tags: ["Goals"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        },
        body: {
          type: "object",
          required: ["amount"],
          properties: {
            amount: { type: "number", exclusiveMinimum: 0 }
          }
        }
      }
    },
    controller.contribute
  );
  app.post(
    "/goals/:id/withdraw",
    {
      schema: {
        description: "Saca valor de uma meta",
        tags: ["Goals"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        },
        body: {
          type: "object",
          required: ["amount"],
          properties: {
            amount: { type: "number", exclusiveMinimum: 0 }
          }
        }
      }
    },
    controller.withdraw
  );
  app.delete(
    "/goals/:id",
    {
      schema: {
        description: "Deleta uma meta",
        tags: ["Goals"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.delete
  );
  app.get(
    "/goals/:id/contributions",
    {
      schema: {
        description: "Lista contribui\xE7\xF5es de uma meta",
        tags: ["Goals"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.listContributions
  );
  app.delete(
    "/goals/contributions/:id",
    {
      schema: {
        description: "Remove uma contribui\xE7\xE3o",
        tags: ["Goals"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.removeContribution
  );
}

// src/modules/subcategories/subcategories.model.ts
var import_drizzle_orm6 = require("drizzle-orm");
var SubcategoryModel = class {
  async findAll(userId) {
    return db.select({
      id: subcategories.id,
      name: subcategories.name,
      color: subcategories.color,
      icon: subcategories.icon,
      categoryId: subcategories.categoryId,
      categoryName: categories.name
    }).from(subcategories).leftJoin(categories, (0, import_drizzle_orm6.eq)(subcategories.categoryId, categories.id)).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(subcategories.userId, userId), (0, import_drizzle_orm6.isNull)(subcategories.deletedAt))).orderBy((0, import_drizzle_orm6.asc)(subcategories.name));
  }
  async findByCategory(userId, categoryId) {
    return db.select({
      id: subcategories.id,
      name: subcategories.name,
      color: subcategories.color,
      icon: subcategories.icon,
      categoryId: subcategories.categoryId
    }).from(subcategories).where(
      (0, import_drizzle_orm6.and)(
        (0, import_drizzle_orm6.eq)(subcategories.userId, userId),
        (0, import_drizzle_orm6.eq)(subcategories.categoryId, categoryId),
        (0, import_drizzle_orm6.isNull)(subcategories.deletedAt)
      )
    ).orderBy((0, import_drizzle_orm6.asc)(subcategories.name));
  }
  async findById(id, userId) {
    const [subcategory] = await db.select().from(subcategories).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(subcategories.id, id), (0, import_drizzle_orm6.eq)(subcategories.userId, userId))).limit(1);
    return subcategory;
  }
  async create(userId, data) {
    const [subcategory] = await db.insert(subcategories).values({
      userId,
      categoryId: data.categoryId,
      name: data.name,
      color: data.color || "#3B82F6",
      icon: data.icon
    }).returning();
    return subcategory;
  }
  async update(id, userId, data) {
    const [updated] = await db.update(subcategories).set(data).where(
      (0, import_drizzle_orm6.and)(
        (0, import_drizzle_orm6.eq)(subcategories.id, id),
        (0, import_drizzle_orm6.eq)(subcategories.userId, userId),
        (0, import_drizzle_orm6.isNull)(subcategories.deletedAt)
      )
    ).returning();
    return updated;
  }
  async softDelete(id, userId) {
    const [deleted] = await db.update(subcategories).set({ deletedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm6.and)(
        (0, import_drizzle_orm6.eq)(subcategories.id, id),
        (0, import_drizzle_orm6.eq)(subcategories.userId, userId),
        (0, import_drizzle_orm6.isNull)(subcategories.deletedAt)
      )
    ).returning();
    return deleted;
  }
  async restore(id, userId) {
    const [restored] = await db.update(subcategories).set({ deletedAt: null }).where((0, import_drizzle_orm6.and)((0, import_drizzle_orm6.eq)(subcategories.id, id), (0, import_drizzle_orm6.eq)(subcategories.userId, userId))).returning();
    return restored;
  }
};
var subcategories_model_default = new SubcategoryModel();

// src/modules/subcategories/subcategories.schema.ts
var import_zod5 = require("zod");
var createSubcategorySchema = import_zod5.z.object({
  name: import_zod5.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(100),
  color: import_zod5.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inv\xE1lida").optional(),
  icon: import_zod5.z.string().optional(),
  categoryId: import_zod5.z.string().uuid("ID da categoria inv\xE1lido")
});
var subcategorySchema = import_zod5.z.object({
  id: import_zod5.z.string().uuid(),
  name: import_zod5.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(100),
  color: import_zod5.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inv\xE1lida").optional(),
  icon: import_zod5.z.string().optional().nullable(),
  categoryId: import_zod5.z.string().uuid("ID da categoria inv\xE1lido")
});
var updateSubcategorySchema = createSubcategorySchema.partial();

// src/modules/subcategories/subcategories.controller.ts
var SubcategoriesController = class {
  constructor(model = new SubcategoryModel()) {
    this.model = model;
  }
  list = async (request, reply) => {
    const { sub: userId } = request.user;
    const { categoryId } = request.query;
    let subcategories2;
    if (categoryId) {
      subcategories2 = await this.model.findByCategory(userId, categoryId);
    } else {
      subcategories2 = await this.model.findAll(userId);
    }
    return reply.send(subcategories2);
  };
  create = async (request, reply) => {
    const { sub: userId } = request.user;
    const body = createSubcategorySchema.parse(request.body);
    const [err, subcategory] = await catchError(
      this.model.create(userId, body)
    );
    if (err) throw new AppError("Erro ao criar subcategoria", 500);
    return reply.status(201).send(subcategory);
  };
  update = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const body = updateSubcategorySchema.parse(request.body);
    const [err, updated] = await catchError(
      this.model.update(id, userId, body)
    );
    if (err) throw new AppError("Erro ao atualizar subcategoria", 500);
    if (!updated) {
      throw new AppError("Subcategoria n\xE3o encontrada", 404);
    }
    return reply.send(updated);
  };
  delete = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [err, deleted] = await catchError(this.model.softDelete(id, userId));
    if (err) throw new AppError("Erro ao deletar subcategoria", 500);
    if (!deleted) {
      throw new AppError("Subcategoria n\xE3o encontrada", 404);
    }
    return reply.send({ message: "Subcategoria deletada com sucesso" });
  };
  restore = async (request, reply) => {
    const { sub: userId } = request.user;
    const { id } = request.params;
    const [err, restored] = await catchError(this.model.restore(id, userId));
    if (err) throw new AppError("Erro ao restaurar subcategoria", 500);
    if (!restored) {
      throw new AppError("Subcategoria n\xE3o encontrada", 404);
    }
    return reply.send(restored);
  };
};
var subcategories_controller_default = new SubcategoriesController();

// src/modules/subcategories/subcategories.routes.ts
var PUBLIC_ROUTES2 = ["/health", "/docs"];
async function registerSubcategoriesRoutes(app) {
  const controller = new SubcategoriesController();
  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublicRoute = PUBLIC_ROUTES2.some((route) => path === route || path.startsWith(route + "/"));
    if (isPublicRoute) return;
    if (!path.startsWith("/subcategories")) return;
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get(
    "/subcategories",
    {
      schema: {
        description: "Lista subcategorias do usu\xE1rio",
        tags: ["Subcategories"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            categoryId: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.list
  );
  app.post(
    "/subcategories",
    {
      schema: {
        description: "Cria uma nova subcategoria",
        tags: ["Subcategories"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name", "categoryId"],
          properties: {
            name: { type: "string" },
            color: { type: "string" },
            icon: { type: "string" },
            categoryId: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.create
  );
  app.put(
    "/subcategories/:id",
    {
      schema: {
        description: "Atualiza uma subcategoria",
        tags: ["Subcategories"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            color: { type: "string" },
            icon: { type: "string" },
            categoryId: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.update
  );
  app.delete(
    "/subcategories/:id",
    {
      schema: {
        description: "Soft delete de uma subcategoria",
        tags: ["Subcategories"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.delete
  );
  app.patch(
    "/subcategories/:id/restore",
    {
      schema: {
        description: "Restaura uma subcategoria deletada",
        tags: ["Subcategories"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.restore
  );
}

// src/modules/seed/dashboard.export.model.ts
var import_drizzle_orm7 = require("drizzle-orm");
var import_exceljs = __toESM(require("exceljs"), 1);
var import_pdfkit = __toESM(require("pdfkit"), 1);
var DEFAULT_COLOR = "FF607D8B";
var DashboardExportModel = class {
  getDateRange(filters) {
    const startDate = filters.startDate ? /* @__PURE__ */ new Date(`${filters.startDate}T00:00:00`) : void 0;
    const endDate = filters.endDate ? /* @__PURE__ */ new Date(`${filters.endDate}T23:59:59`) : void 0;
    return { startDate, endDate };
  }
  async getCategoryColors(userId) {
    const userCategories = await db.select({
      name: categories.name,
      color: categories.color
    }).from(categories).where((0, import_drizzle_orm7.eq)(categories.userId, userId));
    const colorMap = /* @__PURE__ */ new Map();
    for (const cat of userCategories) {
      const hexColor = cat.color.replace("#", "");
      colorMap.set(cat.name, `FF${hexColor.toUpperCase()}`);
    }
    return colorMap;
  }
  async getTransactions(userId, filters) {
    const { startDate, endDate } = this.getDateRange(filters);
    const rows = await db.select({
      date: transactions.date,
      description: transactions.description,
      category: categories.name,
      categoryId: transactions.categoryId,
      categoryColor: categories.color,
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
    return rows;
  }
  async getSummary(userId, filters) {
    const rawTransactions = await this.getTransactions(userId, filters);
    const categoryColors = await this.getCategoryColors(userId);
    const transactionsData = rawTransactions.map((row) => {
      const categoryName = row.category || "Sem Categoria";
      const categoryColor = row.categoryColor ? `FF${row.categoryColor.replace("#", "").toUpperCase()}` : categoryColors.get(categoryName) || DEFAULT_COLOR;
      return {
        date: row.date.toISOString(),
        description: row.description,
        category: categoryName,
        categoryColor,
        paymentMethod: row.paymentMethod || "-",
        type: row.type,
        amount: Number(row.amount)
      };
    });
    const totalIncome = transactionsData.filter((t) => t.type === "income").reduce((sum2, t) => sum2 + t.amount, 0);
    const totalExpense = transactionsData.filter((t) => t.type === "expense").reduce((sum2, t) => sum2 + t.amount, 0);
    const categoryMap = /* @__PURE__ */ new Map();
    for (const t of transactionsData) {
      if (t.type === "expense") {
        const current = categoryMap.get(t.category) || {
          total: 0,
          color: DEFAULT_COLOR
        };
        categoryMap.set(t.category, {
          total: current.total + t.amount,
          color: t.categoryColor || current.color
        });
      }
    }
    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      categoryColor: data.color,
      total: data.total,
      percentage: totalExpense > 0 ? data.total / totalExpense * 100 : 0
    })).sort((a, b) => b.total - a.total);
    const monthlyMap = /* @__PURE__ */ new Map();
    for (const t of transactionsData) {
      const monthKey = t.date.slice(0, 7);
      const current = monthlyMap.get(monthKey) || { income: 0, expense: 0 };
      if (t.type === "income") {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      monthlyMap.set(monthKey, current);
    }
    const byMonth = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    })).sort((a, b) => a.month.localeCompare(b.month));
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
      byMonth,
      transactionCount: transactionsData.length
    };
  }
  formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR");
  }
  escapeCsvField(field) {
    if (field.includes(";") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
  async exportToCsv(userId, filters) {
    const rawTransactions = await this.getTransactions(userId, filters);
    const summary = await this.getSummary(userId, filters);
    const lines = [];
    lines.push("RELAT\xD3RIO FINANCEIRO");
    lines.push("");
    lines.push("RESUMO GERAL");
    lines.push(`Total de Receitas;${this.formatCurrency(summary.totalIncome)}`);
    lines.push(
      `Total de Despesas;${this.formatCurrency(summary.totalExpense)}`
    );
    lines.push(`Saldo;${this.formatCurrency(summary.balance)}`);
    lines.push(`Total de Transa\xE7\xF5es;${summary.transactionCount}`);
    lines.push("");
    lines.push("");
    lines.push("GASTOS POR CATEGORIA");
    lines.push("Categoria;Valor;Percentual");
    for (const cat of summary.byCategory) {
      lines.push(
        `${cat.category};${this.formatCurrency(cat.total)};${cat.percentage.toFixed(1)}%`
      );
    }
    lines.push("");
    lines.push("");
    lines.push("RESUMO MENSAL");
    lines.push("M\xEAs;Receitas;Despesas;Saldo");
    for (const m of summary.byMonth) {
      lines.push(
        `${m.month};${this.formatCurrency(m.income)};${this.formatCurrency(m.expense)};${this.formatCurrency(m.balance)}`
      );
    }
    lines.push("");
    lines.push("");
    lines.push("TRANSA\xC7\xD5ES");
    lines.push("Data;Descri\xE7\xE3o;Categoria;M\xE9todo de Pagamento;Tipo;Valor");
    for (const row of rawTransactions) {
      lines.push(
        `${this.formatDate(row.date.toISOString())};${this.escapeCsvField(row.description)};${row.category || "-"};${row.paymentMethod || "-"};${row.type === "income" ? "Receita" : "Despesa"};${this.formatCurrency(Number(row.amount))}`
      );
    }
    const bom = "\uFEFF";
    return bom + lines.join("\r\n");
  }
  async exportToExcel(userId, filters) {
    const rawTransactions = await this.getTransactions(userId, filters);
    const summary = await this.getSummary(userId, filters);
    const transactionsData = rawTransactions.map((row) => {
      const categoryName = row.category || "Sem Categoria";
      const categoryColor = row.categoryColor ? `FF${row.categoryColor.replace("#", "").toUpperCase()}` : DEFAULT_COLOR;
      return {
        date: row.date.toISOString(),
        description: row.description,
        category: categoryName,
        categoryColor,
        paymentMethod: row.paymentMethod || "-",
        type: row.type,
        amount: Number(row.amount)
      };
    });
    const wb = new import_exceljs.default.Workbook();
    wb.creator = "FinanceApp";
    wb.created = /* @__PURE__ */ new Date();
    this.createDashboardSheet(wb, summary);
    this.createTransactionsSheet(wb, transactionsData);
    this.createCategorySheet(wb, summary.byCategory);
    this.createMonthlySheet(wb, summary.byMonth);
    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
  createDashboardSheet(wb, summary) {
    const ws = wb.addWorksheet("Dashboard", {
      properties: { tabColor: { argb: "FF2D5FF3" } }
    });
    ws.mergeCells("A1:F1");
    ws.getCell("A1").value = "RELAT\xD3RIO FINANCEIRO";
    ws.getCell("A1").font = {
      bold: true,
      size: 16,
      color: { argb: "FFFFFFFF" }
    };
    ws.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2D5FF3" }
    };
    ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 30;
    ws.mergeCells("A3:B3");
    ws.getCell("A3").value = "RESUMO GERAL";
    ws.getCell("A3").font = {
      bold: true,
      size: 14,
      color: { argb: "FF1A2035" }
    };
    const summaryBoxes = [
      {
        label: "Receitas",
        value: summary.totalIncome,
        row: 4,
        col: "A",
        color: "FF4CAF50"
      },
      {
        label: "Despesas",
        value: summary.totalExpense,
        row: 4,
        col: "C",
        color: "FFF44336"
      },
      {
        label: "Saldo",
        value: summary.balance,
        row: 4,
        col: "E",
        color: summary.balance >= 0 ? "FF4CAF50" : "FFF44336"
      }
    ];
    for (const box of summaryBoxes) {
      const cellRef = `${box.col}${box.row}`;
      ws.getCell(cellRef).value = box.label;
      ws.getCell(cellRef).font = { bold: true, size: 11 };
      ws.getCell(cellRef).alignment = { horizontal: "center" };
      ws.getCell(cellRef).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: box.color }
      };
      const valueRef = `${box.col}${box.row + 1}`;
      ws.getCell(valueRef).value = this.formatCurrency(box.value);
      ws.getCell(valueRef).font = { bold: true, size: 14 };
      ws.getCell(valueRef).alignment = { horizontal: "center" };
      ws.getCell(valueRef).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F5" }
      };
      ws.getCell(cellRef).border = {
        top: { style: "thin", color: { argb: "FFDDDDDD" } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } }
      };
      ws.getCell(valueRef).border = {
        top: { style: "thin", color: { argb: "FFDDDDDD" } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } }
      };
    }
    ws.getColumn("A").width = 18;
    ws.getColumn("B").width = 10;
    ws.getColumn("C").width = 18;
    ws.getColumn("D").width = 10;
    ws.getColumn("E").width = 18;
    ws.getColumn("F").width = 10;
    const catStartRow = 8;
    ws.mergeCells(`A${catStartRow}:C${catStartRow}`);
    ws.getCell(`A${catStartRow}`).value = "GASTOS POR CATEGORIA";
    ws.getCell(`A${catStartRow}`).font = {
      bold: true,
      size: 12,
      color: { argb: "FF1A2035" }
    };
    const catHeaders = ["Categoria", "Valor", "%"];
    catHeaders.forEach((header, idx) => {
      const cell = ws.getCell(
        `${String.fromCharCode(65 + idx)}${catStartRow + 1}`
      );
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" }
      };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });
    summary.byCategory.forEach((cat, idx) => {
      const rowNum = catStartRow + 2 + idx;
      const catCell = ws.getCell(`A${rowNum}`);
      catCell.value = cat.category;
      catCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: cat.categoryColor }
      };
      catCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
      const valueCell = ws.getCell(`B${rowNum}`);
      valueCell.value = cat.total;
      valueCell.numFmt = "R$ #,##0.00";
      valueCell.alignment = { horizontal: "right" };
      valueCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
      const pctCell = ws.getCell(`C${rowNum}`);
      pctCell.value = cat.percentage / 100;
      pctCell.numFmt = "0.0%";
      pctCell.alignment = { horizontal: "center" };
      pctCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });
    const monthStartRow = catStartRow + summary.byCategory.length + 4;
    ws.mergeCells(`A${monthStartRow}:D${monthStartRow}`);
    ws.getCell(`A${monthStartRow}`).value = "RESUMO MENSAL";
    ws.getCell(`A${monthStartRow}`).font = {
      bold: true,
      size: 12,
      color: { argb: "FF1A2035" }
    };
    const monthHeaders = ["M\xEAs", "Receitas", "Despesas", "Saldo"];
    monthHeaders.forEach((header, idx) => {
      const cell = ws.getCell(
        `${String.fromCharCode(65 + idx)}${monthStartRow + 1}`
      );
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" }
      };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });
    summary.byMonth.forEach((m, idx) => {
      const rowNum = monthStartRow + 2 + idx;
      const monthCell = ws.getCell(`A${rowNum}`);
      monthCell.value = m.month;
      monthCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
      const incomeCell = ws.getCell(`B${rowNum}`);
      incomeCell.value = m.income;
      incomeCell.numFmt = "R$ #,##0.00";
      incomeCell.font = { color: { argb: "FF4CAF50" } };
      incomeCell.alignment = { horizontal: "right" };
      incomeCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
      const expenseCell = ws.getCell(`C${rowNum}`);
      expenseCell.value = m.expense;
      expenseCell.numFmt = "R$ #,##0.00";
      expenseCell.font = { color: { argb: "FFF44336" } };
      expenseCell.alignment = { horizontal: "right" };
      expenseCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
      const balanceCell = ws.getCell(`D${rowNum}`);
      balanceCell.value = m.balance;
      balanceCell.numFmt = "R$ #,##0.00";
      balanceCell.font = {
        color: { argb: m.balance >= 0 ? "FF4CAF50" : "FFF44336" },
        bold: true
      };
      balanceCell.alignment = { horizontal: "right" };
      balanceCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });
  }
  createTransactionsSheet(wb, transactions2) {
    const ws = wb.addWorksheet("Transa\xE7\xF5es", {
      properties: { tabColor: { argb: "FF4CAF50" } }
    });
    ws.columns = [
      { header: "Data", key: "data", width: 12 },
      { header: "Descri\xE7\xE3o", key: "descricao", width: 35 },
      { header: "Categoria", key: "categoria", width: 18 },
      { header: "M\xE9todo", key: "metodo", width: 15 },
      { header: "Tipo", key: "tipo", width: 10 },
      { header: "Valor", key: "valor", width: 14 }
    ];
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A2035" }
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 25;
    transactions2.forEach((t, idx) => {
      const rowNum = idx + 2;
      ws.addRow({
        data: this.formatDate(t.date),
        descricao: t.description,
        categoria: t.category,
        metodo: t.paymentMethod,
        tipo: t.type === "income" ? "Receita" : "Despesa",
        valor: t.amount
      });
      const row = ws.getRow(rowNum);
      row.height = 20;
      const catCell = ws.getCell(`C${rowNum}`);
      catCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: t.categoryColor }
      };
      const valueCell = ws.getCell(`F${rowNum}`);
      valueCell.numFmt = "R$ #,##0.00";
      valueCell.font = {
        color: { argb: t.type === "income" ? "FF4CAF50" : "FFF44336" },
        bold: true
      };
      valueCell.alignment = { horizontal: "right" };
      const tipoCell = ws.getCell(`E${rowNum}`);
      tipoCell.font = {
        color: { argb: t.type === "income" ? "FF4CAF50" : "FFF44336" }
      };
      tipoCell.alignment = { horizontal: "center" };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFDDDDDD" } },
          left: { style: "thin", color: { argb: "FFDDDDDD" } },
          bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
          right: { style: "thin", color: { argb: "FFDDDDDD" } }
        };
      });
      if (idx % 2 === 1) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFAFAFA" }
        };
      }
    });
  }
  createCategorySheet(wb, byCategory) {
    const ws = wb.addWorksheet("Por Categoria", {
      properties: { tabColor: { argb: "FFFF9800" } }
    });
    ws.columns = [
      { header: "Categoria", key: "categoria", width: 25 },
      { header: "Cor", key: "cor", width: 10 },
      { header: "Valor", key: "total", width: 15 },
      { header: "Percentual", key: "percentual", width: 15 }
    ];
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF9800" }
    };
    headerRow.alignment = { horizontal: "center" };
    for (const cat of byCategory) {
      const row = ws.addRow({
        categoria: cat.category,
        cor: "",
        total: cat.total,
        percentual: cat.percentage / 100
      });
      const colorCell = row.getCell(2);
      colorCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: cat.categoryColor }
      };
      row.getCell(3).numFmt = "R$ #,##0.00";
      row.getCell(4).numFmt = "0.0%";
    }
  }
  createMonthlySheet(wb, byMonth) {
    const ws = wb.addWorksheet("Por M\xEAs", {
      properties: { tabColor: { argb: "FF00BCD4" } }
    });
    ws.columns = [
      { header: "M\xEAs", key: "mes", width: 12 },
      { header: "Receitas", key: "receitas", width: 15 },
      { header: "Despesas", key: "despesas", width: 15 },
      { header: "Saldo", key: "saldo", width: 15 }
    ];
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00BCD4" }
    };
    headerRow.alignment = { horizontal: "center" };
    for (const m of byMonth) {
      const row = ws.addRow({
        mes: m.month,
        receitas: m.income,
        despesas: m.expense,
        saldo: m.balance
      });
      row.getCell(2).numFmt = "R$ #,##0.00";
      row.getCell(3).numFmt = "R$ #,##0.00";
      row.getCell(4).numFmt = "R$ #,##0.00";
    }
  }
  async exportToPdf(userId, filters) {
    const rawTransactions = await this.getTransactions(userId, filters);
    const summary = await this.getSummary(userId, filters);
    const transactionsData = rawTransactions.map((row) => {
      const categoryName = row.category || "Sem Categoria";
      const categoryColor = row.categoryColor ? `FF${row.categoryColor.replace("#", "").toUpperCase()}` : DEFAULT_COLOR;
      return {
        date: row.date.toISOString(),
        description: row.description,
        category: categoryName,
        categoryColor,
        paymentMethod: row.paymentMethod || "-",
        type: row.type,
        amount: Number(row.amount)
      };
    });
    return new Promise((resolve, reject) => {
      try {
        const doc = new import_pdfkit.default({ size: "A4", margin: 40 });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        this.renderPdfHeader(doc, "Relat\xF3rio Financeiro");
        this.renderPdfSummary(doc, summary);
        this.renderPdfCategoryChart(doc, summary.byCategory);
        doc.addPage();
        this.renderPdfHeader(doc, "Transa\xE7\xF5es");
        this.renderPdfTransactions(doc, transactionsData.slice(0, 20));
        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }
  renderPdfHeader(doc, title) {
    doc.fontSize(20).fillColor("#1A2035").text(title, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#666666").text(`Gerado em: ${(/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")}`, {
      align: "center"
    });
    doc.moveDown(2);
  }
  renderPdfSummary(doc, summary) {
    doc.fontSize(14).fillColor("#1A2035").text("Resumo Geral", { underline: true });
    doc.moveDown(1);
    const boxWidth = 160;
    const boxHeight = 60;
    const startX = 40;
    const gap = 10;
    const boxes = [
      {
        label: "Receitas",
        value: this.formatCurrency(summary.totalIncome),
        color: "#4CAF50"
      },
      {
        label: "Despesas",
        value: this.formatCurrency(summary.totalExpense),
        color: "#F44336"
      },
      {
        label: "Saldo",
        value: this.formatCurrency(summary.balance),
        color: summary.balance >= 0 ? "#4CAF50" : "#F44336"
      }
    ];
    boxes.forEach((box, idx) => {
      const x = startX + idx * (boxWidth + gap);
      doc.rect(x, doc.y, boxWidth, boxHeight).fill("#F5F5F5");
      doc.fontSize(10).fillColor("#666666").text(box.label, x + 10, doc.y + 10, { width: boxWidth - 20 });
      doc.fontSize(16).fillColor(box.color).text(box.value, x + 10, doc.y + 5, { width: boxWidth - 20 });
    });
    doc.moveDown(4);
    doc.fontSize(10).fillColor("#666666").text(`Total de transa\xE7\xF5es: ${summary.transactionCount}`);
    doc.moveDown(2);
  }
  renderPdfCategoryChart(doc, categories2) {
    doc.fontSize(14).fillColor("#1A2035").text("Gastos por Categoria", { underline: true });
    doc.moveDown(1);
    const chartWidth = 200;
    const chartHeight = 150;
    const legendX = 260;
    const startY = doc.y;
    doc.rect(40, startY, chartWidth, chartHeight).fill("#F5F5F5");
    let currentAngle = 0;
    const centerX = 40 + chartWidth / 2;
    const centerY = startY + chartHeight / 2;
    const radius = 50;
    const total = categories2.reduce((sum2, c) => sum2 + c.total, 0);
    for (const cat of categories2) {
      if (cat.total > 0) {
        const sliceAngle = cat.total / total * 2 * Math.PI;
        doc.fillColor(`#${cat.categoryColor}`);
        doc.circle(centerX, centerY, radius).fill();
        doc.fillColor("#FFFFFF");
        doc.fontSize(8).text(
          `${cat.category}
${cat.percentage.toFixed(1)}%`,
          centerX - 30,
          centerY - 10,
          { width: 60, align: "center" }
        );
        currentAngle += sliceAngle;
      }
    }
    doc.y = startY;
    for (let idx = 0; idx < Math.min(categories2.length, 6); idx++) {
      const cat = categories2[idx];
      const legendY = startY + 10 + idx * 20;
      doc.fillColor(`#${cat.categoryColor}`).rect(legendX, legendY, 12, 12).fill();
      doc.fontSize(9).fillColor("#333333").text(
        `${cat.category}: ${this.formatCurrency(cat.total)}`,
        legendX + 18,
        legendY
      );
    }
    doc.moveDown(10);
  }
  renderPdfTransactions(doc, transactions2) {
    const tableTop = doc.y;
    const colWidths = [70, 180, 80, 80];
    const rowHeight = 20;
    doc.rect(40, tableTop - 5, 510, rowHeight).fill("#1A2035");
    doc.fillColor("#FFFFFF").fontSize(9);
    doc.text("Data", 45, tableTop, { width: colWidths[0] });
    doc.text("Descri\xE7\xE3o", 45 + colWidths[0], tableTop, { width: colWidths[1] });
    doc.text("Categoria", 45 + colWidths[0] + colWidths[1], tableTop, {
      width: colWidths[2]
    });
    doc.text(
      "Valor",
      45 + colWidths[0] + colWidths[1] + colWidths[2],
      tableTop,
      {
        width: colWidths[3],
        align: "right"
      }
    );
    let y = tableTop + rowHeight;
    for (let idx = 0; idx < transactions2.length; idx++) {
      const t = transactions2[idx];
      if (idx % 2 === 0) {
        doc.rect(40, y - 3, 510, rowHeight).fill("#FAFAFA");
      }
      doc.fillColor("#333333").fontSize(8);
      doc.text(this.formatDate(t.date), 45, y, { width: colWidths[0] });
      doc.text(t.description.substring(0, 35), 45 + colWidths[0], y, {
        width: colWidths[1]
      });
      doc.text(t.category ?? "-", 45 + colWidths[0] + colWidths[1], y, {
        width: colWidths[2]
      });
      const color = t.type === "income" ? "#4CAF50" : "#F44336";
      doc.fillColor(color);
      doc.text(
        this.formatCurrency(t.amount),
        45 + colWidths[0] + colWidths[1] + colWidths[2],
        y,
        { width: colWidths[3], align: "right" }
      );
      y += rowHeight;
    }
  }
};
var dashboard_export_model_default = new DashboardExportModel();

// src/modules/seed/dashboard.seed.controller.ts
var DashboardSeedController = class {
  /**
   * Importa transações a partir de um arquivo Excel
   */
  async importFromExcel(req, reply) {
    const payload = req.body || {};
    console.log("Received import request with payload:", payload);
    reply.status(501).send({ ok: false, message: "Not implemented yet" });
  }
  parseFilters(query) {
    const q = query;
    return {
      startDate: q.startDate,
      endDate: q.endDate
    };
  }
  /**
   * Exporta relatório financeiro em formato Excel (.xlsx)
   *
   * O relatório inclui:
   * - Resumo geral (receitas, despesas, saldo)
   * - Gastos por categoria
   * - Resumo mensal
   * - Lista de transações
   */
  async exportExcel(req, reply) {
    try {
      await req.jwtVerify();
    } catch {
      throw new AppError("Unauthorized", 401);
    }
    const userId = req.user.sub;
    const filters = this.parseFilters(req.query);
    const buffer = await dashboard_export_model_default.exportToExcel(userId, filters);
    reply.type(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    reply.header(
      "Content-Disposition",
      'attachment; filename="relatorio_financeiro.xlsx"'
    );
    return reply.send(buffer);
  }
  /**
   * Exporta relatório financeiro em formato PDF
   *
   * O relatório inclui:
   * - Resumo geral (receitas, despesas, saldo)
   * - Gráfico de pizza por categoria
   * - Lista de transações
   */
  async exportPdf(req, reply) {
    try {
      await req.jwtVerify();
    } catch {
      throw new AppError("Unauthorized", 401);
    }
    const userId = req.user.sub;
    const filters = this.parseFilters(req.query);
    const buffer = await dashboard_export_model_default.exportToPdf(userId, filters);
    reply.type("application/pdf");
    reply.header(
      "Content-Disposition",
      'attachment; filename="relatorio_financeiro.pdf"'
    );
    return reply.send(buffer);
  }
  /**
   * Exporta transações em formato CSV
   *
   * O arquivo CSV inclui:
   * - Resumo geral
   * - Gastos por categoria
   * - Resumo mensal
   * - Lista de transações
   */
  async exportCsv(req, reply) {
    try {
      await req.jwtVerify();
    } catch {
      throw new AppError("Unauthorized", 401);
    }
    const userId = req.user.sub;
    const filters = this.parseFilters(req.query);
    const csvContent = await dashboard_export_model_default.exportToCsv(userId, filters);
    reply.type("text/csv; charset=utf-8");
    reply.header(
      "Content-Disposition",
      'attachment; filename="transacoes.csv"'
    );
    return reply.send(csvContent);
  }
};
var dashboard_seed_controller_default = new DashboardSeedController();

// src/modules/seed/dashboard.seed.routes.ts
async function registerSeedDashboardRoutes(app) {
  app.post(
    "/seed/dashboard/import",
    {
      schema: {
        description: "Importa transa\xE7\xF5es a partir de um arquivo Excel",
        tags: ["Seed"]
      }
    },
    dashboard_seed_controller_default.importFromExcel.bind(dashboard_seed_controller_default)
  );
  app.get(
    "/seed/dashboard/export/excel",
    {
      schema: {
        description: "Exporta relat\xF3rio financeiro em formato Excel (.xlsx)",
        tags: ["Export"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            startDate: { type: "string", description: "Data inicial (YYYY-MM-DD)" },
            endDate: { type: "string", description: "Data final (YYYY-MM-DD)" }
          }
        }
      }
    },
    dashboard_seed_controller_default.exportExcel.bind(dashboard_seed_controller_default)
  );
  app.get(
    "/seed/dashboard/export/pdf",
    {
      schema: {
        description: "Exporta relat\xF3rio financeiro em formato PDF",
        tags: ["Export"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            startDate: { type: "string", description: "Data inicial (YYYY-MM-DD)" },
            endDate: { type: "string", description: "Data final (YYYY-MM-DD)" }
          }
        }
      }
    },
    dashboard_seed_controller_default.exportPdf.bind(dashboard_seed_controller_default)
  );
  app.get(
    "/seed/dashboard/export/csv",
    {
      schema: {
        description: "Exporta transa\xE7\xF5es em formato CSV",
        tags: ["Export"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            startDate: { type: "string", description: "Data inicial (YYYY-MM-DD)" },
            endDate: { type: "string", description: "Data final (YYYY-MM-DD)" }
          }
        }
      }
    },
    dashboard_seed_controller_default.exportCsv.bind(dashboard_seed_controller_default)
  );
}

// src/modules/auth/auth.model.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_drizzle_orm8 = require("drizzle-orm");
var SALT_ROUNDS = 10;
var AuthModel = class {
  async findByEmail(email) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm8.eq)(users.email, email)).limit(1);
    return user;
  }
  async findById(id) {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    }).from(users).where((0, import_drizzle_orm8.eq)(users.id, id)).limit(1);
    return user;
  }
  async findByIdWithPassword(id) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm8.eq)(users.id, id)).limit(1);
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
  async updateName(id, name) {
    const [user] = await db.update(users).set({ name }).where((0, import_drizzle_orm8.eq)(users.id, id)).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    });
    return user;
  }
  async updatePassword(id, newPassword) {
    const hash = await import_bcryptjs.default.hash(newPassword, SALT_ROUNDS);
    const [user] = await db.update(users).set({ password: hash }).where((0, import_drizzle_orm8.eq)(users.id, id)).returning({
      id: users.id,
      name: users.name,
      email: users.email
    });
    return user;
  }
};

// src/modules/auth/auth.schema.ts
var import_zod6 = require("zod");
var registerSchema = import_zod6.z.object({
  name: import_zod6.z.string().min(1).max(120),
  email: import_zod6.z.string().email(),
  password: import_zod6.z.string().min(6).max(128)
});
var loginSchema = import_zod6.z.object({
  email: import_zod6.z.string().email(),
  password: import_zod6.z.string().min(6).max(128),
  rememberMe: import_zod6.z.boolean().optional()
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
  updateMe = async (request, reply) => {
    await catchError(request.jwtVerify());
    const { sub } = request.user;
    const body = request.body;
    if (!body.name) {
      throw new AppError("Nome \xE9 obrigat\xF3rio", 400);
    }
    const [err, user] = await catchError(
      this.authModel.updateName(sub, body.name)
    );
    if (err) throw new AppError("Erro ao atualizar perfil", 500);
    return reply.send({ user });
  };
  changePassword = async (request, reply) => {
    await catchError(request.jwtVerify());
    const { sub } = request.user;
    const body = request.body;
    const [errUser, user] = await catchError(this.authModel.findByIdWithPassword(sub));
    if (errUser || !user) throw new AppError("Usu\xE1rio n\xE3o encontrado", 404);
    const [errVerify, isValid] = await catchError(
      this.authModel.verifyPassword(body.currentPassword, user.password)
    );
    if (errVerify) throw new AppError("Erro ao verificar senha", 500);
    if (!isValid) {
      throw new AppError("Senha atual incorreta", 401);
    }
    const [errUpdate] = await catchError(
      this.authModel.updatePassword(sub, body.newPassword)
    );
    if (errUpdate) throw new AppError("Erro ao alterar senha", 500);
    return reply.send({ message: "Senha alterada com sucesso" });
  };
};

// src/modules/auth/auth.routes.ts
async function registerAuthRoutes(app) {
  const authController = new AuthController();
  app.post(
    "/auth/register",
    {
      schema: {
        description: "Registra um novo usu\xE1rio",
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", description: "Nome do usu\xE1rio" },
            email: { type: "string", format: "email", description: "E-mail do usu\xE1rio" },
            password: { type: "string", minLength: 6, description: "Senha do usu\xE1rio" }
          }
        }
      }
    },
    authController.register
  );
  app.post(
    "/auth/login",
    {
      schema: {
        description: "Autentica um usu\xE1rio e retorna o token JWT",
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", description: "E-mail do usu\xE1rio" },
            password: { type: "string", description: "Senha do usu\xE1rio" },
            rememberMe: { type: "boolean", description: "Manter login por 30 dias" }
          }
        }
      }
    },
    authController.login
  );
  app.post(
    "/auth/logout",
    {
      schema: {
        description: "Realiza logout do usu\xE1rio",
        tags: ["Auth"]
      }
    },
    authController.logout
  );
  app.get(
    "/auth/me",
    {
      schema: {
        description: "Retorna os dados do usu\xE1rio autenticado",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }]
      }
    },
    authController.me
  );
  app.put(
    "/auth/me",
    {
      schema: {
        description: "Atualiza os dados do usu\xE1rio",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        }
      }
    },
    authController.updateMe
  );
  app.put(
    "/auth/me/password",
    {
      schema: {
        description: "Altera a senha do usu\xE1rio",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string" },
            newPassword: { type: "string", minLength: 6 }
          }
        }
      }
    },
    authController.changePassword
  );
}

// src/modules/categories/categories.schema.ts
var import_zod7 = require("zod");
var createCategorySchema = import_zod7.z.object({
  name: import_zod7.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(100),
  color: import_zod7.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Cor inv\xE1lida").optional(),
  icon: import_zod7.z.string().optional()
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
var PUBLIC_ROUTES3 = ["/health", "/docs"];
async function registerCategoriesRoutes(app) {
  const categoriesController = new CategoriesController();
  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublicRoute = PUBLIC_ROUTES3.some((route) => path === route || path.startsWith(route + "/"));
    if (isPublicRoute) return;
    if (!path.startsWith("/categories")) return;
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get(
    "/categories",
    {
      schema: {
        description: "Lista todas as categorias do usu\xE1rio",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["income", "expense"] },
            includeDeleted: { type: "boolean" }
          }
        }
      }
    },
    categoriesController.listCategories
  );
  app.post(
    "/categories",
    {
      schema: {
        description: "Cria uma nova categoria",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            color: { type: "string" },
            icon: { type: "string" }
          }
        }
      }
    },
    categoriesController.createCategory
  );
  app.put(
    "/categories/:id",
    {
      schema: {
        description: "Atualiza uma categoria",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            color: { type: "string" },
            icon: { type: "string" }
          }
        }
      }
    },
    categoriesController.updateCategory
  );
  app.delete(
    "/categories/:id",
    {
      schema: {
        description: "Soft delete de uma categoria",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    categoriesController.deleteCategory
  );
  app.patch(
    "/categories/:id/restore",
    {
      schema: {
        description: "Restaura uma categoria deletada",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    categoriesController.restoreCategory
  );
}

// src/modules/payment-methods/payment-methods.schema.ts
var import_zod8 = require("zod");
var createPaymentMethodSchema = import_zod8.z.object({
  name: import_zod8.z.string().min(1, "Nome \xE9 obrigat\xF3rio").max(100)
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
  const PUBLIC_ROUTES4 = ["/health", "/docs"];
  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublicRoute = PUBLIC_ROUTES4.some((route) => path === route || path.startsWith(`${route}/`));
    if (isPublicRoute) return;
    if (!path.startsWith("/payment-methods")) return;
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get(
    "/payment-methods",
    {
      schema: {
        description: "Lista todos os m\xE9todos de pagamento do usu\xE1rio",
        tags: ["Payment Methods"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            includeDeleted: { type: "boolean" }
          }
        }
      }
    },
    paymentMethodsController.listPaymentMethods
  );
  app.post(
    "/payment-methods",
    {
      schema: {
        description: "Cria um novo m\xE9todo de pagamento",
        tags: ["Payment Methods"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" }
          }
        }
      }
    },
    paymentMethodsController.createPaymentMethod
  );
  app.put(
    "/payment-methods/:id",
    {
      schema: {
        description: "Atualiza um m\xE9todo de pagamento",
        tags: ["Payment Methods"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        }
      }
    },
    paymentMethodsController.updatePaymentMethod
  );
  app.delete(
    "/payment-methods/:id",
    {
      schema: {
        description: "Soft delete de um m\xE9todo de pagamento",
        tags: ["Payment Methods"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    paymentMethodsController.deletePaymentMethod
  );
  app.patch(
    "/payment-methods/:id/restore",
    {
      schema: {
        description: "Restaura um m\xE9todo de pagamento deletado",
        tags: ["Payment Methods"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    paymentMethodsController.restorePaymentMethod
  );
}

// src/modules/recurring/recurring.model.ts
var import_drizzle_orm9 = require("drizzle-orm");
var RecurringTransactionModel = class {
  async findAll(userId, filters) {
    let conditions = (0, import_drizzle_orm9.eq)(recurringTransactions.userId, userId);
    if (filters?.isActive !== void 0) {
      conditions = (0, import_drizzle_orm9.and)(
        conditions,
        (0, import_drizzle_orm9.eq)(recurringTransactions.isActive, filters.isActive)
      );
    }
    if (filters?.type) {
      conditions = (0, import_drizzle_orm9.and)(
        conditions,
        (0, import_drizzle_orm9.eq)(recurringTransactions.type, filters.type)
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
    }).from(recurringTransactions).leftJoin(categories, (0, import_drizzle_orm9.eq)(recurringTransactions.categoryId, categories.id)).leftJoin(
      paymentMethods,
      (0, import_drizzle_orm9.eq)(recurringTransactions.paymentMethodId, paymentMethods.id)
    ).where(conditions).orderBy((0, import_drizzle_orm9.asc)(recurringTransactions.createdAt));
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
    }).from(recurringTransactions).leftJoin(categories, (0, import_drizzle_orm9.eq)(recurringTransactions.categoryId, categories.id)).leftJoin(
      paymentMethods,
      (0, import_drizzle_orm9.eq)(recurringTransactions.paymentMethodId, paymentMethods.id)
    ).where(
      (0, import_drizzle_orm9.and)(
        (0, import_drizzle_orm9.eq)(recurringTransactions.id, id),
        (0, import_drizzle_orm9.eq)(recurringTransactions.userId, userId)
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
      (0, import_drizzle_orm9.and)(
        (0, import_drizzle_orm9.eq)(recurringTransactions.id, id),
        (0, import_drizzle_orm9.eq)(recurringTransactions.userId, userId)
      )
    ).returning();
    return updated;
  }
  async toggleActive(id, userId) {
    const existing = await this.findById(id, userId);
    if (!existing) return null;
    const [updated] = await db.update(recurringTransactions).set({ isActive: !existing.isActive, updatedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm9.and)(
        (0, import_drizzle_orm9.eq)(recurringTransactions.id, id),
        (0, import_drizzle_orm9.eq)(recurringTransactions.userId, userId)
      )
    ).returning();
    return updated;
  }
  async softDelete(id, userId) {
    const [deleted] = await db.update(recurringTransactions).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm9.and)(
        (0, import_drizzle_orm9.eq)(recurringTransactions.id, id),
        (0, import_drizzle_orm9.eq)(recurringTransactions.userId, userId)
      )
    ).returning();
    return deleted;
  }
  async updateLastGeneratedAt(id, userId, date) {
    const [updated] = await db.update(recurringTransactions).set({ lastGeneratedAt: date, updatedAt: /* @__PURE__ */ new Date() }).where(
      (0, import_drizzle_orm9.and)(
        (0, import_drizzle_orm9.eq)(recurringTransactions.id, id),
        (0, import_drizzle_orm9.eq)(recurringTransactions.userId, userId)
      )
    ).returning();
    return updated;
  }
};

// src/modules/recurring/recurring.schema.ts
var import_zod9 = require("zod");
var recurringTransactionBaseSchema = import_zod9.z.object({
  description: import_zod9.z.string().min(1, "Descri\xE7\xE3o \xE9 obrigat\xF3ria").max(120),
  subDescription: import_zod9.z.string().max(120).optional(),
  amount: import_zod9.z.number().positive("O valor deve ser positivo"),
  type: import_zod9.z.enum(["income", "expense"], {
    errorMap: () => ({ message: "O tipo deve ser income ou expense" })
  }),
  categoryId: import_zod9.z.string().uuid("ID de categoria inv\xE1lido").optional(),
  subcategoryId: import_zod9.z.string().uuid("ID de subcategoria inv\xE1lido").optional(),
  paymentMethodId: import_zod9.z.string().uuid("ID de m\xE9todo de pagamento inv\xE1lido").optional(),
  frequency: import_zod9.z.enum(["daily", "weekly", "monthly", "yearly", "custom"], {
    errorMap: () => ({ message: "Frequ\xEAncia inv\xE1lida" })
  }),
  customIntervalDays: import_zod9.z.number().min(1, "Intervalo deve ser pelo menos 1 dia").max(365, "Intervalo m\xE1ximo \xE9 365 dias").optional(),
  dayOfMonth: import_zod9.z.number().min(1, "Dia do m\xEAs deve ser entre 1 e 31").max(31, "Dia do m\xEAs deve ser entre 1 e 31"),
  dayOfWeek: import_zod9.z.number().min(0).max(6).optional(),
  startDate: import_zod9.z.string().datetime({
    message: "Data inicial deve ser ISO 8601 v\xE1lida"
  }),
  endDate: import_zod9.z.string().datetime({ message: "Data final deve ser ISO 8601 v\xE1lida" }).optional()
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
var listRecurringTransactionsSchema = import_zod9.z.object({
  isActive: import_zod9.z.boolean().optional(),
  type: import_zod9.z.enum(["income", "expense"]).optional()
});

// src/modules/recurring/recurring.controller.ts
var RecurringTransactionController = class {
  constructor(recurringModel = new RecurringTransactionModel(), categoryModel = new CategoryModel(), paymentMethodModel = new PaymentMethodModel(), transactionModel2 = new TransactionModel()) {
    this.recurringModel = recurringModel;
    this.categoryModel = categoryModel;
    this.paymentMethodModel = paymentMethodModel;
    this.transactionModel = transactionModel2;
  }
  listRecurringTransactions = async (request, reply) => {
    const { sub: userId } = request.user;
    const filters = listRecurringTransactionsSchema.parse(request.query);
    const [err, result] = await catchError(
      this.recurringModel.findAll(userId, filters)
    );
    if (err)
      throw new AppError(
        `Erro ao listar transa\xE7\xF5es recorrentes, ${err.message}`,
        500
      );
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
    await this.recurringModel.updateLastGeneratedAt(id, userId, now);
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
          const interval = Number.parseInt(
            recurring.customIntervalDays || "0",
            10
          );
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
  const PUBLIC_ROUTES4 = ["/health", "/docs"];
  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublicRoute = PUBLIC_ROUTES4.some((route) => path === route || path.startsWith(route + "/"));
    if (isPublicRoute) return;
    if (!path.startsWith("/recurring")) return;
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get(
    "/recurring",
    {
      schema: {
        description: "Lista todas as transa\xE7\xF5es recorrentes do usu\xE1rio",
        tags: ["Recurring"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            includeInactive: { type: "boolean" }
          }
        }
      }
    },
    controller.listRecurringTransactions
  );
  app.get(
    "/recurring/:id",
    {
      schema: {
        description: "Retorna uma transa\xE7\xE3o recorrente pelo ID",
        tags: ["Recurring"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.getRecurringTransaction
  );
  app.post(
    "/recurring",
    {
      schema: {
        description: "Cria uma nova transa\xE7\xE3o recorrente",
        tags: ["Recurring"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["description", "amount", "type", "startDate", "frequency"],
          properties: {
            description: { type: "string" },
            subDescription: { type: "string" },
            amount: { type: "number" },
            type: { type: "string", enum: ["income", "expense"] },
            startDate: { type: "string" },
            endDate: { type: "string" },
            frequency: {
              type: "string",
              enum: ["daily", "weekly", "monthly", "yearly", "custom"]
            },
            customIntervalDays: { type: "integer" },
            dayOfMonth: { type: "integer" },
            dayOfWeek: { type: "integer" },
            categoryId: { type: "string", format: "uuid" },
            subcategoryId: { type: "string", format: "uuid" },
            paymentMethodId: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.createRecurringTransaction
  );
  app.put(
    "/recurring/:id",
    {
      schema: {
        description: "Atualiza uma transa\xE7\xE3o recorrente",
        tags: ["Recurring"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        },
        body: {
          type: "object",
          properties: {
            description: { type: "string" },
            subDescription: { type: "string" },
            amount: { type: "number" },
            type: { type: "string", enum: ["income", "expense"] },
            startDate: { type: "string" },
            endDate: { type: "string" },
            frequency: {
              type: "string",
              enum: ["daily", "weekly", "monthly", "yearly", "custom"]
            },
            customIntervalDays: { type: "integer" },
            dayOfMonth: { type: "integer" },
            dayOfWeek: { type: "integer" },
            categoryId: { type: "string", format: "uuid" },
            subcategoryId: { type: "string", format: "uuid" },
            paymentMethodId: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.updateRecurringTransaction
  );
  app.patch(
    "/recurring/:id/toggle",
    {
      schema: {
        description: "Ativa ou desativa uma transa\xE7\xE3o recorrente",
        tags: ["Recurring"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.toggleRecurringTransaction
  );
  app.delete(
    "/recurring/:id",
    {
      schema: {
        description: "Deleta uma transa\xE7\xE3o recorrente",
        tags: ["Recurring"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.deleteRecurringTransaction
  );
  app.post(
    "/recurring/:id/process",
    {
      schema: {
        description: "Processa manualmente uma transa\xE7\xE3o recorrente",
        tags: ["Recurring"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    controller.processRecurringTransaction
  );
}

// src/modules/summary/summary.model.ts
var import_drizzle_orm10 = require("drizzle-orm");
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
  async getMetaCategoryId(userId) {
    const [metaCategory] = await db.select({ id: categories.id }).from(categories).where((0, import_drizzle_orm10.and)((0, import_drizzle_orm10.eq)(categories.userId, userId), (0, import_drizzle_orm10.eq)(categories.name, "Meta"))).limit(1);
    return metaCategory?.id ?? null;
  }
  async getSummary(userId, filters = {}) {
    const range = resolveRange(filters);
    const metaCategoryId = await this.getMetaCategoryId(userId);
    const balanceConditions = (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.eq)(transactions.userId, userId),
      (0, import_drizzle_orm10.gte)(transactions.date, range.start),
      (0, import_drizzle_orm10.lt)(transactions.date, range.endExclusive)
    );
    const balanceConditionsWithFilter = metaCategoryId ? (0, import_drizzle_orm10.and)(balanceConditions, (0, import_drizzle_orm10.ne)(transactions.categoryId, metaCategoryId)) : balanceConditions;
    const [balanceResult] = await db.select({
      total: import_drizzle_orm10.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`
    }).from(transactions).where(balanceConditionsWithFilter);
    const currentConditions = (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.eq)(transactions.userId, userId),
      (0, import_drizzle_orm10.gte)(transactions.date, range.start),
      (0, import_drizzle_orm10.lt)(transactions.date, range.endExclusive)
    );
    const currentConditionsWithFilter = metaCategoryId ? (0, import_drizzle_orm10.and)(currentConditions, (0, import_drizzle_orm10.ne)(transactions.categoryId, metaCategoryId)) : currentConditions;
    const [currentMonthTotals] = await db.select({
      income: import_drizzle_orm10.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
      expense: import_drizzle_orm10.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
    }).from(transactions).where(currentConditionsWithFilter);
    const previousConditions = (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.eq)(transactions.userId, userId),
      (0, import_drizzle_orm10.gte)(transactions.date, range.previousStart),
      (0, import_drizzle_orm10.lt)(transactions.date, range.previousEndExclusive)
    );
    const previousConditionsWithFilter = metaCategoryId ? (0, import_drizzle_orm10.and)(previousConditions, (0, import_drizzle_orm10.ne)(transactions.categoryId, metaCategoryId)) : previousConditions;
    const [previousMonthTotals] = await db.select({
      expense: import_drizzle_orm10.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
    }).from(transactions).where(previousConditionsWithFilter);
    const expenseChange = previousMonthTotals.expense > 0 ? (currentMonthTotals.expense - previousMonthTotals.expense) / previousMonthTotals.expense * 100 : 0;
    return {
      totalBalance: Number(balanceResult.total),
      monthlyIncome: Number(currentMonthTotals.income),
      monthlyExpense: Number(currentMonthTotals.expense),
      monthlyChange: Number(expenseChange.toFixed(2))
    };
  }
  async getMonthlySummary(userId) {
    const metaCategoryId = await this.getMetaCategoryId(userId);
    const conditions = (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.eq)(transactions.userId, userId),
      import_drizzle_orm10.sql`${transactions.date} >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'`
    );
    const conditionsWithFilter = metaCategoryId ? (0, import_drizzle_orm10.and)(conditions, (0, import_drizzle_orm10.ne)(transactions.categoryId, metaCategoryId)) : conditions;
    const result = await db.select({
      month: import_drizzle_orm10.sql`to_char(${transactions.date}, 'YYYY-MM')`,
      income: import_drizzle_orm10.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
      expense: import_drizzle_orm10.sql`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`
    }).from(transactions).where(conditionsWithFilter).groupBy(import_drizzle_orm10.sql`to_char(${transactions.date}, 'YYYY-MM')`).orderBy(import_drizzle_orm10.sql`to_char(${transactions.date}, 'YYYY-MM')`);
    return result.map((r) => ({
      month: r.month,
      income: Number(r.income),
      expense: Number(r.expense),
      balance: Number(r.income) - Number(r.expense)
    }));
  }
  async getByCategorySummary(userId, filters = {}) {
    const range = resolveRange(filters);
    const transactionType = filters.type || "expense";
    const metaCategoryId = await this.getMetaCategoryId(userId);
    const conditions = (0, import_drizzle_orm10.and)(
      (0, import_drizzle_orm10.eq)(transactions.userId, userId),
      (0, import_drizzle_orm10.eq)(transactions.type, transactionType),
      (0, import_drizzle_orm10.gte)(transactions.date, range.start),
      (0, import_drizzle_orm10.lt)(transactions.date, range.endExclusive)
    );
    const conditionsWithFilter = metaCategoryId ? (0, import_drizzle_orm10.and)(conditions, (0, import_drizzle_orm10.ne)(transactions.categoryId, metaCategoryId)) : conditions;
    const expenses = await db.select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      color: categories.color,
      total: import_drizzle_orm10.sql`SUM(${transactions.amount})`
    }).from(transactions).leftJoin(categories, (0, import_drizzle_orm10.eq)(transactions.categoryId, categories.id)).where(conditionsWithFilter).groupBy(transactions.categoryId, categories.name, categories.color).orderBy((0, import_drizzle_orm10.desc)(import_drizzle_orm10.sql`SUM(${transactions.amount})`));
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
var import_zod10 = require("zod");
var summaryPeriodSchema = import_zod10.z.enum(["7d", "30d", "month", "previous"]);
var summaryQuerySchema = import_zod10.z.object({
  month: import_zod10.z.string().regex(/^\d{4}-\d{2}$/, "Formato de m\xEAs inv\xE1lido (esperado: YYYY-MM)").optional(),
  period: summaryPeriodSchema.optional(),
  type: import_zod10.z.enum(["income", "expense"]).optional()
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
    const { month, period, type } = summaryQuerySchema.parse(request.query);
    const [err, byCategory] = await catchError(
      this.summaryModel.getByCategorySummary(userId, { month, period, type })
    );
    if (err) throw new AppError("Erro ao obter resumo por categoria", 500);
    return reply.send(byCategory);
  };
};

// src/modules/summary/summary.routes.ts
async function registerSummaryRoutes(app) {
  const summaryController = new SummaryController();
  const PUBLIC_ROUTES4 = ["/health", "/docs"];
  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublicRoute = PUBLIC_ROUTES4.some((route) => path === route || path.startsWith(route + "/"));
    if (isPublicRoute) return;
    if (!path.startsWith("/summary")) return;
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get(
    "/summary",
    {
      schema: {
        description: "Retorna o resumo geral das finan\xE7as",
        tags: ["Summary"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            month: { type: "string", description: "M\xEAs espec\xEDfico (YYYY-MM)" }
          }
        }
      }
    },
    summaryController.getSummary
  );
  app.get(
    "/summary/monthly",
    {
      schema: {
        description: "Retorna o resumo mensal das finan\xE7as",
        tags: ["Summary"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            months: { type: "integer", description: "Quantidade de meses" }
          }
        }
      }
    },
    summaryController.getMonthlySummary
  );
  app.get(
    "/summary/by-category",
    {
      schema: {
        description: "Retorna o resumo por categoria",
        tags: ["Summary"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            month: { type: "string", description: "M\xEAs espec\xEDfico (YYYY-MM)" },
            type: { type: "string", enum: ["income", "expense"] }
          }
        }
      }
    },
    summaryController.getByCategorySummary
  );
}

// src/modules/transactions/transactions.schema.ts
var import_zod11 = require("zod");
var createTransactionSchema = import_zod11.z.object({
  description: import_zod11.z.string().min(1, "Descri\xE7\xE3o \xE9 obrigat\xF3ria").max(120),
  subDescription: import_zod11.z.string().max(120).optional(),
  amount: import_zod11.z.number().positive("O valor deve ser positivo"),
  type: import_zod11.z.enum(["income", "expense"], {
    errorMap: () => ({ message: "O tipo deve ser income ou expense" })
  }),
  date: import_zod11.z.string().min(1, "Data \xE9 obrigat\xF3ria"),
  categoryId: import_zod11.z.string().uuid("ID de categoria inv\xE1lido").optional(),
  subcategoryId: import_zod11.z.string().uuid("ID de subcategoria inv\xE1lido").optional(),
  paymentMethodId: import_zod11.z.string().uuid("ID de m\xE9todo de pagamento inv\xE1lido").optional()
});
var updateTransactionSchema = createTransactionSchema.partial();
var listTransactionsSchema = import_zod11.z.object({
  month: import_zod11.z.string().regex(/^\d{4}-\d{2}$/, "Formato de m\xEAs inv\xE1lido (esperado: YYYY-MM)").optional(),
  type: import_zod11.z.enum(["income", "expense"]).optional(),
  categoryId: import_zod11.z.string().uuid().optional(),
  paymentMethodId: import_zod11.z.string().uuid().optional(),
  startDate: import_zod11.z.string().datetime({ message: "startDate deve ser ISO 8601 v\xE1lida" }).optional(),
  endDate: import_zod11.z.string().datetime({ message: "endDate deve ser ISO 8601 v\xE1lida" }).optional(),
  page: import_zod11.z.coerce.number().min(1).default(1),
  limit: import_zod11.z.coerce.number().min(1).max(100).default(10)
});

// src/modules/transactions/transactions.controller.ts
var TransactionsController = class {
  constructor(transactionModel2 = new TransactionModel(), categoryModel = new CategoryModel(), paymentMethodModel = new PaymentMethodModel()) {
    this.transactionModel = transactionModel2;
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
  const PUBLIC_ROUTES4 = ["/health", "/docs"];
  app.addHook("onRequest", async (request, reply) => {
    const path = request.url.split("?")[0];
    const isPublicRoute = PUBLIC_ROUTES4.some((route) => path === route || path.startsWith(`${route}/`));
    if (isPublicRoute) return;
    if (!path.startsWith("/transactions")) return;
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  app.get(
    "/transactions",
    {
      schema: {
        description: "Lista todas as transa\xE7\xF5es do usu\xE1rio",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["income", "expense"] },
            categoryId: { type: "string", format: "uuid" },
            page: { type: "integer" },
            limit: { type: "integer" }
          }
        }
      }
    },
    transactionsController.listTransactions
  );
  app.get(
    "/transactions/:id",
    {
      schema: {
        description: "Retorna uma transa\xE7\xE3o pelo ID",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    transactionsController.getTransaction
  );
  app.post(
    "/transactions",
    {
      schema: {
        description: "Cria uma nova transa\xE7\xE3o",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["description", "amount", "type", "date"],
          properties: {
            description: { type: "string" },
            amount: { type: "number" },
            type: { type: "string", enum: ["income", "expense"] },
            date: { type: "string" },
            categoryId: { type: "string", format: "uuid" },
            subcategoryId: { type: "string", format: "uuid" },
            paymentMethodId: { type: "string", format: "uuid" }
          }
        }
      }
    },
    transactionsController.createTransaction
  );
  app.put(
    "/transactions/:id",
    {
      schema: {
        description: "Atualiza uma transa\xE7\xE3o",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        },
        body: {
          type: "object",
          properties: {
            description: { type: "string" },
            amount: { type: "number" },
            type: { type: "string", enum: ["income", "expense"] },
            date: { type: "string" },
            categoryId: { type: "string", format: "uuid" },
            subcategoryId: { type: "string", format: "uuid" },
            paymentMethodId: { type: "string", format: "uuid" }
          }
        }
      }
    },
    transactionsController.updateTransaction
  );
  app.delete(
    "/transactions/:id",
    {
      schema: {
        description: "Deleta uma transa\xE7\xE3o",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" }
          }
        }
      }
    },
    transactionsController.deleteTransaction
  );
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
      info: {
        title: "FinanceApp API",
        version: "1.0.0",
        description: "API para controle financeiro pessoal"
      },
      servers: [
        { url: "http://localhost:3000", description: "Servidor local" }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        },
        schemas: {
          ExportFilter: {
            type: "object",
            properties: {
              startDate: {
                type: "string",
                format: "date",
                description: "Data inicial (YYYY-MM-DD)"
              },
              endDate: {
                type: "string",
                format: "date",
                description: "Data final (YYYY-MM-DD)"
              },
              type: {
                type: "string",
                enum: ["income", "expense"],
                description: "Tipo de transa\xE7\xE3o"
              },
              categoryId: {
                type: "string",
                format: "uuid",
                description: "ID da categoria"
              }
            }
          },
          ErrorResponse: {
            type: "object",
            properties: {
              message: { type: "string" },
              statusCode: { type: "number" }
            }
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  });
  await app.register(import_swagger_ui.default, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false
    }
  });
  await registerRoutes(app);
  await registerBudgetsRoutes(app);
  await registerGoalsRoutes(app);
  await registerSubcategoriesRoutes(app);
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
