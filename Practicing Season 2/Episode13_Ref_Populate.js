// =====================================================================
//  Episode 13 — ref, Populate & Thought Process of Writing APIs
// =====================================================================
//
//  🤔 ref & Populate kya hai?
//  → MongoDB mein RELATIONSHIPS banane ka tarika
//  → SQL mein Foreign Key hota hai, MongoDB mein ref + populate hai
//
//  Example: User ne Post likha → Post mein user ki ID store karo
//  → ref = "Ye field dusre collection ka ID store karega"
//  → populate = "ID ki jagah POORA document la do"
//
// =====================================================================

const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());

// =====================================================================
//  1. SCHEMAS WITH REFERENCES (ref)
// =====================================================================

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

// Post Schema — has reference to User
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },

    // ref: "User" → Ye field User collection ki ID store karega
    author: {
        type: mongoose.Schema.Types.ObjectId, // MongoDB ID type
        ref: "User",                          // Kis collection ka ID?
        required: true,
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Array of User IDs who liked
    }],

    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// =====================================================================
//  2. CREATING DATA WITH REFERENCES
// =====================================================================

app.post("/api/posts", async (req, res) => {
    try {
        const { title, content, authorId } = req.body;

        // authorId = User ki MongoDB ObjectId
        const post = await Post.create({
            title,
            content,
            author: authorId, // Sirf ID store hogi
        });

        res.status(201).json({ success: true, data: post });
        // Response: { author: "65abc123..." } ← Sirf ID dikhegi
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// =====================================================================
//  3. POPULATE — ID ki jagah POORA document laao
// =====================================================================

app.get("/api/posts", async (req, res) => {
    try {
        // WITHOUT populate:
        // { author: "65abc123..." }  ← Sirf ID (useless for frontend)

        // WITH populate:
        // { author: { _id: "65abc...", name: "Ujjwal", email: "..." } }  ← Full data!

        const posts = await Post.find()
            .populate("author", "name email")   // Populate author, sirf name & email
            .populate("likes", "name")          // Populate likes array
            .populate("comments.user", "name")  // Nested populate
            .sort({ createdAt: -1 });

        res.json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Single post with full details
app.get("/api/posts/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name email")
            .populate("comments.user", "name");

        if (!post) return res.status(404).json({ message: "Post not found" });

        res.json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// =====================================================================
//  4. THOUGHT PROCESS OF WRITING APIs
// =====================================================================
//
//  Step 1: KYA chahiye? (Requirements)
//  → "User apna profile edit kar sake"
//
//  Step 2: ROUTE decide karo
//  → PATCH /api/users/:id
//
//  Step 3: KON access karega? (Auth)
//  → Sirf logged-in user → authMiddleware lagao
//  → Sirf apna profile → check req.userId === req.params.id
//
//  Step 4: KYA accept karenge? (Validation)
//  → Allowed fields: name, bio, age (NOT email, password)
//  → Data sanitize karo
//
//  Step 5: DATABASE operation
//  → findByIdAndUpdate with runValidators: true
//
//  Step 6: RESPONSE bhejo
//  → Success: 200 + updated data
//  → Not found: 404
//  → Validation error: 400
//  → Server error: 500
//
// =====================================================================

// Example: Profile Edit API
const ALLOWED_EDITS = ["name", "age", "bio", "gender"];

app.patch("/api/users/:id", async (req, res) => {
    try {
        // Step 1: Validate fields
        const updates = Object.keys(req.body);
        const isValid = updates.every((f) => ALLOWED_EDITS.includes(f));
        if (!isValid) {
            return res.status(400).json({ message: "Invalid fields!" });
        }

        // Step 2: Update
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,            // Return updated document
            runValidators: true,  // Schema validators chalao
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Step 3: Respond
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

app.listen(3000, () => console.log("🚀 Server on port 3000"));

// =====================================================================
//  🧠 KEY POINTS:
// =====================================================================
//
//  1. ref = "Is field mein dusre collection ka ObjectId store hoga"
//  2. populate("field") = "ID ki jagah poora document laao"
//  3. populate("field", "name email") = Sirf specific fields laao
//  4. Nested populate = populate("comments.user", "name")
//  5. API likhne ka thought process:
//     Route → Auth → Validate → DB Operation → Response
//  6. ALWAYS whitelist allowed update fields
//  7. runValidators: true → Update mein bhi schema check hoga
//  8. new: true → Updated document return karo (not old one)
//
// =====================================================================
