import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import logsRoutes from "./modules/logs/logs.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/health", healthRoutes);

app.use("/auth", authRoutes);
app.use("/logs", logsRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;