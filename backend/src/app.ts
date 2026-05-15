import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import logsRoutes from "./modules/logs/logs.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { globalRateLimit } from "./middlewares/rateLimit.middleware.js";
import projectRoutes from "./modules/projects/projects.routes.js";


const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://loglens-ai-frontend-production.up.railway.app",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(globalRateLimit);

app.use("/health", healthRoutes);

app.use("/auth", authRoutes);
app.use("/logs", logsRoutes);
app.use("/projects", projectRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use(errorMiddleware);


export default app;