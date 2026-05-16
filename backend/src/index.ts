import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import { fail } from "./utils/responses";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.FRONTEND_URL?.split(",") || true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.use((_req, res) => fail(res, "Route not found", 404));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  return fail(res, "Internal server error", 500);
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
