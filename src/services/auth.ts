import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@lib/db";
import { userTable } from "@lib/db/schema";
import { createLogger } from "@lib/logger";
import { sendEmail } from "@lib/email";
import type { LoginSchema, VerifyEmailSchema } from "@/schema";
import {
  comparePassword,
  generateOTPCode,
  hashPassword,
  takeFirst,
  verifyOTPCode,
} from "@/util";
import {
  InternalError,
  InvalidLoginCredentials,
  ValidationError,
} from "@/exceptions";
import { generateTokens } from "@/util";
import type { Tokens } from "global";

const logger = createLogger("auth-service");
export default class AuthService {
  public async login(data: LoginSchema): Promise<Tokens> {
    try {
      const hashedPassword = await hashPassword(data.password);

      const users = await db
        .select()
        .from(userTable)
        .where(
          and(
            eq(userTable.email, data.email),
            isNotNull(userTable.emailVerified)
          )
        );

      const user = takeFirst(users);

      if (!user) {
        logger.error(
          { email: data.email },
          "User not found or email not verified"
        );
        throw new InvalidLoginCredentials("email or password is incorrect");
      }

      const isValid = await comparePassword(user.password, hashedPassword);

      if (!isValid) {
        logger.error({ email: data.email }, "Invalid login credentials");
        throw new ValidationError("email or password is incorrect");
      }

      const { accessToken, refreshToken } = generateTokens(user);
      return { accessToken, refreshToken };
    } catch (error) {
      logger.error({ error }, "Login failed");
      throw new InternalError("Login failed");
    }
  }

  public async register(data: LoginSchema): Promise<void> {
    try {
      const hashedPassword = await hashPassword(data.password);

      const users = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, data.email));

      const user = takeFirst(users);

      if (user) {
        if (user.emailVerified) {
          logger.error({ email: data.email }, "Email already registered");
          throw new ValidationError("Email already registered");
        }
        logger.error({ email: data.email }, "Email already registered");
        throw new ValidationError("Email already registered");
      }

      await db.insert(userTable).values({
        email: data.email,
        password: hashedPassword,
      });

      logger.info({ email: data.email }, "User registered successfully");

      const code = await generateOTPCode(data.email);
      logger.info({ email: data.email }, "Generated OTP code");

      await sendEmail(data.email, "verifyEmail", { code });
    } catch (error) {
      logger.error({ error }, "Registration failed");
      throw new InternalError("Registration failed");
    }
  }

  public async verifyEmail(data: VerifyEmailSchema): Promise<void> {
    try {
      const isValid = await verifyOTPCode(data);

      if (!isValid) {
        logger.error({ email: data.email }, "Invalid OTP code");
        throw new ValidationError("Invalid OTP code");
      }

      await db
        .update(userTable)
        .set({ emailVerified: new Date() })
        .where(eq(userTable.email, data.email));

      logger.info({ email: data.email }, "Email verified successfully");
    } catch (error) {
      logger.error({ error }, "Email verification failed");
      throw new InternalError("Email verification failed");
    }
  }
}
