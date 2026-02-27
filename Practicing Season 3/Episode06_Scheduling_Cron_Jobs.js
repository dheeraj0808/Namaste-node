// =====================================================================
//  Episode 06 — Scheduling Cron Jobs
// =====================================================================
//
//  🤔 What is a Cron Job?
//  -----------------------
//  Cron Job = A task that runs AUTOMATICALLY at a scheduled time.
//
//  Real-life analogy:
//  → Alarm clock ⏰ = A cron job (runs every day at 7 AM)
//  → Monthly salary 💰 = A cron job (runs on 1st of every month)
//  → Birthday reminder 🎂 = A cron job (runs once a year)
//
//  📌 Use Cases:
//  → Send daily report email every morning at 9 AM
//  → Delete expired OTPs every 10 minutes
//  → Take database backup every night at 2 AM
//  → Send birthday wishes at midnight
//  → Clean up old log files every week
//  → Check server health every 30 seconds
//
// =====================================================================

// =====================================================================
//  INSTALL: npm install node-cron
// =====================================================================

const cron = require("node-cron");

// =====================================================================
//  CRON EXPRESSION FORMAT
// =====================================================================
//
//  ┌────────────── second (0-59)         [optional]
//  │ ┌──────────── minute (0-59)
//  │ │ ┌────────── hour (0-23)
//  │ │ │ ┌──────── day of month (1-31)
//  │ │ │ │ ┌────── month (1-12)
//  │ │ │ │ │ ┌──── day of week (0-7) (0 & 7 = Sunday)
//  │ │ │ │ │ │
//  * * * * * *
//
//  📌 Special characters:
//  *     = Every (har ek)
//  */5   = Every 5th (har 5th)
//  1,15  = On 1st and 15th
//  1-5   = From 1 to 5
//
// =====================================================================

// =====================================================================
//  COMMON CRON EXPRESSIONS (yaad rakhne wale):
// =====================================================================
//
//  "* * * * *"          → Every minute
//  "*/5 * * * *"        → Every 5 minutes
//  "*/30 * * * *"       → Every 30 minutes
//  "0 * * * *"          → Every hour (at minute 0)
//  "0 9 * * *"          → Every day at 9:00 AM
//  "0 0 * * *"          → Every day at midnight (12:00 AM)
//  "0 9 * * 1"          → Every Monday at 9 AM
//  "0 9 * * 1-5"        → Weekdays at 9 AM (Mon-Fri)
//  "0 0 1 * *"          → 1st of every month at midnight
//  "0 0 1 1 *"          → January 1st at midnight (yearly)
//  "*/10 * * * * *"     → Every 10 seconds (6 fields with seconds)
//
// =====================================================================

// =====================================================================
//  EXAMPLE 1: Simple — Log every minute
// =====================================================================

cron.schedule("* * * * *", () => {
    const now = new Date().toLocaleTimeString("en-IN");
    console.log(`⏰ [${now}] This runs every minute!`);
});

// =====================================================================
//  EXAMPLE 2: Clean up expired OTPs every 10 minutes
// =====================================================================

cron.schedule("*/10 * * * *", async () => {
    console.log("🧹 Cleaning expired OTPs...");

    // In real app with MongoDB:
    // const result = await OTP.deleteMany({
    //   expiresAt: { $lt: new Date() }  // Delete where expiry < current time
    // });
    // console.log(`Deleted ${result.deletedCount} expired OTPs`);

    console.log("✅ OTP cleanup done!");
});

// =====================================================================
//  EXAMPLE 3: Send daily report at 9 AM
// =====================================================================

cron.schedule("0 9 * * *", async () => {
    console.log("📊 Sending daily report...");

    // const totalUsers = await User.countDocuments();
    // const newToday = await User.countDocuments({
    //   createdAt: { $gte: new Date().setHours(0,0,0,0) }
    // });
    //
    // await sendEmail(
    //   "admin@example.com",
    //   "Daily Report",
    //   `Total Users: ${totalUsers}, New Today: ${newToday}`
    // );

    console.log("✅ Daily report sent!");
});

// =====================================================================
//  EXAMPLE 4: Database backup every night at 2 AM
// =====================================================================

const { exec } = require("child_process");

cron.schedule("0 2 * * *", () => {
    console.log("💾 Starting database backup...");

    const timestamp = new Date().toISOString().split("T")[0]; // 2026-02-27
    const backupCommand = `mongodump --db namasteNodeDB --out /backups/backup-${timestamp}`;

    // exec runs a terminal command from Node.js
    exec(backupCommand, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Backup failed:", error.message);
            return;
        }
        console.log("✅ Backup completed:", stdout);
    });
});

// =====================================================================
//  EXAMPLE 5: Health check every 30 seconds
// =====================================================================

cron.schedule("*/30 * * * * *", () => {
    // 6 fields = includes seconds
    const memoryUsage = process.memoryUsage();
    const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const uptime = Math.round(process.uptime());

    console.log(
        `💓 Health: Memory ${usedMB}/${totalMB} MB | Uptime: ${uptime}s`
    );
});

// =====================================================================
//  EXAMPLE 6: Birthday wishes at midnight
// =====================================================================

cron.schedule("0 0 * * *", async () => {
    console.log("🎂 Checking for birthdays today...");

    const today = new Date();
    const month = today.getMonth() + 1; // 0-indexed, so +1
    const day = today.getDate();

    // In real app:
    // const birthdayUsers = await User.find({
    //   $expr: {
    //     $and: [
    //       { $eq: [{ $month: "$dateOfBirth" }, month] },
    //       { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] }
    //     ]
    //   }
    // });
    //
    // for (const user of birthdayUsers) {
    //   await sendEmail(user.email, "Happy Birthday! 🎉", `Dear ${user.name}...`);
    // }

    console.log("✅ Birthday emails sent!");
});

// =====================================================================
//  CONTROLLING CRON JOBS (Start, Stop, Destroy)
// =====================================================================

// Save reference to control later
const myTask = cron.schedule(
    "*/5 * * * *",
    () => {
        console.log("This runs every 5 minutes");
    },
    {
        scheduled: false, // Don't start immediately
        timezone: "Asia/Kolkata", // Use Indian timezone
    }
);

// Control the task:
// myTask.start();    // Start running
// myTask.stop();     // Pause (can resume later)
// myTask.destroy();  // Permanently remove

// =====================================================================
//  USING WITH EXPRESS
// =====================================================================

const express = require("express");
const app = express();

// API to manually trigger a cron job
app.post("/api/admin/trigger-cleanup", (req, res) => {
    console.log("🧹 Manual cleanup triggered!");
    // Run the cleanup logic...
    res.json({ success: true, message: "Cleanup triggered" });
});

// API to check scheduled jobs status
app.get("/api/admin/cron-status", (req, res) => {
    res.json({
        success: true,
        activeJobs: [
            { name: "OTP Cleanup", schedule: "Every 10 minutes" },
            { name: "Daily Report", schedule: "Every day at 9 AM" },
            { name: "DB Backup", schedule: "Every night at 2 AM" },
            { name: "Health Check", schedule: "Every 30 seconds" },
            { name: "Birthday Wishes", schedule: "Every midnight" },
        ],
    });
});

app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
    console.log("📅 All cron jobs are active!\n");
});

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. Cron jobs run as long as the Node.js process is running.
//     → If server restarts, cron jobs restart too (that's fine)
//     → Use PM2 to keep your server always running
//
//  2. Timezone matters!
//     → Default = server's timezone
//     → Always set timezone explicitly: { timezone: "Asia/Kolkata" }
//     → Otherwise, AWS EC2 (UTC) and your local machine (IST) will
//       behave differently!
//
//  3. Don't put heavy tasks directly in cron callback
//     → Use a job queue (like Bull/BullMQ) for heavy tasks
//     → Cron just TRIGGERS the job, queue PROCESSES it
//
//  4. Idempotency = Running the same job twice should be SAFE
//     → If daily report runs twice, it shouldn't send duplicate emails
//     → Use flags/timestamps to prevent duplicate execution
//
//  5. Logging is crucial for cron jobs
//     → You can't "see" them running (they're background tasks)
//     → Always log start/end/errors for debugging
//
//  6. Alternatives to node-cron:
//     → Agenda.js (MongoDB-based scheduler)
//     → Bull/BullMQ (Redis-based job queue)
//     → AWS CloudWatch Events (serverless cron)
//     → Linux crontab (OS-level, not Node.js)
//
// =====================================================================
