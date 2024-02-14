const {Logger} = require('add_logger');

const mongoose = require('mongoose');
require('dotenv').config();


const logger  = new Logger('default');

async function getIndexCounts() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error("MongoDB URI not provided in the .env file.");
    return;
  }

  try {
    logger.debug("Connecting to db:", uri);
    await mongoose.connect(uri);
    logger.debug("Connected to db:", uri);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      logger.log(`${collectionName}: ${await db.collection(collectionName).countDocuments({})}`);
    }
  } catch (err) {
    logger.error("Error:", err);
  }
}

module.exports = getIndexCounts;

// Invoke the function
getIndexCounts();