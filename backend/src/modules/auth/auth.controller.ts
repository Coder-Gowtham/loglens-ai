import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { loginUser, registerUser, getUserById } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { formatZodError } from "../../utils/formatZodError.js";
import { ApiError } from "../../utils/ApiError.js";

export async function register(req: Request, res: Response) {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(validation.error),
    });
  }

  const result = await registerUser(validation.data);

  res.status(201).json({
    message: "User registered successfully",
    data: result,
  });
}

export async function login(req: Request, res: Response) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(validation.error),
    });
  }

  const result = await loginUser(validation.data);

  res.status(200).json({
    message: "Login successful",
    data: result,
  });
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await getUserById(req.userId);

  res.status(200).json({ data: user });
}
