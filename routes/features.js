const express = require("express");
const router = express.Router();
const Template = require("../models/Template");
const { ScriptSegment, GoodbyeMessage } = require("../models/Script");

// Get all implemented features overview
router.get("/overview", async (req, res) => {
  try {
    const templatesCount = await Template.countDocuments({ isActive: true });
    const scriptSegmentsCount = await ScriptSegment.countDocuments({ isActive: true });
    const goodbyeMessagesCount = await GoodbyeMessage.countDocuments({ isActive: true });

    const features = {
      "🎥 Video Selection": {
        description: "User chooses from 3 types of Santa videos",
        implemented: true,
        details: {
          totalTemplates: templatesCount,
          templates: [
            "Classic Santa Workshop - $19.99",
            "North Pole Adventure - $24.99", 
            "Magical Christmas Wonder - $29.99"
          ],
          endpoint: "GET /api/templates"
        }
      },
      "👶 Name Input + Sample Voice": {
        description: "User enters child's name and system plays sample using ElevenLabs API",
        implemented: true,
        details: {
          voiceProvider: "ElevenLabs API",
          sampleGeneration: "Real-time preview",
          endpoint: "POST /api/voice/preview"
        }
      },
      "📸 Image Upload (1-4 Photos)": {
        description: "Upload 1 to 4 photos with zoom/crop functionality",
        implemented: true,
        details: {
          maxPhotos: 4,
          maxFileSize: "10MB per photo",
          supportedFormats: ["JPG", "PNG", "WEBP"],
          editFeatures: ["Crop", "Zoom", "Rotate", "Brightness", "Contrast"],
          endpoint: "POST /api/upload/photos"
        }
      },
      "📝 Santa Letter Upload (Optional)": {
        description: "User can upload a letter (PDF, image, etc.)",
        implemented: true,
        details: {
          supportedFormats: ["PDF", "JPG", "PNG"],
          thumbnailGeneration: "Automatic for images",
          endpoint: "POST /api/upload/letter"
        }
      },
      "📖 Customizable Script": {
        description: "User selects from predefined text options for Santa's dialogue",
        implemented: true,
        details: {
          totalSegments: scriptSegmentsCount,
          categories: ["Praise", "Inspiration", "Gifts", "Family", "Achievement", "Kindness"],
          personalization: "Child's name automatically inserted",
          endpoint: "GET /api/scripts/segments"
        }
      },
      "👋 Goodbye Message": {
        description: "User chooses a closing message variant",
        implemented: true,
        details: {
          totalMessages: goodbyeMessagesCount,
          variants: ["Classic", "Magical", "Adventure", "Warm"],
          personalization: "Child's name included",
          endpoint: "GET /api/scripts/goodbye"
        }
      },
      "🎬 Video Generation (Server-side)": {
        description: "Compile video using pre-rendered clips with FFmpeg",
        implemented: true,
        details: {
          technology: "FFmpeg",
          features: [
            "Pre-rendered clip stitching",
            "Green screen book insertion", 
            "Child photo overlay",
            "Text overlay for name",
            "Custom voiceover integration",
            "Real-time progress tracking"
          ],
          endpoint: "POST /api/video/generate"
        }
      },
      "💳 Payment Integration": {
        description: "Online payment with Stripe integration",
        implemented: true,
        details: {
          provider: "Stripe",
          supportedMethods: "Credit Cards, Digital Wallets",
          webhookSupport: true,
          features: [
            "Payment intent creation",
            "Webhook handling",
            "Automatic video generation after payment",
            "Email notifications",
            "Refund support"
          ],
          endpoint: "POST /api/payment/create-intent"
        }
      },
      "📧 Email & Download": {
        description: "Email video to user and show download link",
        implemented: true,
        details: {
          emailProvider: "Nodemailer (SMTP)",
          features: [
            "Order confirmation emails",
            "Video ready notifications",
            "HTML email templates", 
            "Download links",
            "30-day file retention"
          ],
          endpoint: "GET /api/video/download/:orderId"
        }
      },
      "🔄 Complete Workflow": {
        description: "End-to-end automated process",
        implemented: true,
        details: {
          flow: [
            "1. Template selection",
            "2. Child name + voice preview", 
            "3. Photo upload & editing",
            "4. Optional letter upload",
            "5. Script customization",
            "6. Goodbye message selection",
            "7. Payment processing",
            "8. Automated video generation",
            "9. Email notification",
            "10. Download delivery"
          ]
        }
      }
    };

    res.json({
      success: true,
      message: "🎅 All key features are fully implemented!",
      totalFeatures: Object.keys(features).length,
      implementationStatus: "100% Complete",
      features
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get API endpoints summary
router.get("/endpoints", (req, res) => {
  const endpoints = {
    templates: [
      "GET /api/templates - List all video templates",
      "GET /api/templates/:id - Get template details"
    ],
    upload: [
      "POST /api/upload/photos - Upload 1-4 child photos",
      "POST /api/upload/letter - Upload Santa letter (optional)",
      "POST /api/upload/photos/:id/edit - Edit photo (crop/zoom/rotate)",
      "GET /api/upload/photos/:id/preview - Get photo with edits"
    ],
    voice: [
      "POST /api/voice/preview - Generate name sample",
      "POST /api/voice/generate - Generate full voiceover",
      "GET /api/voice/voices - List available voices"
    ],
    scripts: [
      "GET /api/scripts/segments - Get script segments",
      "GET /api/scripts/goodbye - Get goodbye messages",
      "POST /api/scripts/create - Create custom script"
    ],
    orders: [
      "POST /api/orders/create - Create new order",
      "GET /api/orders/:orderId - Get order details",
      "PUT /api/orders/:orderId - Update order"
    ],
    payment: [
      "POST /api/payment/create-intent - Create payment intent",
      "POST /api/payment/webhook - Stripe webhook handler",
      "GET /api/payment/status/:id - Check payment status"
    ],
    video: [
      "GET /api/video/status/:orderId - Get generation status",
      "GET /api/video/download/:orderId - Download video",
      "POST /api/video/generate - Start video generation"
    ],
    features: [
      "GET /api/features/overview - This endpoint",
      "GET /api/features/endpoints - API endpoints list"
    ]
  };

  res.json({
    success: true,
    message: "Complete API endpoints for Santa Video Backend",
    endpoints
  });
});

module.exports = router;
