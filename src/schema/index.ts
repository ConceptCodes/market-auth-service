import { insertUserSchema } from "@/lib/db/schema";
import { z } from "zod";

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const loginSchema = insertUserSchema.pick({
  email: true,
  password: true,
});

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
