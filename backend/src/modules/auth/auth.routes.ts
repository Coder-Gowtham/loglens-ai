import { Router } from "express";
import { login, register } from "./auth.controller.js";
import { authRateLimit } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register",authRateLimit, register);
router.post("/login", authRateLimit, login);

export default router;