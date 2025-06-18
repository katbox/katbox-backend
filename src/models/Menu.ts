import mongoose, { Schema } from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  name: String,
  image: String,
  selected: Boolean,
});

const CategorySchema = new mongoose.Schema({
  name: String,
  image: String,
  maxVegSelection: { type: Number, default: 1 },
  maxNonVegSelection: { type: Number, default: 1 },
  vegItems: [MenuItemSchema],
  nonVegItems: [MenuItemSchema],
  vegSelectedCount: { type: Number, default: 0 },
  nonVegSelectedCount: { type: Number, default: 0 },
});

const MenuSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    details: { type: String, required: true },
    additionalDetails: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    menuList: {
      categories: [CategorySchema],
      isSubmitted: Boolean,
    },
  },
  { timestamps: true }
);

export const Menu = mongoose.model("Menu", MenuSchema);