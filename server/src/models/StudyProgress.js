import mongoose from "mongoose";

const studyProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    subject: { type: String, required: true },
    plannedMinutes: { type: Number, default: 0 },
    completedMinutes: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    tasksPlanned: { type: Number, default: 0 },
    focusScore: { type: Number, min: 0, max: 100, default: 70 }
  },
  { timestamps: true }
);

studyProgressSchema.index({ user: 1, date: 1, subject: 1 }, { unique: true });

export default mongoose.model("StudyProgress", studyProgressSchema);
