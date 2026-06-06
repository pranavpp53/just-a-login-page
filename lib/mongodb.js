const { MongoClient } = require("mongodb");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "login_signup_app";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

let client;
let database;
let connectionPromise;

async function getDatabase() {
  if (!connectionPromise) {
    client = new MongoClient(MONGODB_URI);
    connectionPromise = client.connect()
      .then(async connectedClient => {
        database = connectedClient.db(DB_NAME);
        await database.collection("users").createIndex({ email: 1 }, { unique: true });
        await database.collection("posts").createIndex({ createdAt: -1 });
        return database;
      });
  }

  return connectionPromise;
}

module.exports = {
  getDatabase
};
