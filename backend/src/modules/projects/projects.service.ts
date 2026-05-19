import crypto from "crypto";
import prisma from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

type CreateProjectInput = {
  name: string;
  userId: string;
};

export async function createProject(data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      name: data.name,
      userId: data.userId,
      apiKey: crypto.randomUUID(),
    },
  });
}

export async function getProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById(id: string, userId: string) {
  return prisma.project.findFirst({
    where: { id, userId },
  });
}

export async function getProjectByApiKey(apiKey: string) {
  return prisma.project.findUnique({
    where: { apiKey },
  });
}

export async function requireProjectByApiKey(apiKey: string) {
  const project = await getProjectByApiKey(apiKey);

  if (!project) {
    throw new ApiError(401, "Invalid API key");
  }

  return project;
}
