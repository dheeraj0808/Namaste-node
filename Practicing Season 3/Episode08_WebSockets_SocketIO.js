// =====================================================================
//  Episode 08 — Web Sockets & Socket.io
// =====================================================================
//
//  🤔 What are WebSockets?
//  ------------------------
//  Normal HTTP = One-way conversation
//  → Client asks → Server responds → Connection CLOSES ❌
//  → For new data, client has to ask AGAIN (polling)
//
//  WebSocket = Two-way LIVE connection
//  → Connection stays OPEN 🟢
//  → Server can send data anytime WITHOUT client asking
//  → Client can send data anytime too
//  → Real-time communication!
//
//  Real-life analogy:
//  → HTTP = Sending letters (write → send → wait → get reply)
//  → WebSocket = Phone call (both can talk anytime, connection is LIVE)
//
//  📌 Use Cases:
//  → Live Chat (WhatsApp, Telegram)
//  → Real-time Notifications
//  → Live Score Updates (Cricket/Football)
//  → Stock Market Tickers
//  → Multiplayer Games
//  → Collaborative Editing (Google Docs)
//  → Live Location Tracking (Uber, Swiggy)
//
// =====================================================================

// =====================================================================
//  HTTP vs WebSocket — Comparison
// =====================================================================
//
//  ┌──────────────────┬──────────────────────────────────────┐
//  │     HTTP         │     WebSocket                        │
//  ├──────────────────┼──────────────────────────────────────┤
//  │ Request-Response │ Persistent bi-directional connection │
//  │ Client initiates │ Both can initiate                    │
//  │ Stateless        │ Stateful (connection remembered)     │
//  │ http://          │ ws:// (or wss:// for secure)         │
//  │ New connection   │ Single persistent connection         │
//  │ each time        │                                      │
//  │ Higher overhead  │ Low overhead (no headers each time)  │
//  └──────────────────┴──────────────────────────────────────┘
//
// =====================================================================

// =====================================================================
//  What is Socket.io?
// =====================================================================
//
//  Socket.io = A library that makes WebSocket EASY to use.
//
//  Raw WebSocket is complex. Socket.io gives you:
//  → Auto-reconnection (if connection drops, it reconnects)
//  → Fallback to HTTP long-polling (if WebSocket isn't supported)
//  → Rooms & Namespaces (group users)
//  → Event-based communication (emit & listen)
//  → Works with Express easily
//
// =====================================================================

// =====================================================================
//  INSTALL: npm install express socket.io
// =====================================================================

const express = require("express");
const http = require("http"); // Built-in Node.js module
const { Server } = require("socket.io");

const app = express();

// IMPORTANT: We need http.createServer (not app.listen directly)
// because Socket.io needs the raw HTTP server
const server = http.createServer(app);

// Initialize Socket.io and attach it to the HTTP server
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (in production, specify your domain)
        methods: ["GET", "POST"],
    },
});

// Serve a simple HTML page for testing
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Socket.io Chat</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial; background: #1a1a2e; color: #fff;
               display: flex; justify-content: center; align-items: center;
               min-height: 100vh; }
        .chat-container { width: 400px; background: #16213e;
                         border-radius: 15px; overflow: hidden; }
        .header { background: #0f3460; padding: 15px; text-align: center;
                  font-size: 18px; }
        .messages { height: 400px; overflow-y: auto; padding: 15px; }
        .message { margin: 8px 0; padding: 10px 15px; border-radius: 10px;
                   background: #1a1a40; max-width: 80%; }
        .message.own { background: #533483; margin-left: auto; }
        .message .author { font-size: 11px; color: #e94560; margin-bottom: 4px; }
        .input-area { display: flex; padding: 10px; background: #0f3460; }
        input { flex: 1; padding: 10px; border: none; border-radius: 8px;
                background: #1a1a2e; color: #fff; outline: none; }
        button { padding: 10px 20px; margin-left: 8px; border: none;
                 background: #e94560; color: #fff; border-radius: 8px;
                 cursor: pointer; }
        .status { text-align: center; padding: 5px; font-size: 12px;
                  color: #4ecca3; }
      </style>
    </head>
    <body>
      <div class="chat-container">
        <div class="header">💬 NamasteNode Chat</div>
        <div class="status" id="status">Connecting...</div>
        <div class="messages" id="messages"></div>
        <div class="input-area">
          <input id="msgInput" placeholder="Type a message..." autocomplete="off" />
          <button onclick="sendMsg()">Send</button>
        </div>
      </div>

      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();
        const messagesDiv = document.getElementById("messages");
        const statusDiv = document.getElementById("status");

        // Connected
        socket.on("connect", () => {
          statusDiv.textContent = "🟢 Connected | ID: " + socket.id;
        });

        // Disconnected
        socket.on("disconnect", () => {
          statusDiv.textContent = "🔴 Disconnected";
        });

        // Receive message
        socket.on("chat-message", (data) => {
          const div = document.createElement("div");
          div.className = "message" + (data.id === socket.id ? " own" : "");
          div.innerHTML = '<div class="author">' + data.username + '</div>' + data.message;
          messagesDiv.appendChild(div);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });

        // Receive user joined/left notifications
        socket.on("notification", (msg) => {
          const div = document.createElement("div");
          div.style.cssText = "text-align:center; color:#4ecca3; font-size:12px; margin:10px 0;";
          div.textContent = msg;
          messagesDiv.appendChild(div);
        });

        // Send message
        function sendMsg() {
          const input = document.getElementById("msgInput");
          if (input.value.trim()) {
            socket.emit("chat-message", input.value);
            input.value = "";
          }
        }

        // Send on Enter key
        document.getElementById("msgInput").addEventListener("keypress", (e) => {
          if (e.key === "Enter") sendMsg();
        });
      </script>
    </body>
    </html>
  `);
});

// =====================================================================
//  SOCKET.IO — Server Side Events
// =====================================================================

// Track connected users
let onlineUsers = 0;

// "connection" event fires when a new client connects
io.on("connection", (socket) => {
    onlineUsers++;
    const username = `User_${socket.id.slice(0, 5)}`;

    console.log(`✅ ${username} connected | Online: ${onlineUsers}`);

    // Notify everyone that a new user joined
    io.emit("notification", `${username} joined the chat 👋 (${onlineUsers} online)`);

    // ---- Listen for chat messages from this client ----
    socket.on("chat-message", (message) => {
        console.log(`💬 ${username}: ${message}`);

        // io.emit → Send to ALL connected clients (including sender)
        io.emit("chat-message", {
            id: socket.id,
            username: username,
            message: message,
            timestamp: new Date().toISOString(),
        });
    });

    // ---- "disconnect" event when client leaves ----
    socket.on("disconnect", () => {
        onlineUsers--;
        console.log(`❌ ${username} disconnected | Online: ${onlineUsers}`);
        io.emit("notification", `${username} left the chat 😢 (${onlineUsers} online)`);
    });
});

// =====================================================================
//  KEY EMIT METHODS:
// =====================================================================
//
//  socket.emit("event", data)
//  → Send to ONLY this specific client
//
//  io.emit("event", data)
//  → Send to ALL connected clients (broadcast to everyone)
//
//  socket.broadcast.emit("event", data)
//  → Send to ALL clients EXCEPT the sender
//
//  io.to("room-name").emit("event", data)
//  → Send to all clients in a specific ROOM
//
//  socket.join("room-name")
//  → Add this client to a room
//
//  socket.leave("room-name")
//  → Remove this client from a room
//
// =====================================================================

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔌 Socket.io is ready for WebSocket connections!\n`);
});

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. Why http.createServer(app) instead of app.listen()?
//     → Socket.io needs the raw HTTP server to upgrade
//       HTTP connections to WebSocket connections
//     → app.listen() creates an HTTP server internally but
//       doesn't give you access to it
//
//  2. socket.id = unique identifier for each connected client
//     → Changes on each reconnection
//     → Use it to identify who sent what
//
//  3. Rooms = Groups of sockets
//     → Like WhatsApp Groups
//     → socket.join("room1") → Add user to room
//     → io.to("room1").emit() → Send message to room only
//     → Great for: private chats, game lobbies, notifications
//
//  4. Namespaces = Separate "channels" on the same server
//     → / = default namespace
//     → /admin = admin namespace
//     → /chat = chat namespace
//     → Each namespace has its own events and connections
//
//  5. Socket.io automatically handles:
//     → Reconnection (if internet drops, it reconnects)
//     → Heartbeat (checks if connection is alive)
//     → Fallback (uses HTTP long-polling if WebSocket fails)
//
//  6. CORS is important for Socket.io too!
//     → If frontend is on different port/domain, enable CORS
//
// =====================================================================
