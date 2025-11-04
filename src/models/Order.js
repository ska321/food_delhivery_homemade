import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // each order must belong to a user
    },

    // 🆕 Added email field
    email: {
      type: String,
      required: true, // ensures every order has user's email
    },

    items: [
      {
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],

    customer: {
      name: String,
      phone: String,
      address: String,
    },

    status: { type: String, default: "Pending" },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Prevent model recompilation in dev/Next.js hot reload
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
