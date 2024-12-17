module.exports = {
    init: __init,
    final: __final,
    get_db: __get_db
}

const { MongoClient } = require("mongodb")
const fs = require("fs").promises

const MONGO_URI = "mongodb+srv://kyesjh:6fI0LzAzk8gTILfT@cluster0.5n9fk.mongodb.net/book?retryWrites=true&w=majority"

const utility = require("../utility.js")

let client = null

async function __init()
{
    client = new MongoClient(MONGO_URI)

    try
    {
        await client.connect()
        utility.printLogWithName("Connected to MongoDB.", "DB")
    }
    catch (error)
    {

    }
}

async function __final()
{
    await client.close()
    utility.printLogWithName("MongoDB connection closed.", "DB")
}

function __get_db(dbName)
{
    return client.db(dbName)
}