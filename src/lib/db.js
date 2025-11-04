import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "pizza-cake",
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
  }
};

export default connectDB;
