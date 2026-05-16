import crypto from "node:crypto";
import { isDatabaseConnected } from "../config/db.js";
import LoginRecord from "../models/LoginRecord.js";

const memoryLoginRecords = [];

export async function recordLoginEvent({ userId, email, provider = "local", action, success = true }) {
  const record = {
    user: userId,
    email: String(email || "").toLowerCase().trim(),
    provider,
    action,
    success,
    loggedAt: new Date()
  };

  if (isDatabaseConnected()) {
    return LoginRecord.create(record);
  }

  const memoryRecord = { _id: crypto.randomUUID(), ...record };
  memoryLoginRecords.unshift(memoryRecord);
  return memoryRecord;
}

export async function listLoginEvents(userId) {
  if (isDatabaseConnected()) {
    return LoginRecord.find({ user: userId }).sort({ loggedAt: -1 }).limit(50);
  }

  return memoryLoginRecords.filter((record) => String(record.user) === String(userId)).slice(0, 50);
}
