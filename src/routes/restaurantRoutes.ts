import express, { RequestHandler } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import Restaurant from "../models/Restaurant";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Setup Cloudinary storage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "katbox/restaurant", // This is now inside a function
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  }),
});


const uploadRestaurant = multer({ storage });

// GET - Fetch all restaurants
router.get("/", (async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants", error });
  }
}) as RequestHandler);

// GET - Fetch the logged-in user's restaurant
router.get("/my", (async (req, res) => {
  try {
    const userId = req.headers["user-id"] as string;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const restaurant = await Restaurant.findOne({ userId });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user restaurant", error });
  }
}) as RequestHandler);

// POST - Add a restaurant
router.post(
  "/add",
  uploadRestaurant.single("image"),
  (async (req, res) => {
    try {
      const userId = req.headers["user-id"] as string;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      const existingRestaurant = await Restaurant.findOne({ userId });
      if (existingRestaurant) {
        res.status(400).json({ message: "User can only add one restaurant." });
        return;
      }

      const newRestaurant = new Restaurant({
        userId,
        name: req.body.name,
        city: req.body.city,
        cuisines: JSON.parse(req.body.cuisines),
        image: req.file ? (req.file as any).path : "", // Cloudinary URL
      });

      await newRestaurant.save();
      res.status(201).json({ message: "Restaurant added!", restaurant: newRestaurant });
    } catch (error) {
      res.status(500).json({ message: "Error adding restaurant", error });
    }
  }) as RequestHandler
);

// PUT - Update a restaurant
router.put(
  "/update",
  uploadRestaurant.single("image"),
  (async (req, res) => {
    try {
      const userId = req.headers["user-id"] as string;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      const existingRestaurant = await Restaurant.findOne({ userId });
      if (!existingRestaurant) {
        res.status(404).json({ message: "Restaurant not found" });
        return;
      }

      const updatedData = {
        name: req.body.name,
        city: req.body.city,
        cuisines: JSON.parse(req.body.cuisines),
        image: req.file ? (req.file as any).path : existingRestaurant.image,
      };

      const updatedRestaurant = await Restaurant.findOneAndUpdate({ userId }, updatedData, { new: true });

      res.json({ message: "Restaurant updated!", restaurant: updatedRestaurant });
    } catch (error) {
      res.status(500).json({ message: "Error updating restaurant", error });
    }
  }) as RequestHandler
);

export default router;
