import { z } from "zod";

export const logIdParamSchema = z.object({
  id: z.string().uuid("Invalid log ID"),
});

export const createLogSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  level: z.enum(["info", "warning", "error", "critical"]),
  message: z.string().min(1, "Message is required"),
  source: z.string().optional(),
  metadata: z.any().optional(),
});

export const updateLogSchema = z.object({
  level: z.enum(["info", "warning", "error", "critical"]).optional(),
  message: z.string().min(1, "Message cannot be empty").optional(),
  source: z.string().optional(),
  metadata: z.any().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required for update",
});