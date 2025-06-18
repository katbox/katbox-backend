import mongoose, { Schema } from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  cuisines: { type: [String], required: true },
  image: { type: String },
});

export default mongoose.model("Restaurant", RestaurantSchema);