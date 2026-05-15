import { addStoredTask, deleteStoredTask, updateStoredTask } from "../services/plannerStore.js";

export async function updateTask(req, res) {
  const task = await updateStoredTask(req.user.id || req.user._id, req.params.id, req.body);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ task });
}

export async function deleteTask(req, res) {
  const deleted = await deleteStoredTask(req.user.id || req.user._id, req.params.id);
  if (!deleted) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task deleted" });
}

export async function addTask(req, res) {
  const task = await addStoredTask(req.user.id || req.user._id, req.body);
  if (!task) return res.status(404).json({ message: "Generate a timetable first" });
  res.status(201).json({ task });
}
