import { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service.js";

export async function register(req: Request, res: Response) {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
}