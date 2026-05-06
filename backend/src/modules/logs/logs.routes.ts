import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "./logs.controller.js";

const router = Router();

router.post("/", authMiddleware, asyncHandler(create));
router.get("/", authMiddleware, asyncHandler(getAll));
router.get("/:id", authMiddleware, asyncHandler(getById));
router.patch("/:id", authMiddleware, asyncHandler(update));
router.delete("/:id", authMiddleware, asyncHandler(remove));

export default router;