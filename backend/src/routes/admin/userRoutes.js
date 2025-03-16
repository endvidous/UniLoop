import {
  createStudents,
  createTeachers,
  deleteStudent,
  deleteTeacher,
  getBatchStudents,
  getDepartmentTeachers,
  getOneStudent,
  getOneTeacher,
  updateStudent,
  updateTeacher,
} from "../../controllers/admin/userController.js";
import express from "express";
import { isAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

//Teacher Operations
router.get("/teachers/:teacherId", isAdmin, getOneTeacher);
router.get("/:departmentId/teachers", isAdmin, getDepartmentTeachers);
router.post("/:departmentId/teachers", createTeachers);
router.patch("/:departmentId/teachers/:teacherId", isAdmin, updateTeacher);
router.delete("/:departmentId/teachers/:teacherId", isAdmin, deleteTeacher);

//Student Operations
router.get("/students/:studentId", isAdmin, getOneStudent);
router.get("/:batchId/students", getBatchStudents);
router.post("/:batchId/students", isAdmin, createStudents);
router.patch("/:batchId/students/:studentId", isAdmin, updateStudent);
router.delete("/:batchId/students/:studentId", isAdmin, deleteStudent);
export default router;
