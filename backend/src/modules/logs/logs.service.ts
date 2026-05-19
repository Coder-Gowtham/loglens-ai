import prisma from "../../config/db.js";
import { redis } from "../../config/redis.js";
import { clearLogsCache } from "../../utils/clearLogsCache.js";
import { ApiError } from "../../utils/ApiError.js";
import { addLogAnalysisJob } from "../queue/logAnalysis.queue.js";
import { getProjectById } from "../projects/projects.service.js";

function userLogsWhere(userId: string, extra: Record<string, unknown> = {}) {
  return {
    project: { userId },
    ...extra,
  };
}

export async function createLog(
  userId: string,
  data: {
    projectId: string;
    level?: string;
    message: string;
    source?: string;
    metadata?: unknown;
  }
) {
  const project = await getProjectById(data.projectId, userId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const log = await prisma.log.create({
    data: {
      projectId: data.projectId,
      level: data.level ?? "info",
      message: data.message,
      source: data.source,
      metadata: data.metadata as object | undefined,
      status: "pending",
    },
  });

  try {
    await addLogAnalysisJob(log.id);
  } catch (error) {
    console.error("Failed to enqueue log analysis job:", error);
  }

  try {
    await clearLogsCache();
  } catch (error) {
    console.error("Failed to clear logs cache:", error);
  }

  return log;
}

export async function getLogs(
  userId: string,
  page = 1,
  limit = 5,
  search = "",
  severity = "all",
  projectId?: string
) {
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 5;
  const skip = (safePage - 1) * safeLimit;

  const where: Record<string, unknown> = userLogsWhere(userId);

  if (projectId) {
    where.projectId = projectId;
  }

  if (search.trim()) {
    where.message = {
      contains: search.trim(),
      mode: "insensitive",
    };
  }

  if (severity && severity !== "all") {
    where.analysis = {
      is: {
        severity: {
          equals: severity,
          mode: "insensitive",
        },
      },
    };
  }

  const cacheKey = `logs:user:${userId}:page:${safePage}:limit:${safeLimit}:search:${search}:severity:${severity}:project:${projectId || "all"}`;

  try {
    const cachedLogs = await redis.get(cacheKey);

    if (cachedLogs) {
      return JSON.parse(cachedLogs);
    }
  } catch (error) {
    console.error("Redis cache read failed:", error);
  }

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      include: { analysis: true },
    }),
    prisma.log.count({ where }),
  ]);

  const result = {
    data: logs,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };

  try {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);
  } catch (error) {
    console.error("Redis cache write failed:", error);
  }

  return result;
}

export async function getLogById(id: string) {
  return prisma.log.findUnique({
    where: { id },
    include: { analysis: true },
  });
}

export async function getLogByIdForUser(id: string, userId: string) {
  return prisma.log.findFirst({
    where: userLogsWhere(userId, { id }),
    include: { analysis: true },
  });
}

export async function updateLog(
  id: string,
  userId: string,
  data: {
    level?: string;
    message?: string;
    source?: string;
    metadata?: unknown;
  }
) {
  const existing = await getLogByIdForUser(id, userId);

  if (!existing) {
    throw new ApiError(404, "Log not found");
  }

  const log = await prisma.log.update({
    where: { id },
    data: {
      ...data,
      metadata: data.metadata as object | undefined,
    },
    include: { analysis: true },
  });

  try {
    await clearLogsCache();
  } catch (error) {
    console.error("Failed to clear logs cache:", error);
  }

  return log;
}

export async function deleteLog(id: string, userId: string) {
  const existing = await getLogByIdForUser(id, userId);

  if (!existing) {
    throw new ApiError(404, "Log not found");
  }

  const log = await prisma.log.delete({
    where: { id },
  });

  try {
    await clearLogsCache();
  } catch (error) {
    console.error("Failed to clear logs cache:", error);
  }

  return log;
}

export async function reanalyzeLog(id: string, userId: string) {
  const existing = await getLogByIdForUser(id, userId);

  if (!existing) {
    throw new ApiError(404, "Log not found");
  }

  await prisma.log.update({
    where: { id },
    data: {
      status: "pending",
      errorMessage: null,
    },
  });

  try {
    await addLogAnalysisJob(id);
  } catch (error) {
    console.error("Failed to enqueue re-analysis job:", error);
  }

  try {
    await clearLogsCache();
  } catch (error) {
    console.error("Failed to clear logs cache:", error);
  }
}

export async function markLogProcessing(id: string) {
  return prisma.log.update({
    where: { id },
    data: {
      status: "processing",
      errorMessage: null,
    },
  });
}

export async function markLogCompleted(id: string) {
  return prisma.log.update({
    where: { id },
    data: {
      status: "completed",
      processedAt: new Date(),
      errorMessage: null,
    },
  });
}

export async function markLogFailed(id: string, errorMessage: string) {
  return prisma.log.update({
    where: { id },
    data: {
      status: "failed",
      errorMessage,
      processedAt: new Date(),
    },
  });
}

type SaveLogAnalysisInput = {
  logId: string;
  severity: string;
  category: string;
  summary: string;
  possibleCause: string;
  suggestedFix: string;
  confidenceScore: number;
};

export async function saveLogAnalysis(data: SaveLogAnalysisInput) {
  return prisma.logAnalysis.upsert({
    where: { logId: data.logId },
    update: {
      severity: data.severity,
      category: data.category,
      summary: data.summary,
      possibleCause: data.possibleCause,
      suggestedFix: data.suggestedFix,
      confidenceScore: data.confidenceScore,
    },
    create: data,
  });
}