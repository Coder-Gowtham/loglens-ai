import jwt, { type SignOptions, type Secret } from "jsonwebtoken";

function getJwtSecret(): Secret {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }
  return secret;
}

export function signToken(userId: string) {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

  return jwt.sign(
    { userId },
    getJwtSecret(),
    { expiresIn }
  );
}