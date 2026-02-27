// =====================================================================
//  Episode 09 — Building Real-time Live Chat Feature
// =====================================================================
//
//  🤔 What are we building?
//  -------------------------
//  A FULL live chat application with:
//  → Multiple chat rooms (like WhatsApp groups)
//  → Private messages (1-to-1 chat)
//  → Typing indicator ("User is typing...")
//  → Online/Offline status
//  → Message history (saved in database)
//  → Read receipts (✓✓)
//
//  This builds on Episode 08 (Socket.io basics) and adds
//  real production-level features.
//
// =====================================================================

// =====================================================================
//  INSTALL: npm install express socket.io mongoose
// =====================================================================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.json());

// =====================================================================
//  DATABASE: Message Schema (to save chat history)
// =====================================================================

const messageSchema = new mongoose.Schema(
    {
        sender: { type: String, required: true },
        receiver: { type: String, default: null }, // null = room message
        room: { type: String, required: true },
        content: { type: String, required: true },
        type: {
            type: String,
            enum: ["text", "image", "file"],
            default: "text",
        },
        readBy: [String], // Array of usernames who read this message
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

// =====================================================================
//  TRACK ONLINE USERS
// =====================================================================

// Map: socketId → user info
const connectedUsers = new Map();

// Map: username → socketId (to find user's socket)
const userSocketMap = new Map();

// =====================================================================
//  SOCKET.IO — Real-time Chat Logic
// =====================================================================

io.on("connection", (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // ================================================================
    //  EVENT 1: User joins (with username)
    // ================================================================
    socket.on("user-join", (username) => {
        // Save user info
        connectedUsers.set(socket.id, {
            username,
            socketId: socket.id,
            status: "online",
            joinedAt: new Date(),
        });
        userSocketMap.set(username, socket.id);

        console.log(`✅ ${username} joined | Total online: ${connectedUsers.size}`);

        // Send updated online users list to EVERYONE
        io.emit("online-users", Array.from(connectedUsers.values()));

        // Notify others
        socket.broadcast.emit("notification", {
            type: "user-joined",
            message: `${username} is now online 🟢`,
            timestamp: new Date(),
        });
    });

    // ================================================================
    //  EVENT 2: Join a Chat Room
    // ================================================================
    socket.on("join-room", async (roomName) => {
        socket.join(roomName);
        const user = connectedUsers.get(socket.id);
        const username = user ? user.username : "Unknown";

        console.log(`🚪 ${username} joined room: ${roomName}`);

        // Send last 50 messages of this room (chat history)
        try {
            const history = await Message.find({ room: roomName })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            // Send in correct order (oldest first)
            socket.emit("chat-history", history.reverse());
        } catch (err) {
            console.error("Error fetching history:", err.message);
        }

        // Notify room members
        socket.to(roomName).emit("notification", {
            type: "room-join",
            message: `${username} joined the room`,
            room: roomName,
        });
    });

    // ================================================================
    //  EVENT 3: Send Message to Room
    // ================================================================
    socket.on("send-message", async (data) => {
        const { room, content, type = "text" } = data;
        const user = connectedUsers.get(socket.id);
        const username = user ? user.username : "Unknown";

        const messageData = {
            sender: username,
            room: room,
            content: content,
            type: type,
            readBy: [username], // Sender has "read" their own message
            timestamp: new Date(),
        };

        // Save to database
        try {
            const savedMsg = await Message.create(messageData);
            messageData._id = savedMsg._id;
        } catch (err) {
            console.error("Error saving message:", err.message);
        }

        // Send to ALL in the room (including sender)
        io.to(room).emit("new-message", messageData);

        console.log(`💬 [${room}] ${username}: ${content}`);
    });

    // ================================================================
    //  EVENT 4: Private Message (1-to-1)
    // ================================================================
    socket.on("private-message", async (data) => {
        const { to, content } = data;
        const user = connectedUsers.get(socket.id);
        const senderName = user ? user.username : "Unknown";

        // Find receiver's socket ID
        const receiverSocketId = userSocketMap.get(to);

        const messageData = {
            sender: senderName,
            receiver: to,
            room: `dm_${[senderName, to].sort().join("_")}`, // Consistent room name
            content: content,
            type: "text",
            timestamp: new Date(),
        };

        // Save to database
        try {
            await Message.create(messageData);
        } catch (err) {
            console.error("Error saving DM:", err.message);
        }

        // Send to receiver (if online)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("private-message", messageData);
        }

        // Send back to sender (confirmation)
        socket.emit("private-message", messageData);

        console.log(`🔒 DM: ${senderName} → ${to}: ${content}`);
    });

    // ================================================================
    //  EVENT 5: Typing Indicator
    // ================================================================
    socket.on("typing-start", (data) => {
        const { room } = data;
        const user = connectedUsers.get(socket.id);
        const username = user ? user.username : "Unknown";

        // Notify others in the room (NOT the sender)
        socket.to(room).emit("user-typing", {
            username: username,
            isTyping: true,
        });
    });

    socket.on("typing-stop", (data) => {
        const { room } = data;
        const user = connectedUsers.get(socket.id);
        const username = user ? user.username : "Unknown";

        socket.to(room).emit("user-typing", {
            username: username,
            isTyping: false,
        });
    });

    // ================================================================
    //  EVENT 6: Mark Messages as Read (Read Receipts ✓✓)
    // ================================================================
    socket.on("mark-read", async (data) => {
        const { messageIds, room } = data;
        const user = connectedUsers.get(socket.id);
        const username = user ? user.username : "Unknown";

        try {
            // Add username to readBy array for each message
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { $addToSet: { readBy: username } } // $addToSet avoids duplicates
            );

            // Notify room that messages were read
            socket.to(room).emit("messages-read", {
                messageIds,
                readBy: username,
            });
        } catch (err) {
            console.error("Error marking read:", err.message);
        }
    });

    // ================================================================
    //  EVENT 7: Leave Room
    // ================================================================
    socket.on("leave-room", (roomName) => {
        socket.leave(roomName);
        const user = connectedUsers.get(socket.id);
        const username = user ? user.username : "Unknown";

        socket.to(roomName).emit("notification", {
            type: "room-leave",
            message: `${username} left the room`,
        });
    });

    // ================================================================
    //  EVENT 8: Disconnect
    // ================================================================
    socket.on("disconnect", () => {
        const user = connectedUsers.get(socket.id);

        if (user) {
            console.log(`❌ ${user.username} disconnected`);
            userSocketMap.delete(user.username);
            connectedUsers.delete(socket.id);

            // Notify everyone
            io.emit("online-users", Array.from(connectedUsers.values()));
            io.emit("notification", {
                type: "user-left",
                message: `${user.username} went offline 🔴`,
            });
        }
    });
});

// =====================================================================
//  REST API — Fetch Chat History
// =====================================================================

app.get("/api/messages/:room", async (req, res) => {
    try {
        const { room } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const messages = await Message.find({ room })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const total = await Message.countDocuments({ room });

        res.json({
            success: true,
            data: messages.reverse(),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all rooms
app.get("/api/rooms", async (req, res) => {
    try {
        const rooms = await Message.distinct("room");
        res.json({ success: true, rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================================================================
//  START SERVER
// =====================================================================

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Chat server running at http://localhost:${PORT}`);
    console.log(`🔌 WebSocket ready for connections!\n`);
});

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. Room-based messaging:
//     → socket.join("room1") → User enters the room
//     → io.to("room1").emit() → Message goes to room members ONLY
//     → Like WhatsApp groups — message stays within the group
//
//  2. Private Messaging:
//     → Find receiver's socketId from the userSocketMap
//     → io.to(socketId).emit() → Send directly to that ONE user
//     → Create a consistent room name: dm_user1_user2 (sorted)
//
//  3. Typing Indicator:
//     → Frontend detects "keypress" → emits "typing-start"
//     → After 2 seconds of no typing → emits "typing-stop"
//     → Use socket.to(room).emit (NOT io.emit) to exclude sender
//
//  4. Message Persistence:
//     → ALWAYS save messages to database (MongoDB)
//     → If user reconnects, load history from DB
//     → Without DB, messages are LOST on server restart
//
//  5. Read Receipts:
//     → readBy array tracks who has seen the message
//     → $addToSet prevents duplicate entries
//     → Frontend shows ✓ (sent), ✓✓ (read) based on readBy
//
//  6. Scaling WebSockets:
//     → Single server can handle ~10,000 concurrent connections
//     → For more, use Socket.io adapter with Redis
//     → npm install @socket.io/redis-adapter
//     → Redis syncs events across multiple Node.js servers
//
// =====================================================================
