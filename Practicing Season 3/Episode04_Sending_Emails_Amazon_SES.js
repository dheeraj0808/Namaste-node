// =====================================================================
//  Episode 04 — Sending Emails using Amazon SES
// =====================================================================
//
//  🤔 What is Amazon SES?
//  -----------------------
//  SES = Simple Email Service
//  → AWS ki email bhejne ki service
//  → Aap apne Node.js app se emails bhej sakte ho
//
//  Use cases:
//  → Welcome email jab user signup kare
//  → Password reset email
//  → Order confirmation
//  → OTP verification
//  → Newsletter
//
//  📌 Why SES and not Gmail?
//  → Gmail has limit (500 emails/day)
//  → SES can send 62,000 emails/month FREE (if sent from EC2)
//  → Professional — emails don't go to spam
//  → Scalable — handle millions of emails
//
// =====================================================================

// =====================================================================
//  SETUP STEPS (AWS Console pe):
// =====================================================================
//
//  STEP 1: Go to AWS Console → Search "SES"
//
//  STEP 2: Verify your email address
//  → SES → Verified Identities → Create Identity
//  → Choose "Email address" → Enter your email
//  → Check your inbox → Click verification link
//
//  📌 In SANDBOX mode (default):
//  → You can ONLY send to verified emails
//  → To send to anyone, request "Production Access" from AWS
//
//  STEP 3: Create IAM credentials for SES
//  → AWS Console → IAM → Users → Create User
//  → Attach policy: "AmazonSESFullAccess"
//  → Create Access Key → Save Access Key ID & Secret (safely!)
//
// =====================================================================

// =====================================================================
//  INSTALL REQUIRED PACKAGE
// =====================================================================
//  npm install @aws-sdk/client-ses

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// =====================================================================
//  Configure SES Client
// =====================================================================
// Region = AWS datacenter location where SES is enabled
// Common regions: us-east-1, ap-south-1 (Mumbai), eu-west-1

const sesClient = new SESClient({
    region: "ap-south-1", // Mumbai region (closest to India)
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "YOUR_ACCESS_KEY",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "YOUR_SECRET_KEY",
    },
});

// =====================================================================
//  Function 1: Send a SIMPLE text email
// =====================================================================

const sendSimpleEmail = async (to, subject, body) => {
    const params = {
        Source: "your-verified-email@example.com", // FROM — must be verified in SES

        Destination: {
            ToAddresses: [to], // TO — array of recipient emails
            // CcAddresses: ["cc@example.com"],   // Optional CC
            // BccAddresses: ["bcc@example.com"],  // Optional BCC
        },

        Message: {
            Subject: {
                Data: subject, // Email subject line
                Charset: "UTF-8",
            },
            Body: {
                Text: {
                    Data: body, // Plain text body
                    Charset: "UTF-8",
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const result = await sesClient.send(command);
        console.log("✅ Email sent! Message ID:", result.MessageId);
        return result;
    } catch (error) {
        console.error("❌ Email failed:", error.message);
        throw error;
    }
};

// =====================================================================
//  Function 2: Send an HTML email (with styling)
// =====================================================================

const sendHtmlEmail = async (to, subject) => {
    const htmlBody = `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to NamasteNode! 🚀</h1>
      </div>
      <div style="padding: 20px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Hi there!</p>
        <p style="font-size: 14px; color: #666;">
          Thank you for signing up. We're excited to have you on board.
        </p>
        <a href="https://example.com" 
           style="display: inline-block; background: #667eea; color: white; 
                  padding: 12px 30px; text-decoration: none; border-radius: 5px;
                  margin-top: 15px;">
          Get Started
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">
          If you didn't sign up, please ignore this email.
        </p>
      </div>
    </div>
  `;

    const params = {
        Source: "your-verified-email@example.com",
        Destination: { ToAddresses: [to] },
        Message: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
                Html: {
                    Data: htmlBody, // HTML body instead of Text
                    Charset: "UTF-8",
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const result = await sesClient.send(command);
        console.log("✅ HTML Email sent! Message ID:", result.MessageId);
        return result;
    } catch (error) {
        console.error("❌ Email failed:", error.message);
        throw error;
    }
};

// =====================================================================
//  Function 3: Send OTP Email
// =====================================================================

const sendOtpEmail = async (to, otp) => {
    const htmlBody = `
    <div style="font-family: Arial; text-align: center; padding: 40px;">
      <h2>Your Verification Code</h2>
      <div style="background: #f0f0f0; display: inline-block; padding: 20px 40px; 
                  border-radius: 10px; margin: 20px 0;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">
          ${otp}
        </span>
      </div>
      <p style="color: #666;">This code expires in 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">Do not share this code with anyone.</p>
    </div>
  `;

    const params = {
        Source: "your-verified-email@example.com",
        Destination: { ToAddresses: [to] },
        Message: {
            Subject: { Data: "Your OTP Code", Charset: "UTF-8" },
            Body: { Html: { Data: htmlBody, Charset: "UTF-8" } },
        },
    };

    const command = new SendEmailCommand(params);
    return await sesClient.send(command);
};

// =====================================================================
//  USE WITH EXPRESS (in your routes)
// =====================================================================

const express = require("express");
const app = express();
app.use(express.json());

// Send welcome email on signup
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email } = req.body;

        // ... save user to database ...

        // Send welcome email
        await sendHtmlEmail(email, `Welcome ${name}!`);

        res.status(201).json({ success: true, message: "Signup successful, email sent!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send OTP
app.post("/api/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // In real app: Save OTP to DB with expiry time
        // await OTP.create({ email, otp, expiresAt: Date.now() + 10*60*1000 });

        await sendOtpEmail(email, otp);

        res.json({ success: true, message: "OTP sent to " + email });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. SES Sandbox Mode:
//     → By default, new SES accounts are in SANDBOX
//     → Can only send to VERIFIED email addresses
//     → Request production access to send to anyone
//
//  2. Sending Limits:
//     → Sandbox: 200 emails/24 hours
//     → Production: starts at 50,000/day, can increase
//     → From EC2: 62,000 emails/month FREE
//
//  3. Bounce & Complaint Handling:
//     → If too many emails bounce (invalid address), AWS suspends you
//     → Keep bounce rate < 5%, complaint rate < 0.1%
//
//  4. NEVER hardcode AWS credentials in code!
//     → Use environment variables (.env file)
//     → Or IAM Roles (if running on EC2 — best practice)
//
//  5. Email goes to spam? Common fixes:
//     → Verify your domain (not just email)
//     → Set up SPF, DKIM, DMARC records
//     → Use a professional "From" address
//     → Don't use spammy words in subject line
//
// =====================================================================
