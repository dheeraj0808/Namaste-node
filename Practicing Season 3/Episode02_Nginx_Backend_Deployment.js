// =====================================================================
//  Episode 02 — Nginx & Backend Node App Deployment
// =====================================================================
//
//  🤔 What is Nginx?
//  ------------------
//  Nginx (pronounced "Engine-X") = A web server + reverse proxy.
//
//  Real-life analogy:
//  → Imagine a restaurant. Customers (users) come in.
//  → Nginx = The RECEPTIONIST at the front desk
//  → Your Node.js app = The CHEF in the kitchen
//
//  Receptionist decides:
//  → "Ye customer frontend chahta hai" → serve static files
//  → "Ye API request hai" → forward to the Node.js backend
//
//  📌 Why not just use Node.js directly?
//  → Nginx handles 10,000+ connections simultaneously (Node can't)
//  → Nginx serves static files MUCH faster than Node.js
//  → Nginx can do load balancing (multiple Node servers)
//  → Nginx handles SSL/HTTPS (free with Let's Encrypt)
//
// =====================================================================

// =====================================================================
//  STEP 1: Install Nginx on EC2
// =====================================================================
//
//  # SSH into your EC2 instance first
//  ssh -i "my-key.pem" ubuntu@<your-ec2-ip>
//
//  # Install Nginx
//  sudo apt update
//  sudo apt install nginx -y
//
//  # Start Nginx
//  sudo systemctl start nginx
//  sudo systemctl enable nginx   # Auto-start on reboot
//
//  # Check status
//  sudo systemctl status nginx   # Should show "active (running)"
//
//  # Now open your EC2 Public IP in browser → You should see
//  # "Welcome to nginx!" page 🎉
//
// =====================================================================

// =====================================================================
//  STEP 2: Deploy Backend Node.js App
// =====================================================================
//
//  # Clone your backend project
//  git clone https://github.com/your-username/backend-app.git
//  cd backend-app
//
//  # Install dependencies
//  npm install
//
//  # Test if it works
//  node app.js   # Should show "Server running on port 3000"
//
//  # But if you close the terminal, the server STOPS! ❌
//  # Solution: Use PM2 (Process Manager)
//
// =====================================================================

// =====================================================================
//  STEP 3: Install PM2 — Keep Node.js Running Forever
// =====================================================================
//
//  # Install PM2 globally
//  npm install -g pm2
//
//  # Start your app with PM2
//  pm2 start app.js --name "my-backend"
//
//  # Useful PM2 Commands:
//  pm2 list              # Show all running processes
//  pm2 logs              # Show logs (console.log output)
//  pm2 restart my-backend   # Restart the app
//  pm2 stop my-backend      # Stop the app
//  pm2 delete my-backend    # Remove from PM2
//
//  # Make PM2 auto-start on server reboot
//  pm2 startup
//  pm2 save
//
//  📌 PM2 ka kaam:
//  → App crash ho jaaye → PM2 automatically restart kar deta hai
//  → Server reboot ho → PM2 phir se app start kar deta hai
//  → Logs manage karta hai
//
// =====================================================================

// =====================================================================
//  STEP 4: Configure Nginx as Reverse Proxy
// =====================================================================
//
//  🤔 What is Reverse Proxy?
//  → Client sends request to Nginx (port 80)
//  → Nginx FORWARDS that request to Node.js (port 3000)
//  → Node.js processes it and sends response BACK to Nginx
//  → Nginx sends it to the client
//
//  Client ←→ Nginx (port 80) ←→ Node.js (port 3000)
//
//  # Edit Nginx config file
//  sudo nano /etc/nginx/sites-available/default
//
//  # Replace the content with:
//
//  ┌────────────────────────────────────────────────┐
//  │  server {                                      │
//  │      listen 80;                                │
//  │      server_name your-domain.com;              │
//  │                                                │
//  │      # Frontend — serve static files           │
//  │      location / {                              │
//  │          root /home/ubuntu/frontend/dist;      │
//  │          try_files $uri $uri/ /index.html;     │
//  │      }                                         │
//  │                                                │
//  │      # Backend API — reverse proxy             │
//  │      location /api/ {                          │
//  │          proxy_pass http://localhost:3000;      │
//  │          proxy_http_version 1.1;               │
//  │          proxy_set_header Upgrade $http_upgrade;│
//  │          proxy_set_header Connection 'upgrade'; │
//  │          proxy_set_header Host $host;           │
//  │          proxy_cache_bypass $http_upgrade;      │
//  │      }                                         │
//  │  }                                             │
//  └────────────────────────────────────────────────┘
//
//  # Test config for errors
//  sudo nginx -t
//
//  # Restart Nginx
//  sudo systemctl restart nginx
//
// =====================================================================

// =====================================================================
//  SAMPLE BACKEND APP (that Nginx will proxy to)
// =====================================================================

const express = require("express");
const app = express();

app.use(express.json());

// Health check route — useful to verify server is running
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        server: "Backend is running!",
        timestamp: new Date().toISOString(),
        uptime: process.uptime() + " seconds",
    });
});

// Sample API routes
app.get("/api/users", (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: "Ujjwal" },
            { id: 2, name: "Akshay" },
        ],
    });
});

app.post("/api/users", (req, res) => {
    const { name, email } = req.body;
    res.status(201).json({
        success: true,
        message: `User ${name} created!`,
    });
});

// Listen on 3000 — Nginx will proxy from port 80 to here
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`📡 Nginx will proxy requests from port 80 → ${PORT}`);
});

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. Port 80 = Default HTTP port (user ko URL mein port likhne ki zarurat nahi)
//     → http://example.com = http://example.com:80
//
//  2. Nginx serves frontend DIRECTLY (fast, no Node.js needed)
//     Nginx forwards /api/* requests to Node.js (reverse proxy)
//
//  3. PM2 ensures your Node.js app NEVER goes down:
//     → Crash recovery (auto restart)
//     → Log management
//     → Cluster mode (use all CPU cores)
//
//  4. try_files $uri $uri/ /index.html;
//     → Pehle exact file dhundho
//     → Nahi mili toh /index.html serve karo
//     → This is for React Router (SPA) to work
//
//  5. proxy_pass = "Forward this request to another server"
//     → Nginx receives on port 80
//     → Forwards to Node.js on port 3000
//
// =====================================================================
