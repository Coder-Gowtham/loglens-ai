import prisma from "../../config/db.js";
import {redis} from "../../config/redis.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { addLogAnalysisJob } from "../queue/logAnalysis.queue.js";

async function clearLogsCache() {
    const keys = await redis.keys("logs:*");

    if (keys.length > 0) {
        await redis.del(...keys);
    }
}

export async function createLog(data: any) {
    const log = await prisma.log.create({
        data: {
            ...data,
            status: "pending",
        },
    });

    await addLogAnalysisJob(log.id); //Log created, processing queued

    await clearLogsCache();

    return log;
}

export async function getLogs(
    page = 1,
    limit = 5,
    search = "",
    severity = "all"
) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
        where.message = {
            contains: search,
            mode: "insensitive",
        };
    }

    if (severity !== "all") {
        where.analysis = {
            is: {
                severity: {
                    equals: severity,
                    mode: "insensitive",
                },
            },
        };
    }

    const cacheKey = `logs:page:${page}:limit:${limit}:search:${search}:severity:${severity}`;

    const cachedLogs = await redis.get(cacheKey);

    if (cachedLogs) {
        console.log("Cache hit: filtered paginated logs");
        return JSON.parse(cachedLogs);
    }

    console.log("Cache miss: filtered paginated logs");

    const [logs, total] = await Promise.all([
        prisma.log.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                analysis: true,
            },
        }),

        prisma.log.count({
            where,
        }),
    ]);

    const result = {
        data: logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);

    return result;
}

export async function getLogById(id: string) {
    return await prisma.log.findUnique({
        where: { id },
        include: {
            analysis: true,
        },
    });
}

export async function updateLog(id: string, data: any) {
    const log = await prisma.log.update({
        where: { id },
        data,
    });

    await clearLogsCache();

    return log;
}

export async function deleteLog(id: string) {
    const log = await prisma.log.delete({
        where: { id },
    });

    await clearLogsCache();

    return log;
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
        where: {
            logId: data.logId,
        },
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