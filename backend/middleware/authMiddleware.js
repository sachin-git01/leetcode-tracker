const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "leetcode_tracker_super_secret_jwt_key_2026";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, please log in with Google" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-__v");
    if (!user) {
      return res.status(401).json({ error: "User session expired or user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token verification failed, please re-authenticate" });
  }
};

// Optional auth: attaches user if token is present, but doesn't block unauthenticated requests
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select("-__v");
      if (user) req.user = user;
    } catch {
      // Ignore token failure for optional endpoints
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
