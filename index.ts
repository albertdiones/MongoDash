const mongoose = require('mongoose');
require('dotenv').config();

async function getIndexCounts() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MongoDB URI not provided in the .env file.");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\t${collectionName}: ${await db.collection(collectionName).countDocuments({})}`);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = getIndexCounts;

// Invoke the function
getIndexCounts();