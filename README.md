// Complete Node.js Backend for E-commerce Authentication
// This file contains all the necessary components for user registration and login

// 1. User Model (models/User.js)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Prefer not to say'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  access: [{
    type: String,
    enum: ['home', 'products', 'contact', 'about', 'blog', 'cart', 'wishlist', 'profile', 'orders', 'admin']
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set default access based on role
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    if (this.role === 'admin') {
      this.access = ['home', 'products', 'contact', 'about', 'blog', 'cart', 'wishlist', 'profile', 'orders', 'admin'];
    } else {
      this.access = ['home', 'products', 'contact', 'about', 'blog', 'cart', 'wishlist', 'profile', 'orders'];
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);

// 2. Authentication Controller (controllers/authController.js)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address, gender, role, adminSecret } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: 'Name, email, password, and phone are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long'
      });
    }

    // Validate role and admin secret
    if (role === 'admin') {
      const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'anjalicart_admin_secret_2024';
      if (adminSecret !== ADMIN_SECRET_KEY) {
        return res.status(400).json({
          message: 'Invalid admin secret key'
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      address,
      gender,
      role: role || 'user'
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    // Remove password from response
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      gender: newUser.gender,
      role: newUser.role,
      access: newUser.access,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      role: user.role,
      access: user.access,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, gender } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name,
        phone,
        address,
        gender,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, gender, role, access } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        address,
        gender,
        role,
        access,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user access (Admin only)
exports.updateUserAccess = async (req, res) => {
  try {
    const { access } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        access,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User access updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user access error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// 3. Authentication Middleware (middleware/auth.js)
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        message: 'Token is not valid. User not found.'
      });
    }

    // Add user to request
    req.user = {
      userId: user._id,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      message: 'Token is not valid.'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Middleware to check if user has specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        message: `Access denied. ${role} role required.`
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRole
};

// 4. Authentication Routes (routes/authRoutes.js)
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.get('/users/:id', authenticateToken, requireAdmin, authController.getUserById);
router.put('/users/:id', authenticateToken, requireAdmin, authController.updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, authController.deleteUser);
router.put('/users/:id/access', authenticateToken, requireAdmin, authController.updateUserAccess);

module.exports = router;

// 5. Main Server File (index.js)
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use('/api/chat', chatRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/anjalicart')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);

// 6. Environment Variables (.env)
MONGO_URI=mongodb://localhost:27017/anjalicart
PORT=5000
JWT_SECRET=anjalicart_jwt_secret_key_2024
JWT_EXPIRE=7d
ADMIN_SECRET_KEY=anjalicart_admin_secret_2024

// SETUP INSTRUCTIONS:
// 1. Install MongoDB locally or use MongoDB Atlas
// 2. Create database named 'anjalicart'
// 3. Start MongoDB service
// 4. Run: node index.js
// 5. API endpoints available:
//    - POST /api/auth/register
//    - POST /api/auth/login
//    - GET /api/auth/me (protected)
//    - PUT /api/auth/profile (protected)
//    - GET /api/auth/users (admin only)