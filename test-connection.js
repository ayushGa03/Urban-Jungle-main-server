import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Test DNS Resolution
console.log("🔍 Testing DNS Resolution...\n");

const testServers = ["8.8.8.8", "8.8.4.4", "1.1.1.1"];

testServers.forEach((server) => {
  dns.setServers([server]);
  console.log(`Testing with DNS: ${server}`);

  dns.resolveSrv("_mongodb._tcp.cluster0.qfg42um.mongodb.net", (err, addresses) => {
    if (err) {
      console.log(`  ❌ Failed: ${err.code}`);
    } else {
      console.log(`  ✅ Resolved: ${JSON.stringify(addresses)}`);
    }
  });
});

// Set to Google DNS and test MongoDB connection
dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("\n🔗 Testing MongoDB Connection...\n");
console.log(`Connection String: ${process.env.MONGODB_URI}\n`);

const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: "majority",
};

mongoose
  .connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    console.log("✅ Your setup is ready!");
    process.exit(0);
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Failed:", err.message);
    console.log("\n🔧 Troubleshooting Steps:");
    console.log("1. Check MongoDB Atlas IP Whitelist:");
    console.log("   - Go to: https://cloud.mongodb.com");
    console.log("   - Select Cluster → Network Access");
    console.log("   - Add your IP (0.0.0.0/0 for all IPs - not recommended)");
    console.log("\n2. Verify connection string is correct in .env");
    console.log("\n3. Ensure firewall allows outbound HTTPS (port 443)");
    process.exit(1);
  });
