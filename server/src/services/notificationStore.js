import crypto from "node:crypto";
import { isDatabaseConnected } from "../config/db.js";
import Notification from "../models/Notification.js";

const memoryNotifications = new Map();

function userKey(userId) {
  return String(userId);
}

function normalizeNotification(notification) {
  const raw = typeof notification.toObject === "function" ? notification.toObject() : notification;
  return {
    ...raw,
    _id: String(raw._id || raw.id || crypto.randomUUID()),
    user: String(raw.user),
    status: raw.status || "pending",
    createdAt: raw.createdAt || new Date(),
    updatedAt: raw.updatedAt || new Date()
  };
}

export async function createStoredNotification(userId, payload) {
  if (isDatabaseConnected()) {
    return normalizeNotification(await Notification.create({ ...payload, user: userId }));
  }

  const notification = normalizeNotification({ ...payload, user: userId, _id: crypto.randomUUID() });
  const key = userKey(userId);
  memoryNotifications.set(key, [notification, ...(memoryNotifications.get(key) || [])]);
  return notification;
}

export async function createStoredNotifications(userId, notifications = []) {
  if (!notifications.length) return [];

  if (isDatabaseConnected()) {
    const rows = await Notification.insertMany(notifications.map((item) => ({ ...item, user: userId })));
    return rows.map(normalizeNotification);
  }

  const rows = notifications.map((item) => normalizeNotification({ ...item, user: userId, _id: crypto.randomUUID() }));
  const key = userKey(userId);
  memoryNotifications.set(key, [...rows, ...(memoryNotifications.get(key) || [])]);
  return rows;
}

export async function listStoredNotifications(userId) {
  if (isDatabaseConnected()) {
    const notifications = await Notification.find({ user: userId }).sort({ scheduledFor: -1 }).limit(30);
    return notifications.map(normalizeNotification);
  }

  return memoryNotifications.get(userKey(userId)) || [];
}
