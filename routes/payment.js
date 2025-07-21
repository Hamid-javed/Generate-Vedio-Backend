const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Create payment request
router.post("/create", paymentController.createPayment);

// Handle Netopia payment notification
router.post("/notification", express.raw({ type: "application/json" }), paymentController.handleNotification);

module.exports = router;
