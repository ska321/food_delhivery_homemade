import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // ensures one customer per user account
    },
    name: {
      type: String,
      default: "", // optional for new blank profiles
    },
    email: {
      type: String,
      default: "",
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // simple validation
    },
    phone: {
      type: String,
      required: true,
    },
    addresses: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // ✅ automatically adds createdAt & updatedAt
  }
);

export default mongoose.models.Customer ||
  mongoose.model("Customer", CustomerSchema);
