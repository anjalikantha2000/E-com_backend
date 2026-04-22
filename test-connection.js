const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...');
console.log('Connection String:', process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Failed!');
    console.log('Error:', err.message);
    process.exit(1);
  });