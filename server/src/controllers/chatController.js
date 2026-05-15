import { askStudyAssistant } from "../services/openaiService.js";

export async function chat(req, res) {
  const answer = await askStudyAssistant(req.body.message, {
    user: req.user.email,
    profile: {
      preferredStudyTime: req.user.preferredStudyTime,
      dailyStudyHours: req.user.dailyStudyHours
    }
  });
  res.json({ answer });
}
