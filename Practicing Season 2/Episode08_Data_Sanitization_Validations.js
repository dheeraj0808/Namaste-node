// =====================================================================
//  Episode 08 — Data Sanitization & Schema Validations
// =====================================================================
//
//  🤔 Why Sanitization?
//  → User kuch bhi bhej sakta hai — galat data, script, SQL injection
//  → Humein data ko CLEAN karna padta hai before saving to DB
//
//  🤔 Why Validation?
//  → Schema level pe rules lagao → Invalid data DB mein jaaye hi nahi
//
//  Sanitization = Data ko CLEAN karna (trim, lowercase, remove scripts)
//  Validation   = Data ko CHECK karna (sahi format hai ya nahi)
//
// =====================================================================

const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

// =====================================================================
//  1. SCHEMA-LEVEL VALIDATION (Mongoose ke andar)
// =====================================================================

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        minLength: [2, "Minimum 2 characters"],
        maxLength: [50, "Maximum 50 characters"],
        trim: true, // "  Ujjwal  " → "Ujjwal" (sanitization)
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true, // "UJJWAL@GMAIL.COM" → "ujjwal@gmail.com" (sanitization)
        trim: true,
        match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, "Invalid email format"],
    },

    password: {
        type: String,
        required: true,
        minLength: [8, "Password must be at least 8 characters"],
    },

    age: {
        type: Number,
        min: [13, "Must be at least 13"],
        max: [120, "Invalid age"],
    },

    gender: {
        type: String,
        enum: {
            values: ["male", "female", "other"],
            message: "{VALUE} is not valid",
        },
    },

    bio: {
        type: String,
        maxLength: 300,
        default: "Hey there!",
    },
});

// =====================================================================
//  2. CUSTOM VALIDATOR (Apna validation rule banana)
// =====================================================================

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        // Custom validator function
        validate: {
            validator: function (value) {
                return value > 0; // Price must be positive
            },
            message: "Price must be greater than 0",
        },
    },
    category: {
        type: String,
        enum: ["electronics", "clothing", "food", "books"],
    },
});

// =====================================================================
//  3. API-LEVEL SANITIZATION (Route mein data clean karna)
// =====================================================================

// Allowed fields — Sirf yahi fields update ho sakti hain
const ALLOWED_UPDATES = ["firstName", "lastName", "age", "gender", "bio"];

app.patch("/users/:id", async (req, res) => {
    try {
        // Check: Kya user allowed fields hi bhej raha hai?
        const updates = Object.keys(req.body);
        const isValid = updates.every((field) => ALLOWED_UPDATES.includes(field));

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid fields! Allowed: " + ALLOWED_UPDATES.join(", "),
            });
        }

        // Agar koi password ya email change karne ki koshish kare → BLOCK!
        // This prevents users from changing sensitive fields through PATCH

        res.json({ success: true, message: "User updated" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// =====================================================================
//  4. SANITIZE INPUT — Remove dangerous characters
// =====================================================================

// Simple sanitize function
const sanitizeInput = (input) => {
    if (typeof input !== "string") return input;

    return input
        .trim()                           // Remove whitespace
        .replace(/</g, "&lt;")           // Prevent HTML injection
        .replace(/>/g, "&gt;")           // Prevent HTML injection
        .replace(/\$/g, "")             // Remove $ (MongoDB operator injection)
        .replace(/\{/g, "")             // Remove { (object injection)
        .replace(/\}/g, "");            // Remove } (object injection)
};

// Usage in route
app.post("/users", (req, res) => {
    const cleanData = {
        firstName: sanitizeInput(req.body.firstName),
        email: sanitizeInput(req.body.email),
        bio: sanitizeInput(req.body.bio),
    };

    // Now cleanData is safe to use
    res.json({ success: true, data: cleanData });
});

// =====================================================================
//  5. HANDLING VALIDATION ERRORS (Mongoose errors ko clean karna)
// =====================================================================

app.post("/signup", async (req, res) => {
    try {
        const User = mongoose.model("User", userSchema);
        const user = new User(req.body);
        await user.validate(); // Manually validate before saving

        // await user.save();
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        // Mongoose validation error
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: messages,
                // Example output: ["First name is required", "Invalid email format"]
            });
        }

        // Duplicate key error (unique field)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists!",
            });
        }

        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(3000, () => console.log("🚀 Server on port 3000"));

// =====================================================================
//  🧠 KEY POINTS:
// =====================================================================
//
//  1. SANITIZATION = Clean the data (trim, lowercase, remove scripts)
//  2. VALIDATION   = Check the data (required, min, max, enum, match)
//  3. Always WHITELIST allowed fields for update (ALLOWED_UPDATES)
//  4. Never trust user input — hamesha validate + sanitize karo
//  5. Mongoose validators sirf save()/validate() pe chalte hain
//     → findByIdAndUpdate mein chahiye toh { runValidators: true } do
//  6. Common attacks prevented:
//     → XSS (Cross-Site Scripting) — HTML/JS injection
//     → NoSQL Injection — MongoDB operator injection ($gt, $ne)
//
// =====================================================================
