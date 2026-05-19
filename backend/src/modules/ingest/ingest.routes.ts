import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ingestLog } from "./ingest.controller.js";

const router = Router();

router.post("/logs", asyncHandler(ingestLog));

export default router;
