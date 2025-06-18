import express, { Request, Response } from "express";
import multer from "multer";
import { Menu } from "../models/Menu";
import { menuItemsStorage, categoryStorage, itemStorage } from "../config/cloudinary";

const router = express.Router();

// Multer uploads using Cloudinary storage
const uploadMenu = multer({ storage: menuItemsStorage });
const uploadCategory = multer({ storage: categoryStorage });
const uploadItem = multer({ storage: itemStorage });

// Upload category image
router.post("/category-image", uploadCategory.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }
    res.status(200).json({ imagePath: req.file.path });
  } catch (error) {
    res.status(500).json({ message: "Error uploading category image", error });
  }
});

// Upload item image
router.post("/item-image", uploadItem.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }
    res.status(200).json({ imagePath: req.file.path });
  } catch (error) {
    res.status(500).json({ message: "Error uploading item image", error });
  }
});

// Add menu
router.post("/add", uploadMenu.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers["user-id"] as string;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const { menuName, description, minPrice, maxPrice, minGuests, maxGuests, categories, restaurantId } = req.body;
    if (!restaurantId) {
      res.status(400).json({ message: "Restaurant ID is required" });
      return;
    }
    const newMenu = new Menu({
      userId,
      restaurantId,
      title: menuName,
      description,
      price: `${minPrice} - ${maxPrice}/plate`,
      details: `Min ${minGuests} - Max ${maxGuests} Guests`,
      additionalDetails: "Dynamic Pricing: more guests, more savings",
      image: req.file ? req.file.path : "https://res.cloudinary.com/your_cloud_name/image/upload/v1/katbox_restaurants/default-image.jpg",
      category: categories,
    });
    await newMenu.save();
    res.status(201).json({ message: "Menu added successfully", menu: newMenu });
  } catch (error) {
    res.status(500).json({ message: "Error adding menu", error });
  }
});

// Edit menu
router.put("/edit/:id", uploadMenu.single("image"), async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const userId = req.headers["user-id"] as string;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const { menuName, description, minPrice, maxPrice, minGuests, maxGuests, categories } = req.body;
    const existingMenu = await Menu.findById(req.params.id);
    if (!existingMenu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }
    if (existingMenu.userId !== userId) {
      res.status(403).json({ message: "You can only edit your own menus" });
      return;
    }
    const updatedData = {
      title: menuName,
      description,
      price: `${minPrice} - ${maxPrice}/plate`,
      details: `Min ${minGuests} - Max ${maxGuests} Guests`,
      additionalDetails: "Dynamic Pricing: more guests, more savings",
      image: req.file ? req.file.path : existingMenu.image,
      category: categories,
    };
    const updatedMenu = await Menu.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedMenu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }
    res.status(200).json({ message: "Menu updated successfully", menu: updatedMenu });
  } catch (error) {
    res.status(500).json({ message: "Error updating menu", error });
  }
});

// Delete menu
router.delete("/delete/:menuId", async (req: Request<{ menuId: string }>, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;
    const userId = req.headers["user-id"] as string;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const menu = await Menu.findOne({ _id: menuId, userId });
    if (!menu) {
      res.status(404).json({ message: "Menu not found or unauthorized" });
      return;
    }
    await Menu.deleteOne({ _id: menuId, userId });
    res.status(200).json({ message: "Menu deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu", error });
  }
});

// Get all menus
router.get("/all", async (_req: Request, res: Response): Promise<void> => {
  try {
    const menus = await Menu.find();
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menus", error });
  }
});

// Get menus by restaurant
router.get("/restaurant/:restaurantId", async (req: Request<{ restaurantId: string }>, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const menus = await Menu.find({ restaurantId });
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menus", error });
  }
});

// Get user menus
router.get("/my", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers["user-id"] as string;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const menus = await Menu.find({ userId });
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user menus", error });
  }
});

// Save menu list (categories + items)
router.post("/list/add/:menuId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;
    const userId = req.headers["user-id"] as string;
    const menuList = req.body;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
      const menu = await Menu.findById(menuId);
    if (!menu || menu.userId !== userId) {
      res.status(403).json({ message: "Unauthorized or menu not found" });
      return;
    }

    // Normalize and validate menuList.categories
    if (menuList.categories) {
      menuList.categories = menuList.categories.map((category: any) => {
        const maxVegSelection = category.maxVegSelection || category.maxSelection || 1;
        const maxNonVegSelection = category.maxNonVegSelection || category.maxSelection || 1;
        const vegSelectedCount = category.countVegSelectedCount || category.selectedCount || 0;
        const nonVegSelectedCount = category.nonVegSelectedCount || 0;

        return {
          ...category,
          name: category.name || '',
          image: category.image && category.image.startsWith('http') 
            ? category.image 
            : 'https://res.cloudinary.com/your_cloud_name/image/upload/v1/katbox_restaurants/default-image.jpg',
          maxVegSelection: Math.max(1, parseInt(maxVegSelection) || 1),
          maxNonVegSelection: Math.max(1, parseInt(maxNonVegSelection) || 1),
          vegSelectedCount: Math.max(0, parseInt(vegSelectedCount) || 0),
          nonVegSelectedCount: Math.max(0, parseInt(nonVegSelectedCount) || 0),
          vegItems: (category.vegItems || []).map((item: any) => ({
            ...item,
            name: item.name || '',
            image: item.image && item.image.startsWith('http') 
              ? item.image 
              : 'https://res.cloudinary.com/your_cloud_name/image/upload/v1/katbox_restaurants/default-image.jpg',
            selected: !!item.selected,
          })),
          nonVegItems: (category.nonVegItems || []).map((item: any) => ({
            ...item,
            name: item.name || '',
            image: item.image && item.image.startsWith('http') 
              ? item.image 
              : 'https://res.cloudinary.com/your_cloud_name/image/upload/v1/katbox_restaurants/default-image.jpg',
            selected: !!item.selected,
          })),
          maxSelection: undefined,
          selectedCount: undefined,
        };
      });
    }

    menu.menuList = menuList;
    await menu.save();
    res.status(200).json({ message: "Menu list saved successfully", menu });
  } catch (error) {
    res.status(500).json({ message: "Error saving menu list", error });
  }
});

// Get menu list for a specific menu
router.get("/list/:menuId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;
    const menu = await Menu.findById(menuId);

    if (!menu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    res.status(200).json(menu.menuList || { categories: [], isSubmitted: false });
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu list", error });
  }
});

export default router;