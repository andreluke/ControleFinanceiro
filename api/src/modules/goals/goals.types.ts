import type { goals } from "../../drizzle/schema";

export type Goal = typeof goals.$inferSelect;
export type CreateGoal = typeof goals.$inferInsert;
