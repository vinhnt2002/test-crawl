const { MongoClient } = require("mongodb");

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://bohubo2:bohubo2025@tts01.apczpp3.mongodb.net/";
const DATABASE_NAME = process.env.DATABASE_NAME || "tiktokshopV1";

let db = null;

const create_db_tiktokshop = async () => {
  if (db) {
    return db;
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db(DATABASE_NAME);
    
    // Create collections if they don't exist
    const collections = ['tiktoks', 'seller_ids', 'keywords', 'settings'];
    for (const collectionName of collections) {
      try {
        await database.createCollection(collectionName);
        console.log(`Collection ${collectionName} created or already exists`);
      } catch (error) {
        // Collection might already exist, which is fine
        if (error.code !== 48) {
          console.log(`Collection ${collectionName} already exists or error:`, error.message);
        }
      }
    }

    db = {
      tiktoks: database.collection('tiktoks'),
      seller_ids: database.collection('seller_ids'),
      keywords: database.collection('keywords'),
      settings: database.collection('settings')
    };

    // Create indexes for better performance
    await db.tiktoks.createIndex({ product_id: 1 }, { unique: true });
    await db.seller_ids.createIndex({ seller_id: 1 }, { unique: true });
    await db.keywords.createIndex({ keyword: 1 }, { unique: true });

    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

module.exports = create_db_tiktokshop; 