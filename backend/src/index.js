import express from "express";
import authRoutes from "./routes/auth/authRoutes.js";
import adminRoutes from "./routes/admin/index.js";
import announcementRoutes from "./routes/common/announcementRoutes.js";
import discussionRoutes from "./routes/common/discussionRoutes.js";
import fileRoutes from "./routes/common/fileRoutes.js";
import meetingRoutes from "./routes/common/meetingRoutes.js";
import associationsRoutes from "./routes/common/associationsRoutes.js";
import { authMiddleware, isAdmin } from "./middleware/authMiddleware.js";

const router = express.Router();

// Define routes
router.use("/auth", authRoutes);
router.use("/admin", authMiddleware, isAdmin, adminRoutes);
router.use("/announcements", authMiddleware, announcementRoutes);
router.use("/discussions", authMiddleware, discussionRoutes);
router.use("/files", authMiddleware, fileRoutes);
router.use("/meetings", authMiddleware, meetingRoutes);
router.use("/associations", authMiddleware, associationsRoutes);

export default router;
