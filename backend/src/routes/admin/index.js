import express from "express";
import courseRoutes from "./courseRoutes.js";
import academicRoutes from "./academicRoutes.js";
import userRoutes from "./userRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import { isAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Mount individual admin route modules
router.use("/academic-timeline", isAdmin, academicRoutes);
router.use("/departments", isAdmin, departmentRoutes);
router.use("/courses", courseRoutes);
router.use("/users", userRoutes);

export default router;
