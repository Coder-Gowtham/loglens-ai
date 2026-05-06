import { Request, Response } from "express";
import * as logService from "./logs.service.js";
import {
    createLogSchema,
    logIdParamSchema,
    updateLogSchema,
} from "./logs.validation.js";
import { formatZodError } from "../../utils/formatZodError.js";

export async function create(req: Request, res: Response) {
    const validation = createLogSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: formatZodError(validation.error),
        });
    }

    const log = await logService.createLog(validation.data);

    return res.status(201).json({
        message: "Log created",
        data: log,
    });
}

export async function getAll(_req: Request, res: Response) {
    const logs = await logService.getLogs();

    return res.status(200).json({
        data: logs,
    });
}

export async function getById(req: Request, res: Response) {
    const validation = logIdParamSchema.safeParse(req.params);

    if (!validation.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: formatZodError(validation.error),
        });
    }

    const { id } = validation.data;

    const log = await logService.getLogById(id);

    if (!log) {
        return res.status(404).json({
            message: "Log not found",
        });
    }

    return res.status(200).json({
        data: log,
    });
}

export async function update(req: Request, res: Response) {
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

    const { id } = idValidation.data;

    const existingLog = await logService.getLogById(id);

    if (!existingLog) {
        return res.status(404).json({
            message: "Log not found",
        });
    }

    const log = await logService.updateLog(id, bodyValidation.data);

    return res.status(200).json({
        message: "Log updated",
        data: log,
    });
}

export async function remove(req: Request, res: Response) {
    const validation = logIdParamSchema.safeParse(req.params);

    if (!validation.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: formatZodError(validation.error),
        });
    }

    const { id } = validation.data;

    const existingLog = await logService.getLogById(id);

    if (!existingLog) {
        return res.status(404).json({
            message: "Log not found",
        });
    }

    await logService.deleteLog(id);

    return res.status(200).json({
        message: "Log deleted successfully",
    });
}