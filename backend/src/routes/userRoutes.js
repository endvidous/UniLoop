import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createAdmin,
  createTeacher,
  createStudent,
} from "../controllers/userController.js";

const router = express.Router();

// Get all users (Admin only)
router.get("/", authMiddleware, getAllUsers);

// // Create Users routes
// router.post("/create/admin", createAdmin);
// router.post("/create/teacher", createTeacher);
// router.post("/create/student", createStudent);

export default router;
