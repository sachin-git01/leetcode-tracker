const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Problem = require("../models/Problem");

const JWT_SECRET = process.env.JWT_SECRET || "leetcode_tracker_super_secret_jwt_key_2026";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");

const generateToken = (userId, email, name) => {
  return jwt.sign({ id: userId, email, name }, JWT_SECRET, {
    expiresIn: "30d"
  });
};

const authController = {
  // POST /auth/google
  // Accepts { credential } from Google Identity Services
  googleAuth: async (req, res) => {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ error: "Missing Google ID token credential" });
      }

      let payload;
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID || undefined
        });
        payload = ticket.getPayload();
      } catch (verifyError) {
        console.error("Google token verification failed:", verifyError.message);
        return res.status(401).json({
          error: "Invalid Google credential token. Please check your Google Client ID configuration.",
          details: verifyError.message
        });
      }

      if (!payload || !payload.email) {
        return res.status(400).json({ error: "Google token did not contain valid email" });
      }

      const { sub: googleId, email, name, picture } = payload;

      // Find existing user by googleId or email
      let user = await User.findOne({
        $or: [{ googleId }, { email: email.toLowerCase() }]
      });

      let isNewUser = false;
      if (!user) {
        isNewUser = true;
        user = await User.create({
          googleId,
          email: email.toLowerCase(),
          name: name || email.split("@")[0],
          picture: picture || ""
        });

        // Pre-seed a welcome starter problem for first-time user
        await Problem.create({
          user: user._id,
          title: "Two Sum",
          topic: "Array",
          difficulty: "Easy",
          note: "Welcome to your personal LeetCode Tracker! Hash Map complement lookup in O(N).",
          isFavorite: true,
          status: "Solved"
        });
      } else {
        // Keep profile info fresh
        let needsSave = false;
        if (!user.googleId) {
          user.googleId = googleId;
          needsSave = true;
        }
        if (picture && user.picture !== picture) {
          user.picture = picture;
          needsSave = true;
        }
        if (name && user.name !== name) {
          user.name = name;
          needsSave = true;
        }
        if (needsSave) await user.save();
      }

      const token = generateToken(user._id, user.email, user.name);

      res.status(200).json({
        message: isNewUser ? "Welcome! Account created successfully." : "Logged in successfully.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture
        }
      });
    } catch (error) {
      console.error("Google auth server error:", error);
      res.status(500).json({ error: "Authentication failed", details: error.message });
    }
  },

  // GET /auth/me (Get profile of currently logged in user)
  getMe: async (req, res) => {
    try {
      res.status(200).json({
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          picture: req.user.picture,
          createdAt: req.user.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile", details: error.message });
    }
  }
};

module.exports = authController;
