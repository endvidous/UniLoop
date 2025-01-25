import { createAcademicTimeline } from "../../controllers/admin/academicController.js";
import express from "express";
const router = express.Router();

//Academic Timeline Routes
router.post("/", createAcademicTimeline);

export default router;
