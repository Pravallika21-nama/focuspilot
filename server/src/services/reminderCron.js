import { findUserByEmail } from "./userStore.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import { sendDailyReminderEmail } from "./emailService.js";
import cron from "node-cron";
import Notification from "../models/Notification.js";
import { sendEmailReminder } from "./emailService.js";

export function startReminderCron() {
  // ── Every 5 min: send pending notification reminders ──────────────────
  cron.schedule("*/5 * * * *", async () => {
    if (!isDatabaseConnected()) return;

    const due = await Notification.find({
      status: "pending",
      scheduledFor: { $lte: new Date() },
      channel: { $in: ["email", "browser"] },
    }).limit(50);

    for (const reminder of due) {
      try {
        if (reminder.channel === "email") {
          const user = await User.findById(reminder.user);
          if (user?.email) {
            await sendEmailReminder({
              to: user.email,
              subject: reminder.title,
              html: `<p style="font-family:Arial,sans-serif;color:#e2e8f0">${reminder.message}</p>`,
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

  // ── 7 AM daily: send daily study digest to all opted-in users ─────────
  cron.schedule("0 7 * * *", async () => {
    if (!isDatabaseConnected()) {
      console.log("⏰  Daily digest skipped: no DB connection");
      return;
    }

    console.log("⏰  Running 7 AM daily study digest...");

    const users = await User.find({
      "notificationPreferences.email": true,
      "notificationPreferences.emailEnabled": { $ne: false },
    }).select("email name notificationPreferences");

    const today = new Date();
    const todayStr = today.toDateString();

    for (const user of users) {
      try {
        // Check if today is a study day for this user
        const studyDays = user.notificationPreferences?.studyDays;
        if (studyDays && studyDays.length && !studyDays.includes(today.getDay())) {
          continue; // Not a study day for this user
        }

        // Fetch today's tasks from their active timetable
        const timetable = await Timetable.findOne({
          user: user._id,
          isActive: true,
        }).select("weeklySchedule");

        const todayTasks = (timetable?.weeklySchedule || []).filter((t) => {
          const taskDate = new Date(t.date);
          return taskDate.toDateString() === todayStr && !t.completed;
        });

        await sendDailyReminderEmail({
          to: user.email,
          name: user.name?.split(" ")[0] || "Student",
          tasks: todayTasks.slice(0, 5),
        });

        console.log(`📧  Daily digest sent to ${user.email}`);
      } catch (err) {
        console.error(`📧  Daily digest failed for ${user.email}:`, err.message);
      }
    }
  });
}
