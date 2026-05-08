import prisma from "../../config/db.js";
import redis from "../../config/redis.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { addLogAnalysisJob } from "../queue/logAnalysis.queue.js";


export async function createLog(data: any) {
    const log = await prisma.log.create({
        data: {
            ...data,
            status: "pending",
        },
    });

    await addLogAnalysisJob(log.id); //Log created, processing queued

    await redis.del(cacheKeys.logsAll);

    return log;
}
export async function getLogs() {
    const cachedLogs = await redis.get(cacheKeys.logsAll);

    if (cachedLogs) {
        console.log("Cache hit: logs");
        return JSON.parse(cachedLogs);
    }

    console.log("Cache miss: logs");

    const logs = await prisma.log.findMany({
        orderBy: { createdAt: "desc" },
    });

    await redis.set(cacheKeys.logsAll, JSON.stringify(logs), "EX", 60);
    /*
    await redis.set(
                "logs:all",
                "[JSON DATA]",
                "EX",
                60
                    ); 
        Store logs in Redis under key "logs:all" for 60 seconds*/

    return logs;
}

export async function getLogById(id: string) {
    return await prisma.log.findUnique({
        where: { id },
    });
}

export async function updateLog(id: string, data: any) {
    const log = await prisma.log.update({
        where: { id },
        data,
    });

    await redis.del(cacheKeys.logsAll);

    return log;
}

export async function deleteLog(id: string) {
    const log = await prisma.log.delete({
        where: { id },
    });

    await redis.del(cacheKeys.logsAll);

    return log;
}