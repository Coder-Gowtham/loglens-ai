import "dotenv/config";
import prisma from "./config/db.js";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const userData = {
    email: "test@example.com",
    name: "Test User",
    passwordHash,
  } as Prisma.UserCreateInput;

  const user = await prisma.user.create({
    data: userData,
  });

  console.log("User created:", user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());