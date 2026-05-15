import crypto from "node:crypto";
import { isDatabaseConnected } from "../config/db.js";
import StudyProgress from "../models/StudyProgress.js";
import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";

const memoryTimetables = new Map();
const memoryProgress = new Map();

function userKey(userId) {
  return String(userId);
}

function normalizeSession(session) {
  return {
    _id: String(session._id || crypto.randomUUID()),
    subject: session.subject,
    topic: session.topic,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    type: session.type || "study",
    priority: session.priority || "medium",
    completed: Boolean(session.completed),
    notes: session.notes || ""
  };
}

function normalizeTimetable(timetable) {
  if (!timetable) return null;
  const raw = typeof timetable.toObject === "function" ? timetable.toObject() : timetable;
  return {
    ...raw,
    _id: String(raw._id || raw.id || crypto.randomUUID()),
    user: String(raw.user),
    dailySchedule: (raw.dailySchedule || []).map(normalizeSession),
    weeklySchedule: (raw.weeklySchedule || []).map(normalizeSession),
    createdAt: raw.createdAt || new Date(),
    updatedAt: raw.updatedAt || new Date()
  };
}

export async function createStoredTimetable(userId, inputs, plan) {
  if (isDatabaseConnected()) {
    const timetable = await Timetable.create({
      user: userId,
      inputs,
      dailySchedule: plan.dailySchedule,
      weeklySchedule: plan.weeklySchedule,
      subjectRoadmap: plan.subjectRoadmap,
      revisionPlan: plan.revisionPlan,
      suggestions: plan.suggestions,
      productivityScore: plan.productivityScore
    });

    if (Array.isArray(inputs.subjects)) {
      await Subject.deleteMany({ user: userId });
      await Subject.insertMany(inputs.subjects.map((subject) => ({ ...subject, user: userId })));
    }

    return normalizeTimetable(timetable);
  }

  const timetable = normalizeTimetable({
    _id: crypto.randomUUID(),
    user: userId,
    title: "FocusPilot BTech Roadmap",
    inputs,
    dailySchedule: plan.dailySchedule,
    weeklySchedule: plan.weeklySchedule,
    subjectRoadmap: plan.subjectRoadmap,
    revisionPlan: plan.revisionPlan,
    suggestions: plan.suggestions,
    productivityScore: plan.productivityScore,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const key = userKey(userId);
  memoryTimetables.set(key, [timetable, ...(memoryTimetables.get(key) || [])]);
  return timetable;
}

export async function listStoredTimetables(userId) {
  if (isDatabaseConnected()) {
    const timetables = await Timetable.find({ user: userId }).sort({ createdAt: -1 }).limit(5);
    return timetables.map(normalizeTimetable);
  }

  return memoryTimetables.get(userKey(userId)) || [];
}

export async function getActiveStoredTimetable(userId) {
  if (isDatabaseConnected()) {
    const timetable = await Timetable.findOne({ user: userId }).sort({ createdAt: -1 });
    return normalizeTimetable(timetable);
  }

  return (memoryTimetables.get(userKey(userId)) || [])[0] || null;
}

export async function updateStoredTask(userId, taskId, patch) {
  if (isDatabaseConnected()) {
    const timetable = await Timetable.findOne({ user: userId, "weeklySchedule._id": taskId });
    if (!timetable) return null;

    const task = timetable.weeklySchedule.id(taskId);
    Object.assign(task, patch);
    await timetable.save();

    if (patch.completed === true) {
      await StudyProgress.findOneAndUpdate(
        { user: userId, date: startOfDay(task.date), subject: task.subject },
        {
          $inc: { completedMinutes: 50, tasksCompleted: 1 },
          $setOnInsert: { plannedMinutes: 50, tasksPlanned: 1, focusScore: 82 }
        },
        { upsert: true, new: true }
      );
    }

    return normalizeSession(task);
  }

  const timetable = await getActiveStoredTimetable(userId);
  if (!timetable) return null;
  const task = timetable.weeklySchedule.find((session) => String(session._id) === String(taskId));
  if (!task) return null;
  const wasCompleted = task.completed;
  Object.assign(task, patch);
  timetable.dailySchedule = timetable.weeklySchedule.slice(0, Math.max(1, timetable.dailySchedule.length));
  timetable.updatedAt = new Date();

  if (patch.completed === true && !wasCompleted) {
    addMemoryProgress(userId, task);
  }

  return task;
}

export async function addStoredTask(userId, task) {
  const normalized = normalizeSession(task);

  if (isDatabaseConnected()) {
    const timetable = await Timetable.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!timetable) return null;
    timetable.weeklySchedule.push(normalized);
    await timetable.save();
    return normalizeSession(timetable.weeklySchedule[timetable.weeklySchedule.length - 1]);
  }

  const timetable = await getActiveStoredTimetable(userId);
  if (!timetable) return null;
  timetable.weeklySchedule.push(normalized);
  timetable.updatedAt = new Date();
  return normalized;
}

export async function deleteStoredTask(userId, taskId) {
  if (isDatabaseConnected()) {
    const timetable = await Timetable.findOne({ user: userId, "weeklySchedule._id": taskId });
    if (!timetable) return false;
    timetable.weeklySchedule.pull(taskId);
    await timetable.save();
    return true;
  }

  const timetable = await getActiveStoredTimetable(userId);
  if (!timetable) return false;
  const before = timetable.weeklySchedule.length;
  timetable.weeklySchedule = timetable.weeklySchedule.filter((task) => String(task._id) !== String(taskId));
  timetable.updatedAt = new Date();
  return timetable.weeklySchedule.length !== before;
}

export async function getStoredAnalytics(userId) {
  const timetable = await getActiveStoredTimetable(userId);

  if (isDatabaseConnected()) {
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const rows = await StudyProgress.find({ user: userId, date: { $gte: since } }).sort({ date: 1 });
    const subjects = await Subject.find({ user: userId });
    return buildAnalytics(timetable, rows, subjects);
  }

  return buildAnalytics(timetable, memoryProgress.get(userKey(userId)) || [], timetable?.inputs?.subjects || []);
}

function buildAnalytics(timetable, rows = [], subjects = []) {
  const tasks = timetable?.weeklySchedule || [];
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const weeklyMinutes = rows.reduce((sum, row) => sum + Number(row.completedMinutes || 0), completedTasks * 50);
  const tasksCompleted = rows.reduce((sum, row) => sum + Number(row.tasksCompleted || 0), completedTasks);
  const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    summary: {
      weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
      tasksCompleted,
      totalTasks,
      completionPercent,
      remainingTasks: Math.max(0, totalTasks - completedTasks),
      consistency: totalTasks ? Math.min(100, completionPercent) : 0,
      averageFocus: rows.length ? Math.round(rows.reduce((sum, row) => sum + Number(row.focusScore || 0), 0) / rows.length) : 0
    },
    daily: rows,
    subjects: subjects.map((subject) => ({
      ...subject,
      progress: subjectProgress(tasks, subject.name)
    })),
    timetable
  };
}

function subjectProgress(tasks, subjectName) {
  const subjectTasks = tasks.filter((task) => task.subject === subjectName);
  if (!subjectTasks.length) return 0;
  return Math.round((subjectTasks.filter((task) => task.completed).length / subjectTasks.length) * 100);
}

function addMemoryProgress(userId, task) {
  const key = userKey(userId);
  const rows = memoryProgress.get(key) || [];
  rows.push({
    _id: crypto.randomUUID(),
    user: userId,
    date: startOfDay(task.date),
    subject: task.subject,
    plannedMinutes: 50,
    completedMinutes: 50,
    tasksCompleted: 1,
    tasksPlanned: 1,
    focusScore: 82
  });
  memoryProgress.set(key, rows);
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}
