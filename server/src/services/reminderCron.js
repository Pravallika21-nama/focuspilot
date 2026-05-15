import cron from "node-cron";
import { isDatabaseConnected } from "../config/db.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmailReminder } from "./emailService.js";

export function startReminderCron() {
  cron.schedule("*/5 * * * *", async () => {
    if (!isDatabaseConnected()) return;

    const due = await Notification.find({
      status: "pending",
      scheduledFor: { $lte: new Date() },
      channel: { $in: ["email", "browser"] }
    }).limit(50);

    for (const reminder of due) {
      try {
        if (reminder.channel === "email") {
          const user = await User.findById(reminder.user);
          if (user?.email) {
            await sendEmailReminder({
              to: user.email,
              subject: reminder.title,
              html: `<p>${reminder.message}</p>`
            });
          }
        }
        reminder.status = "sent";
        reminder.sentAt = new Date();
      } catch (error) {
        reminder.status = "failed";
        reminder.metadata = { ...reminder.metadata, error: error.message };
      }
      await reminder.save();
    }
  });
}
