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
import { isAdmin } from "../../middleware/authMiddleware.js";
const router = express.Router();

/* ---------------------- COURSE ROUTES ---------------------- */
router.get("/", isAdmin, getCourses);
router.get("/:courseId", getOneCourse);
router.post("/", isAdmin, createCourses);
router.patch("/:courseId", isAdmin, editCourse);
router.delete("/:courseId", isAdmin, deleteCourse);

/* ---------------------- BATCH ROUTES ---------------------- */
router.get("/:courseId/batches", isAdmin, getBatches);
router.post("/:courseId/batches", isAdmin, createBatches);
router.get("/batches/:batchId", getOneBatch);
router.patch("/batches/:batchId", isAdmin, editBatch);
router.delete("/batches/:batchId", isAdmin, deleteBatch);

/* ---------------------- SEMESTER ROUTES ---------------------- */
router.get("/:courseId/semesters", isAdmin, getSemesters);
router.post("/:courseId/semesters/:sem_no", isAdmin, createSemester);
router.get("/semesters/:semesterId", getOneSemester);
router.patch("/semesters/:semesterId", isAdmin, editSemester);
router.delete("/semesters/:semesterId", isAdmin, deleteSemester);

export default router;
