import express from "express";
import {
  createDepartments,
  createTeachers,
  createCourses,
  createBatches,
  createStudents,
  createSemester,
  createAcademicTimeline,
} from "../controllers/courseController.js";

const router = express.Router();
//POST ROUTES
router.post("/create/departmentsBatch", createDepartments);
router.post("/create/teachersBatch", createTeachers);
router.post("/create/academic-timeline", createAcademicTimeline);
router.post("/create/courses", createCourses);
router.post("/create/:courseID/batches", createBatches);
router.post("/create/:batchID/students", createStudents);
router.post("/create/:courseID/:sem_no/papers", createSemester);

//GET ROUTES
router.get("/courses/:id/");
router.get("/courses/:id/:num");

export default router;
