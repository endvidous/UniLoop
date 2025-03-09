import express from "express";
import {
  assignClassRep,
  assignMentor,
} from "../../controllers/admin/userController.js";
import { isAdmin, isAdminOrTeacher } from "../../middleware/authMiddleware.js";
const classRep_MentorRoutes = express.Router();

classRep_MentorRoutes.post("/assign-mentor", isAdmin, assignMentor);
classRep_MentorRoutes.post(
  "/assign-classrep",
  isAdminOrTeacher,
  assignClassRep
);

export default classRep_MentorRoutes;
