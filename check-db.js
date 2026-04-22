// Simple script to check MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

async function checkConnection() {
  console.log('🔍 Checking MongoDB connection...');
  console.log('Connection String:', process.env.MONGO_URI);

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!');

    const db = mongoose.connection.db;
    console.log('📊 Database:', db.databaseName);

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));

    // Check if products exist
    const productCount = await db.collection('products').countDocuments();
    console.log('📦 Products in database:', productCount);

    if (productCount === 0) {
      console.log('⚠️  No products found. Run seed script: node seed-products.js');
    } else {
      console.log('✅ Products are ready!');
    }

  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);

    console.log('\n🔧 Troubleshooting:');
    console.log('1. For MongoDB Atlas: Update MONGO_URI with your cluster connection string');
    console.log('2. For Local MongoDB: Make sure mongod is running on port 27017');
    console.log('3. Check your internet connection for Atlas');

  } finally {
    await mongoose.connection.close();
  }
}

checkConnection();