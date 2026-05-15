import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { create, getAll, getById } from "./projects.controller.js";

const router = Router();

router.post("/", authMiddleware, asyncHandler(create));
router.get("/", authMiddleware, asyncHandler(getAll));
router.get("/:id", authMiddleware, asyncHandler(getById));

export default router;