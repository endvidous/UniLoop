import {
  Department,
  Subject,
  Course,
  Batch,
  Semester,
} from "../models/courseModels";

export const createDepartmentsBatch = async (req, res) => {
  try {
    const { departments } = req.body;
    
  } catch (error) {
    res.status(500).json({ message: "Error creating Departments" });
  }
};
