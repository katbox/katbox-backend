import mongoose, { Schema, Document } from "mongoose";

interface IOrder extends Document {
  menuTitle: string;
  date: string;
  time: string;
  guests: number;
  pricePerPlate: number;
  location: string;
  restaurantId: string;
  phoneNumber: string;
  name: string; // Added
  altPhoneNumber?: string; // Added, optional
  selectedItems: { name: string; type: "veg" | "nonveg"; category: string }[];
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  menuTitle: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  pricePerPlate: { type: Number, required: true },
  location: { type: String, required: true },
  restaurantId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true }, // Added
  altPhoneNumber: { type: String, default: "" }, // Added, optional
  selectedItems: [
    {
      name: { type: String, required: true },
      type: { type: String, enum: ["veg", "nonveg"], required: true },
      category: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrder>("Order", OrderSchema);