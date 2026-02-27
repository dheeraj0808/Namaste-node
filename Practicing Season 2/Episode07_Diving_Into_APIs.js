// =====================================================================
//  Episode 07 — Diving into the APIs
// =====================================================================
//
//  🤔 API kya hai?
//  → API = Application Programming Interface
//  → Ek "waiter" jo frontend aur backend ke beech kaam karta hai
//  → Frontend bolta hai "mujhe users ka data do"
//  → API backend se data laake frontend ko de deta hai
//
//  📌 REST API Rules:
//  → Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
//  → Use proper status codes (200, 201, 400, 404, 500)
//  → Use proper URL naming (/users, /users/:id, NOT /getUser)
//  → Send JSON responses
//  → Stateless — server koi session yaad nahi rakhta
//
// =====================================================================

const express = require("express");
const app = express();
app.use(express.json());

// =====================================================================
//  Fake Database (In-memory)
// =====================================================================

let users = [
    { id: 1, firstName: "Ujjwal", lastName: "Pratap", email: "ujjwal@test.com", age: 22 },
    { id: 2, firstName: "Akshay", lastName: "Saini", email: "akshay@test.com", age: 30 },
    { id: 3, firstName: "Priya", lastName: "Sharma", email: "priya@test.com", age: 25 },
];

// =====================================================================
//  GET /users — Get all users (with filters)
// =====================================================================

app.get("/users", (req, res) => {
    let result = [...users];

    // Query params se filter karo
    // Example: /users?age=22&firstName=Ujjwal
    const { firstName, age, sort } = req.query;

    if (firstName) {
        result = result.filter((u) =>
            u.firstName.toLowerCase().includes(firstName.toLowerCase())
        );
    }
    if (age) {
        result = result.filter((u) => u.age === Number(age));
    }
    if (sort) {
        // /users?sort=age → age se sort karo
        result.sort((a, b) => a[sort] > b[sort] ? 1 : -1);
    }

    res.json({ success: true, count: result.length, data: result });
});

// =====================================================================
//  GET /users/:id — Get single user
// =====================================================================

app.get("/users/:id", (req, res) => {
    const user = users.find((u) => u.id === Number(req.params.id));

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    res.json({ success: true, data: user });
});

// =====================================================================
//  POST /users — Create new user
// =====================================================================

app.post("/users", (req, res) => {
    const { firstName, lastName, email, age } = req.body;

    // Validation
    if (!firstName || !email) {
        return res.status(400).json({
            success: false,
            message: "firstName and email are required!",
        });
    }

    const newUser = {
        id: users.length + 1,
        firstName,
        lastName: lastName || "",
        email,
        age: age || null,
    };

    users.push(newUser);

    // 201 = Created (naya resource bana)
    res.status(201).json({ success: true, data: newUser });
});

// =====================================================================
//  PATCH /users/:id — Update user (partial)
// =====================================================================

app.patch("/users/:id", (req, res) => {
    const user = users.find((u) => u.id === Number(req.params.id));

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // Sirf wo fields update karo jo body mein aayi hain
    Object.assign(user, req.body);

    res.json({ success: true, message: "User updated", data: user });
});

// =====================================================================
//  DELETE /users/:id — Delete user
// =====================================================================

app.delete("/users/:id", (req, res) => {
    const index = users.findIndex((u) => u.id === Number(req.params.id));

    if (index === -1) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const deleted = users.splice(index, 1)[0];
    res.json({ success: true, message: "User deleted", data: deleted });
});

// =====================================================================
//  STATUS CODES CHEAT SHEET:
// =====================================================================
//
//  200 → OK (sab theek hai)
//  201 → Created (naya data bana)
//  204 → No Content (delete ke baad koi data nahi)
//  400 → Bad Request (client ne galat data bheja)
//  401 → Unauthorized (login nahi kiya)
//  403 → Forbidden (permission nahi hai)
//  404 → Not Found (resource mila nahi)
//  500 → Internal Server Error (server crash)
//
// =====================================================================

app.listen(3000, () => console.log("🚀 API server on port 3000"));
