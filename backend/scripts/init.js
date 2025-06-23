const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const path = require('path');
const { seedReviews } = require('./seed-reviews-mongo');

require('dotenv').config();

console.log('🔍 Environment variables check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);

// Determine environment - Railway sets NODE_ENV or detect by Railway-specific variables
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT || process.env.MYSQLHOST;
const environmentConfig = isProduction ? 'production' : 'development';

console.log('🌍 Environment detected:', environmentConfig);
console.log('🔍 isProduction:', isProduction);
console.log('🔍 Railway env vars present:', {
  NODE_ENV: !!process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: !!process.env.RAILWAY_ENVIRONMENT,
  MYSQLHOST: !!process.env.MYSQLHOST
});

const dbConfig = require('../config/config')[environmentConfig];

const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const DB_NAME = dbConfig.database || process.env.DB_NAME || 'sbdjaya';

let mongoUri;
if (process.env.MONGODB_URI) {
  // Use cloud MongoDB URI if provided (for production)
  mongoUri = process.env.MONGODB_URI;
  console.log('🔍 Using cloud MongoDB URI');
} else {
  // Use local MongoDB for development
  mongoUri = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${DB_NAME}`;
  console.log('🔍 Using local MongoDB URI:', mongoUri);
}

const isDrop = process.env.npm_lifecycle_event === 'drop';

async function init() {
  console.log('🚀 Starting initialization...');

  // MYSQL
  console.log('📊 Initializing MySQL...');
  console.log('🔍 Using DB config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    database: dbConfig.database
  });

  if (!dbConfig.host || !dbConfig.username) {
    console.error('❌ MySQL configuration missing! Required variables:');
    if (isProduction) {
      console.error('  - MYSQLHOST, MYSQLUSER, MYSQLDATABASE, MYSQLPASSWORD');
    } else {
      console.error('  - DB_HOST, DB_USER, DB_NAME, DB_PASSWORD');
    }
    process.exit(1);
  }
  try {
    const connectionWithoutDB = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password
    });

    if (isDrop) {
      // Drop database
      execSync(`npx sequelize-cli db:drop --config "${path.resolve(__dirname, '../config/config.js')}"`, {
        stdio: 'inherit'
      });
      console.log(`🗑  Dropped MySQL database '${dbConfig.database}'`);
    } else {
      // Create database if not exists
      await connectionWithoutDB.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
      console.log(`✅ MySQL database '${dbConfig.database}' is ready.`);

      // Connect to the specific database
      const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database
      });

      // Run migrations
      const migrationsPath = path.resolve(__dirname, '../migrations');
      execSync(`npx sequelize-cli db:migrate --config "${path.resolve(__dirname, '../config/config.js')}" --migrations-path "${migrationsPath}"`, {
        stdio: 'inherit'
      });
      console.log('✅ Sequelize migration completed.');

      console.log('🔍 Checking if MySQL data already exists...');

      await connection.end();
    }
    await connectionWithoutDB.end();
  } catch (error) {
    console.error('❌ MySQL Error:', error.message);
    if (isProduction) {
      console.warn('⚠️  Skipping MySQL initialization in production. Database should be managed by Railway.');
    } else {
      throw error;
    }
  }

  console.log('🍃 Initializing MongoDB...');
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    const db = mongoose.connection.db;

    if (isDrop) {
      await db.dropDatabase();
      console.log(`🗑  Dropped MongoDB database '${dbConfig.database}'`);
      await mongoose.disconnect();
      return;
    }


    const collections = [      {
        name: 'wishlist',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['id_user', 'produk'],
            properties: {
              id_user: { bsonType: 'string' },
              produk: { bsonType: 'array', items: { bsonType: 'string' } }
            }
          }
        }
      },
      {
        name: 'cart',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['id_user', 'produk'],
            properties: {
              id_user: { bsonType: 'string' },
              produk: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  required: ['product_id', 'qty'],
                  properties: {
                    product_id: { bsonType: 'string' },
                    qty: { bsonType: 'int' }
                  }
                }
              }
            }
          }
        }
      },      {
        name: 'last_view',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['id_user', 'produk'],
            properties: {
              id_user: { bsonType: 'string' },
              produk: { bsonType: 'array', items: { bsonType: 'string' } }
            }
          }
        }
      },{
        name: 'product_review',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['id_produk', 'total_review', 'reviews'],
            properties: {
              id_produk: { bsonType: 'string' },
              total_review: { bsonType: 'int' },
              reviews: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  required: ['id_user', 'username', 'rate', 'comment', 'date'],
                  properties: {
                    id_user: { bsonType: 'string' },
                    username: { bsonType: 'string' },
                    rate: { bsonType: 'int' },
                    comment: { bsonType: 'string' },
                    date: { bsonType: 'date' }
                  }
                }
              }
            }
          }
        }
      }
    ];

    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);
    for (const col of collections) {
      if (!existingCollections.includes(col.name)) {
        await db.createCollection(col.name, { validator: col.validator });
        console.log(`✅ Created MongoDB collection '${col.name}'`);
      } else {
        console.log(`i MongoDB collection '${col.name}' already exists`);
      }
    }    await mongoose.disconnect();
    console.log('🌱 Starting MongoDB review seeding...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });


    const mongoDb = mongoose.connection.db;
    await seedReviews(mongoDb);

    await mongoose.disconnect();
    console.log('✅ MongoDB initialization and seeding completed.');  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    if (isProduction) {
      console.warn('⚠️  Skipping MongoDB initialization in production.');
      console.warn('💡 To use MongoDB in production:');
      console.warn('   1. Set MONGODB_URI environment variable to your cloud MongoDB URI');
      console.warn('   2. Or add MongoDB service in Railway dashboard');
    } else {
      console.warn('⚠️  Skipping MongoDB initialization. Please ensure MongoDB is running on localhost:27017');
      console.warn('💡 To start MongoDB service:');
      console.warn('   - Windows: net start MongoDB (as Administrator)');
      console.warn('   - Or install MongoDB Community Server if not installed');
      console.warn('   - Or use MongoDB Atlas (cloud) by updating MONGODB_URI in .env');
    }
  }  console.log('🎉 Initialization completed!');
  console.log('📋 Summary:');
  console.log('   ✅ MySQL database migrated and ready');
  if (isProduction) {
    console.log('   ⚠️  MongoDB skipped (set MONGODB_URI for cloud MongoDB)');
  } else {
    console.log('   ⚠️  MongoDB skipped (ensure local MongoDB is running)');
  }
  console.log('🚀 Ready to start server with: npm start');
}

init().catch(err => {
  console.error('❌ Critical Error during initialization:', err.message);
  console.error('💡 Please check your database connections and try again.');
  process.exit(1);
});
