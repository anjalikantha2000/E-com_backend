require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Check if running in demo mode
const isDemoMode = process.argv.includes('--demo');

// Sample product data (extracted from frontend)
const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.',
    price: 2499,
    originalPrice: 2999,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'AnjaliAudio',
    images: [{
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop&auto=format',
      alt: 'Wireless Headphones'
    }],
    stock: 50,
    sku: 'WH-001',
    features: ['Active Noise Cancellation', '30-hour battery', 'Bluetooth 5.0'],
    specifications: {
      'Battery Life': '30 hours',
      'Bluetooth': '5.0',
      'Noise Cancellation': 'Yes',
      'Weight': '250g'
    },
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
    images: [{
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop&auto=format',
      alt: 'Running Shoes'
    }],
    stock: 75,
    sku: 'RS-002',
    features: ['Breathable mesh', 'Cushioned sole'],
    specifications: {
      'Material': 'Mesh',
      'Sole': 'Cushioned',
      'Size Range': '6-12',
      'Weight': '280g'
    },
    rating: 4.3,
    reviewCount: 95,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Leather Handbag',
    description: 'Elegant genuine leather handbag.',
    price: 3299,
    originalPrice: 3999,
    category: 'Fashion',
    subcategory: 'Accessories',
    brand: 'LeatherCraft',
    images: [{
      url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=450&fit=crop&auto=format',
      alt: 'Leather Handbag'
    }],
    stock: 25,
    sku: 'LH-003',
    features: ['Genuine leather', 'Multiple compartments'],
    specifications: {
      'Material': 'Genuine Leather',
      'Compartments': '3 main',
      'Dimensions': '30x20x10 cm',
      'Strap': 'Adjustable'
    },
    rating: 4.7,
    reviewCount: 210,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Smart Watch',
    description: 'Feature-packed smartwatch with health monitoring.',
    price: 5999,
    originalPrice: 6999,
    category: 'Electronics',
    subcategory: 'Wearables',
    brand: 'TechWatch',
    images: [{
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop&auto=format',
      alt: 'Smart Watch'
    }],
    stock: 40,
    sku: 'SW-004',
    features: ['AMOLED display', 'Heart rate monitor'],
    specifications: {
      'Display': 'AMOLED 1.4"',
      'Battery': '7 days',
      'Sensors': 'Heart rate, SpO2',
      'Water Resistance': '50m'
    },
    rating: 4.6,
    reviewCount: 175,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip premium yoga mat.',
    price: 799,
    originalPrice: 999,
    category: 'Sports',
    subcategory: 'Fitness',
    brand: 'ZenFitness',
    images: [{
      url: 'https://images.unsplash.com/photo-1601925268008-f5e4c5e5e5e5?w=600&h=450&fit=crop&auto=format',
      alt: 'Yoga Mat'
    }],
    stock: 100,
    sku: 'YM-005',
    features: ['Non-slip surface', 'Eco-friendly'],
    specifications: {
      'Material': 'Natural Rubber',
      'Thickness': '6mm',
      'Size': '68x183 cm',
      'Eco-Friendly': 'Yes'
    },
    rating: 4.4,
    reviewCount: 88,
    isActive: true
  },
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker.',
    price: 2199,
    originalPrice: 2699,
    category: 'Home',
    subcategory: 'Appliances',
    brand: 'BrewMaster',
    images: [{
      url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=450&fit=crop&auto=format',
      alt: 'Coffee Maker'
    }],
    stock: 30,
    sku: 'CM-006',
    features: ['12-cup capacity', 'Built-in grinder'],
    specifications: {
      'Capacity': '12 cups',
      'Grinder': 'Built-in',
      'Programmable': 'Yes',
      'Power': '1200W'
    },
    rating: 4.2,
    reviewCount: 64,
    isActive: true
  },
  {
    name: 'Sunglasses',
    description: 'Stylish UV400 polarized sunglasses.',
    price: 1299,
    originalPrice: 1599,
    category: 'Fashion',
    subcategory: 'Accessories',
    brand: 'SunShield',
    images: [{
      url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=450&fit=crop&auto=format',
      alt: 'Sunglasses'
    }],
    stock: 60,
    sku: 'SG-007',
    features: ['UV400 protection', 'Polarized lenses'],
    specifications: {
      'UV Protection': 'UV400',
      'Lens Type': 'Polarized',
      'Frame': 'Metal',
      'Gender': 'Unisex'
    },
    rating: 4.1,
    reviewCount: 52,
    isActive: true
  },
  {
    name: 'Bluetooth Speaker',
    description: '360° surround sound speaker.',
    price: 1799,
    originalPrice: 2199,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'SoundWave',
    images: [{
      url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=450&fit=crop&auto=format',
      alt: 'Bluetooth Speaker'
    }],
    stock: 45,
    sku: 'BS-008',
    features: ['360° sound', '20-hour battery'],
    specifications: {
      'Battery Life': '20 hours',
      'Sound': '360° surround',
      'Bluetooth': '5.0',
      'Waterproof': 'IPX7'
    },
    rating: 4.5,
    reviewCount: 143,
    isActive: true
  },
  {
    name: 'Backpack',
    description: 'Durable 30L backpack.',
    price: 1499,
    originalPrice: 1799,
    category: 'Fashion',
    subcategory: 'Accessories',
    brand: 'UrbanPack',
    images: [{
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=450&fit=crop&auto=format',
      alt: 'Backpack'
    }],
    stock: 80,
    sku: 'BP-009',
    features: ['30L capacity', 'Laptop compartment'],
    specifications: {
      'Capacity': '30L',
      'Laptop Size': '15.6"',
      'Material': 'Water-resistant nylon',
      'Compartments': 'Multiple'
    },
    rating: 4.3,
    reviewCount: 77,
    isActive: true
  },
  {
    name: 'Dumbbells Set',
    description: 'Adjustable dumbbell set.',
    price: 2999,
    originalPrice: 3499,
    category: 'Sports',
    subcategory: 'Fitness',
    brand: 'PowerFit',
    images: [{
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=450&fit=crop&auto=format',
      alt: 'Dumbbells Set'
    }],
    stock: 20,
    sku: 'DS-010',
    features: ['Adjustable weight', 'Rubber coating'],
    specifications: {
      'Weight Range': '5-50 lbs each',
      'Material': 'Cast iron with rubber',
      'Adjustable': 'Yes',
      'Set': '2 dumbbells'
    },
    rating: 4.6,
    reviewCount: 112,
    isActive: true
  },
  {
    name: 'Table Lamp',
    description: 'Modern LED table lamp.',
    price: 899,
    originalPrice: 1199,
    category: 'Home',
    subcategory: 'Lighting',
    brand: 'LightStyle',
    images: [{
      url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=450&fit=crop&auto=format',
      alt: 'Table Lamp'
    }],
    stock: 35,
    sku: 'TL-011',
    features: ['LED technology', 'Touch control'],
    specifications: {
      'Type': 'LED',
      'Brightness': 'Adjustable',
      'Control': 'Touch',
      'Power': '12W'
    },
    rating: 4.0,
    reviewCount: 41,
    isActive: true
  },
  {
    name: 'Sneakers',
    description: 'Trendy casual sneakers.',
    price: 2299,
    originalPrice: 2799,
    category: 'Footwear',
    subcategory: 'Casual',
    brand: 'StepStyle',
    images: [{
      url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&h=450&fit=crop&auto=format',
      alt: 'Sneakers'
    }],
    stock: 55,
    sku: 'SN-012',
    features: ['Memory foam insole', 'Rubber outsole'],
    specifications: {
      'Insole': 'Memory foam',
      'Outsole': 'Rubber',
      'Size Range': '6-12',
      'Style': 'Casual'
    },
    rating: 4.4,
    reviewCount: 98,
    isActive: true
  }
];

async function seedDatabase() {
  if (isDemoMode) {
    console.log('🎭 Running in DEMO MODE');
    console.log('📦 Sample products data prepared:');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₹${product.price} (${product.category})`);
    });
    console.log('\n💡 To seed real database, connect MongoDB and run without --demo flag');
    console.log('📄 Products data saved to: products-data.json');
    const fs = require('fs');
    fs.writeFileSync('products-data.json', JSON.stringify(sampleProducts, null, 2));
    return;
  }

  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing existing products...');
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    console.log('📦 Seeding products...');

    // Add createdBy field (assuming admin user exists)
    const adminUser = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });
    const createdBy = adminUser ? adminUser._id : null;

    const productsWithCreator = sampleProducts.map(product => ({
      ...product,
      createdBy
    }));

    const insertedProducts = await Product.insertMany(productsWithCreator);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products`);

    // Display inserted products
    console.log('\n📋 Inserted Products:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₹${product.price} (${product.category})`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('💡 You can now view products at: http://localhost:5173/products');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check MONGO_URI in .env file');
    console.log('3. For demo mode, run: node seed-products.js --demo');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seed function
seedDatabase();