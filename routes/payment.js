const express = require("express");
const router = express.Router();
const paymentService = require("../services/paymentService");
const videoService = require("../services/videoService");

// Create payment intent
router.post("/create-intent", async (req, res) => {
  try {
    const { amount, currency = "usd", orderData } = req.body;

    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency,
      metadata: {
        orderId: orderData.orderId,
        templateId: orderData.templateId,
        childName: orderData.childName,
      },
      orderId: orderData.orderId
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle successful payment webhook
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const event = paymentService.constructWebhookEvent(req.body, sig);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      // Update order status
      const order = await paymentService.handleSuccessfulPayment(paymentIntent.id);

      // Trigger video generation
      await videoService.generateVideo({
        orderId: paymentIntent.metadata.orderId,
        paymentIntentId: paymentIntent.id,
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Check payment status
router.get("/status/:paymentIntentId", async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const status = await paymentService.getPaymentStatus(paymentIntentId);

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post("/create-customer", async (req, res) => {
  try {
    const { email, name, metadata } = req.body;
    const customer = await paymentService.createCustomer({
      email,
      name,
      metadata
    });

    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process refund
router.post("/refund", async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;
    const refund = await paymentService.refundPayment(paymentIntentId, amount);

    res.json({
      success: true,
      refund,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
