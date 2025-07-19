const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");

// Get video generation status
router.get("/status/:orderId", videoController.getStatus);

// Download generated video
router.get("/download/:orderId", videoController.download);

// Regenerate video (admin only)
router.post("/regenerate/:orderId", videoController.regenerate);

// Start video generation manually
router.post("/generate", videoController.generate);

// Get video metadata
router.get("/metadata/:orderId", videoController.getMetadata);

// Delete video
router.delete("/:orderId", videoController.delete);

module.exports = router;
