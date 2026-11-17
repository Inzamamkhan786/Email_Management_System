import mongoose from "mongoose";

export async function connectMongo(uri) {
  if (!uri) return false;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.warn("MongoDB unavailable, using file store:", err.message);
    return false;
  }
}
