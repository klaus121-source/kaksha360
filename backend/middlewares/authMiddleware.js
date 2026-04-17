import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log('Auth Middleware: Received token:', token); // Debug log
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth Middleware: Decoded token:', decoded); // Debug log
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('Auth Middleware: User not found for decoded id:', decoded.id); // Debug log
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      next();
    } catch (err) {
      console.log('Auth Middleware: JWT error:', err); // Debug log
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please log in again." });
      }
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (err) {
    console.error("JWT Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminOrInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== "admin" && user.role !== "instructor")) {
      return res.status(403).json({ message: "Access denied" });
    }
    req.user = user; // Attach full user object
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
