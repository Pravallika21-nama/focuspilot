import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ["browser", "email", "whatsapp"], default: "browser" },
    scheduledFor: { type: Date, required: true },
    sentAt: Date,
    readAt: Date,
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    metadata: Object
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
