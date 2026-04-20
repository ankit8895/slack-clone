import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);

    console.log("MongoDB connected successfully:", conn.connection.host);
  } catch (error) {
    console.error("Error connecting to DB:", error);
    process.exit(1);
  }
};
