import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import logsRoutes from "./modules/logs/logs.routes.js";
import projectRoutes from "./modules/projects/projects.routes.js";
import ingestRoutes from "./modules/ingest/ingest.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { globalRateLimit } from "./middlewares/rateLimit.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(globalRateLimit);

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/logs", logsRoutes);
app.use("/projects", projectRoutes);
app.use("/ingest", ingestRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use(errorMiddleware);

export default app;
