import { Router, Request, Response, RequestHandler } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import Restaurant from "../models/Restaurant";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Setup Cloudinary storage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req: Request, _file: Express.Multer.File) => ({
    folder: "katbox/restaurant",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  }),
});

const uploadRestaurant = multer({ storage });

// GET - Fetch all restaurants
const getAllRestaurants: RequestHandler = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants", error });
  }
};

// GET - Fetch the logged-in user's restaurant
const getUserRestaurant: RequestHandler = async (req: Request, res: Response) => {
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
};

// POST - Add a restaurant
const addRestaurant: RequestHandler = async (req: Request, res: Response) => {
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
      image: req.file ? req.file.path : "",
    });

    await newRestaurant.save();
    res.status(201).json({ message: "Restaurant added!", restaurant: newRestaurant });
  } catch (error) {
    res.status(500).json({ message: "Error adding restaurant", error });
  }
};

// PUT - Update a restaurant
const updateRestaurant: RequestHandler = async (req: Request, res: Response) => {
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
      image: req.file ? req.file.path : existingRestaurant.image,
    };

    const updatedRestaurant = await Restaurant.findOneAndUpdate({ userId }, updatedData, { new: true });

    res.json({ message: "Restaurant updated!", restaurant: updatedRestaurant });
  } catch (error) {
    res.status(500).json({ message: "Error updating restaurant", error });
  }
};

router.get("/", getAllRestaurants);
router.get("/my", getUserRestaurant);
router.post("/add", uploadRestaurant.single("image"), addRestaurant);
router.put("/update", uploadRestaurant.single("image"), updateRestaurant);

export default router;