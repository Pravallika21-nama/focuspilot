import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "FocusPilot" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
