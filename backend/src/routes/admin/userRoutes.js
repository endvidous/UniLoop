import {
  createStudents,
  createTeachers,
} from "../../controllers/admin/userController.js";
import express from "express";

const router = express.Router();

//Student Operations
router.post("/:courseId/:batchId/students", createStudents);

//Teacher Operations
router.post("/:departmentId/teachers", createTeachers);

export default router;
