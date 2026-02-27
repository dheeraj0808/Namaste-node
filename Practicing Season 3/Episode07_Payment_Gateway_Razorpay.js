// =====================================================================
//  Episode 07 — Payment Gateway Integration ft. Razorpay
// =====================================================================
//
//  🤔 What is a Payment Gateway?
//  ------------------------------
//  Payment Gateway = A service that processes online payments.
//  Jab user "Pay Now" click karta hai, payment gateway:
//  → Card/UPI details securely collect karta hai
//  → Bank se verify karta hai
//  → Amount deduct karta hai
//  → Merchant ko paisa bhejta hai
//
//  📌 Why Razorpay?
//  → Indian company (built for India 🇮🇳)
//  → Supports UPI, Cards, Net Banking, Wallets
//  → Easy API integration
//  → Test mode FREE hai (no real money involved)
//  → Dashboard for tracking payments
//
//  Alternatives: Stripe (international), PayU, Cashfree, Paytm
//
// =====================================================================

// =====================================================================
//  SETUP STEPS:
// =====================================================================
//
//  STEP 1: Create Razorpay Account
//  → Go to https://dashboard.razorpay.com/signup
//  → Sign up with email
//  → You'll get TEST mode by default (no KYC needed for testing)
//
//  STEP 2: Get API Keys
//  → Dashboard → Settings → API Keys → Generate Test Key
//  → You'll get:
//     Key ID:     rzp_test_xxxxxxxxxxxx
//     Key Secret: xxxxxxxxxxxxxxxxxxxxxxx
//  → Save both in .env file!
//
//  STEP 3: Install package
//  → npm install razorpay
//
// =====================================================================

// =====================================================================
//  INSTALL: npm install razorpay express crypto
// =====================================================================

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto"); // Built-in Node.js module

const app = express();
app.use(express.json());

// =====================================================================
//  Initialize Razorpay Instance
// =====================================================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_xxxxxxxxxxxxx",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "xxxxxxxxxxxxxxxxxxxx",
});

// =====================================================================
//  PAYMENT FLOW (3 Steps):
// =====================================================================
//
//  Step 1: CREATE ORDER (Backend)
//  → Your server creates an "order" with amount on Razorpay
//  → Razorpay returns an order_id
//
//  Step 2: PAY (Frontend)
//  → Frontend opens Razorpay checkout popup
//  → User enters card/UPI details and pays
//  → Razorpay returns payment details (razorpay_payment_id, signature)
//
//  Step 3: VERIFY PAYMENT (Backend)
//  → Frontend sends payment details to your backend
//  → Backend VERIFIES the signature using crypto
//  → If valid → Order is confirmed ✅
//  → If invalid → Payment is fake/tampered ❌
//
// =====================================================================

// =====================================================================
//  STEP 1: Create Order API
// =====================================================================

app.post("/api/payment/create-order", async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        // amount is in PAISE (smallest unit)
        // ₹500 = 50000 paise
        const options = {
            amount: amount * 100, // Convert rupees to paise
            currency: currency,
            receipt: receipt || `receipt_${Date.now()}`,

            // Optional: Add notes for your reference
            notes: {
                purpose: "Product Purchase",
                customer: "Ujjwal",
            },
        };

        // Create order on Razorpay
        const order = await razorpay.orders.create(options);

        console.log("✅ Order created:", order.id);

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
        });
    } catch (error) {
        console.error("❌ Order creation failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================================================================
//  STEP 3: Verify Payment API
// =====================================================================

app.post("/api/payment/verify", (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;

        // Create expected signature using HMAC SHA256
        // Formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "xxxx")
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        // Compare the signatures
        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            console.log("✅ Payment verified! ID:", razorpay_payment_id);

            // In real app:
            // → Update order status in database to "paid"
            // → Send confirmation email
            // → Grant access to purchased item

            res.json({
                success: true,
                message: "Payment verified successfully!",
                paymentId: razorpay_payment_id,
            });
        } else {
            console.error("❌ Payment verification failed — signature mismatch!");

            res.status(400).json({
                success: false,
                message: "Payment verification failed!",
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================================================================
//  STEP 2: Frontend Code (HTML + Razorpay Checkout)
// =====================================================================
//
//  <!-- Add Razorpay script in your HTML -->
//  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
//
//  <button id="payBtn">Pay ₹500</button>
//
//  <script>
//    document.getElementById("payBtn").addEventListener("click", async () => {
//
//      // Step 1: Create order from backend
//      const res = await fetch("/api/payment/create-order", {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        body: JSON.stringify({ amount: 500 })
//      });
//      const { order } = await res.json();
//
//      // Step 2: Open Razorpay checkout
//      const options = {
//        key: "rzp_test_xxxxxxxxxxxxx",  // Your Key ID
//        amount: order.amount,
//        currency: order.currency,
//        name: "NamasteNode Store",
//        description: "Premium Course",
//        order_id: order.id,
//
//        // This runs when payment is successful
//        handler: async function (response) {
//          // Step 3: Verify payment on backend
//          const verifyRes = await fetch("/api/payment/verify", {
//            method: "POST",
//            headers: { "Content-Type": "application/json" },
//            body: JSON.stringify({
//              razorpay_order_id: response.razorpay_order_id,
//              razorpay_payment_id: response.razorpay_payment_id,
//              razorpay_signature: response.razorpay_signature,
//            })
//          });
//          const result = await verifyRes.json();
//          if (result.success) {
//            alert("Payment Successful! 🎉");
//          } else {
//            alert("Payment verification failed ❌");
//          }
//        },
//
//        prefill: {
//          name: "Ujjwal Pratap",
//          email: "ujjwal@example.com",
//          contact: "9999999999"
//        },
//
//        theme: { color: "#6C63FF" }
//      };
//
//      const rzp = new Razorpay(options);
//      rzp.open();
//    });
//  </script>
//
// =====================================================================

// =====================================================================
//  BONUS: Fetch Payment Details API
// =====================================================================

app.get("/api/payment/:paymentId", async (req, res) => {
    try {
        const payment = await razorpay.payments.fetch(req.params.paymentId);

        res.json({
            success: true,
            data: {
                id: payment.id,
                amount: payment.amount / 100, // Convert paise to rupees
                currency: payment.currency,
                status: payment.status, // "captured", "failed", "refunded"
                method: payment.method, // "upi", "card", "netbanking"
                email: payment.email,
                contact: payment.contact,
                createdAt: new Date(payment.created_at * 1000),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =====================================================================
//  BONUS: Refund API
// =====================================================================

app.post("/api/payment/refund/:paymentId", async (req, res) => {
    try {
        const { amount } = req.body; // Optional: partial refund amount

        const refund = await razorpay.payments.refund(req.params.paymentId, {
            amount: amount ? amount * 100 : undefined, // Full refund if no amount
            notes: { reason: "Customer requested refund" },
        });

        res.json({
            success: true,
            message: "Refund initiated!",
            refundId: refund.id,
            status: refund.status,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(3000, () => {
    console.log("🚀 Payment server running on port 3000");
});

// =====================================================================
//  🧠 IMPORTANT CONCEPTS:
// =====================================================================
//
//  1. NEVER process payments on frontend only!
//     → Always CREATE order on backend
//     → Always VERIFY payment on backend
//     → Frontend can be tampered with (user can change amount)
//
//  2. Amount is in PAISE:
//     → ₹500 = 50000 paise
//     → ₹1 = 100 paise
//     → Always multiply by 100 before sending to Razorpay
//
//  3. Signature Verification = MOST IMPORTANT step
//     → Ensures payment is genuine (not forged)
//     → Uses HMAC SHA256 cryptographic hash
//     → If signature doesn't match → payment is FAKE
//
//  4. Test vs Live mode:
//     → Test: rzp_test_xxxx (no real money, use test cards)
//     → Live: rzp_live_xxxx (real money, needs KYC)
//     → Test Card: 4111 1111 1111 1111 (any expiry, any CVV)
//     → Test UPI: success@razorpay
//
//  5. Webhooks:
//     → Razorpay can send payment events to your server
//     → More reliable than frontend handler (internet can disconnect)
//     → Dashboard → Webhooks → Add endpoint URL
//     → Events: payment.captured, payment.failed, refund.created
//
// =====================================================================
