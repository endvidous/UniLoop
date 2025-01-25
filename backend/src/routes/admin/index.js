import express from "express";
import courseRoutes from "./courseRoutes.js";
import academicRoutes from "./academicRoutes.js";
import userRoutes from "./userRoutes.js";
import departmentRoutes from "./departmentRoutes.js";

const router = express.Router();

// Mount individual admin route modules
router.use("/academic-timeline", academicRoutes);
router.use("/departments", departmentRoutes);
router.use("/courses", courseRoutes);
router.use("/users", userRoutes);

export default router;
