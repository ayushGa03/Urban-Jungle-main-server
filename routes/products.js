import express from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { upload, bufferToDataUrl } from "../middleware/upload.js";

const router = express.Router();

// GET ALL PRODUCTS (Public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET SINGLE PRODUCT (Public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE PRODUCT (Admin Only)
router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { name, type, description, price, rating, reviews, stock, category } = req.body;

    if (!name || !type || !price || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields including image",
      });
    }

    // Convert image to data URL
    const imageUrl = bufferToDataUrl(req.file.buffer, req.file.mimetype);

    const product = await Product.create({
      name,
      type,
      description,
      price,
      rating: rating || 0,
      reviews: reviews || 0,
      stock: stock || 100,
      category: category || "Plants",
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE PRODUCT (Admin Only)
router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { name, type, description, price, rating, reviews, stock, category } = req.body;

    let updateData = {
      ...(name && { name }),
      ...(type && { type }),
      ...(description && { description }),
      ...(price && { price }),
      ...(rating && { rating }),
      ...(reviews && { reviews }),
      ...(stock && { stock }),
      ...(category && { category }),
    };

    // Convert new image if provided
    if (req.file) {
      updateData.image = bufferToDataUrl(req.file.buffer, req.file.mimetype);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE PRODUCT (Admin Only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
