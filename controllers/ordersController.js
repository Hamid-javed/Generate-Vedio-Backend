const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");
const Template = require("../models/Template");
const emailService = require("../services/emailService");

const ordersController = {
  // Create a new order
  create: async (req, res) => {
    try {
      const {
        templateId,
        childName,
        email,
        photos,
        customScript,
        voiceSettings,
        amount
      } = req.body;

      if (!templateId || !childName || !email) {
        return res.status(400).json({ 
          error: "Template ID, child name, and email are required" 
        });
      }

      // Verify template exists
      const template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const orderId = `order_${uuidv4()}`;

      const order = new Order({
        orderId,
        templateId,
        childName,
        email,
        photos: photos || [],
        customScript: customScript || {},
        voiceSettings: voiceSettings || { voice: 'santa_voice' },
        amount: amount || 19.99,
        status: 'created'
      });

      await order.save();

      // Send order confirmation email
      await emailService.sendOrderConfirmation(email, {
        orderId,
        childName,
        templateName: template.name,
        photoCount: photos ? photos.length : 0
      });

      res.json({
        success: true,
        order: {
          orderId: order.orderId,
          status: order.status,
          templateId: order.templateId,
          childName: order.childName,
          email: order.email,
          amount: order.amount,
          createdAt: order.createdAt
        }
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get order by ID
  getById: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findOne({ orderId })
        .populate('templateId')
        .populate('photos.uploadId')
        .populate('customScript.scriptId');

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update order
  update: async (req, res) => {
    try {
      const { orderId } = req.params;
      const updateData = req.body;

      const order = await Order.findOneAndUpdate(
        { orderId },
        updateData,
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get orders by email
  getByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const orders = await Order.find({ email })
        .populate('templateId')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        orders
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all orders (admin only)
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const query = {};
      
      if (status) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate('templateId')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Order.countDocuments(query);

      res.json({
        success: true,
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete order
  delete: async (req, res) => {
    try {
      const { orderId } = req.params;
      
      const order = await Order.findOneAndUpdate(
        { orderId },
        { isActive: false },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({
        success: true,
        message: "Order deleted successfully"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ordersController;
