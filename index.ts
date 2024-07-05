    const {Logger} = require('add_logger');

const mongoose = require('mongoose');
require('dotenv').config();


const logger  = new Logger('default');

const uri = process.env.MONGO_URL;
if (!uri) {
    const error = "MongoDB URI not provided in the .env file.";
    logger.error(error);
    throw error;
}
logger.debug("Connecting to db:", uri);
await mongoose.connect(uri);
logger.debug("Connected to db:", uri);

const db = mongoose.connection.db;


const fs = require('fs');

// Load the config file
const configPath = './config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const collections = await db.listCollections().toArray();
interface collectionCountResult {name: string, count: number};
async function getIndexCounts(): Promise<collectionCountResult[]>  {
    const results: Array<Promise<collectionCountResult>>   = [];

    try {

    for (const collection of collections) {
        results.push(getCollectionCount(collection.name));
    }
    } catch (err) {
    logger.error("Error:", err);
    }
    return Promise.all(results);
}

function getCollectionCount(collectionName: string): Promise<collectionCountResult> {
    return db.collection(collectionName).countDocuments({}).then(
        (count: number) =>( {name: collectionName,count})
    )
}
function clearConsole() {
    // Print enough newline characters to scroll the current content out of view
    process.stdout.write('\x1B[2J\x1B[H');
}

function showCollectionCounts(counts: Array<collectionCountResult>) {
    counts.forEach(
        (count: collectionCountResult) => {
            logger.log(`${count.name}: ${count.count}`);
        }
    );
}


async function getExtraQueryCounts() {
  try {
    const counts = [];

    for (const query of config.extra_queries) {
      const collection = db.collection(query.collection);
      const count = await collection.countDocuments(query.filter);
      counts.push({ name: query.name, count });
    }
    showCollectionCounts(counts);
  } catch (err) {
    console.error("Error:", err);
  }
}

export async function continuousIndexCounts() {
    const collectionCounts = await getIndexCounts();
    clearConsole();
    showCollectionCounts(collectionCounts);
    await getExtraQueryCounts();
    Bun.sleep(1000).then(continuousIndexCounts)
}