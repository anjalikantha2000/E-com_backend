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
