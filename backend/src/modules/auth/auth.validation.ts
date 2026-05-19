import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
