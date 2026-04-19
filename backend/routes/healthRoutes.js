const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// @desc    Health check for API and Database
// @route   GET /api/health
// @access  Public
router.get("/", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({
      status: "online",
      database: dbStatus,
      timestamp: new Date(),
      environment: process.env.NODE_ENV
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
