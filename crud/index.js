const express = require('express');
const app = express();
const PORT = 3000;

// Middleware - JSON data ko parse karne ke liye
app.use(express.json());

// In-memory database (array mein users store karenge)
let users = [
    { id: 1, name: "Rahul", email: "rahul@example.com", age: 25 },
    { id: 2, name: "Priya", email: "priya@example.com", age: 22 }
];

let nextId = 3; // Next user ke liye ID

// ==========================================
// 📖 READ - Sabhi users ko get karo (GET)
// ==========================================
app.get('/users', (req, res) => {
    res.json({
        success: true,
        message: "Sabhi users mil gaye!",
        data: users
    });
});

// ==========================================
// 📖 READ - Ek specific user ko get karo (GET)
// ==========================================
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User nahi mila!"
        });
    }
    
    res.json({
        success: true,
        message: "User mil gaya!",
        data: user
    });
});

// ==========================================
// ✏️ CREATE - Naya user banao (POST)
// ==========================================
app.post('/users', (req, res) => {
    const { name, email, age } = req.body;
    
    // Validation
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name aur email required hai!"
        });
    }
    
    // Naya user create karo
    const newUser = {
        id: nextId++,
        name: name,
        email: email,
        age: age || null
    };
    
    users.push(newUser);
    
    res.status(201).json({
        success: true,
        message: "User successfully create ho gaya!",
        data: newUser
    });
});

// ==========================================
// 🔄 UPDATE - User update karo (PUT)
// ==========================================
app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "User nahi mila!"
        });
    }
    
    const { name, email, age } = req.body;
    
    // User update karo
    users[userIndex] = {
        id: userId,
        name: name || users[userIndex].name,
        email: email || users[userIndex].email,
        age: age || users[userIndex].age
    };
    
    res.json({
        success: true,
        message: "User successfully update ho gaya!",
        data: users[userIndex]
    });
});

// ==========================================
// 🗑️ DELETE - User delete karo (DELETE)
// ==========================================
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "User nahi mila!"
        });
    }
    
    // User delete karo
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({
        success: true,
        message: "User successfully delete ho gaya!",
        data: deletedUser
    });
});

// Server start karo
app.listen(PORT, () => {
    console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`);
    console.log('\n📌 Available APIs:');
    console.log('   GET    /users      - Sabhi users dekho');
    console.log('   GET    /users/:id  - Ek user dekho');
    console.log('   POST   /users      - Naya user banao');
    console.log('   PUT    /users/:id  - User update karo');
    console.log('   DELETE /users/:id  - User delete karo');
});
