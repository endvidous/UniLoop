import {
  getAssignment,
  createAssignment,
  deleteAssignment,
  getAllAssignments,
  updateAssignment,
  submitAssignment,
  deleteAssignmentSubmission,
  downloadSubmissionsZip,
} from "../../controllers/common/assignmentController.js";
import express from "express";
import {
  isStudent,
  isStudentOrTeacher,
  isTeacher,
} from "../../middleware/authMiddleware.js";

const router = express.Router();

//Assignments view
router.get("/", isStudentOrTeacher, getAllAssignments);
router.get("/:assignmentId", isStudentOrTeacher, getAssignment);

//Only teachers can access create, update and delete for an assignment
router.post("/", isTeacher, createAssignment);
router.put("/:assignmentId", isTeacher, updateAssignment);
router.delete("/:assignmentId", isTeacher, deleteAssignment);
router.get(
  "/:assignmentId/submissions/download",
  isTeacher,
  downloadSubmissionsZip
); // Download route for teachers zip

// Submission-specific routes
router.post("/:assignmentId/submissions", isStudent, submitAssignment);
router.delete(
  "/:assignmentId/submissions",
  isStudent,
  deleteAssignmentSubmission
);

export default router;
