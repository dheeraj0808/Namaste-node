// =====================================================================
//  Episode 03 — Adding a Custom Domain Name
// =====================================================================
//
//  🤔 What is a Domain Name?
//  --------------------------
//  Domain = Human-readable name for an IP address.
//
//  → IP Address: 54.123.45.67 (hard to remember 😵)
//  → Domain:     www.ujjwal.com (easy to remember 😎)
//
//  Real-life analogy:
//  → IP Address = Your house's GPS coordinates (28.6139° N, 77.2090° E)
//  → Domain Name = Your house address ("123, MG Road, Delhi")
//  → DNS = The system that converts address → GPS coordinates
//
// =====================================================================

// =====================================================================
//  KEY TERMS:
// =====================================================================
//
//  📌 DNS (Domain Name System)
//     → Internet ki phone book
//     → Converts domain name → IP address
//     → When you type "google.com", DNS tells your browser
//       "google.com ka IP hai 142.250.190.14, wahan jao"
//
//  📌 Domain Registrar
//     → Company jahan se domain khareedto ho
//     → Examples: GoDaddy, Namecheap, Google Domains, Route 53 (AWS)
//
//  📌 DNS Records (most important ones):
//
//     A Record     → Maps domain → IPv4 address
//                     example.com → 54.123.45.67
//
//     AAAA Record  → Maps domain → IPv6 address
//
//     CNAME Record → Maps domain → another domain (alias)
//                     www.example.com → example.com
//
//     MX Record    → Mail server (for receiving emails)
//
//     TXT Record   → Text info (used for verification, SPF)
//
//     NS Record    → Which Name Server manages this domain
//
// =====================================================================

// =====================================================================
//  STEP-BY-STEP: Connect Domain to EC2
// =====================================================================
//
//  STEP 1: Buy a Domain
//  → Go to any registrar (Namecheap, GoDaddy, etc.)
//  → Search & buy your domain (e.g., ujjwal.com)
//
//  STEP 2: Get your EC2 Elastic IP
//  → AWS Console → EC2 → Elastic IPs → Allocate
//  → Associate it with your EC2 instance
//  → Now your IP won't change on restart!
//
//  STEP 3: Add DNS Records
//  → Go to your domain registrar's DNS settings
//  → Add these records:
//
//  ┌────────────┬──────────┬───────────────────┐
//  │ Type       │ Name     │ Value              │
//  ├────────────┼──────────┼───────────────────┤
//  │ A Record   │ @        │ 54.123.45.67       │
//  │ A Record   │ www      │ 54.123.45.67       │
//  └────────────┴──────────┴───────────────────┘
//
//  → "@" means the root domain (ujjwal.com)
//  → "www" means www.ujjwal.com
//  → Both point to your EC2 IP
//
//  STEP 4: Update Nginx config
//  → sudo nano /etc/nginx/sites-available/default
//  → Change server_name to your domain:
//
//     server_name ujjwal.com www.ujjwal.com;
//
//  → Restart Nginx: sudo systemctl restart nginx
//
//  STEP 5: Wait for DNS Propagation
//  → DNS changes take 5 min to 48 hours to spread worldwide
//  → Check status: https://www.whatsmydns.net/
//
// =====================================================================

// =====================================================================
//  STEP 6: Add FREE SSL (HTTPS) using Let's Encrypt
// =====================================================================
//
//  🤔 What is SSL/HTTPS?
//  → HTTP  = Data travels in PLAIN TEXT (anyone can read it) 🔓
//  → HTTPS = Data is ENCRYPTED (only sender & receiver can read) 🔒
//
//  Without HTTPS:
//  → Browser shows "Not Secure" warning ⚠️
//  → Google penalizes your SEO ranking
//  → Users don't trust your site
//
//  # Install Certbot (Let's Encrypt client)
//  sudo apt install certbot python3-certbot-nginx -y
//
//  # Get SSL certificate (FREE!)
//  sudo certbot --nginx -d ujjwal.com -d www.ujjwal.com
//
//  # Follow the prompts:
//  → Enter email address
//  → Agree to terms
//  → Choose "Redirect HTTP to HTTPS" (recommended)
//
//  # Auto-renewal (certificates expire every 90 days)
//  # Certbot automatically sets up a cron job for renewal
//  # Test it:
//  sudo certbot renew --dry-run
//
//  # Now visit https://ujjwal.com → You'll see the 🔒 lock icon!
//
// =====================================================================

// =====================================================================
//  SAMPLE: How your final Nginx config looks with SSL
// =====================================================================
//
//  server {
//      listen 80;
//      server_name ujjwal.com www.ujjwal.com;
//      return 301 https://$server_name$request_uri;  ← Redirect to HTTPS
//  }
//
//  server {
//      listen 443 ssl;
//      server_name ujjwal.com www.ujjwal.com;
//
//      ssl_certificate /etc/letsencrypt/live/ujjwal.com/fullchain.pem;
//      ssl_certificate_key /etc/letsencrypt/live/ujjwal.com/privkey.pem;
//
//      location / {
//          root /home/ubuntu/frontend/dist;
//          try_files $uri $uri/ /index.html;
//      }
//
//      location /api/ {
//          proxy_pass http://localhost:3000;
//          proxy_http_version 1.1;
//          proxy_set_header Host $host;
//      }
//  }
//
// =====================================================================

// Simple Node.js example to check if request came via HTTPS
const express = require("express");
const app = express();

app.get("/api/check-protocol", (req, res) => {
    res.json({
        protocol: req.protocol,              // "http" or "https"
        secure: req.secure,                   // true if HTTPS
        host: req.headers.host,              // "ujjwal.com"
        fullUrl: `${req.protocol}://${req.headers.host}${req.originalUrl}`,
    });
});

app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. DNS Propagation = Domain changes take time to spread globally
//     → Can take 5 minutes to 48 hours
//     → Different users might see old/new IP during this time
//
//  2. Elastic IP = Static IP that stays same even after EC2 restart
//     → Free while associated with a running instance
//     → Charged if instance is stopped ($$)
//
//  3. SSL Certificate = Digital proof that your site is genuine
//     → Let's Encrypt gives FREE certificates
//     → Must renew every 90 days (Certbot does it automatically)
//
//  4. HTTP → HTTPS redirect = ALWAYS do this
//     → Anyone visiting http://ujjwal.com gets auto-redirected
//       to https://ujjwal.com
//
//  5. TTL (Time To Live) = How long DNS record is cached
//     → Low TTL (300s) = Changes propagate faster
//     → High TTL (86400s) = Changes take longer
//
// =====================================================================
