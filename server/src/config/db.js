import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/focuspilot";
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.warn(`MongoDB not connected: ${error.message}`);
    console.warn("Auth will use the in-memory development store. Configure MONGODB_URI for persistent production auth.");
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
