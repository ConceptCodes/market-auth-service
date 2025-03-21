import { z } from "zod";

export const verifyEmailSchema = z.object(
  {
    email: z.string().email(),
    code: z.string().length(6),
  },
  {
    description: "verify email schema",
  }
);

export const loginSchema = z.object(
  {
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password cannot exceed 100 characters")
      .refine(
        (password) => /[A-Z]/.test(password),
        "Password must contain at least one uppercase letter"
      )
      .refine(
        (password) => /[a-z]/.test(password),
        "Password must contain at least one lowercase letter"
      )
      .refine(
        (password) => /[0-9]/.test(password),
        "Password must contain at least one number"
      )
      .refine(
        (password) => /[^A-Za-z0-9]/.test(password),
        "Password must contain at least one special character"
      ),
  },
  {
    description: "login/register schema",
  }
);

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
