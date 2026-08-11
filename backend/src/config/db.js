const mongoose = require('mongoose');
const { setupFallback } = require('./dbFallback');

// Disable Mongoose buffering so database calls do not hang if DB is offline
mongoose.set('bufferCommands', false);

// Initialize database fallback overrides
setupFallback();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wetalk_db';
    if (!uri) {
      console.warn('[WARNING] No MongoDB URI found in environment variables. Running in local fallback mode.');
      return;
    }
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Successfully connected to Atlas: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    console.warn('[MongoDB] The backend server will continue running in safe local fallback mode.');
  }
};

module.exports = connectDB;
