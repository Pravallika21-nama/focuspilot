import dotenv from "dotenv";
import { connectDatabase } from "../config/db.js";
import Notification from "../models/Notification.js";
import StudyProgress from "../models/StudyProgress.js";
import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import { generateStudyPlan } from "../services/openaiService.js";

dotenv.config();

await connectDatabase();
await Promise.all([
  User.deleteMany({ email: "demo@student.com" }),
  Subject.deleteMany({}),
  Timetable.deleteMany({}),
  Notification.deleteMany({}),
  StudyProgress.deleteMany({})
]);

const user = await User.create({
  name: "Aarav Demo",
  email: "demo@student.com",
  password: "Demo@12345",
  preferredStudyTime: "18:00",
  dailyStudyHours: 4,
  streak: 6
});

const subjects = [
  { name: "Mathematics", examDate: daysFromNow(8), difficulty: 5, priority: 5, isWeak: true },
  { name: "Physics", examDate: daysFromNow(12), difficulty: 4, priority: 4, isWeak: true },
  { name: "Chemistry", examDate: daysFromNow(16), difficulty: 3, priority: 3, isWeak: false },
  { name: "English", examDate: daysFromNow(20), difficulty: 2, priority: 2, isWeak: false }
];

await Subject.insertMany(subjects.map((subject) => ({ ...subject, user: user._id })));

const plan = await generateStudyPlan({
  subjects,
  dailyStudyHours: 4,
  weakSubjects: ["Mathematics", "Physics"],
  preferredStudyTime: "18:00",
  breakPreferences: "10-minute break after every 50 minutes",
  difficultyLevel: "mixed"
});

await Timetable.create({ user: user._id, inputs: { subjects, dailyStudyHours: 4 }, ...plan });

await StudyProgress.insertMany([
  { user: user._id, date: startOfDay(daysFromNow(-5)), subject: "Mathematics", plannedMinutes: 100, completedMinutes: 90, tasksCompleted: 2, tasksPlanned: 2, focusScore: 84 },
  { user: user._id, date: startOfDay(daysFromNow(-4)), subject: "Physics", plannedMinutes: 100, completedMinutes: 80, tasksCompleted: 1, tasksPlanned: 2, focusScore: 76 },
  { user: user._id, date: startOfDay(daysFromNow(-3)), subject: "Chemistry", plannedMinutes: 50, completedMinutes: 50, tasksCompleted: 1, tasksPlanned: 1, focusScore: 88 },
  { user: user._id, date: startOfDay(daysFromNow(-1)), subject: "Mathematics", plannedMinutes: 120, completedMinutes: 110, tasksCompleted: 2, tasksPlanned: 3, focusScore: 82 }
]);

await Notification.create({
  user: user._id,
  title: "Mathematics revision starts soon",
  message: "Your algebra practice block begins in 15 minutes.",
  channel: "browser",
  scheduledFor: daysFromNow(1)
});

console.log("Seed complete: demo@student.com / Demo@12345");
process.exit(0);

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}
