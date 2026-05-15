import { createStoredNotifications } from "./notificationStore.js";
import { getActiveStoredTimetable } from "./plannerStore.js";

export async function scheduleSessionReminders(userId, sessions) {
  const browserReminders = sessions
    .filter((session) => session.type !== "break")
    .map((session) => {
      const sessionDate = new Date(session.date);
      const [hour, minute] = session.startTime.split(":").map(Number);
      sessionDate.setHours(hour, minute, 0, 0);
      const scheduledFor = new Date(sessionDate.getTime() - 15 * 60 * 1000);
      return {
        user: userId,
        title: `Upcoming ${session.subject} session`,
        message: `${session.topic} starts at ${session.startTime}.`,
        channel: "browser",
        scheduledFor,
        metadata: { session }
      };
    });

  const emailReminders = sessions
    .filter((session) => session.type !== "break")
    .map((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(7, 0, 0, 0);
      return {
        user: userId,
        title: `Today's study plan: ${session.subject}`,
        message: `${session.subject}: ${session.topic} at ${session.startTime}.`,
        channel: "email",
        scheduledFor: sessionDate,
        metadata: { session, kind: "daily-timetable" }
      };
    });

  const reminders = [...browserReminders, ...emailReminders];

  if (reminders.length) {
    await createStoredNotifications(userId, reminders);
  }
}

export async function scheduleExamCountdownReminders(userId, subjects = []) {
  const reminders = subjects.flatMap((subject) => {
    const examDate = new Date(subject.examDate);
    const windows = [
      { days: 7, label: "7-day exam countdown" },
      { days: 3, label: "3-day revision alert" },
      { days: 1, label: "Tomorrow's exam reminder" }
    ];

    return windows.map((window) => {
      const scheduledFor = new Date(examDate);
      scheduledFor.setDate(scheduledFor.getDate() - window.days);
      scheduledFor.setHours(8, 0, 0, 0);
      return {
        user: userId,
        title: `${window.label}: ${subject.name}`,
        message: `${subject.name} exam is on ${examDate.toDateString()}. Review your revision plan and practice errors.`,
        channel: "email",
        scheduledFor,
        metadata: { subject, kind: "exam-countdown", daysBeforeExam: window.days }
      };
    });
  }).filter((reminder) => reminder.scheduledFor > new Date());

  if (reminders.length) {
    await createStoredNotifications(userId, reminders);
  }
}

export async function findIncompleteTaskReminders(userId) {
  const timetable = await getActiveStoredTimetable(userId);
  if (!timetable) return [];
  return timetable.weeklySchedule.filter((task) => !task.completed && new Date(task.date) < new Date());
}
