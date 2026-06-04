import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import mongoose from "mongoose";
import connectDB from "./config/db.js";
import dns from "dns";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import cartRoutes from "./routes/cart.js";
import { fileURLToPath } from "url";
import path from "path";
dotenv.config();

// FIX DNS RESOLUTION
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Google's DNS servers

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// MIDDLEWARE
// Increase payload size limit to handle images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // Alternative dev port
  "http://localhost:5174", // Another dev port
  "http://localhost:8080", // Vue dev server or others
  "https://urban-jungle-main-server.onrender.com", // Render backend (for testing)
  process.env.FRONTEND_URL || "http://localhost:5173", // Production frontend URL from env
  // Add your Render frontend URL here
  // e.g., "https://your-frontend-domain.onrender.com"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // For development: allow any localhost
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// calling the dunction to connect to the database
connectDB();

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running 🚀" });
});

// SPA Fallback - Serve index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});
// scan the file i have deployed but there is issue while communication fronted and backed on the render current url is 