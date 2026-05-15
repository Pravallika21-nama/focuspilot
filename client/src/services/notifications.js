export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

export function notifyBeforeSessions(sessions = []) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  sessions.forEach((session) => {
    const date = new Date(session.date);
    const [hour, minute] = session.startTime.split(":").map(Number);
    date.setHours(hour, minute, 0, 0);
    const delay = date.getTime() - Date.now() - 15 * 60 * 1000;
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      window.setTimeout(() => {
        new Notification(`Study soon: ${session.subject}`, {
          body: `${session.topic} starts at ${session.startTime}.`
        });
      }, delay);
    }
  });
}
