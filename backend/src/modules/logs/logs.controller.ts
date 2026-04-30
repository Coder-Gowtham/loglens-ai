import { Request, Response } from "express";
import * as logService from "./logs.service.js";

function normalizeId(id: string | string[]): string {
    return Array.isArray(id) ? id[0] : id;
}

export async function create(req: Request, res: Response) {
    try {
        const log = await logService.createLog(req.body);

        res.status(201).json({
            message: "Log created",
            data: log,
        });
    } catch (error) {
        res.status(400).json({ message: "Failed to create log" });
    }
}

export async function getAll(req: Request, res: Response) {
    try {
        const logs = await logService.getLogs();

        res.status(200).json({
            data: logs,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch logs" });
    }
}

export async function   getById(req: Request, res: Response) {
    try {
        const id = normalizeId(req.params.id);
        const log = await logService.getLogById(id);

        if (!log) {
            return res.status(404).json({ message: "Log not found" });
        }

        res.json({ data: log });
    } catch (error) {
        res.status(500).json({ message: "Error fetching log" });
    }
}

export async function update(req: Request, res: Response) {
    try {
        const id = normalizeId(req.params.id);
        const log = await logService.updateLog(id, req.body);

        res.json({
            message: "Log updated",
            data: log,
        });
    } catch (error){
        res.status(400).json({ message: "Update failed" });
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const id = normalizeId(req.params.id);
        await logService.deleteLog(id);

        res.json({ message: "Log deleted" });
    } catch (error) {
        res.status(400).json({ message: "Delete failed" });
    }
}