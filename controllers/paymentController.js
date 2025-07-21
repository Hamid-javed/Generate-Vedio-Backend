const { Netopia } = require('netopia-card');
if (!process.env.NETOPIA_API_KEY) {
  throw new Error('Netopia API key is required');
}
const netopia = new Netopia({
  apiKey: process.env.NETOPIA_API_KEY,
  sandbox: true, // Set to false in production
});

const paymentController = {
  // Create payment request
  createPayment: async (req, res) => {
    try {
      const { amount, orderId } = req.body;
      if (!amount || !orderId) {
        return res.status(400).json({ error: "Amount and Order ID are required" });
      }

      const paymentRequest = await netopia.createTransaction({
        amount,
        orderId,
        currency: 'RON',
        description: 'Santa Video Order',
      });

      res.json({
        success: true,
        paymentUrl: paymentRequest.paymentUrl
      });
    } catch (error) {
      console.error('Netopia error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Handle successful payment notification (webhook)
  handleNotification: async (req, res) => {
    try {
      const notification = netopia.verifyNotification(req.body);
      if (notification.success) {
        // Process successful payment logic here (e.g., update order status)
        res.json({ received: true });
      } else {
        res.status(400).json({ error: 'Payment verification failed' });
      }
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = paymentController;
