import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { upload, bufferToDataUrl } from "../middleware/upload.js";

const router = express.Router();

// REGISTER (User)
router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    // CHECK IF USER EXISTS
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // UPLOAD IMAGE TO IMGBB IF PROVIDED
    let profileImageUrl = null;
    if (req.file) {
      profileImageUrl = bufferToDataUrl(req.file.buffer, req.file.mimetype);
    }

    // CREATE USER
    const userData = {
      name,
      email,
      password,
      profileImage: profileImageUrl,
      role: "user",
    };

    const user = await User.create(userData);

    // GENERATE TOKEN
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN REGISTER
router.post("/admin/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { name, email, password, adminSecretKey } = req.body;

    if (!name || !email || !password || !adminSecretKey) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password and admin secret key",
      });
    }

    // VERIFY ADMIN SECRET KEY
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin secret key",
      });
    }

    // CHECK IF USER EXISTS
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // UPLOAD IMAGE TO IMGBB IF PROVIDED
    let profileImageUrl = null;
    if (req.file) {
      profileImageUrl = bufferToDataUrl(req.file.buffer, req.file.mimetype);
    }

    // CREATE ADMIN USER
    const userData = {
      name,
      email,
      password,
      profileImage: profileImageUrl,
      role: "admin",
    };

    const user = await User.create(userData);

    // GENERATE TOKEN
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN LOGIN
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // CHECK USER
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // CHECK IF USER IS ADMIN
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not an admin account.",
      });
    }

    // CHECK PASSWORD
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // GENERATE TOKEN
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// LOGIN (User)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // CHECK USER
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // CHECK PASSWORD
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // GENERATE TOKEN
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET CURRENT USER
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE USER PROFILE
router.put("/update", protect, upload.single("profileImage"), async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(city && { city }),
      ...(state && { state }),
      ...(pincode && { pincode }),
    };

    // UPLOAD IMAGE TO IMGBB IF PROVIDED
    if (req.file) {
      updateData.profileImage = bufferToDataUrl(req.file.buffer, req.file.mimetype);
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
