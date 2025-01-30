import express from "express";
import {
  createDepartments,
  createPapers,
  deleteDepartment,
  deletePaper,
  getDepartments,
  getPapers,
  updateDepartment,
  updatePaper,
} from "../../controllers/admin/departmentController.js";

const router = express.Router();

//Department routes
router.get("/", getDepartments);
router.post("/", createDepartments);
router.patch("/:departmentId", updateDepartment);
router.delete("/:departmentId", deleteDepartment);

//Paper routes
router.get("/:departmentId/papers", getPapers);
router.post("/:departmentId/papers", createPapers);
router.patch("/papers/:paperId", updatePaper);
router.delete("/papers/:paperId", deletePaper);

export default router;
