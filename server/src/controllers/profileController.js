import { normalizeUser, updateUser } from "../services/userStore.js";

export async function getProfile(req, res) {
  res.json({ user: normalizeUser(req.user) });
}

export async function updateProfile(req, res) {
  const allowed = ["name", "preferredStudyTime", "dailyStudyHours", "notificationPreferences", "avatar"];
  const patch = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }
  const user = await updateUser(req.user, patch);
  res.json({ user: normalizeUser(user || { ...req.user, ...patch }) });
}
