const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const contentRoutes = require("./routes/contentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Server running",
    mongoDB: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chat", chatRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running...");
});

const PORT = process.env.PORT || 5000;

// MongoDB Connection with fallback
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("⚠️ MongoDB not connected - using fallback");
    console.log("   To enable MongoDB: Add your IP to Atlas whitelist");
  });

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});