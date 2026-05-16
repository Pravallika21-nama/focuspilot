import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8, select: false },
    avatar: String,
    provider: { type: String, enum: ["local", "google"], default: "local" },
    preferredStudyTime: { type: String, default: "18:00" },
    dailyStudyHours: { type: Number, default: 3 },
    notificationPreferences: {
      browser: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      whatsappNumber: String,
      reminderTime: { type: String, default: "07:00" },
      studyDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    },
    streak: { type: Number, default: 0 },
    lastActiveDate: Date
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
