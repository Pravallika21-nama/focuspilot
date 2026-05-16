import { findUserById, updateUser } from "../services/userStore.js";
import { isDatabaseConnected } from "../config/db.js";
import User from "../models/User.js";

/** GET /api/reminders/preferences */
export async function getReminderPrefs(req, res) {
  const user = await findUserById(req.user.id || req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const prefs = user.notificationPreferences || {};
  res.json({
    emailEnabled: prefs.emailEnabled ?? true,
    reminderTime: prefs.reminderTime || "07:00",
    studyDays: prefs.studyDays || [1, 2, 3, 4, 5],
    browserEnabled: prefs.browser ?? true,
  });
}

/** PUT /api/reminders/preferences */
export async function updateReminderPrefs(req, res) {
  const { emailEnabled, reminderTime, studyDays } = req.body;

  if (isDatabaseConnected()) {
    // MongoDB: use $set with dot-notation for nested fields
    await User.findByIdAndUpdate(
      req.user.id || req.user._id,
      {
        $set: {
          "notificationPreferences.emailEnabled": Boolean(emailEnabled),
          "notificationPreferences.email": Boolean(emailEnabled),
          ...(reminderTime && { "notificationPreferences.reminderTime": reminderTime }),
          ...(Array.isArray(studyDays) && { "notificationPreferences.studyDays": studyDays }),
        },
      },
      { new: true }
    );
  } else {
    // In-memory store: update the nested object directly
    const user = await findUserById(req.user.id || req.user._id);
    if (user) {
      await updateUser(user, {
        notificationPreferences: {
          ...((user.notificationPreferences) || {}),
          emailEnabled: Boolean(emailEnabled),
          email: Boolean(emailEnabled),
          ...(reminderTime && { reminderTime }),
          ...(Array.isArray(studyDays) && { studyDays }),
        },
      });
    }
  }

  res.json({
    message: "Preferences saved",
    emailEnabled: Boolean(emailEnabled),
    reminderTime: reminderTime || "07:00",
    studyDays: studyDays || [1, 2, 3, 4, 5],
  });
}
