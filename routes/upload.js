const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

// Upload child photos (1-4 photos maximum)
router.post("/photos", uploadController.uploadPhotos);

// Upload Santa letter
router.post("/letter", uploadController.uploadLetter);

// Edit photo with crop/zoom functionality
router.post("/photos/:photoId/edit", uploadController.editPhoto);

// Get photo preview with current edits
router.get("/photos/:photoId/preview", uploadController.previewPhoto);

module.exports = router;

