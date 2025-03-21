import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { get, set } from "@lib/redis";
import { type User, userTable } from "@lib/db/schema";
import { db } from "@lib/db";
import { env } from "@lib/env";
import type { Tokens } from "global";
import type { VerifyEmailSchema } from "@/schema";

export function takeFirst<T>(items: T[]): T | undefined {
  return items.at(0);
}

export function takeFirstOrThrow<T>(items: T[]) {
  const first = takeFirst(items);

  if (!first) {
    throw new Error("First item not found");
  }

  return first;
}

export const getOtpKey = (email: string) => `otp:${email}`;

export const generateOTPCode = async (email: string): Promise<string> => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = getOtpKey(email);
  await set(key, otp);
  return otp;
};

export const verifyOTPCode = async (
  data: VerifyEmailSchema
): Promise<boolean> => {
  const key = getOtpKey(data.email);
  const value = await get(key);
  console.log(value, data.code);
  return value == data.code;
};

export const doesUserExist = async (id: User["id"]): Promise<boolean> => {
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, id))
    .limit(1);

  const user = takeFirst(users);
  return !!user;
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateTokens = (data: User): Tokens => {
  try {
    const accessToken = jwt.sign(
      {
        id: data.id,
        role: data.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN,
      }
    );

    const refreshToken = jwt.sign({ id: data.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  } catch (err) {
    throw err;
  }
};
