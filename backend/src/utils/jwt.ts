import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(userId: string) {
  const expiresIn = env.jwtExpiresIn as SignOptions["expiresIn"];

  return jwt.sign({ userId }, env.jwtSecret, { expiresIn });
}
