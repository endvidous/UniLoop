import express from "express";

const router = express.Router();

import {
  createCourses,
  createBatches,
  createSemester,
} from "../../controllers/admin/courseController.js";

//Course Operations
router.post("/", createCourses);

//Batch Operations
router.post("/:courseId/batches", createBatches);

//Semester Operations
router.post("/:courseId/:sem_no/papers", createSemester);

export default router;
