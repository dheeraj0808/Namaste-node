// =====================================================================
//  Episode 05 — Keeping Our Credentials Safe Using dotenv Files
// =====================================================================
//
//  🤔 Problem kya hai?
//  --------------------
//  Imagine you write this in your code:
//
//     const password = "mySuperSecretPassword123";
//     const apiKey = "sk-abc123xyz456";
//
//  Then you push to GitHub → EVERYONE can see your passwords! 😱
//  Hackers specifically search GitHub for leaked API keys.
//
//  📌 Solution: .env files
//  → Store secrets in a separate file (.env)
//  → NEVER push .env to GitHub (add to .gitignore)
//  → Your code reads from .env file instead of hardcoding
//
// =====================================================================

// =====================================================================
//  STEP 1: Install dotenv package
// =====================================================================
//  npm install dotenv

// =====================================================================
//  STEP 2: Create .env file (in project root)
// =====================================================================
//
//  📄 .env file contents:
//
//  # Database
//  MONGO_URI=mongodb+srv://ujjwal:mypassword@cluster.mongodb.net/myDB
//  DB_NAME=namasteNodeDB
//
//  # Server
//  PORT=3000
//  NODE_ENV=development
//
//  # AWS Credentials
//  AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
//  AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
//  AWS_REGION=ap-south-1
//
//  # JWT Secret (for authentication tokens)
//  JWT_SECRET=my-ultra-secret-jwt-key-dont-share
//  JWT_EXPIRY=7d
//
//  # Email
//  EMAIL_FROM=noreply@ujjwal.com
//
//  📌 RULES for .env file:
//  → NO spaces around = sign (KEY=value ✅, KEY = value ❌)
//  → NO quotes needed (but can use them for values with spaces)
//  → Comments start with #
//  → Each variable on its own line
//
// =====================================================================

// =====================================================================
//  STEP 3: Load .env in your app
// =====================================================================

// This line MUST be at the very TOP of your entry file (app.js / server.js)
// It reads .env file and puts all variables into process.env
require("dotenv").config();

// Now you can access any .env variable like this:
console.log("Database:", process.env.MONGO_URI);
console.log("Port:", process.env.PORT);
console.log("Environment:", process.env.NODE_ENV);

// =====================================================================
//  STEP 4: Use in your actual code
// =====================================================================

const express = require("express");
const mongoose = require("mongoose");

const app = express();

// ---- Database Connection (using .env) ----
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Connected to ${process.env.DB_NAME}`);
    } catch (error) {
        console.error("❌ DB Error:", error.message);
        process.exit(1);
    }
};

// ---- JWT Secret (using .env) ----
// const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//   expiresIn: process.env.JWT_EXPIRY
// });

// ---- AWS Config (using .env) ----
// const sesClient = new SESClient({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// =====================================================================
//  STEP 5: Add .env to .gitignore (MOST IMPORTANT!)
// =====================================================================
//
//  📄 .gitignore file:
//
//  # Environment variables — NEVER push to GitHub
//  .env
//  .env.local
//  .env.production
//
//  # Node modules
//  node_modules/
//
//  📌 If you already pushed .env to GitHub by mistake:
//  → git rm --cached .env
//  → git commit -m "Remove .env from tracking"
//  → git push
//  → Then CHANGE ALL YOUR PASSWORDS/KEYS (they are compromised!)
//
// =====================================================================

// =====================================================================
//  BONUS: .env.example file (share the STRUCTURE, not the VALUES)
// =====================================================================
//
//  📄 .env.example (this file IS pushed to GitHub):
//
//  # Database
//  MONGO_URI=your_mongodb_connection_string_here
//  DB_NAME=your_database_name
//
//  # Server
//  PORT=3000
//  NODE_ENV=development
//
//  # AWS
//  AWS_ACCESS_KEY_ID=your_aws_access_key
//  AWS_SECRET_ACCESS_KEY=your_aws_secret_key
//  AWS_REGION=ap-south-1
//
//  # JWT
//  JWT_SECRET=your_jwt_secret_here
//  JWT_EXPIRY=7d
//
//  📌 This tells other developers WHAT variables they need,
//     without revealing YOUR actual values. Smart! 🧠
//
// =====================================================================

// =====================================================================
//  BONUS: Different .env for different environments
// =====================================================================
//
//  .env.development  → Local machine settings
//  .env.production   → Live server settings
//  .env.test         → Testing environment
//
//  Load specific file:
//  require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
//
// =====================================================================

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. process.env = Node.js ka built-in object that stores all
//     environment variables. dotenv package adds .env file values to it.
//
//  2. All .env values are STRINGS
//     → process.env.PORT = "3000" (string, not number!)
//     → Use Number(process.env.PORT) if you need a number
//     → process.env.IS_PROD = "true" (string, not boolean!)
//     → Use process.env.IS_PROD === "true" for checks
//
//  3. Default values pattern:
//     const port = process.env.PORT || 3000;
//     → If PORT is not set in .env, use 3000 as fallback
//
//  4. NEVER log credentials in production!
//     console.log(process.env.JWT_SECRET) ← WRONG in production!
//
//  5. On production servers (EC2, Heroku, etc.):
//     → You often set env variables DIRECTLY on the server
//     → No .env file needed on production
//     → AWS EC2: export PORT=3000 (in terminal)
//     → Heroku: heroku config:set PORT=3000
//
// =====================================================================
