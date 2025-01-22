import express from "express";
import {
  createDepartmentsBatch,
  createTeachersBatch,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/create/departmentsBatch", createDepartmentsBatch);

router.post("/create/teachersBatch", createTeachersBatch);

router.get("/users", (req, res) => {
  res.send("Got all users");
});

export default router;
