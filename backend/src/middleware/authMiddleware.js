import jwt from "jsonwebtoken";
import { User } from "../models/userModels.js";
import { Batches } from "../models/courseModels.js";

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
    res.status(500).json({
      message: "Server error in auth middleware",
      error: error.message,
    });
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

export const isStudentOrTeacher = (req, res, next) => {
  if (!req.user || (!req.user.isStudent() && !req.user.isTeacher())) {
    return res
      .status(403)
      .json({ message: "Access denied: Students or Teachers only" });
  }
  next();
};

export const isClassRep = async (req, res, next) => {
  try {
    // Basic checks (schema validation ensures valid assignment)
    if (!req.user?.isStudent() || !req.user.classrep_of) {
      return res
        .status(403)
        .json({ message: "Access denied: Not a class representative" });
    }

    // Get batch details for downstream use
    const batch = await Batches.findById(req.user.classrep_of)
      .select("course currentSemester status")
      .populate("course", "name");

    if (!batch) {
      return res.status(404).json({ message: "Associated batch not found" });
    }

    // If route requires specific batch access
    if (req.params.batchId && !batch._id.equals(req.params.batchId)) {
      return res.status(403).json({
        message: "Not authorized for this specific batch",
      });
    }

    // Attach essential batch context for downstream use
    req.batchInfo = {
      id: batch._id,
      course: batch.course.name,
      semester: batch.currentSemester,
      status: batch.status,
    };

    next();
  } catch (error) {
    res.status(500).json({
      message: "Class representative verification failed",
      error: error.message,
    });
  }
};

export const isMentor = async (req, res, next) => {
  try {
    // Basic role check
    if (!req.user?.isTeacher()) {
      return res.status(403).json({ message: "Teacher access required" });
    }

    // Get assigned mentorship
    const mentorBatch = await Batches.findById(req.user.mentor_of)
      .populate("course", "name type")
      .lean();

    if (!mentorBatch) {
      return res.status(403).json({
        message: "Not assigned as mentor to any batch",
      });
    }

    // If route requires specific batch access
    if (req.params.batchId && !mentorBatch._id.equals(req.params.batchId)) {
      return res.status(403).json({
        message: "Not authorized for this specific batch",
      });
    }

    // Attach batch for downstream use
    req.batchInfo = {
      batchId: mentorBatch._id,
      course: mentorBatch.course.name,
      courseType: mentorBatch.course.type,
      currentSemester: mentorBatch.currentSemester,
    };

    next();
  } catch (error) {
    res.status(500).json({
      message: "Mentor verification failed",
      error: error.message,
    });
  }
};
