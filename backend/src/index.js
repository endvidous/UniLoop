import express from "express";
import authRoutes from "./routes/auth/authRoutes.js";
import adminRoutes from "./routes/admin/index.js";
import announcementRoutes from "./routes/common/announcementRoutes.js";
import discussionRoutes from "./routes/common/discussionRoutes.js";
import fileRoutes from "./routes/common/fileRoutes.js";
import { authMiddleware, isAdmin } from "./middleware/authMiddleware.js";

const router = express.Router();

// Define routes
router.use("/auth", authRoutes);
router.use("/admin", authMiddleware, isAdmin, adminRoutes);
router.use("/announcements", authMiddleware, announcementRoutes);
router.use("/discussions", authMiddleware, discussionRoutes);
router.use("/files", authMiddleware, fileRoutes);

export default router;
