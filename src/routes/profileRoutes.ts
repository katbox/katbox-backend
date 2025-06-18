import express, { Request, Response } from "express";
import mongoose from "mongoose";

const router = express.Router();

// Define Mongoose Schema
const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  fullname: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  country: String
});

// Create Mongoose Model
const Profile = mongoose.model("Profile", ProfileSchema);

// GET USER PROFILE
router.get("/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// CREATE OR UPDATE USER PROFILE
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, fullname, email, phone, address, city, country } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { 
        $set: {  
          fullname,
          email: email || "",
          phone: phone || "",
          address,
          city,
          country
        } 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;