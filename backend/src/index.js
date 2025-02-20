import express from "express";
import authRoutes from "./routes/auth/authRoutes.js";
import adminRoutes from "./routes/admin/index.js";
import announcementRoutes from "./routes/common/announcementRoutes.js";
import discussionRoutes from "./routes/common/discussionRoutes.js";
import fileRoutes from "./routes/common/fileRoutes.js";
import meetingRoutes from "./routes/common/meetingRoutes.js";
import associationsRoutes from "./routes/common/associationsRoutes.js";
import classroomRoutes from "./routes/common/classroomFinderRoutes.js";
import { authMiddleware, isAdmin } from "./middleware/authMiddleware.js";

const router = express.Router();

// Default parser for routes that don't require a high limit
const defaultJsonParser = express.json({ limit: "2mb" });
// High limit parser for routes that need it
// const highLimitJsonParser = express.json({ limit: '50mb' });

// Define routes
router.use("/auth", authRoutes);
router.use("/admin", defaultJsonParser, authMiddleware, isAdmin, adminRoutes);
router.use(
  "/announcements",
  defaultJsonParser,
  authMiddleware,
  announcementRoutes
);
router.use("/discussions", defaultJsonParser, authMiddleware, discussionRoutes);
router.use("/files", defaultJsonParser, authMiddleware, fileRoutes);
router.use("/meetings", defaultJsonParser, authMiddleware, meetingRoutes);
router.use(
  "/associations",
  defaultJsonParser,
  authMiddleware,
  associationsRoutes
);
router.use("/classrooms", defaultJsonParser, authMiddleware, classroomRoutes);

export default router;
