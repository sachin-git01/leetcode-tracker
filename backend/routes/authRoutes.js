const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public Google OAuth exchange endpoint
router.post("/google", authController.googleAuth);

// Protected endpoint to fetch current user profile
router.get("/me", protect, authController.getMe);

module.exports = router;
