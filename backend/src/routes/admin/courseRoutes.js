import express from "express";
import {
  // Course Controllers
  getOneCourse,
  getCourses,
  createCourses,
  editCourse,
  deleteCourse,
  // Batch Controllers
  getOneBatch,
  getBatches,
  createBatches,
  editBatch,
  deleteBatch,
  // Semester Controllers
  getOneSemester,
  getSemesters,
  createSemester,
  editSemester,
  deleteSemester,
} from "../../controllers/admin/courseController.js";

const router = express.Router();

/* ---------------------- COURSE ROUTES ---------------------- */
router.get("/", getCourses);
router.get("/:courseId", getOneCourse);
router.post("/", createCourses);
router.patch("/:courseId", editCourse);
router.delete("/:courseId", deleteCourse);

/* ---------------------- BATCH ROUTES ---------------------- */
router.get("/:courseId/batches", getBatches);
router.post("/:courseId/batches", createBatches);
router.get("/batches/:batchId", getOneBatch);
router.patch("/batches/:batchId", editBatch);
router.delete("/batches/:batchId", deleteBatch);

/* ---------------------- SEMESTER ROUTES ---------------------- */
router.get("/:courseId/semesters", getSemesters);
router.post("/:courseId/semesters/:sem_no", createSemester);
router.get("/semesters/:semesterId", getOneSemester);
router.patch("/semesters/:semesterId", editSemester);
router.delete("/semesters/:semesterId", deleteSemester);

export default router;
