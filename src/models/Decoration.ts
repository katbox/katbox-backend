import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the Decoration document
interface IDecoration extends Document {
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  image: string; // Store Cloudinary image URL
  imagePublicId?: string; // Store Cloudinary public_id for deletion (optional)
  createdAt: Date;
}

const DecorationSchema: Schema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  rating: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true }, // Store Cloudinary image URL
  imagePublicId: { type: String }, // Store Cloudinary public_id for deletion
  createdAt: { type: Date, default: Date.now },
});

// Create and export the model with the interface
export default mongoose.model<IDecoration>("Decoration", DecorationSchema);