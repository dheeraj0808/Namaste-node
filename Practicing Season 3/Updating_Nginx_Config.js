// =====================================================================
//  Updating Nginx Config — WebSocket Support & Production Setup
// =====================================================================
//
//  🤔 Why update Nginx config?
//  ----------------------------
//  After adding WebSocket (Socket.io), we need to update Nginx
//  because by default Nginx does NOT support WebSocket connections.
//
//  Without this update:
//  → Socket.io falls back to HTTP long-polling (SLOW! ❌)
//  → Real-time features won't work properly
//  → Users will experience delays in live chat
//
//  With this update:
//  → WebSocket connections work through Nginx ✅
//  → Real-time data flows instantly
//  → Socket.io uses native WebSocket (FAST! ⚡)
//
// =====================================================================

// =====================================================================
//  UPDATED NGINX CONFIG FILE
// =====================================================================
//
//  File location: /etc/nginx/sites-available/default
//
//  # Edit the file:
//  sudo nano /etc/nginx/sites-available/default
//
//  ┌─────────────────────────────────────────────────────────────────┐
//  │                                                                 │
//  │  # HTTP → HTTPS redirect                                       │
//  │  server {                                                       │
//  │      listen 80;                                                 │
//  │      server_name yourdomain.com www.yourdomain.com;             │
//  │      return 301 https://$server_name$request_uri;               │
//  │  }                                                              │
//  │                                                                 │
//  │  # Main HTTPS server                                            │
//  │  server {                                                       │
//  │      listen 443 ssl;                                            │
//  │      server_name yourdomain.com www.yourdomain.com;             │
//  │                                                                 │
//  │      # SSL certificates (from Let's Encrypt)                    │
//  │      ssl_certificate /etc/letsencrypt/live/yourdomain/fullchain;│
//  │      ssl_certificate_key /etc/letsencrypt/live/yourdomain/privkey│
//  │                                                                 │
//  │      # ─── Frontend (Static Files) ──────────────────           │
//  │      location / {                                               │
//  │          root /home/ubuntu/frontend/dist;                       │
//  │          try_files $uri $uri/ /index.html;                      │
//  │      }                                                          │
//  │                                                                 │
//  │      # ─── Backend API (Reverse Proxy) ──────────────           │
//  │      location /api/ {                                           │
//  │          proxy_pass http://localhost:3000;                       │
//  │          proxy_http_version 1.1;                                │
//  │          proxy_set_header Host $host;                           │
//  │          proxy_set_header X-Real-IP $remote_addr;               │
//  │      }                                                          │
//  │                                                                 │
//  │      # ─── WebSocket Support (NEW!) ─────────────────           │
//  │      location /socket.io/ {                                     │
//  │          proxy_pass http://localhost:3000;                       │
//  │          proxy_http_version 1.1;                                │
//  │                                                                 │
//  │          # These 2 headers UPGRADE HTTP → WebSocket             │
//  │          proxy_set_header Upgrade $http_upgrade;                │
//  │          proxy_set_header Connection "upgrade";                 │
//  │                                                                 │
//  │          proxy_set_header Host $host;                           │
//  │          proxy_set_header X-Real-IP $remote_addr;               │
//  │          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded│
//  │                                                                 │
//  │          # Timeout settings for long-lived connections          │
//  │          proxy_read_timeout 86400s;  # 24 hours                 │
//  │          proxy_send_timeout 86400s;                             │
//  │      }                                                          │
//  │  }                                                              │
//  │                                                                 │
//  └─────────────────────────────────────────────────────────────────┘
//
// =====================================================================

// =====================================================================
//  COMMANDS TO APPLY THE CONFIG:
// =====================================================================
//
//  # Test config for syntax errors
//  sudo nginx -t
//  # Expected output: "syntax is ok" and "test is successful"
//
//  # Restart Nginx to apply changes
//  sudo systemctl restart nginx
//
//  # Check if Nginx is running
//  sudo systemctl status nginx
//
// =====================================================================

// =====================================================================
//  🧠 KEY LINES EXPLAINED:
// =====================================================================
//
//  1. proxy_set_header Upgrade $http_upgrade;
//     → Tells Nginx to pass the "Upgrade" header from client
//     → This header says "I want to upgrade from HTTP to WebSocket"
//
//  2. proxy_set_header Connection "upgrade";
//     → Tells Nginx to keep the connection open for upgrade
//     → Without this, Nginx closes the connection after HTTP response
//
//  3. proxy_http_version 1.1;
//     → WebSocket requires HTTP 1.1 (not 1.0)
//     → HTTP 1.1 supports persistent connections
//
//  4. proxy_read_timeout 86400s;
//     → Default Nginx timeout = 60 seconds
//     → WebSocket connections are LONG-LIVED (hours/days)
//     → Set to 24 hours so Nginx doesn't kill the connection
//
//  5. location /socket.io/ {
//     → Socket.io client automatically sends requests to /socket.io/
//     → This tells Nginx to forward those requests to Node.js
//     → WITHOUT this, WebSocket connection will FAIL through Nginx
//
//  6. X-Real-IP & X-Forwarded-For
//     → When Nginx proxies, Node.js sees Nginx's IP (127.0.0.1)
//     → These headers preserve the CLIENT's real IP address
//     → Important for logging, rate limiting, security
//
// =====================================================================

// =====================================================================
//  VERIFY WEBSOCKET IS WORKING:
// =====================================================================
//
//  # Check from browser DevTools → Network tab → Filter: WS
//  # You should see a WebSocket connection with status 101
//
//  # Or use wscat (WebSocket CLI tool):
//  # npm install -g wscat
//  # wscat -c ws://yourdomain.com/socket.io/?EIO=4&transport=websocket
//
//  # If you see "connected", WebSocket is working! ✅
//
// =====================================================================

console.log("📝 This file is a reference guide for Nginx WebSocket config.");
console.log("📂 Edit: /etc/nginx/sites-available/default");
console.log("🔄 Apply: sudo nginx -t && sudo systemctl restart nginx");
