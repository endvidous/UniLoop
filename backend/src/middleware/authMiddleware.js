import jwt from "jsonwebtoken";
import { User } from "../models/userModels.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};

// Role Validation Middleware
export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin()) {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

export const isTeacher = (req, res, next) => {
  if (!req.user || !req.user.isTeacher()) {
    return res.status(403).json({ message: "Access denied: Teachers only" });
  }
  next();
};

export const isStudent = (req, res, next) => {
  if (!req.user || !req.user.isStudent()) {
    return res.status(403).json({ message: "Access denied: Students only" });
  }
  next();
};

export const isClassRep = (courseId) => (req, res, next) => {
  if (!req.user || !req.user.isClassRepOf(courseId)) {
    return res.status(403).json({ message: `Access denied` });
  }
  next();
};

export const isMentor = (courseId) => (req, res, next) => {
  if (!req.user || !req.user.isMentorOf(courseId)) {
    return res.status(403).json({ message: `Access denied` });
  }
  next();
};
