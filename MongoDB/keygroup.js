const { MongoClient } = require("mongodb");
const fs = require("fs").promises;

const MONGO_URI = "mongodb+srv://kyesjh:6fI0LzAzk8gTILfT@cluster0.5n9fk.mongodb.net/book?retryWrites=true&w=majority";
const LOG_FILE = "aggregation_log.json"; 

async function saveAggregationWithResume() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db("book");
    const sourceCollection = db.collection("bookkeywords");
    const targetCollection = db.collection("keygroup");

    let lastId = await readLog();

    while (true) {
      const query = lastId ? { _id: { $gt: lastId } } : {};
      const batch = await sourceCollection
        .find(query)
        .sort({ _id: 1 })
        .limit(500) 
        .toArray();

      if (batch.length === 0) {
        console.log("No more data to process.");
        break; 
      }

      //  파이프라인
      const pipeline = [
        { $match: { _id: { $in: batch.map((doc) => doc._id) } } },
        {
          $group: {
            _id: "$isbn13",
            keywords: { $push: { word: "$word", weight: "$weight" } },
          },
        },
        {
          $project: {
            _id: 0,
            isbn13: "$_id",
            keywords: 1,
          },
        },
      ];

      const results = await sourceCollection.aggregate(pipeline).toArray();

      // 결과 저장
      for (const result of results) {
        await targetCollection.updateOne(
          { isbn13: result.isbn13 },
          { $set: result }, 
          { upsert: true }
        );
      }

      lastId = batch[batch.length - 1]._id;
      await writeLog(lastId);

      console.log(`Processed batch up to _id: ${lastId}`);
    }
  } catch (err) {
    console.error("Error during aggregation:", err.message);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

async function readLog() {
  try {
    const data = await fs.readFile(LOG_FILE, "utf-8");
    const log = JSON.parse(data);
    return log.lastId || null;
  } catch {
    console.log("No log file found. Starting from the beginning.");
    return null;
  }
}

async function writeLog(lastId) {
  const log = { lastId };
  try {
    await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
    console.log(`Log updated: Last _id = ${lastId}`);
  } catch (err) {
    console.error("Failed to write log:", err.message);
  }
}

saveAggregationWithResume();
