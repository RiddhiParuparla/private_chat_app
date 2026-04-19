const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const protect = require("../middleware/authMiddleware");

// Use memory storage for transient buffer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @desc    Upload file to Cloudinary
// @route   POST /api/upload
// @access  Private
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;

    // Use upload_stream to handle buffer directly
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "private_circle_media" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed", error });
        }
        res.json({ url: result.secure_url });
      }
    );

    uploadStream.end(file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
