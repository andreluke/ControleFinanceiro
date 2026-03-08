import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { users } from "../../drizzle/schema";
import type { RegisterInput } from "./auth.schema";

const SALT_ROUNDS = 10;

export class AuthModel {
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  async findById(id: string) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async createUser(data: RegisterInput) {
    const hash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    return user;
  }
}
