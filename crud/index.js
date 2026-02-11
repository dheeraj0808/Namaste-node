const express = require("express");
const app = express();

app.use(express.json());

// Temporary database (in-memory)
let users = [];

/* =========================
   ROOT ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("CRUD API is running 🚀");
});

/* =========================
   CREATE - POST
========================= */
app.post("/users", (req, res) => {
  const user = req.body;

  if (!user.id || !user.name || !user.age) {
    return res.status(400).json({
      message: "Please provide id, name and age"
    });
  }

  users.push(user);

  res.status(201).json({
    message: "User created successfully ✅",
    data: user
  });
});

/* =========================
   READ - GET ALL USERS
========================= */
app.get("/users", (req, res) => {
  res.json(users);
});

/* =========================
   READ - GET SINGLE USER
========================= */
app.get("/users/:id", (req, res) => {
  const userId = Number(req.params.id);

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

/* =========================
   UPDATE - PUT
========================= */
app.put("/users/:id", (req, res) => {
  const userId = Number(req.params.id);
  const updatedData = req.body;

  let userFound = false;

  users = users.map(user => {
    if (user.id === userId) {
      userFound = true;
      return { ...user, ...updatedData };
    }
    return user;
  });

  if (!userFound) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: "User updated successfully ✅"
  });
});

/* =========================
   DELETE - DELETE
========================= */
app.delete("/users/:id", (req, res) => {
  const userId = Number(req.params.id);

  const initialLength = users.length;
  users = users.filter(user => user.id !== userId);

  if (users.length === initialLength) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: "User deleted successfully 🗑️"
  });
});

/* =========================
   SERVER START
========================= */
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
// DELETE - DELETE USER
app.delete("/users/:id", (req, res) => {
  const userId = Number(req.params.id);

  const initialLength = users.length;
  users = users.filter(user => user.id !== userId);

  if (users.length === initialLength) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: "User deleted successfully 🗑️"
  });
});