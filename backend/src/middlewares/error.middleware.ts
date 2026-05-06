import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Global error:", error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
  });
}