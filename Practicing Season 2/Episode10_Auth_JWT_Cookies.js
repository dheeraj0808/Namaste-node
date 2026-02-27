// =====================================================================
//  Episode 10 — Authentication, JWT & Cookies
// =====================================================================
//
//  🤔 Authentication kya hai?
//  → Verify karna ki "tu wahi hai jo tu bol raha hai"
//  → Like showing your Aadhaar Card at the airport
//
//  🤔 Authorization kya hai?
//  → Check karna ki "tujhe yeh karne ki permission hai ya nahi"
//  → Like a VIP pass — normal ticket holders can't enter VIP lounge
//
//  Authentication = "Kaun hai tu?"
//  Authorization  = "Tujhe permission hai?"
//
//  📌 Flow:
//  1. User login karta hai (email + password)
//  2. Server verify karta hai
//  3. Server ek TOKEN (JWT) deta hai
//  4. User har request ke saath token bhejta hai
//  5. Server token check karta hai → "Haan, ye valid user hai"
//
// =====================================================================

// npm install jsonwebtoken cookie-parser bcrypt

const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cookieParser()); // Cookie parse karne ke liye

const JWT_SECRET = "my-super-secret-key-never-share"; // .env mein rakhna!

// =====================================================================
//  1. JWT — JSON Web Token
// =====================================================================
//
//  JWT = A token string that contains user info (encoded, NOT encrypted)
//
//  Format: xxxxx.yyyyy.zzzzz
//          Header.Payload.Signature
//
//  Header  = Algorithm (HS256) + Token type (JWT)
//  Payload = User data (id, name, role) — NOT passwords!
//  Signature = Verification that token wasn't tampered with
//
//  📌 ENCODED ≠ ENCRYPTED
//  → Anyone can READ a JWT (just base64 decode it)
//  → But no one can MODIFY it (signature will break)
//  → So NEVER put passwords or sensitive data in JWT!
//

// =====================================================================
//  2. CREATE TOKEN (Login ke baad)
// =====================================================================

const createToken = (userId) => {
    // jwt.sign(payload, secret, options)
    const token = jwt.sign(
        { _id: userId },      // Payload — user ki ID
        JWT_SECRET,           // Secret key — sirf server jaanta hai
        { expiresIn: "7d" }   // Token 7 din baad expire hoga
    );
    return token;
};

// =====================================================================
//  3. VERIFY TOKEN (Har protected request pe)
// =====================================================================

const verifyToken = (token) => {
    try {
        // jwt.verify checks: Is token valid? Is it expired? Is signature correct?
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded; // Returns: { _id: "user123", iat: ..., exp: ... }
    } catch (error) {
        return null; // Invalid or expired token
    }
};

// =====================================================================
//  4. AUTH MIDDLEWARE — Protect Routes
// =====================================================================

const authMiddleware = (req, res, next) => {
    // Token can come from:
    // 1. Cookies (browser automatically sends cookies)
    // 2. Authorization header (mobile apps, Postman)

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    // "Bearer eyJhbGci..." → split(" ") → ["Bearer", "eyJhbGci..."] → [1]

    if (!token) {
        return res.status(401).json({ message: "Please login first!" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token!" });
    }

    // Token valid hai → user info attach karo
    req.userId = decoded._id;
    next();
};

// =====================================================================
//  5. COOKIES — Token ko browser mein store karna
// =====================================================================
//
//  🤔 Why Cookies?
//  → Token ko localStorage mein rakhna → XSS attack se vulnerable
//  → Cookie mein rakhna + httpOnly flag → JS access nahi kar sakta
//  → Browser automatically har request ke saath cookie bhejta hai
//

// Fake DB
const users = [];

// ---- SIGNUP ----
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), name, email, password: hashedPassword };
    users.push(user);

    // Create token
    const token = createToken(user.id);

    // Set token in cookie
    res.cookie("token", token, {
        httpOnly: true,   // JS se access nahi kar sakta (XSS protection)
        secure: false,    // true in production (HTTPS only)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        sameSite: "lax",  // CSRF protection
    });

    res.status(201).json({
        success: true,
        message: "Signup successful!",
        user: { id: user.id, name, email },
    });
});

// ---- LOGIN ----
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token & set cookie
    const token = createToken(user.id);
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
        success: true,
        message: "Login successful!",
        user: { id: user.id, name: user.name, email: user.email },
    });
});

// ---- LOGOUT ----
app.post("/logout", (req, res) => {
    // Cookie ko expire kar do
    res.cookie("token", "", { maxAge: 0 });
    // OR: res.clearCookie("token");
    res.json({ success: true, message: "Logged out!" });
});

// ---- PROTECTED ROUTE ----
app.get("/profile", authMiddleware, (req, res) => {
    const user = users.find((u) => u.id === req.userId);
    res.json({
        success: true,
        message: "This is a protected route!",
        user: { id: user.id, name: user.name, email: user.email },
    });
});

app.listen(3000, () => console.log("🚀 Auth server on port 3000"));

// =====================================================================
//  🧠 KEY POINTS:
// =====================================================================
//
//  1. JWT = Stateless authentication (server kuch store nahi karta)
//  2. Token has 3 parts: Header.Payload.Signature
//  3. NEVER put passwords in JWT payload
//  4. Cookie with httpOnly = Safest way to store token in browser
//  5. Token expiry lagao (7d, 24h) — Forever valid token = security risk
//  6. Logout = Cookie ko expire/clear karo
//  7. Cookie flags:
//     → httpOnly: JS access block
//     → secure: Only send over HTTPS
//     → sameSite: CSRF attack protection
//     → maxAge: Expiry time in milliseconds
//
// =====================================================================
