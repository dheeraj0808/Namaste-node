const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connected ✅");
        // ...perform database operations here...
    } catch (err) {
        console.error("Connection Error:", err.message);
    } finally {
        await client.close();
    }
}

run();