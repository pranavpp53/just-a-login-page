const { MongoClient } = require("mongodb");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "login_signup_app";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

let client;
let database;

async function getDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    database = client.db(DB_NAME);
    await database.collection("users").createIndex({ email: 1 }, { unique: true });
  }

  return database;
}

module.exports = {
  getDatabase
};
