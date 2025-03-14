import express from "express";
import authRoutes from "./routes/auth/authRoutes.js";
import adminRoutes from "./routes/admin/index.js";
import announcementRoutes from "./routes/common/announcementRoutes.js";
import discussionRoutes from "./routes/common/discussionRoutes.js";
import fileRoutes from "./routes/common/fileRoutes.js";
import meetingRoutes from "./routes/common/meetingRoutes.js";
import associationsRoutes from "./routes/common/associationsRoutes.js";
import classroomRoutes from "./routes/common/classroomFinderRoutes.js";
import assignmentRoutes from "./routes/common/assignmentRoutes.js";
import notificationRoutes from "./routes/notifications/notificationRoutes.js";
import classRep_MentorRoutes from "./routes/common/classrepMentorRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import reminderRoutes from "./routes/common/reminderRoutes.js";

const router = express.Router();

// Default parser for routes that don't require a high limit
const defaultJsonParser = express.json({ limit: "100kb" });
// High limit parser for routes that need it
const highLimitJsonParser = express.json({ limit: "5mb" });

// Define routes
router.use("/auth", defaultJsonParser, authRoutes);
router.use("/admin", defaultJsonParser, authMiddleware, adminRoutes);
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
router.use("/classrooms", highLimitJsonParser, authMiddleware, classroomRoutes);
router.use("/assignments", defaultJsonParser, authMiddleware, assignmentRoutes);
router.use("/", defaultJsonParser, authMiddleware, notificationRoutes);
router.use("/users", defaultJsonParser, authMiddleware, classRep_MentorRoutes);
router.use("/reminders", defaultJsonParser, authMiddleware, reminderRoutes);
export default router;
