require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔍 Testing Database Connection...');
  console.log('Connection String:', process.env.MONGO_URI);
  console.log('Testing connection...');

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);

    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);

    // Test if we can create a collection
    const testCollection = mongoose.connection.db.collection('test_connection');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Database write test successful');

    // Clean up test data
    await testCollection.deleteMany({ test: true });

    console.log('🎉 MongoDB Atlas is working perfectly!');
    console.log('💡 You can now run: node seed-products.js');

  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed!');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify MongoDB Atlas cluster is running');
    console.log('3. Check Network Access in MongoDB Atlas (allow 0.0.0.0/0)');
    console.log('4. Verify username and password in connection string');
    console.log('5. Try using MongoDB Compass to test connection');
    console.log('\n💡 For now, the app will run in demo mode');
    console.log('   To enable demo mode, set: USE_DEMO_MODE=true');

  } finally {
    await mongoose.connection.close();
  }
}

testConnection();