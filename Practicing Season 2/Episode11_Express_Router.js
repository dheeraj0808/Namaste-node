// =====================================================================
//  Episode 11 — Diving into APIs & Express Router
// =====================================================================
//
//  🤔 Express Router kya hai?
//  → Jab app bada hota hai, sab routes ek file mein rakhna = MESS
//  → Router se routes ko ALAG-ALAG files mein organize kar sakte ho
//  → Like school mein subjects ke alag-alag teachers hain
//
//  Without Router:  app.js mein 500+ lines of routes 😵
//  With Router:     routes/users.js, routes/posts.js, routes/auth.js 😎
//
// =====================================================================

// =====================================================================
//  PROJECT STRUCTURE (Clean & Organized):
// =====================================================================
//
//  project/
//  ├── app.js              ← Main file (server start)
//  ├── routes/
//  │   ├── auth.js         ← Login/Signup routes
//  │   ├── users.js        ← User CRUD routes
//  │   └── posts.js        ← Post CRUD routes
//  ├── middleware/
//  │   └── auth.js         ← Auth middleware
//  └── models/
//      ├── User.js         ← User schema + model
//      └── Post.js         ← Post schema + model
//
// =====================================================================

const express = require("express");

// =====================================================================
//  STEP 1: Create a Router (normally in a separate file)
// =====================================================================

// ---- routes/users.js ----
const userRouter = express.Router();

// All routes here are RELATIVE — "/users" prefix will be added in app.js
// So "/" here = "/users/" in the actual URL

userRouter.get("/", (req, res) => {
    // Actual URL: GET /users/
    res.json({ message: "Get all users" });
});

userRouter.get("/:id", (req, res) => {
    // Actual URL: GET /users/:id
    res.json({ message: `Get user ${req.params.id}` });
});

userRouter.post("/", (req, res) => {
    // Actual URL: POST /users/
    res.json({ message: "Create new user" });
});

userRouter.patch("/:id", (req, res) => {
    // Actual URL: PATCH /users/:id
    res.json({ message: `Update user ${req.params.id}` });
});

userRouter.delete("/:id", (req, res) => {
    // Actual URL: DELETE /users/:id
    res.json({ message: `Delete user ${req.params.id}` });
});

// ---- routes/posts.js ----
const postRouter = express.Router();

postRouter.get("/", (req, res) => {
    res.json({ message: "Get all posts" });
});

postRouter.post("/", (req, res) => {
    res.json({ message: "Create new post" });
});

postRouter.get("/:id", (req, res) => {
    res.json({ message: `Get post ${req.params.id}` });
});

// ---- routes/auth.js ----
const authRouter = express.Router();

authRouter.post("/signup", (req, res) => {
    res.json({ message: "Signup route" });
});

authRouter.post("/login", (req, res) => {
    res.json({ message: "Login route" });
});

authRouter.post("/logout", (req, res) => {
    res.json({ message: "Logout route" });
});

// =====================================================================
//  STEP 2: Mount Routers in app.js
// =====================================================================

const app = express();
app.use(express.json());

// Mount routers with a prefix
// app.use("/prefix", router)
app.use("/users", userRouter);   // /users + router paths
app.use("/posts", postRouter);   // /posts + router paths
app.use("/auth", authRouter);    // /auth + router paths

// Now the routes become:
// GET    /users/       → Get all users
// GET    /users/:id    → Get one user
// POST   /users/       → Create user
// PATCH  /users/:id    → Update user
// DELETE /users/:id    → Delete user
// GET    /posts/       → Get all posts
// POST   /posts/       → Create post
// POST   /auth/signup  → Signup
// POST   /auth/login   → Login

// =====================================================================
//  STEP 3: Router-level Middleware
// =====================================================================

// Middleware sirf user routes pe chalega
// userRouter.use(authMiddleware);  ← Sab user routes protected

// Ya specific route pe:
// userRouter.get("/profile", authMiddleware, (req, res) => {...});

// =====================================================================
//  API ROUTE SUMMARY
// =====================================================================

app.get("/", (req, res) => {
    res.json({
        message: "API Server",
        routes: {
            auth: ["POST /auth/signup", "POST /auth/login", "POST /auth/logout"],
            users: [
                "GET /users", "GET /users/:id",
                "POST /users", "PATCH /users/:id", "DELETE /users/:id",
            ],
            posts: ["GET /posts", "POST /posts", "GET /posts/:id"],
        },
    });
});

app.listen(3000, () => console.log("🚀 Server on port 3000"));

// =====================================================================
//  🧠 KEY POINTS:
// =====================================================================
//
//  1. express.Router() = Mini app for routes
//  2. app.use("/prefix", router) = Mount router with prefix
//  3. Router mein routes RELATIVE hote hain
//     → router.get("/") + app.use("/users", router) = GET /users/
//  4. Benefits of Router:
//     → Code organization (alag files)
//     → Router-level middleware (specific routes pe)
//     → Reusability (same router, different prefix)
//  5. Real projects mein ALWAYS use Router
//     → Ek file mein 500 routes = nightmare
//
// =====================================================================
