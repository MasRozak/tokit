
const { MongoClient } = require("mongodb");

require('dotenv').config();

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT || process.env.MYSQLHOST;

let MONGO_URI;
if (process.env.MONGODB_URI) {
  // Use cloud MongoDB URI if provided (for production)
  MONGO_URI = process.env.MONGODB_URI;
  console.log('🔍 Using cloud MongoDB URI');
} else {
  // Use local MongoDB for development
  const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1';
  const MONGO_PORT = process.env.MONGO_PORT || '27017';
  const DB_NAME = process.env.DB_NAME || 'sbdjaya';
  MONGO_URI = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${DB_NAME}`;
  console.log('🔍 Using local MongoDB URI:', MONGO_URI);
}

const client = new MongoClient(MONGO_URI);

let dbConnection;

const connectDB = async () => {
  if (dbConnection) {
    console.log("MongoDB already connected ✅");
    return;
  }
  try {
    await client.connect();
    dbConnection = client.db();
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.warn("⚠️  MongoDB connection error:", err.message);
    if (isProduction) {
      console.warn("⚠️  MongoDB features will be disabled. Set MONGODB_URI for cloud MongoDB.");
    } else {
      console.warn("⚠️  MongoDB features will be disabled. Start local MongoDB or set MONGODB_URI.");
    }
    // Don't exit in production, just disable MongoDB features
    if (!isProduction) {
      process.exit(1);
    }
  }
};

const getDB = () => {
  if (!dbConnection) throw new Error("DB not connected");
  return dbConnection;
};

module.exports = { connectDB, getDB };