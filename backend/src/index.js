import express from "express";
import authRoutes from "./routes/auth/authRoutes.js";
import adminRoutes from "./routes/admin/index.js";
import { authMiddleware, isAdmin } from "./middleware/authMiddleware.js";

const router = express.Router();

// Define routes
router.use("/auth", authRoutes);
router.use("/admin", authMiddleware, isAdmin, adminRoutes);

export default router;
