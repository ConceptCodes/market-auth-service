import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@lib/db";
import type { LoginSchema } from "@/schema";
import { comparePassword, hashPassword, takeFirstOrThrow } from "@/util";
import { userTable } from "@lib/db/schema";
import { InvalidLoginCredentials } from "@/exceptions";
import { generateTokens } from "@/util";
import type { Tokens } from "global";

export default class AuthService {
  public async login(data: LoginSchema): Promise<Tokens> {
    const hashedPassword = await hashPassword(data.password);

    const users = await db
      .select()
      .from(userTable)
      .where(
        and(eq(userTable.email, data.email), isNotNull(userTable.emailVerified))
      );

    const user = takeFirstOrThrow(users);

    if (!user) {
      throw new InvalidLoginCredentials();
    }

    const isValid = await comparePassword(user.password, hashedPassword);

    if (!isValid) throw new InvalidLoginCredentials();

    const { accessToken, refreshToken } = generateTokens(user);
    return { accessToken, refreshToken };
  }

  public async register(data: LoginSchema): Promise<void> {
    const hashedPassword = await hashPassword(data.password);

    const users = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, data.email));

    const user = takeFirstOrThrow(users);

    if (user) throw new InvalidLoginCredentials();

    await db.insert(userTable).values({
      email: data.email,
      password: hashedPassword,
    });
  }
}
