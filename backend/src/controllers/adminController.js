import {
  Department,
  Subject,
  Course,
  Batch,
  Semester,
} from "../models/courseModels.js";

export const createDepartmentsBatch = async (req, res) => {
  try {
    // const { departments } = req.body;
    res.send("Auth middleware working, departments created");
  } catch (error) {
    res.status(500).json({ message: "Error creating Departments" });
  }
};

export const createTeachersBatch = async (req, res) => {
  try {
    // const { departments } = req.body;
    res.send("Auth middleware working, teachers created");
  } catch (error) {
    res.status(500).json({ message: "Error creating Departments" });
  }
};
