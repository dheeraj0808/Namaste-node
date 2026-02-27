// =====================================================================
//  schema.js — SCHEMA DEFINITION FILE
// =====================================================================
//
//  🤔 What is a Schema?
//  ---------------------
//  Schema = The BLUEPRINT / STRUCTURE of your data.
//
//  Real-life analogy:
//  → Think of an Aadhaar Card form. It has fixed fields:
//    Name (required), DOB (required), Address, Phone Number, Photo
//    You can't just write random stuff — it has RULES.
//
//  Similarly, a Schema defines:
//  → WHAT fields your data will have
//  → WHAT type each field is (String, Number, Date, etc.)
//  → WHICH fields are required and which are optional
//  → DEFAULT values, validation rules, etc.
//
//  📌 Without Schema → MongoDB will accept ANY random data (chaos!)
//     With Schema    → Data is consistent, validated, and reliable
//
// =====================================================================

const mongoose = require("mongoose");

// =====================================================================
//  USER SCHEMA — Blueprint for a "User" document
// =====================================================================

const userSchema = new mongoose.Schema(
    {
        // ---- firstName ----
        // Type: String → must be text
        // required: true → this field MUST be provided, cannot be empty
        // minLength/maxLength → controls how short/long the name can be
        // trim: true → removes spaces from start and end ("  Ujjwal  " → "Ujjwal")
        firstName: {
            type: String,
            required: [true, "First name is required"], // Custom error message
            minLength: [2, "First name must be at least 2 characters"],
            maxLength: [50, "First name cannot exceed 50 characters"],
            trim: true,
        },

        // ---- lastName ----
        // Not required → optional field
        lastName: {
            type: String,
            trim: true,
            maxLength: 50,
        },

        // ---- email ----
        // unique: true → No two users can have the same email
        // lowercase: true → "UJJWAL@Gmail.COM" → "ujjwal@gmail.com"
        // match → Regex validation to ensure valid email format
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true, // Creates a unique INDEX in MongoDB
            lowercase: true,
            trim: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please enter a valid email",
            ],
        },

        // ---- password ----
        // In production, you would HASH this before saving (using bcrypt)
        // Never store plain-text passwords!
        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: [8, "Password must be at least 8 characters"],
        },

        // ---- age ----
        // min/max → numeric range validation
        age: {
            type: Number,
            min: [13, "Must be at least 13 years old"],
            max: [120, "Age seems invalid"],
        },

        // ---- gender ----
        // enum → Only these EXACT values are allowed, nothing else
        // "male", "female", "other" → ✅
        // "xyz", "abc" → ❌ Validation Error!
        gender: {
            type: String,
            enum: {
                values: ["male", "female", "other"],
                message: "{VALUE} is not a valid gender",
            },
        },

        // ---- skills ----
        // [String] → Array of Strings
        // Example: ["JavaScript", "Node.js", "React"]
        skills: {
            type: [String],
            default: [], // If not provided, empty array
        },

        // ---- bio ----
        // default → If user doesn't provide a bio, this value is used
        bio: {
            type: String,
            default: "Hey there! I am new here.",
            maxLength: [500, "Bio cannot exceed 500 characters"],
        },

        // ---- profilePic ----
        // Stores a URL to the profile image
        profilePic: {
            type: String,
            default: "https://via.placeholder.com/150",
        },

        // ---- isActive ----
        // Boolean → true or false only
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        // =====================================================================
        //  Schema OPTIONS (2nd argument to mongoose.Schema)
        // =====================================================================

        // timestamps: true → Mongoose automatically adds TWO fields:
        //   createdAt → when the document was first created
        //   updatedAt → when the document was last modified
        // You don't need to manage these yourself!
        timestamps: true,
    }
);

// Export the schema so model.js can use it
module.exports = userSchema;

// =====================================================================
//  🧠 SCHEMA vs MODEL — What's the difference?
// =====================================================================
//
//  Schema = BLUEPRINT (defines structure & rules)
//           → Like a class definition in OOP
//           → Schema alone can't read/write data
//
//  Model  = CONSTRUCTOR (creates actual documents using the Schema)
//           → Like creating objects from a class
//           → Model gives you methods: find(), create(), update(), delete()
//
//  Flow:   Schema → Model → Documents (actual data in DB)
//
// =====================================================================
//
//  📌 COMMON SCHEMA TYPES:
//
//  String    → "Ujjwal", "hello@email.com"
//  Number    → 22, 99.5
//  Boolean   → true, false
//  Date      → new Date(), Date.now
//  Array     → [String], [Number], [{nested}]
//  ObjectId  → Reference to another document (for relationships)
//  Buffer    → Binary data (files, images)
//  Mixed     → Any type (avoid this — loses validation)
//
// =====================================================================
//
//  📌 COMMON VALIDATORS:
//
//  required    → Field must be present
//  unique      → No duplicates allowed
//  default     → Fallback value if not provided
//  enum        → Only specific values allowed
//  min / max   → Number range
//  minLength / maxLength → String length range
//  match       → Regex pattern validation
//  trim        → Remove whitespace from edges
//  lowercase   → Convert to lowercase before saving
//  uppercase   → Convert to uppercase before saving
//
// =====================================================================
