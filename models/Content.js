const mongoose = require('mongoose');

// About Model
const aboutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mission: String,
  vision: String,
  values: [String],
  stats: [{
    label: String,
    value: String,
    icon: String
  }],
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  seoTitle: String,
  seoDescription: String,
  isActive: {
    type: Boolean,
    default: true
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
aboutSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const About = mongoose.model('About', aboutSchema);

// Team Member Model
const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  bio: String,
  image: {
    url: String,
    alt: String
  },
  email: String,
  phone: String,
  linkedin: String,
  twitter: String,
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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
teamMemberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

// Blog Model
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: String,
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [String],
  featuredImage: {
    url: String,
    alt: String
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  readTime: {
    type: Number,
    min: 1
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ title: 'text', content: 'text' });

// Update the updatedAt field before saving
blogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Generate slug from title if not provided
blogSchema.pre('save', function(next) {
  if (this.isNew && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

// Contact Model
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: String,
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  repliedAt: Date,
  closedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
  About,
  TeamMember,
  Blog,
  Contact
};