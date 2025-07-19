const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

class PaymentService {
  async createPaymentIntent({ amount, currency, metadata, orderId }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        metadata: {
          ...metadata,
          orderId
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Update order with payment intent ID
      if (orderId) {
        await Order.findOneAndUpdate(
          { orderId },
          { paymentIntentId: paymentIntent.id }
        );
      }

      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  constructWebhookEvent(body, signature) {
    try {
      return stripe.webhooks.constructEvent(
        body, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  async getPaymentStatus(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error('Error retrieving payment status:', error);
      throw new Error('Failed to retrieve payment status');
    }
  }

  async handleSuccessfulPayment(paymentIntentId) {
    try {
      const order = await Order.findOne({ paymentIntentId });
      if (!order) {
        throw new Error('Order not found for payment intent');
      }

      // Update order status
      order.paymentStatus = 'paid';
      order.status = 'paid';
      await order.save();

      return order;
    } catch (error) {
      console.error('Error handling successful payment:', error);
      throw error;
    }
  }

  async refundPayment(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = amount * 100; // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      // Update order status
      const order = await Order.findOne({ paymentIntentId });
      if (order) {
        order.paymentStatus = 'refunded';
        await order.save();
      }

      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  async createCustomer(customerData) {
    try {
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: customerData.metadata || {}
      });
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async getCustomer(customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      throw new Error('Failed to retrieve customer');
    }
  }
}

module.exports = new PaymentService();
