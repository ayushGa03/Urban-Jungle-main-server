import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Product from "./models/Product.js";
import dns from "dns";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const imgDir = "C:\\Users\\ayush\\.gemini\\antigravity\\brain\\9867c8fa-5c1e-4db8-8340-ab65eb2b9b57";

function toDataUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const plants = [
  {
    name: "Snake Plant",
    type: "Indoor Air Purifier",
    description: "The Snake Plant (Sansevieria) is one of the best air-purifying indoor plants. It thrives in low light, requires minimal watering, and is perfect for beginners. Known for converting CO2 to oxygen at night.",
    price: 349,
    rating: 4.7,
    reviews: 234,
    stock: 80,
    category: "Indoor Plants",
    imageFile: "snake_plant_1779059864271.png",
  },
  {
    name: "Peace Lily",
    type: "Flowering Indoor Plant",
    description: "The Peace Lily (Spathiphyllum) is an elegant flowering plant that blooms beautiful white flowers. It purifies indoor air and thrives in low to medium light. A symbol of peace and tranquility.",
    price: 499,
    rating: 4.8,
    reviews: 189,
    stock: 55,
    category: "Flowering Plants",
    imageFile: "peace_lily_1779059878095.png",
  },
  {
    name: "Aloe Vera",
    type: "Medicinal Succulent",
    description: "Aloe Vera is a versatile medicinal plant known for its healing gel. Great for skin care, burns, and digestion. Easy to maintain, loves bright indirect sunlight, and needs watering only once a week.",
    price: 299,
    rating: 4.6,
    reviews: 312,
    stock: 120,
    category: "Medicinal Plants",
    imageFile: "aloe_vera_1779059893135.png",
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const plant of plants) {
      const imgPath = path.join(imgDir, plant.imageFile);
      const image = toDataUrl(imgPath);

      await Product.findOneAndDelete({ name: plant.name });

      const { imageFile, ...productData } = plant;
      await Product.create({ ...productData, image });
      console.log(`Added: ${plant.name}`);
    }

    console.log("\nSeed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedProducts();
