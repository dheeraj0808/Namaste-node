// =====================================================================
//  Episode 12 — Logical DB Query & Compound Indexes
// =====================================================================

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: String, lastName: String,
    email: { type: String, unique: true },
    age: Number, gender: String, city: String,
    skills: [String], isActive: Boolean,
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// =====================================================================
//  1. COMPARISON OPERATORS
// =====================================================================
// $eq = Equal          →  { age: { $eq: 22 } }  or just { age: 22 }
// $ne = Not Equal      →  { gender: { $ne: "male" } }
// $gt = Greater Than   →  { age: { $gt: 18 } }
// $gte = Greater/Equal →  { age: { $gte: 18 } }
// $lt = Less Than      →  { age: { $lt: 30 } }
// $lte = Less/Equal    →  { age: { $lte: 30 } }
// $in = In array       →  { city: { $in: ["Delhi", "Mumbai"] } }
// $nin = Not in array  →  { city: { $nin: ["Delhi"] } }
// Range: { age: { $gte: 18, $lte: 30 } }  → 18 to 30

// =====================================================================
//  2. LOGICAL OPERATORS
// =====================================================================
// $and → ALL conditions true (implicit by default)
// User.find({ age: { $gte: 18 }, gender: "male" })  ← implicit $and
//
// $or → ANY ONE condition true
// User.find({ $or: [{ city: "Delhi" }, { city: "Mumbai" }] })
//
// $not → Negate a condition
// User.find({ age: { $not: { $lt: 18 } } })

// =====================================================================
//  3. QUERY HELPERS (sort, limit, skip, select)
// =====================================================================
//
// SELECT → Sirf specific fields laao
// User.find({}).select("firstName email age")
// User.find({}).select("-password -__v")  ← exclude
//
// SORT → 1 = ascending, -1 = descending
// User.find({}).sort({ age: 1 })
//
// PAGINATION:
// Page 1: User.find({}).skip(0).limit(10)
// Page 2: User.find({}).skip(10).limit(10)
// Page 3: User.find({}).skip(20).limit(10)
//
// COMBINED:
// User.find({ isActive: true })
//   .select("firstName email age")
//   .sort({ age: 1 })
//   .skip(10).limit(10)

// =====================================================================
//  4. COMPOUND INDEXES (Speed up queries!)
// =====================================================================
// Without Index: MongoDB scans ALL documents (slow on lakhs of data)
// With Index: Jumps directly to matching documents (fast!)
//
// Single Index:
userSchema.index({ email: 1 });
//
// Compound Index (2+ fields queried together):
userSchema.index({ gender: 1, age: -1 });
// ✅ Works for: find({ gender: "male" }).sort({ age: -1 })
// ❌ Won't help: find({ age: { $gt: 18 } }) ← gender missing!
//
// Text Index (for search):
userSchema.index({ firstName: "text", lastName: "text" });
// User.find({ $text: { $search: "Ujjwal" } })

// =====================================================================
//  🧠 KEY POINTS:
// =====================================================================
//  1. .skip() + .limit() = PAGINATION
//  2. Compound Index order matters (left-most field first)
//  3. Too many indexes = slow WRITES (insert/update)
//  4. Use .explain("executionStats") to check if index is used
//  5. $in is like SQL's IN clause
//  6. countDocuments() for total count
// =====================================================================

console.log("📝 MongoDB Queries & Indexes reference file");
