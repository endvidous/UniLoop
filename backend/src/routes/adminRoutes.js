import express from "express";
import {
  createDepartments,
  createTeachers,
  createCourses,
  createBatches,
  createStudents,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/create/departmentsBatch", createDepartments);

router.post("/create/teachersBatch", createTeachers);

router.post("/create/courses", createCourses);

router.post("/create/:courseID/batches", createBatches);

router.post("/create/:batchID/students", createStudents)
export default router;
