// =====================================================================
//  db.js — DATABASE CONNECTION FILE
// =====================================================================
//
//  🤔 What is this file?
//  ---------------------
//  This file has ONE job → Connect our Node.js app to MongoDB database.
//
//  Think of it like plugging a cable between your app and the database.
//  Without this connection, your app can't read or write any data.
//
//  📌 We use "mongoose" library to connect to MongoDB.
//     Mongoose = ODM (Object Data Modeling) library for MongoDB & Node.js
//     It gives us a cleaner, structured way to interact with MongoDB.
//
// =====================================================================

const mongoose = require("mongoose");

// MongoDB connection string (URI)
// Format: mongodb://username:password@host:port/databaseName
// For local MongoDB:  "mongodb://localhost:27017/myDatabase"
// For MongoDB Atlas:  "mongodb+srv://user:pass@cluster.mongodb.net/myDatabase"

const MONGO_URI = "mongodb://localhost:27017/namasteNodeDB";

// =====================================================================
//  connectDB() — Function to establish the connection
// =====================================================================
//
//  Why async/await?
//  → Connecting to a database takes time (it's an I/O operation)
//  → We use async/await so our code WAITS until connection is done
//    before doing anything else.
//
//  Why a separate function?
//  → So we can call it from our main server file (app.js)
//  → Keeps the code modular and clean (Separation of Concerns)
//
// =====================================================================

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);

        // conn.connection.host tells us WHERE we connected
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database Name: ${conn.connection.name}`);
    } catch (error) {
        // If connection fails (wrong URI, MongoDB not running, etc.)
        console.error(`❌ MongoDB Connection Error: ${error.message}`);

        // process.exit(1) → Stop the entire app
        // Why? Because if DB is down, our app is useless anyway
        // Exit code 1 = "exited due to failure"
        // Exit code 0 = "exited successfully" (normal shutdown)
        process.exit(1);
    }
};

// Export the function so other files can use it
module.exports = connectDB;

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. mongoose.connect(URI) →
//     Establishes a persistent connection to MongoDB.
//     Mongoose internally maintains a "connection pool" (multiple
//     connections) so your app can handle many requests simultaneously.
//
//  2. Connection States:
//     0 = disconnected
//     1 = connected
//     2 = connecting
//     3 = disconnecting
//     Check with: mongoose.connection.readyState
//
//  3. Why not connect in every file?
//     → We connect ONCE when the app starts.
//     → Mongoose reuses that single connection everywhere.
//     → This is efficient — opening a new connection each time is SLOW.
//
// =====================================================================
