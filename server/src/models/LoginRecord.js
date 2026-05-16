import mongoose from "mongoose";

const loginRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true, lowercase: true, trim: true },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    action: { type: String, enum: ["register", "login", "google-login"], required: true },
    success: { type: Boolean, default: true },
    loggedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("LoginRecord", loginRecordSchema);
