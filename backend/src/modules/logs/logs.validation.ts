import { z } from "zod";

export const createLogSchema = z.object({
  projectId: z.string().uuid(),
  level: z.enum(["info", "warning", "error", "critical"]),
  message: z.string(),
  source: z.string().optional(),
  metadata: z.any().optional(),
});