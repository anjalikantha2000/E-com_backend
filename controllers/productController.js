const Product = require('../models/Product');

// Sample products data (fallback when DB not connected)
const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.',
    price: 2499,
    originalPrice: 2999,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'AnjaliAudio',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop&auto=format', alt: 'Wireless Headphones' }],
    stock: 50,
    sku: 'WH-001',
    features: ['Active Noise Cancellation', '30-hour battery', 'Bluetooth 5.0'],
    specifications: { 'Battery Life': '30 hours', 'Bluetooth': '5.0', 'Noise Cancellation': 'Yes', 'Weight': '250g' },
    rating: 4.5,
    reviewCount: 128,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes for maximum comfort.',
    price: 1899,
    originalPrice: 2299,
    category: 'Footwear',
    subcategory: 'Sports',
    brand: 'SportFit',
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop&auto=format', alt: 'Running Shoes' }],
    stock: 75,
    sku: 'RS-002',
    features: ['Breathable mesh', 'Cushioned sole'],
    specifications: { 'Material': 'Mesh', 'Sole': 'Cushioned', 'Size Range': '6-12', 'Weight': '280g' },
    rating: 4.3,
    reviewCount: 95,
    isActive: true,
    isFeatured: true
  }
];

// Get all products with filtering and pagination
exports.getAllProducts = async (req, res) => {
  try {
    // Check if DB is connected
    if (require('mongoose').connection.readyState !== 1) {
      // Return sample data when DB not connected
      const { page = 1, limit = 12 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = sampleProducts.length;
      
      const products = sampleProducts
        .slice(skip, skip + parseInt(limit))
        .map((p, i) => ({ ...p, id: i + 1 }));
      
      return res.json({
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          hasNextPage: parseInt(page) * parseInt(limit) < total,
          hasPrevPage: parseInt(page) > 1
        }
      });
    }

    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc',
      featured,
      active = 'true'
    } = req.query;

    // Build query
    const query = {};

    if (active === 'true') query.isActive = true;
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (featured === 'true') query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNextPage: parseInt(page) * parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all products error:', error.message);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    // Check if DB is connected
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product by ID error:', error.message);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    // Check if DB is connected
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const { limit = 8 } = req.query;

    const products = await Product
      .find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error.message);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get product categories
exports.getCategories = async (req, res) => {
  try {
    // Check if DB is connected
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const categories = await Product.distinct('category', { isActive: true });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Increment view count (you can implement this later)
    // product.views += 1;
    // await product.save();

    res.json({
      product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product
      .find({ category, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({ category, isActive: true });

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 12 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0
        }
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product
      .find({
        $text: { $search: query },
        isActive: true
      })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({
      $text: { $search: query },
      isActive: true
    });

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('createdBy', 'name');

    if (!updatedProduct) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product
      .find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get product categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};