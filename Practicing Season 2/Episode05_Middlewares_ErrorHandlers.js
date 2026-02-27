// =====================================================================
//  Episode 05 — Middlewares & Error Handlers
// =====================================================================
//
//  🤔 Middleware kya hai?
//  → Ek function jo request aur response ke BEECH mein baithta hai
//  → Request aaye → Middleware process kare → Route handler ko de de
//
//  Real-life: Restaurant mein Waiter = Middleware
//  → Customer (Request) order deta hai
//  → Waiter (Middleware) order check karta hai, kitchen tak le jaata hai
//  → Chef (Route Handler) khana banata hai
//
// =====================================================================

const express = require("express");
const app = express();

app.use(express.json());

// =====================================================================
//  1. APPLICATION-LEVEL MIDDLEWARE (Sab routes pe chalega)
// =====================================================================

// Logging Middleware — har request ka log banata hai
app.use((req, res, next) => {
    console.log(`📝 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    // next() → "Aage badho, next middleware/route pe jaao"
    // Agar next() nahi likha → Request HANG ho jayegi!
    next();
});

// =====================================================================
//  2. ROUTE-LEVEL MIDDLEWARE (Sirf specific route pe chalega)
// =====================================================================

// Auth check middleware
const isAuthenticated = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "Please login first!" });
    }
    // Token valid hai → aage jaao
    req.user = { name: "Ujjwal", role: "admin" }; // Fake user for demo
    next();
};

// Admin check middleware
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next(); // Admin hai → allow
    } else {
        res.status(403).json({ message: "Admin access required!" });
    }
};

// Multiple middlewares on one route: isAuthenticated → isAdmin → handler
app.get("/admin/dashboard", isAuthenticated, isAdmin, (req, res) => {
    res.json({ message: `Welcome Admin ${req.user.name}!` });
});

// =====================================================================
//  3. MIDDLEWARE EXECUTION ORDER
// =====================================================================
//
//  Request → Middleware1 → Middleware2 → Middleware3 → Route Handler
//
//  IMPORTANT: Order matters!
//  → app.use() jo pehle likha, wo pehle chalega
//  → Route handlers ke UPAR likho middleware
//  → Neeche likha toh kabhi execute nahi hoga uss route ke liye

// =====================================================================
//  4. ERROR HANDLING MIDDLEWARE (4 parameters!)
// =====================================================================
//
//  Normal middleware → (req, res, next) → 3 params
//  Error middleware  → (err, req, res, next) → 4 params ← Express isko pehchaanta hai
//

// Sample route that throws an error
app.get("/error-demo", (req, res, next) => {
    try {
        // Simulating an error
        throw new Error("Something went wrong!");
    } catch (err) {
        // next(err) → Error middleware ko bhej do
        next(err);
    }
});

// Async error example
app.get("/async-error", async (req, res, next) => {
    try {
        // Simulating DB call that fails
        // const user = await User.findById("invalid-id");
        throw new Error("Database connection failed!");
    } catch (err) {
        next(err); // Forward error to error handler
    }
});

// ---- GLOBAL ERROR HANDLER ---- (Must be the LAST app.use)
// This catches ALL errors from any route
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        // In development, show stack trace. In production, hide it.
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

// =====================================================================
//  5. COMMON BUILT-IN MIDDLEWARES
// =====================================================================
//
//  express.json()         → Parse JSON body
//  express.urlencoded()   → Parse form data
//  express.static("public") → Serve static files (CSS, images, etc.)
//
// =====================================================================

app.listen(3000, () => console.log("🚀 Server running on port 3000"));

// =====================================================================
//  🧠 KEY POINTS:
// =====================================================================
//
//  1. next() bhoolna = Request hang hona
//  2. Error middleware has 4 params (err, req, res, next)
//  3. Error middleware LAST mein likho
//  4. next(err) → Error middleware pe jaata hai
//  5. next() → Normal next middleware pe jaata hai
//  6. Middleware order = TOP to BOTTOM execution
//
// =====================================================================
