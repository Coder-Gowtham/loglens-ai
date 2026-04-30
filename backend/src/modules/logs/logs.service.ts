import prisma from "../../config/db.js";

export async function createLog(data: any) {
    return await prisma.log.create({
        data,
    });
}

export async function getLogs() {
    return await prisma.log.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function getLogById(id: string) {
    return await prisma.log.findUnique({
        where: { id },
    });
}

export async function updateLog(id: string, data: any) {
    return await prisma.log.update({
        where: { id },
        data,
    });
}

export async function deleteLog(id: string) {
    return await prisma.log.delete({
        where: { id },
    });
}