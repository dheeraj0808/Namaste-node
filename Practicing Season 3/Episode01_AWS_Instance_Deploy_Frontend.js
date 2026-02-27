// =====================================================================
//  Episode 01 — Launching an AWS Instance & Deploying Frontend
// =====================================================================
//
//  🤔 What is AWS?
//  ----------------
//  AWS (Amazon Web Services) = Cloud computing platform by Amazon
//  Think of it as renting a COMPUTER on the internet.
//  Instead of buying a physical server, you rent one from Amazon.
//
//  📌 Key Terms:
//  → EC2 (Elastic Compute Cloud) = Virtual server (computer) on AWS
//  → Instance = One running EC2 server
//  → AMI (Amazon Machine Image) = Pre-built OS template (like Ubuntu, Amazon Linux)
//  → Security Group = Firewall rules (which ports are open)
//  → Key Pair (.pem file) = Password to SSH into your server
//
// =====================================================================

// =====================================================================
//  STEP 1: Launch an EC2 Instance (AWS Console pe jaake)
// =====================================================================
//
//  1. Login to AWS Console → https://aws.amazon.com/console/
//  2. Search "EC2" → Click "Launch Instance"
//  3. Settings:
//     → Name: "my-first-server"
//     → AMI: Ubuntu (Free Tier eligible) ✅
//     → Instance Type: t2.micro (Free Tier — 1 vCPU, 1 GB RAM)
//     → Key Pair: Create new → download .pem file (SAVE IT SAFELY!)
//     → Security Group: Allow SSH (22), HTTP (80), HTTPS (443)
//  4. Click "Launch Instance"
//
// =====================================================================

// =====================================================================
//  STEP 2: Connect to your EC2 Instance via SSH
// =====================================================================
//
//  Terminal se connect karo:
//
//  # First, set permissions on the key file
//  chmod 400 my-key.pem
//
//  # Then SSH into the instance
//  ssh -i "my-key.pem" ubuntu@<your-ec2-public-ip>
//
//  Example:
//  ssh -i "my-key.pem" ubuntu@54.123.45.67
//
//  📌 "ubuntu" = default username for Ubuntu AMI
//  📌 Public IP = AWS Console mein instance ke details mein milega
//
// =====================================================================

// =====================================================================
//  STEP 3: Setup the Server (EC2 ke andar)
// =====================================================================
//
//  # Update packages
//  sudo apt update && sudo apt upgrade -y
//
//  # Install Node.js (using nvm — Node Version Manager)
//  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
//  source ~/.bashrc
//  nvm install 20
//  node -v   # Should show v20.x.x
//
//  # Install Git
//  sudo apt install git -y
//
// =====================================================================

// =====================================================================
//  STEP 4: Deploy Frontend
// =====================================================================
//
//  # Clone your project from GitHub
//  git clone https://github.com/your-username/your-project.git
//  cd your-project
//
//  # Install dependencies
//  npm install
//
//  # Build the frontend (for React/Vite projects)
//  npm run build
//
//  # The "build" or "dist" folder contains your static files
//  # Now we need a web server to serve these files — that's Episode 02!
//
// =====================================================================

// =====================================================================
//  SIMPLE EXPRESS SERVER TO SERVE FRONTEND (basic approach)
// =====================================================================

const express = require("express");
const path = require("path");

const app = express();

// Serve static files from the "dist" or "build" folder
// This is how you serve a React/Vite built frontend
app.use(express.static(path.join(__dirname, "dist")));

// For Single Page Applications (SPA like React)
// Any route that doesn't match a file → send index.html
// This is needed because React handles routing on the client side
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 80; // Port 80 = default HTTP port
app.listen(PORT, () => {
    console.log(`🚀 Frontend is live on port ${PORT}`);
});

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. Free Tier = AWS gives you 750 hours/month of t2.micro FREE
//     for 12 months after signup. Uske baad charges lagenge!
//
//  2. NEVER share your .pem key file — whoever has it can access
//     your server. Treat it like a password.
//
//  3. Elastic IP = A static public IP that doesn't change when you
//     restart your instance. Free while instance is running.
//
//  4. Security Groups = Firewall
//     → Port 22 (SSH) = Terminal access
//     → Port 80 (HTTP) = Website access
//     → Port 443 (HTTPS) = Secure website access
//     → Port 3000, 8080 = Custom app ports
//
//  5. path.join(__dirname, "dist") = Creates absolute path to dist folder
//     __dirname = current file ka folder path
//
// =====================================================================
