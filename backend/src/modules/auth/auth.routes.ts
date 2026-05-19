import { Router } from "express";
import { login, register, me } from "./auth.controller.js";
import { authRateLimit } from "../../middlewares/rateLimit.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

router.post("/register", authRateLimit, asyncHandler(register));
router.post("/login", authRateLimit, asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(me));

export default router;
