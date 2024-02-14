const {Logger} = require('add_logger');

const mongoose = require('mongoose');
require('dotenv').config();


const logger  = new Logger('default');

const uri = process.env.MONGODB_URI;
if (!uri) {
    const error = "MongoDB URI not provided in the .env file.";
    logger.error(error);
    throw error;
}
logger.debug("Connecting to db:", uri);
await mongoose.connect(uri);
logger.debug("Connected to db:", uri);

async function getIndexCounts() {

  try {
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
function clearConsole() {
    // Print enough newline characters to scroll the current content out of view
    process.stdout.write('\x1B[2J\x1B[H');
}


// Invoke the function

function continuousIndexCounts() {
    clearConsole();
    getIndexCounts();
    Bun.sleep(1000).then(continuousIndexCounts)
}

continuousIndexCounts();