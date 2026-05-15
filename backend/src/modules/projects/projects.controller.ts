import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as projectService from "./projects.service.js";

export async function create(req: AuthRequest, res: Response) {
    const userId = req.userId;
    const { name } = req.body;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    if (!name) {
        return res.status(400).json({
            message: "Project name is required",
        });
    }

    const project = await projectService.createProject({
        name,
        userId,
    });

    res.status(201).json(project);
}

export async function getAll(req: AuthRequest, res: Response) {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const projects = await projectService.getProjects(userId);

    res.json(projects);
}

export async function getById(req: AuthRequest, res: Response) {
    const userId = req.userId;
    const id = req.params.id as string;
    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const project = await projectService.getProjectById(id, userId);

    if (!project) {
        return res.status(404).json({
            message: "Project not found",
        });
    }

    res.json(project);
}