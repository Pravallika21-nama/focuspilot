import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";

const memoryUsers = new Map();

export function normalizeUser(user) {
  if (!user) return null;
  const raw = typeof user.toObject === "function" ? user.toObject() : user;
  return {
    id: String(raw._id || raw.id),
    _id: raw._id || raw.id,
    name: raw.name,
    email: raw.email,
    avatar: raw.avatar,
    provider: raw.provider || "local",
    preferredStudyTime: raw.preferredStudyTime || "18:00",
    dailyStudyHours: raw.dailyStudyHours || 3,
    notificationPreferences: raw.notificationPreferences || {
      browser: true,
      email: true,
      whatsapp: false
    },
    streak: raw.streak || 0,
    lastActiveDate: raw.lastActiveDate
  };
}

export async function findUserByEmail(email, { includePassword = false } = {}) {
  const normalizedEmail = String(email || "").toLowerCase().trim();

  if (isDatabaseConnected()) {
    const query = User.findOne({ email: normalizedEmail });
    if (includePassword) query.select("+password");
    return query;
  }

  const user = memoryUsers.get(normalizedEmail);
  if (!user) return null;
  if (includePassword) return user;
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function findUserById(id) {
  if (isDatabaseConnected()) {
    return User.findById(id).select("-password");
  }

  for (const user of memoryUsers.values()) {
    if (String(user.id) === String(id)) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
  }

  return null;
}

export async function createUser(payload) {
  const email = String(payload.email || "").toLowerCase().trim();

  if (isDatabaseConnected()) {
    return User.create({ ...payload, email });
  }

  if (memoryUsers.has(email)) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const user = {
    id: crypto.randomUUID(),
    _id: crypto.randomUUID(),
    name: payload.name,
    email,
    password: payload.password ? await bcrypt.hash(payload.password, 12) : undefined,
    avatar: payload.avatar,
    provider: payload.provider || "local",
    preferredStudyTime: payload.preferredStudyTime || "18:00",
    dailyStudyHours: payload.dailyStudyHours || 3,
    notificationPreferences: {
      browser: true,
      email: true,
      whatsapp: false,
      ...payload.notificationPreferences
    },
    streak: payload.streak || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  user._id = user.id;
  memoryUsers.set(email, user);
  return user;
}

export async function updateUser(user, patch) {
  if (isDatabaseConnected() && typeof user.save === "function") {
    Object.assign(user, patch);
    await user.save();
    return user;
  }

  if (isDatabaseConnected()) {
    return User.findByIdAndUpdate(user.id || user._id, patch, { new: true }).select("-password");
  }

  const existing = memoryUsers.get(String(user.email).toLowerCase());
  if (!existing) return null;
  Object.assign(existing, patch, { updatedAt: new Date() });
  memoryUsers.set(existing.email, existing);
  const { password, ...safeUser } = existing;
  return safeUser;
}

export async function verifyUserPassword(user, password) {
  if (!user) return false;

  if (typeof user.comparePassword === "function") {
    return user.comparePassword(password);
  }

  if (!user.password) return false;
  return bcrypt.compare(password, user.password);
}
