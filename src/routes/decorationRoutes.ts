import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { cloudinary, decorationStorage } from "../config/cloudinary"; // Adjust path if needed
import Decoration from "../models/Decoration"; // Adjust path if needed

const router = express.Router();

// Configure multer for decoration image uploads to Cloudinary
const upload = multer({ storage: decorationStorage });

// POST: Add a new decoration
router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, price, originalPrice, rating, category } = req.body;
      if (!title || !price || !originalPrice || !rating || !category || !req.file) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }
      // Use Cloudinary URL and public_id
      const image = (req.file as any).path; // Cloudinary URL
      const imagePublicId = (req.file as any).filename; // Cloudinary public_id
      const decoration = new Decoration({
        title,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice),
        rating: parseFloat(rating),
        category,
        image,
        imagePublicId, // Store public_id for future deletion
      });
      await decoration.save();
      res.status(201).json(decoration);
    } catch (error) {
      console.error("Error saving decoration:", error);
      res.status(500).json({ error: "Failed to save decoration" });
    }
  }
);

// GET: Retrieve all decorations
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const decorations = await Decoration.find();
      res.json(decorations);
    } catch (error) {
      console.error("Error fetching decorations:", error);
      res.status(500).json({ error: "Failed to fetch decorations" });
    }
  }
);

// PUT: Update a decoration
router.put(
  "/:id",
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, price, originalPrice, rating, category } = req.body;
      if (!title || !price || !originalPrice || !rating || !category) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }
      const updateData: any = {
        title,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice),
        rating: parseFloat(rating),
        category,
      };
      if (req.file) {
        // Get existing decoration to delete old image from Cloudinary
        const existingDecoration = await Decoration.findById(id);
        if (existingDecoration && existingDecoration.imagePublicId) {
          await cloudinary.uploader.destroy(existingDecoration.imagePublicId);
        }
        updateData.image = (req.file as any).path; // New Cloudinary URL
        updateData.imagePublicId = (req.file as any).filename; // New public_id
      }
      const decoration = await Decoration.findByIdAndUpdate(id, updateData, { new: true });
      if (!decoration) {
        res.status(404).json({ error: "Decoration not found" });
        return;
      }
      res.json(decoration);
    } catch (error) {
      console.error("Error updating decoration:", error);
      res.status(500).json({ error: "Failed to update decoration" });
    }
  }
);

// DELETE: Remove a decoration
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const decoration = await Decoration.findById(id);
      if (!decoration) {
        res.status(404).json({ error: "Decoration not found" });
        return;
      }
      // Delete image from Cloudinary
      if (decoration.imagePublicId) {
        await cloudinary.uploader.destroy(decoration.imagePublicId);
      }
      await Decoration.findByIdAndDelete(id);
      res.json({ message: "Decoration deleted successfully" });
    } catch (error) {
      console.error("Error deleting decoration:", error);
      res.status(500).json({ error: "Failed to delete decoration" });
    }
  }
);

export default router;