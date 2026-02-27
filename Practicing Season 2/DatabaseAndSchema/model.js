// =====================================================================
//  model.js — MODEL CREATION FILE
// =====================================================================
//
//  🤔 What is a Model?
//  --------------------
//  Schema sirf blueprint hai — usne bataya ki data KAISA dikhega.
//  But Schema se directly database mein read/write NAHI kar sakte.
//
//  Model = Schema ko "power" deta hai.
//  Model ek CONSTRUCTOR hai jo Schema se actual documents banata hai
//  aur database ke saath interact karta hai.
//
//  Real-life analogy:
//  → Schema = Car ka design drawing (blueprint)
//  → Model  = Factory jo us design se actual cars banati hai
//  → Document = Actual car (data in database)
//
//  📌 Model provides methods like:
//     .find()           → Get data
//     .findById()       → Get by ID
//     .create()         → Insert new data
//     .findByIdAndUpdate()  → Update data
//     .findByIdAndDelete()  → Delete data
//
// =====================================================================

const mongoose = require("mongoose");
const userSchema = require("./schema"); // Import the Schema we created

// =====================================================================
//  Creating the Model
// =====================================================================
//
//  mongoose.model("ModelName", schema)
//
//  → 1st argument: "User" — Name of the model (Singular, Capitalized)
//     MongoDB will automatically create a COLLECTION called "users"
//     (lowercase + plural). This is Mongoose's convention:
//       "User"    → collection "users"
//       "Post"    → collection "posts"
//       "Product" → collection "products"
//
//  → 2nd argument: userSchema — The schema blueprint to use
//
// =====================================================================

const User = mongoose.model("User", userSchema);

// Export the Model so other files (routes, controllers) can use it
module.exports = User;

// =====================================================================
//  🧠 HOW TO USE THIS MODEL (in your route files)
// =====================================================================
//
//  const User = require("./DatabaseAndSchema/model");
//
//  ---- CREATE (Insert new user) ----
//  const newUser = await User.create({
//    firstName: "Ujjwal",
//    email: "ujjwal@example.com",
//    password: "mypassword123",
//    age: 22,
//    gender: "male",
//    skills: ["JavaScript", "Node.js"]
//  });
//
//  ---- READ (Find users) ----
//  const allUsers = await User.find();              // Get ALL users
//  const oneUser  = await User.findById("64a...");  // Get by ID
//  const filtered = await User.find({ age: 22 });   // Get users with age 22
//  const byEmail  = await User.findOne({ email: "ujjwal@example.com" });
//
//  ---- UPDATE ----
//  const updated = await User.findByIdAndUpdate(
//    "64a...",                           // ID of user to update
//    { age: 23, bio: "Updated bio" },    // New values
//    { new: true, runValidators: true }  // Options (explained below)
//  );
//  // new: true → return the UPDATED document (default returns OLD one)
//  // runValidators: true → still validate the new data against schema
//
//  ---- DELETE ----
//  const deleted = await User.findByIdAndDelete("64a...");
//
// =====================================================================
//
//  📌 THE COMPLETE FLOW:
//
//  ┌──────────────────────────────────────────────────┐
//  │                                                  │
//  │   db.js          →  Connect to MongoDB           │
//  │     ↓                                            │
//  │   schema.js      →  Define structure & rules     │
//  │     ↓                                            │
//  │   model.js       →  Create Model from Schema     │
//  │     ↓                                            │
//  │   app.js/routes  →  Use Model to CRUD data       │
//  │     ↓                                            │
//  │   MongoDB        →  Data stored in collections   │
//  │                                                  │
//  └──────────────────────────────────────────────────┘
//
// =====================================================================
