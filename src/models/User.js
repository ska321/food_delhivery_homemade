import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, default: "" },
  address: { type: String, default: "" },
  occupation: { type: String, default: "" },
  age: { type: Number, default: null },
  dp: { type: String, default: "" },
});

// Prevent re-indexing errors in dev hot-reload
if (!mongoose.models.User) {
  // 🧹 Drop stale 'phone' index if it exists
  UserSchema.pre("save", async function (next) {
    try {
      const indexes = await this.constructor.collection.indexes();
      const phoneIndex = indexes.find((i) => i.name === "phone_1");
      if (phoneIndex) {
        await this.constructor.collection.dropIndex("phone_1");
        console.log("✅ Dropped old phone_1 index");
      }
    } catch (err) {
      console.warn("⚠️ Index cleanup error:", err.message);
    }
    next();
  });
}

export default mongoose.models.User || mongoose.model("User", UserSchema);
