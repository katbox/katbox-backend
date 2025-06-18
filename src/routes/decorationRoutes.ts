import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { cloudinary, decorationStorage } from "../config/cloudinary";
import Decoration from "../models/Decoration";

const router = express.Router();

const upload = multer({ storage: decorationStorage });

// Interface for request body in POST and PUT
interface DecorationRequestBody {
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
}

// POST: Add a new decoration
router.post(
  "/",
  upload.single("image"),
  async (req: Request<{}, {}, DecorationRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, price, originalPrice, rating, category } = req.body;
      if (!title || !price || !originalPrice || !rating || !category || !req.file) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }
      const image = req.file.path;
      const imagePublicId = req.file.filename;
      const decoration = new Decoration({
        title,
        price: parseFloat(price.toString()),
        originalPrice: parseFloat(originalPrice.toString()),
        rating: parseFloat(rating.toString()),
        category,
        image,
        imagePublicId,
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
  async (req: Request<{ id: string }, {}, DecorationRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, price, originalPrice, rating, category } = req.body;
      if (!title || !price || !originalPrice || !rating || !category) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }
      const existingDecoration = await Decoration.findById(id);
      if (!existingDecoration) {
        res.status(404).json({ error: "Decoration not found" });
        return;
      }
      const updateData: Partial<DecorationRequestBody> & { image?: string; imagePublicId?: string } = {
        title,
        price: parseFloat(price.toString()),
        originalPrice: parseFloat(originalPrice.toString()),
        rating: parseFloat(rating.toString()),
        category,
      };
      if (req.file) {
        if (existingDecoration.imagePublicId) {
          await cloudinary.uploader.destroy(existingDecoration.imagePublicId);
        }
        updateData.image = req.file.path;
        updateData.imagePublicId = req.file.filename;
      } else {
        updateData.image = existingDecoration.image;
        updateData.imagePublicId = existingDecoration.imagePublicId;
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
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const decoration = await Decoration.findById(id);
      if (!decoration) {
        res.status(404).json({ error: "Decoration not found" });
        return;
      }
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