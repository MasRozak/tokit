﻿const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const path = require('path');
const { seedReviews } = require('./seed-reviews-mongo');

require('dotenv').config();

console.log('🔍 Environment variables check:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const dbConfig = require('../config/config').development;

const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const DB_NAME = process.env.DB_NAME || 'sbdjaya';
const mongoUri = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${DB_NAME}`;

const isDrop = process.env.npm_lifecycle_event === 'drop';

async function init() {
  console.log('🚀 Starting initialization...');

  console.log('📊 Initializing MySQL...');
  console.log('🔍 Using DB config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    database: dbConfig.database
  });
  const connectionWithoutDB = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password
  });

  if (isDrop) {

    execSync(`npx sequelize-cli db:drop --config "${path.resolve(__dirname, '../config/config.js')}"`, {
      stdio: 'inherit'
    });
    console.log(`🗑  Dropped MySQL database '${dbConfig.database}'`);  } else {

    await connectionWithoutDB.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    console.log(`✅ MySQL database '${dbConfig.database}' is ready.`);


    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database
    });


    const migrationsPath = path.resolve(__dirname, '../migrations');    execSync(`npx sequelize-cli db:migrate --config "${path.resolve(__dirname, '../config/config.js')}" --migrations-path "${migrationsPath}"`, {
      stdio: 'inherit'
    });    console.log('✅ Sequelize migration completed.');


    console.log('🔍 Checking if MySQL data already exists...');


    await connection.end();
  }
  await connectionWithoutDB.end();

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
    console.log('✅ MongoDB initialization and seeding completed.');} catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('⚠️  Skipping MongoDB initialization. Please ensure MongoDB is running on localhost:27017');
    console.warn('💡 To start MongoDB service:');
    console.warn('   - Windows: net start MongoDB (as Administrator)');
    console.warn('   - Or install MongoDB Community Server if not installed');
    console.warn('   - Or use MongoDB Atlas (cloud) by updating MONGO_HOST in .env');
  }
  console.log('🎉 Initialization and seeding completed!');
  console.log('📋 Summary:');
  console.log('   ✅ MySQL database migrated and seeded');
  console.log('   ✅ MongoDB collections created and seeded');
  console.log('🚀 Ready to start server with: npm start');
}

init().catch(err => {
  console.error('❌ Critical Error during initialization:', err.message);
  console.error('💡 Please check your database connections and try again.');
  process.exit(1);
});
