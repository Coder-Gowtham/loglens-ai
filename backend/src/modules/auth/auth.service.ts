import bcrypt from "bcrypt";
import prisma from "../../config/db.js";
import { signToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/ApiError.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerUser(input: RegisterInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: normalizedEmail,
      passwordHash,
    },
  });

  const token = signToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}

export async function loginUser(input: LoginInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}
