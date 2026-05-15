import { generateStudyPlan } from "../services/openaiService.js";
import { createStoredTimetable, getActiveStoredTimetable, listStoredTimetables } from "../services/plannerStore.js";
import { scheduleExamCountdownReminders, scheduleSessionReminders } from "../services/reminderService.js";

export async function createTimetable(req, res) {
  const inputs = req.body;
  if (!Array.isArray(inputs.subjects) || inputs.subjects.length === 0) {
    return res.status(422).json({ message: "Add at least one subject before generating a roadmap" });
  }

  const plan = await generateStudyPlan(inputs);
  const timetable = await createStoredTimetable(req.user.id || req.user._id, inputs, plan);

  if (Array.isArray(inputs.subjects)) {
    await scheduleExamCountdownReminders(req.user.id || req.user._id, inputs.subjects);
  }

  await scheduleSessionReminders(req.user.id || req.user._id, timetable.weeklySchedule);
  res.status(201).json({ timetable });
}

export async function listTimetables(req, res) {
  const timetables = await listStoredTimetables(req.user.id || req.user._id);
  res.json({ timetables });
}

export async function getActiveTimetable(req, res) {
  const timetable = await getActiveStoredTimetable(req.user.id || req.user._id);
  res.json({ timetable });
}
