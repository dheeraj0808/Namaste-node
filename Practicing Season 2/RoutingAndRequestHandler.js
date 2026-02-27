const express = require("express");
const app = express();
const PORT = 3001; // Using 3001 so it doesn't conflict with server.js on 3000

// ======================================================================
//  MIDDLEWARE — runs BEFORE any route handler
// ======================================================================
// express.json() parses incoming JSON request bodies
// Without this, req.body would be undefined for POST/PUT requests
app.use(express.json());

// Custom logging middleware — applicable to ALL routes
app.use((req, res, next) => {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.url}`
    );
    // next() passes control to the NEXT middleware / route handler
    // If you forget next(), the request will hang forever!
    next();
});

// ======================================================================
//  1. BASIC ROUTING — HTTP Methods (GET, POST, PUT, PATCH, DELETE)
// ======================================================================

// ---------- GET — Read / Fetch data ----------
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Routing & Request Handler tutorial!",
        availableRoutes: [
            "GET    /users",
            "GET    /users/:id",
            "POST   /users",
            "PUT    /users/:id",
            "PATCH  /users/:id",
            "DELETE /users/:id",
            "GET    /search?q=term&page=1",
            "GET    /products/:category/:productId",
        ],
    });
});

// ---------- In-memory "database" for demo ----------
let users = [
    { id: 1, name: "Ujjwal", email: "ujjwal@example.com", age: 22 },
    { id: 2, name: "Akshay", email: "akshay@example.com", age: 30 },
    { id: 3, name: "Priya", email: "priya@example.com", age: 25 },
];
let nextId = 4;

// GET all users
app.get("/users", (req, res) => {
    res.json({ success: true, count: users.length, data: users });
});

// ---------- Route Parameters  ( :id ) ----------
// The colon (:) makes "id" a dynamic parameter
// Express stores it in req.params.id
app.get("/users/:id", (req, res) => {
    const userId = Number(req.params.id); // params are always strings, so convert
    const user = users.find((u) => u.id === userId);

    if (!user) {
        // 404 = Not Found
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
});

// ---------- POST — Create new data ----------
// The request body (req.body) contains the data sent by the client
app.post("/users", (req, res) => {
    const { name, email, age } = req.body; // Destructuring from body

    // Simple validation
    if (!name || !email) {
        // 400 = Bad Request
        return res
            .status(400)
            .json({ success: false, message: "Name and email are required" });
    }

    const newUser = { id: nextId++, name, email, age: age || null };
    users.push(newUser);

    // 201 = Created — use this instead of 200 when something new is created
    res.status(201).json({ success: true, data: newUser });
});

// ---------- PUT — Replace entire resource ----------
// PUT expects the FULL object — every field must be provided
app.put("/users/:id", (req, res) => {
    const userId = Number(req.params.id);
    const index = users.findIndex((u) => u.id === userId);

    if (index === -1) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, age } = req.body;
    if (!name || !email) {
        return res
            .status(400)
            .json({ success: false, message: "PUT requires name and email" });
    }

    // Replace the entire user object (keeping the same id)
    users[index] = { id: userId, name, email, age: age || null };
    res.json({ success: true, data: users[index] });
});

// ---------- PATCH — Partially update a resource ----------
// PATCH only updates the fields you send
app.patch("/users/:id", (req, res) => {
    const userId = Number(req.params.id);
    const user = users.find((u) => u.id === userId);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // Spread: keep old values, override only the ones sent in body
    Object.assign(user, req.body);
    res.json({ success: true, data: user });
});

// ---------- DELETE — Remove a resource ----------
app.delete("/users/:id", (req, res) => {
    const userId = Number(req.params.id);
    const index = users.findIndex((u) => u.id === userId);

    if (index === -1) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const deletedUser = users.splice(index, 1)[0]; // splice removes & returns
    res.json({ success: true, message: "User deleted", data: deletedUser });
});

// ======================================================================
//  2. QUERY PARAMETERS  — ?key=value&key2=value2
// ======================================================================
// Query params are NOT part of the route path
// They live in req.query as an object

app.get("/search", (req, res) => {
    const { q, page = 1, limit = 10 } = req.query; // default values

    if (!q) {
        return res
            .status(400)
            .json({ success: false, message: "Query parameter 'q' is required" });
    }

    // Filter users whose name contains the search term (case-insensitive)
    const results = users.filter((u) =>
        u.name.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
        success: true,
        query: q,
        page: Number(page),
        limit: Number(limit),
        results,
    });
});

// ======================================================================
//  3. MULTIPLE ROUTE PARAMETERS
// ======================================================================
// You can have as many dynamic segments as you need

const products = {
    electronics: [
        { id: 1, name: "Laptop", price: 75000 },
        { id: 2, name: "Phone", price: 25000 },
    ],
    clothing: [
        { id: 1, name: "T-Shirt", price: 500 },
        { id: 2, name: "Jeans", price: 1200 },
    ],
};

app.get("/products/:category/:productId", (req, res) => {
    const { category, productId } = req.params;

    const categoryProducts = products[category];
    if (!categoryProducts) {
        return res
            .status(404)
            .json({ success: false, message: `Category '${category}' not found` });
    }

    const product = categoryProducts.find((p) => p.id === Number(productId));
    if (!product) {
        return res.status(404).json({
            success: false,
            message: `Product ${productId} not found in '${category}'`,
        });
    }

    res.json({ success: true, data: product });
});

// ======================================================================
//  4. ROUTE-SPECIFIC MIDDLEWARE (Multiple Request Handlers)
// ======================================================================
// You can pass MULTIPLE handler functions to a single route.
// They execute in order. Each must call next() to continue.

// Auth-check middleware (dummy — just checks for a header)
const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token || token !== "Bearer mysecrettoken") {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized — provide valid token" });
    }
    // Attach data to req so later handlers can use it
    req.authenticatedUser = "Ujjwal";
    next();
};

// This route has TWO handlers: authMiddleware runs first, then the callback
app.get("/dashboard", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: `Welcome to Dashboard, ${req.authenticatedUser}!`,
        secretData: { revenue: "₹10,00,000", users: 5000 },
    });
});

// ======================================================================
//  5. CHAINED HANDLERS with app.route()
// ======================================================================
// app.route() lets you chain HTTP methods on the SAME path — keeps code DRY

app
    .route("/posts")
    .get((req, res) => {
        res.json({
            success: true,
            data: [
                { id: 1, title: "Learning Node.js", author: "Ujjwal" },
                { id: 2, title: "Namaste JavaScript", author: "Akshay" },
            ],
        });
    })
    .post((req, res) => {
        const { title, author } = req.body;
        res.status(201).json({
            success: true,
            message: "Post created",
            data: { id: Date.now(), title, author },
        });
    });

// ======================================================================
//  6. REGEX-BASED ROUTES  (Express 5 compatible)
// ======================================================================
// Express 5 uses strict path-to-regexp v8, so pattern chars like ?, +, *
// inside string routes no longer work. Use actual RegExp objects instead.

// /^\/ab?cd$/ → 'b' is OPTIONAL, matches "/acd" and "/abcd"
app.get(/^\/ab?cd$/, (req, res) => {
    res.send("Regex: /ab?cd/ — 'b' is optional. Matched: " + req.path);
});

// /^\/ab+cd$/ → 'b' repeats ONE or MORE times, matches "/abcd", "/abbcd"
app.get(/^\/ab+cd$/, (req, res) => {
    res.send("Regex: /ab+cd/ — 'b' repeats 1+ times. Matched: " + req.path);
});

// /^\/ab.*cd$/ → wildcard, matches ANY characters between "ab" and "cd"
app.get(/^\/ab.*cd$/, (req, res) => {
    res.send("Regex: /ab.*cd/ — anything between ab and cd. Matched: " + req.path);
});

// ======================================================================
//  7. RESPONSE METHODS — Different ways to send responses
// ======================================================================

// res.json() — Sends JSON (most common for APIs)
app.get("/response/json", (req, res) => {
    res.json({ type: "json", message: "This is a JSON response" });
});

// res.send() — Sends string / HTML / Buffer
app.get("/response/html", (req, res) => {
    res.send("<h1 style='color: #6C63FF;'>This is an HTML response 🚀</h1>");
});

// res.status().json() — Custom status codes
app.get("/response/error", (req, res) => {
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

// res.redirect() — Redirect to another URL
app.get("/old-page", (req, res) => {
    res.redirect("/"); // 302 redirect by default
});

// ======================================================================
//  8. 404 CATCH-ALL — Must be the LAST route
// ======================================================================
// If no route above matched, this will catch it
app.use("*path", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        hint: "Visit GET / to see available routes",
    });
});

// ======================================================================
//  START THE SERVER
// ======================================================================
app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 Try these routes:`);
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/users`);
    console.log(`   GET  http://localhost:${PORT}/users/1`);
    console.log(`   GET  http://localhost:${PORT}/search?q=ujjwal`);
    console.log(`   GET  http://localhost:${PORT}/products/electronics/1`);
    console.log(`   GET  http://localhost:${PORT}/dashboard  (needs auth header)`);
    console.log(`   GET  http://localhost:${PORT}/posts\n`);
});
