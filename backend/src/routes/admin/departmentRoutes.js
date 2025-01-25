import express from "express";
import {
  createDepartments,
  createPapers,
} from "../../controllers/admin/departmentController.js";

const router = express.Router();

//Department routes
router.post("/", createDepartments);

//Paper routes
router.post("/:departmentId/papers", createPapers);

export default router;
