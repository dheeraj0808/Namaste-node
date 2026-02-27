# 🚀 Namaste Node

A comprehensive **Node.js learning repository** following the [Namaste Node](https://namastedev.com/) course by Akshay Saini. This repo contains hands-on code, notes, and practice files covering Node.js fundamentals to advanced deployment concepts.

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

---

## 📁 Project Structure

```
NamasteNode/
│
├── V8 engine/                    # V8 JavaScript Engine internals
│   └── v8.js
│
├── Calculate/                    # Basic JS concepts
│   ├── index.js                  # Entry point
│   ├── sum.js                    # Sum function
│   ├── multiply.js               # Multiply function
│   └── shoadowing.js             # Variable shadowing
│
├── sync/                         # Sync vs Async operations
│   ├── sync.js                   # Synchronous file reading
│   ├── async.js                  # Asynchronous file reading
│   └── file.txt                  # Sample file for I/O
│
├── EventLoop/                    # Event Loop deep dive
│   ├── eventloop1.js             # Basic event loop
│   ├── eventloop2.js             # setTimeout & setInterval
│   ├── eventloop3.js             # Microtasks vs Macrotasks
│   └── eventloop4.js             # Advanced event loop
│
├── Ep10ThreadPoolInLibUv/        # Thread Pool in libuv
│   ├── basic.js                  # Basic thread pool demo
│   ├── threadpool_simple.js      # Simple thread pool usage
│   └── threadpool_explanation.js # Detailed explanation
│
├── Ep11Server/                   # Creating an HTTP server
│   └── basics.js                 # HTTP server from scratch
│
├── crud/                         # CRUD Operations
│   └── index.js                  # Express CRUD API
│
├── app.js                        # Main application entry
├── database.js                   # MongoDB connection
├── crud.js                       # CRUD operations file
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
│
├── Practicing Season 2/          # 🔥 Season 2 Practice
│   ├── server.js                 # Express server basics
│   ├── RoutingAndRequestHandler.js
│   └── DatabaseAndSchema/
│       ├── db.js                 # MongoDB connection
│       ├── schema.js             # Mongoose schema definition
│       └── model.js              # Mongoose model creation
│
└── Practicing Season 3/          # 🔥 Season 3 Practice
    ├── Episode01 — AWS & Frontend Deploy
    ├── Episode02 — Nginx & Backend Deployment
    ├── Episode03 — Custom Domain Name
    ├── Episode04 — Amazon SES Emails
    ├── Episode05 — dotenv & Credentials Safety
    ├── Episode06 — Scheduling Cron Jobs
    ├── Episode07 — Payment Gateway (Razorpay)
    ├── Episode08 — WebSockets & Socket.io
    ├── Episode09 — Real-time Live Chat
    └── Updating Nginx Config
```

---

## 📚 Topics Covered

### 🟢 Season 1 — Node.js Fundamentals

| Topic | Folder | Description |
|-------|--------|-------------|
| V8 Engine | `V8 engine/` | How JavaScript runs inside Node.js |
| Modules & Exports | `Calculate/` | `require()`, `module.exports`, importing/exporting |
| Sync vs Async | `sync/` | Blocking vs Non-blocking I/O operations |
| Event Loop | `EventLoop/` | Call stack, microtasks, macrotasks, execution order |
| Thread Pool (libuv) | `Ep10ThreadPoolInLibUv/` | How libuv handles async I/O with thread pool |
| HTTP Server | `Ep11Server/` | Creating server with `http.createServer()` |
| CRUD Operations | `crud/` | Create, Read, Update, Delete with Express |
| Database | `database.js` | MongoDB connection setup |

### 🟡 Season 2 — Express & Database

| Topic | File | Description |
|-------|------|-------------|
| Express Basics | `server.js` | Express app, `app.get()`, `app.listen()` |
| Routing & Request Handlers | `RoutingAndRequestHandler.js` | HTTP methods (GET, POST, PUT, PATCH, DELETE), route params, query params, middleware, regex routes, `app.route()` |
| Database Connection | `DatabaseAndSchema/db.js` | `mongoose.connect()`, connection pooling, error handling |
| Schema Definition | `DatabaseAndSchema/schema.js` | Field types, validators (`required`, `unique`, `enum`, `match`, `trim`, `default`), `timestamps` |
| Model Creation | `DatabaseAndSchema/model.js` | `mongoose.model()`, CRUD methods (`find`, `create`, `update`, `delete`) |

### 🔴 Season 3 — Deployment & Advanced Features

| Ep | Topic | File | Description |
|----|-------|------|-------------|
| 01 | AWS EC2 & Frontend Deploy | `Episode01_AWS_Instance_Deploy_Frontend.js` | Launch EC2, SSH, install Node.js, serve static files |
| 02 | Nginx & Backend Deploy | `Episode02_Nginx_Backend_Deployment.js` | Nginx setup, PM2 process manager, reverse proxy |
| 03 | Custom Domain | `Episode03_Custom_Domain_Name.js` | DNS records, domain setup, SSL/HTTPS with Let's Encrypt |
| 04 | Amazon SES Emails | `Episode04_Sending_Emails_Amazon_SES.js` | Send text/HTML/OTP emails using AWS SES |
| 05 | Credentials Safety | `Episode05_Dotenv_Credentials_Safety.js` | `.env` files, `process.env`, `.env.example` |
| 06 | Cron Jobs | `Episode06_Scheduling_Cron_Jobs.js` | `node-cron`, scheduled tasks, DB backup, cleanup |
| 07 | Payment Gateway | `Episode07_Payment_Gateway_Razorpay.js` | Razorpay integration, order → pay → verify → refund |
| 08 | WebSockets | `Episode08_WebSockets_SocketIO.js` | Socket.io, real-time chat with working UI |
| 09 | Live Chat Feature | `Episode09_Realtime_Live_Chat.js` | Rooms, DMs, typing indicator, read receipts, DB persistence |
| — | Nginx Config Update | `Updating_Nginx_Config.js` | WebSocket support in Nginx, SSL config |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework for APIs |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM (Object Data Modeling) |
| **Socket.io** | Real-time WebSocket communication |
| **Razorpay** | Payment gateway integration |
| **AWS EC2** | Cloud server hosting |
| **Nginx** | Web server & reverse proxy |
| **PM2** | Node.js process manager |
| **Amazon SES** | Email service |
| **node-cron** | Task scheduling |
| **dotenv** | Environment variable management |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed
- [MongoDB](https://www.mongodb.com/) running locally or Atlas URI
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/dheeraj0808/Namaste-node.git
cd Namaste-node

# For Season 2 practice files
cd "Practicing Season 2"
npm install

# Run the routing example
node RoutingAndRequestHandler.js
# Server runs at http://localhost:3001
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/namasteNodeDB
JWT_SECRET=your_secret_key
```

---

## 📖 How to Use This Repo

Each file is **heavily commented** with:
- ✅ Step-by-step explanations
- ✅ Real-life analogies (in Hinglish)
- ✅ Working code examples
- ✅ Important concepts section at the end
- ✅ Common mistakes and best practices

**Recommended approach:**
1. Read the comments in each file carefully
2. Run the code and experiment with it
3. Modify the code and observe the changes
4. Move to the next topic

---

## 📝 Key Learnings

- **Event Loop** is the heart of Node.js — understanding it is crucial
- **Middleware** = gatekeeper functions that process requests before route handlers
- **Schema** = blueprint for data structure, **Model** = power to interact with DB
- **WebSockets** enable real-time, bidirectional communication
- **Never hardcode secrets** — always use `.env` files
- **Nginx** as reverse proxy is essential for production deployments
- **PM2** keeps your Node.js app running forever with auto-restart

---

## 🤝 Credits

- Course by **[Akshay Saini](https://www.youtube.com/@akshaymarch7)** — [Namaste Node](https://namastedev.com/)
- Built with ❤️ while learning Node.js

---

## 📄 License

This project is for **educational purposes** only.
