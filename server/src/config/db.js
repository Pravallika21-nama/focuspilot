import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ MONGODB_URI is missing in .env. MongoDB will not connect.");
    console.warn("⚠️ Auth will use the in-memory development store or fail. Configure MONGODB_URI for persistence.");
    return;
  }

  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.warn(`MongoDB not connected: ${error.message}`);
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
