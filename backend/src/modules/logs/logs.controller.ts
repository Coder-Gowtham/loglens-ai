import { Request, Response } from "express";
import * as logService from "./logs.service.js";
import { createLogSchema, logIdParamSchema, updateLogSchema } from "./logs.validation.js";

function normalizeId(id: string | string[]): string {
    return Array.isArray(id) ? id[0] : id;
}

export async function create(req: Request, res: Response) {
    try {
        const validation = createLogSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.issues.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        const log = await logService.createLog(validation.data);

        res.status(201).json({
            message: "Log created",
            data: log,
        });
    } catch (error) {
        console.error("Create log error:", error);

        res.status(500).json({
            message: "Failed to create log",
        });
    }
}

export async function getAll(req: Request, res: Response) {
    try {
        const logs = await logService.getLogs();

        res.status(200).json({
            data: logs,
        });
    } catch (error) {
        console.error("Get logs error:", error);

        res.status(500).json({
            message: "Failed to fetch logs",
        });
    }
}

export async function getById(req: Request, res: Response) {
    try {
        const validation = logIdParamSchema.safeParse(req.params)

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.issues.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        const id = normalizeId(req.params.id);
        const log = await logService.getLogById(id);

        if (!log) {
            return res.status(404).json({ message: "Log not found" });
        }

        res.status(200).json({ data: log });
    } catch (error) {
        console.error("Get log by ID error:", error);

        res.status(500).json({
            message: "Error fetching log",
        });
    }
}

export async function update(req: Request, res: Response) {
    try {

        const idValidation = logIdParamSchema.safeParse(req.params);
        const bodyValidation = updateLogSchema.safeParse(req.body);

        if (!idValidation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: idValidation.error.issues.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        if (!bodyValidation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: bodyValidation.error.issues.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        const id = idValidation.data.id;
        const log = await logService.updateLog(id, bodyValidation.data);

        res.status(200).json({
            message: "Log updated",
            data: log,
        });
    } catch (error) {
        console.error("Update log error:", error);

        res.status(500).json({
            message: "Failed to update log",
        });
    }
}

export async function remove(req: Request, res: Response) {
    try {

        const validation = logIdParamSchema.safeParse(req.params);

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.issues.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        const id = validation.data.id;
        await logService.deleteLog(id);

        res.status(204).send();
    } catch (error) {
        console.error("Delete log error:", error);

        res.status(500).json({
            message: "Failed to delete log",
        });
    }
}