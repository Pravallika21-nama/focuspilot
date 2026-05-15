import { getStoredAnalytics } from "../services/plannerStore.js";

export async function getAnalytics(req, res) {
  const analytics = await getStoredAnalytics(req.user.id || req.user._id);
  res.json(analytics);
}
