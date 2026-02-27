// =====================================================================
//  Episode 14 — Building Feed API & Pagination
// =====================================================================
//
//  🤔 Feed API kya hai?
//  → Instagram/Twitter jaise scroll karte ho → wo Feed hai
//  → Backend se data CHHOTE-CHHOTE chunks mein aata hai
//  → Sab ek saath nahi laate — performance kharab hogi!
//
//  📌 Pagination = Data ko PAGES mein divide karna
//  → Page 1: Posts 1-10
//  → Page 2: Posts 11-20
//  → Scroll karo → Next page load ho
//
// =====================================================================

const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

// Schema
const postSchema = new mongoose.Schema({
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});
const Post = mongoose.model("Post", postSchema);

// =====================================================================
//  1. OFFSET-BASED PAGINATION (skip + limit) — Simple
// =====================================================================
//  → /api/feed?page=1&limit=10
//  → Page 1: skip(0), limit(10)  → items 1-10
//  → Page 2: skip(10), limit(10) → items 11-20

app.get("/api/feed", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate("author", "name")
            .sort({ createdAt: -1 })  // Newest first
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
            success: true,
            data: posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =====================================================================
//  2. CURSOR-BASED PAGINATION (Better for infinite scroll)
// =====================================================================
//  → Instead of page number, use last item's ID/timestamp as cursor
//  → More reliable — data insert/delete se page skip nahi hota
//
//  First request:  /api/feed/cursor?limit=10
//  Next request:   /api/feed/cursor?limit=10&cursor=65abc123...

app.get("/api/feed/cursor", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const cursor = req.query.cursor; // Last post's ID

        let query = {};
        if (cursor) {
            // Get posts OLDER than the cursor post
            query = { _id: { $lt: cursor } };
        }

        const posts = await Post.find(query)
            .populate("author", "name")
            .sort({ _id: -1 }) // _id contains timestamp
            .limit(limit + 1);  // +1 to check if more exist

        const hasMore = posts.length > limit;
        if (hasMore) posts.pop(); // Remove the extra one

        const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

        res.json({
            success: true,
            data: posts,
            pagination: {
                nextCursor,  // Frontend sends this in next request
                hasMore,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =====================================================================
//  3. FEED WITH FILTERS
// =====================================================================

app.get("/api/feed/filtered", async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

        const posts = await Post.find()
            .populate("author", "name")
            .sort({ [sortBy]: order === "desc" ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Post.countDocuments();

        res.json({
            success: true,
            data: posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(3000, () => console.log("🚀 Feed API on port 3000"));

// =====================================================================
//  🧠 KEY POINTS:
// =====================================================================
//
//  1. OFFSET Pagination (skip + limit):
//     → Simple, page numbers
//     → Problem: Data change pe pages shift hote hain
//
//  2. CURSOR Pagination:
//     → Last item ka ID use karo as reference
//     → Better for infinite scroll
//     → Data insert/delete se affect nahi hota
//
//  3. Always send pagination metadata in response
//     → totalPages, hasNextPage, currentPage
//     → Frontend ko pata chale ki aur data hai ya nahi
//
//  4. limit + 1 trick → fetch one extra to check if more exist
//
//  5. sort({ createdAt: -1 }) → Newest posts first (Feed behaviour)
//
// =====================================================================
