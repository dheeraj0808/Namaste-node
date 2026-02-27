// =====================================================================
//  Episode 09 — Encrypting Passwords
// =====================================================================
//
//  🤔 Why Encrypt Passwords?
//  → Agar database hack ho jaaye, toh hackers ko sirf encrypted
//    passwords milenge — real passwords nahi
//  → NEVER store plain text passwords!
//
//  📌 Hashing vs Encryption:
//  → Encryption = Unlock ho sakta hai (two-way) 🔓
//  → Hashing    = KABHI unlock nahi hoga (one-way) 🔒 ← Yahi chahiye!
//
//  "password123" → Hash → "$2b$10$X7z..." (irreversible)
//
//  📌 We use bcrypt library:
//  → Industry standard for password hashing
//  → Automatically adds "salt" (random data to make hash unique)
//  → Same password → Different hash every time (because of salt)
//
// =====================================================================

// npm install bcrypt

const bcrypt = require("bcrypt");

// =====================================================================
//  1. HASHING A PASSWORD (Signup ke time)
// =====================================================================

const hashPassword = async (plainPassword) => {
    // saltRounds = How many times the hash is processed
    // Higher = More secure but SLOWER
    // 10 is the sweet spot (recommended)
    const saltRounds = 10;

    // bcrypt.hash() takes the plain password and salt rounds
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    console.log("Plain Password:", plainPassword);
    console.log("Hashed Password:", hashedPassword);
    // Output: "$2b$10$X7zG3h..." (60 characters, always different!)

    return hashedPassword;
};

// =====================================================================
//  2. COMPARING PASSWORDS (Login ke time)
// =====================================================================

const comparePassword = async (plainPassword, hashedPassword) => {
    // bcrypt.compare() → compares plain text with hash
    // Returns true if they match, false if not
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

    console.log("Password Match:", isMatch); // true or false
    return isMatch;
};

// =====================================================================
//  3. FULL EXAMPLE — Signup & Login Flow
// =====================================================================

const express = require("express");
const app = express();
app.use(express.json());

// Fake DB
const usersDB = [];

// ---- SIGNUP ----
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = usersDB.find((u) => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        // HASH the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user with HASHED password (NOT plain text!)
        const newUser = {
            id: usersDB.length + 1,
            name,
            email,
            password: hashedPassword, // ← Hashed, not plain!
        };
        usersDB.push(newUser);

        console.log("✅ User created:", {
            name,
            email,
            password: hashedPassword, // You can see it's encrypted
        });

        res.status(201).json({
            success: true,
            message: "Signup successful!",
            // NEVER send password back in response!
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ---- LOGIN ----
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = usersDB.find((u) => u.email === email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // ☝️ Don't say "email not found" — it tells hackers which emails exist!

        // COMPARE plain password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("✅ Login successful for:", user.name);

        res.json({
            success: true,
            message: "Login successful!",
            user: { id: user.id, name: user.name, email: user.email },
            // NEVER include password in response!
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(3000, () => console.log("🚀 Server on port 3000"));

// =====================================================================
//  4. WITH MONGOOSE — Pre-save Hook (auto hash before saving)
// =====================================================================
//
//  userSchema.pre("save", async function (next) {
//    // Sirf tab hash karo jab password change hua ho
//    if (!this.isModified("password")) return next();
//
//    this.password = await bcrypt.hash(this.password, 10);
//    next();
//  });
//
//  📌 Why "function" and not arrow function?
//  → Arrow functions don't have their own "this"
//  → We need "this" to access the document being saved
//
// =====================================================================

// =====================================================================
//  🧠 KEY POINTS:
// =====================================================================
//
//  1. NEVER store plain text passwords
//  2. bcrypt.hash(password, 10) → Hash karo signup pe
//  3. bcrypt.compare(plain, hash) → Compare karo login pe
//  4. Salt = Random data added to password before hashing
//     → Same "password123" gives DIFFERENT hash each time
//     → Prevents rainbow table attacks
//  5. saltRounds = 10 is recommended (good security + speed)
//     → 10 = ~10 hashes/sec
//     → 12 = ~3 hashes/sec (slower but more secure)
//  6. Login error message should be VAGUE:
//     → ✅ "Invalid email or password"
//     → ❌ "Email not found" (tells hackers valid emails)
//  7. Use pre("save") hook in Mongoose to auto-hash
//
// =====================================================================
