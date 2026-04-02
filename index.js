const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
require('dotenv').config()

const chatRoutes = require('./routes/chatRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' })
})


dotenv.config();


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use('/api/chat', chatRoutes)

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
  })


// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
