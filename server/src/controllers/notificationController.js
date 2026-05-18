import { sendEmailReminder } from "../services/emailService.js";
import { createStoredNotification, listStoredNotifications } from "../services/notificationStore.js";

export async function listNotifications(req, res) {
  const notifications = await listStoredNotifications(req.user.id || req.user._id);
  res.json({ notifications });
}

export async function createNotification(req, res) {
  const notification = await createStoredNotification(req.user.id || req.user._id, req.body);
  res.status(201).json({ notification });
}

export async function sendTestEmail(req, res) {
  try {
    const result = await sendEmailReminder({
      to: req.user.email,
      subject: "Your FocusPilot reminder is ready",
      html: "<p>This is a test reminder from FocusPilot.</p>"
    });
    res.json({ result });
  } catch (error) {
    console.error("Email failed:", error.message);
    res.status(500).json({ message: "Failed to send email. Check SMTP credentials.", error: error.message });
  }
}
