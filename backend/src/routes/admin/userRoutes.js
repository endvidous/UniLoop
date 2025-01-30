import {
  createStudents,
  createTeachers,
  deleteTeacher,
  getDepartmentTeachers,
  updateTeacher,
} from "../../controllers/admin/userController.js";
import express from "express";

const router = express.Router();

//Teacher Operations
router.get("/:departmentId/teachers", getDepartmentTeachers);
router.post("/:departmentId/teachers", createTeachers);
router.patch("/:departmentId/teachers/:teacherId", updateTeacher);
router.delete("/:departmentId/teachers/:teacherId", deleteTeacher);

//Student Operations
router.post("/:courseId/:batchId/students", createStudents);

export default router;
