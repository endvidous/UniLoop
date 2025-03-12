import express from "express";
import {
  assignClassRep,
  assignMentor,
  removeAllClassReps,
  removeClassRep,
  removeMentor,
} from "../../controllers/admin/userController.js";
import { isAdmin, isAdminOrTeacher } from "../../middleware/authMiddleware.js";
const classRep_MentorRoutes = express.Router();

//Mentor routes
classRep_MentorRoutes.post("/assign-mentor", isAdmin, assignMentor);
classRep_MentorRoutes.delete("/remove-mentor", isAdmin, removeMentor);

//Classrep routes
classRep_MentorRoutes.post(
  "/assign-classrep",
  isAdminOrTeacher,
  assignClassRep
);
classRep_MentorRoutes.delete(
  "/remove-classrep",
  isAdminOrTeacher,
  removeClassRep
);
classRep_MentorRoutes.delete(
  "/remove-all-classreps",
  isAdminOrTeacher,
  removeAllClassReps
);

export default classRep_MentorRoutes;
