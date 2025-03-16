import {
  createAcademicTimeline,
  deleteAcademicTimeline,
  getAcademicTimelines,
  updateAcademicTimeline,
} from "../../controllers/admin/academicController.js";
import express from "express";
const router = express.Router();

//Academic Timeline Routes
router.get("/", getAcademicTimelines);
router.post("/", createAcademicTimeline);
router.patch("/:id", updateAcademicTimeline);
router.delete("/:id", deleteAcademicTimeline);
export default router;
