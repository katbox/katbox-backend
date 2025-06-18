import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the Decoration document
interface IDecoration extends Document {
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  image: string;
  imagePublicId?: string;
  createdAt: Date;
}

const DecorationSchema: Schema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  rating: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  imagePublicId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDecoration>("Decoration", DecorationSchema);