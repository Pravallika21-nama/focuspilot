import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    examDate: { type: Date, required: true },
    difficulty: { type: Number, min: 1, max: 5, default: 3 },
    priority: { type: Number, min: 1, max: 5, default: 3 },
    isWeak: { type: Boolean, default: false },
    progress: { type: Number, min: 0, max: 100, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
