import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import restaurantRoutes from "./routes/restaurantRoutes";
import profileRoutes from "./routes/profileRoutes";
import menuRoutes from "./routes/menuRoutes";
import decorationRoutes from "./routes/decorationRoutes";
import orderRoutes from "./routes/orderRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/profile", profileRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/decorations", decorationRoutes);
app.use("/api/orders", orderRoutes);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Start the connection
connectDB();

export default app;