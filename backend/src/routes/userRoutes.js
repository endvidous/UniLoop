import express from "express";
import {getAllUsers} from "../controllers/userControllers.js";
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router();

// Get all users (Admin only)
router.get('/', authMiddleware, getAllUsers);

export default router;