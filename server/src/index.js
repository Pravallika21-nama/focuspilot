import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { startReminderCron } from "./services/reminderCron.js";

dotenv.config();

const port = process.env.PORT || 5000;

await connectDatabase();
startReminderCron();

app.listen(port, () => {
  console.log(`FocusPilot API running on port ${port}`);
});
