import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { startReminderCron } from "./services/reminderCron.js";

dotenv.config();

// Unhandled error handlers
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

async function startServer() {
  await connectDatabase();
  startReminderCron();

  const port = process.env.PORT || 5000;
  
  const server = app.listen(port, () => {
    console.log(`FocusPilot API running on port ${port}`);
  }).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${port} is in use, trying port ${Number(port) + 1}...`);
      app.listen(Number(port) + 1, () => {
        console.log(`FocusPilot API running on port ${Number(port) + 1}`);
      });
    } else {
      console.error(err);
    }
  });
}

startServer();
