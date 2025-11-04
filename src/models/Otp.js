import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: String,
  code: String,
  createdAt: { type: Date, expires: 300, default: Date.now }, // expires in 5 min
});

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
