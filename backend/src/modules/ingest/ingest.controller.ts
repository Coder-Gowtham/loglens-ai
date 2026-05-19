import { Request, Response } from "express";
import { createLogSchema } from "../logs/logs.validation.js";
import { formatZodError } from "../../utils/formatZodError.js";
import { requireProjectByApiKey } from "../projects/projects.service.js";
import * as logService from "../logs/logs.service.js";

export async function ingestLog(req: Request, res: Response) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || typeof apiKey !== "string") {
    return res.status(401).json({ message: "X-API-Key header is required" });
  }

  const validation = createLogSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(validation.error),
    });
  }

  const project = await requireProjectByApiKey(apiKey);

  if (validation.data.projectId !== project.id) {
    return res.status(403).json({
      message: "projectId does not match the API key project",
    });
  }

  const log = await logService.createLog(project.userId, validation.data);

  return res.status(201).json({
    message: "Log ingested",
    data: log,
  });
}
