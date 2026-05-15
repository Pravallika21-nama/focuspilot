import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: { type: String, enum: ["study", "revision", "practice", "break"], default: "study" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    completed: { type: Boolean, default: false },
    notes: String
  },
  { _id: true }
);

const timetableSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "AI Generated Study Plan" },
    inputs: { type: Object, required: true },
    dailySchedule: [sessionSchema],
    weeklySchedule: [sessionSchema],
    subjectRoadmap: [String],
    revisionPlan: [String],
    suggestions: [String],
    productivityScore: { type: Number, min: 0, max: 100, default: 72 }
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);
