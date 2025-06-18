import express, { Request, Response } from "express";
import Order from "../models/Order";

const router = express.Router();

// Create a new order
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }
    if (!orderData.phoneNumber) {
      res.status(400).json({ message: "Primary phone number is required" });
      return;
    }

    // Validate phone number formats
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(orderData.phoneNumber)) {
      res.status(400).json({ message: "Invalid primary phone number format" });
      return;
    }
    if (orderData.altPhoneNumber && !phoneRegex.test(orderData.altPhoneNumber)) {
      res.status(400).json({ message: "Invalid alternate phone number format" });
      return;
    }

    const order = new Order(orderData);
    await order.save();
    res.status(201).json({ message: "Order saved successfully", order });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: "Failed to save order" });
  }
});

// Get all orders
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Update an order by ID
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate required fields
    if (!updateData.name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }
    if (updateData.altPhoneNumber && !/^\+?\d{10,15}$/.test(updateData.altPhoneNumber)) {
      res.status(400).json({ message: "Invalid alternate phone number format" });
      return;
    }
    if (!updateData.date) {
      res.status(400).json({ message: "Date is required" });
      return;
    }
    if (!updateData.time) {
      res.status(400).json({ message: "Time is required" });
      return;
    }
    if (!updateData.guests || updateData.guests < 1) {
      res.status(400).json({ message: "Number of guests must be at least 1" });
      return;
    }
    if (!updateData.location) {
      res.status(400).json({ message: "Location is required" });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        name: updateData.name,
        altPhoneNumber: updateData.altPhoneNumber || "",
        date: updateData.date,
        time: updateData.time,
        guests: updateData.guests,
        location: updateData.location,
      },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
});

// Delete an order by ID
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

export default router;