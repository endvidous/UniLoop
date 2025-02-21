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

const router = express.Router();

//Teacher Operations
router.get("/teachers/:teacherId", getOneTeacher);
router.get("/:departmentId/teachers", getDepartmentTeachers);
router.post("/:departmentId/teachers", createTeachers);
router.patch("/:departmentId/teachers/:teacherId", updateTeacher);
router.delete("/:departmentId/teachers/:teacherId", deleteTeacher);

//Student Operations
router.get("/students/:studentId", getOneStudent);
router.get("/:batchId/students", getBatchStudents);
router.post("/:batchId/students", createStudents);
router.patch("/:batchId/students/:studentId", updateStudent);
router.delete("/:batchId/students/:studentId", deleteStudent);
export default router;
