import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as projectService from "./projects.service.js";
import { createProjectSchema, projectIdParamSchema } from "./projects.validation.js";
import { formatZodError } from "../../utils/formatZodError.js";
import { ApiError } from "../../utils/ApiError.js";

function requireUserId(req: AuthRequest): string {
  if (!req.userId) {
    throw new ApiError(401, "Unauthorized");
  }
  return req.userId;
}

export async function create(req: AuthRequest, res: Response) {
  const userId = requireUserId(req);
  const validation = createProjectSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(validation.error),
    });
  }

  const project = await projectService.createProject({
    name: validation.data.name,
    userId,
  });

  res.status(201).json({ data: project });
}

export async function getAll(req: AuthRequest, res: Response) {
  const userId = requireUserId(req);
  const projects = await projectService.getProjects(userId);

  res.json({ data: projects });
}

export async function getById(req: AuthRequest, res: Response) {
  const userId = requireUserId(req);
  const validation = projectIdParamSchema.safeParse(req.params);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(validation.error),
    });
  }

  const project = await projectService.getProjectById(validation.data.id, userId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json({ data: project });
}
