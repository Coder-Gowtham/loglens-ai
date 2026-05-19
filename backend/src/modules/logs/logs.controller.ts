import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as logService from "./logs.service.js";
import {
  createLogSchema,
  logIdParamSchema,
  updateLogSchema,
} from "./logs.validation.js";
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
  const validation = createLogSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(validation.error),
    });
  }

  const log = await logService.createLog(userId, validation.data);

  return res.status(201).json({
    message: "Log created",
    data: log,
  });
}

export async function getAll(req: AuthRequest, res: Response) {
  const userId = requireUserId(req);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const search = String(req.query.search || "");
  const severity = String(req.query.severity || "all");
  const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;

  const result = await logService.getLogs(userId, page, limit, search, severity, projectId);

  res.json(result);
}

export async function getById(req: AuthRequest, res: Response) {
  const userId = requireUserId(req);
  const validation = logIdParamSchema.safeParse(req.params);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(validation.error),
    });
  }

  const log = await logService.getLogByIdForUser(validation.data.id, userId);

  if (!log) {
    return res.status(404).json({ message: "Log not found" });
  }

  return res.status(200).json({ data: log });
}

export async function update(req: AuthRequest, res: Response) {
  const userId = requireUserId(req);
  const idValidation = logIdParamSchema.safeParse(req.params);

  if (!idValidation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(idValidation.error),
    });
  }

  const bodyValidation = updateLogSchema.safeParse(req.body);

  if (!bodyValidation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(bodyValidation.error),
    });
  }

  const log = await logService.updateLog(
    idValidation.data.id,
    userId,
    bodyValidation.data
  );

  return res.status(200).json({
    message: "Log updated",
    data: log,
  });
}

export async function remove(req: AuthRequest, res: Response) {
  const userId = requireUserId(req);
  const validation = logIdParamSchema.safeParse(req.params);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(validation.error),
    });
  }

  await logService.deleteLog(validation.data.id, userId);

  return res.status(200).json({
    message: "Log deleted successfully",
  });
}

export async function reanalyze(req: AuthRequest, res: Response) {
  const userId = requireUserId(req);
  const validation = logIdParamSchema.safeParse(req.params);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatZodError(validation.error),
    });
  }

  await logService.reanalyzeLog(validation.data.id, userId);

  res.json({
    message: "Log re-analysis queued",
  });
}
