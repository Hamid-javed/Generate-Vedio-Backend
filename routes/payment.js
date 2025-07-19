const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Create payment intent
router.post("/create-intent", paymentController.createIntent);

// Handle successful payment webhook
router.post("/webhook", express.raw({ type: "application/json" }), paymentController.webhook);

// Check payment status
router.get("/status/:paymentIntentId", paymentController.getStatus);

// Create customer
router.post("/create-customer", paymentController.createCustomer);

// Process refund
router.post("/refund", paymentController.refund);

module.exports = router;
