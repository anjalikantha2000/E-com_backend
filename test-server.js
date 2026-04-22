const express = require("express");
const cors = require("cors");
const session = require("express-session");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: "test_secret",
  resave: false,
  saveUninitialized: false
}));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server running" });
});

app.post("/api/auth/register", (req, res) => {
  res.status(201).json({ message: "User registered successfully", user: { name: req.body.name } });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});