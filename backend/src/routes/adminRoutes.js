import express from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { createDepartmentsBatch } from "../controllers/adminController";

const router = express.Router();

router.post(
  "/create/departmentsBatch",
  authMiddleware,
  isAdmin,
  createDepartmentsBatch
);

router.post("/create/teachersBatch", authMiddleware, isAdmin);

export default router;
