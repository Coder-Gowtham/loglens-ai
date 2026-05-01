import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Global error:", error);

  res.status(500).json({
    message: error.message || "Internal Server Error",
  });
}