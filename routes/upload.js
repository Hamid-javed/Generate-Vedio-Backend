const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Upload = require("../models/Upload");
require("dotenv").config();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === "letter" ? "uploads/letters" : "uploads/photos";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "photos") {
      // Accept only images
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for photos"));
      }
    } else if (file.fieldname === "letter") {
      // Accept PDF and images for letters
      if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF and image files are allowed for letters"));
      }
    } else {
      cb(new Error("Invalid field name"));
    }
  },
});

// Upload child photos
router.post("/photos", upload.array("photos", 4), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No photos uploaded" });
    }

    const photoPromises = req.files.map(async (file) => {
      const uploadRecord = new Upload({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        fileType: "photo",
      });
      await uploadRecord.save();
      return uploadRecord;
    });

    const processedPhotos = await Promise.all(photoPromises);

    res.json({
      success: true,
      photos: processedPhotos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Santa letter
router.post("/letter", upload.single("letter"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No letter file uploaded" });
    }

    const uploadRecord = new Upload({
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fileType: "letter",
    });
    await uploadRecord.save();

    res.json({
      success: true,
      letter: uploadRecord,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

