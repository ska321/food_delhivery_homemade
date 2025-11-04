import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  size: String,
  description: String,
  image: String,
});

export default mongoose.models.Menu || mongoose.model("Menu", MenuSchema);
