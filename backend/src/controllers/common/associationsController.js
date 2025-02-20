//NOT ASSOCIATIONS, ASSOCIATED fields to particular dept, course & batches for announcements
import {
  findTeacherDetails,
  findStudentDetails,
} from "../../services/userService.js";
import { Departments, Courses, Batches } from "../../models/courseModels.js";

export const getUserAssociations = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let associations = {
      departments: [],
      courses: [],
      batches: [],
    };

    if (user.isAdmin()) {
      // Admins see all associations with relevant details
      const [departments, courses, batches] = await Promise.all([
        Departments.find({}).select("_id name").lean(),
        Courses.find({}).select("_id name code").lean(),
        Batches.find({}).select("_id code").lean(),
      ]);

      associations = { departments, courses, batches };
    } else if (user.isTeacher()) {
      // Fetch teacher-specific associations
      const details = await findTeacherDetails(user._id);

      // Populate additional details from the IDs
      const [departments, courses, batches] = await Promise.all([
        details.departmentId
          ? Departments.find({ _id: details.departmentId })
              .select("_id name")
              .lean()
          : [],
        details.courseIds && details.courseIds.length > 0
          ? Courses.find({ _id: { $in: details.courseIds } })
              .select("_id name code")
              .lean()
          : [],
        details.batchIds && details.batchIds.length > 0
          ? Batches.find({ _id: { $in: details.batchIds } })
              .select("_id code")
              .lean()
          : [],
      ]);

      associations = { departments, courses, batches };
    } else if (user.isStudent()) {
      // Fetch student-specific associations
      const details = await findStudentDetails(user._id);
      if (!details) {
        return res
          .status(404)
          .json({ message: "No associations found for the student" });
      }

      // Populate additional details from the IDs
      const [departments, courses, batches] = await Promise.all([
        details.departmentIds && details.departmentIds.length > 0
          ? Departments.find({ _id: { $in: details.departmentIds } })
              .select("_id name")
              .lean()
          : [],
        details.courseId
          ? Courses.find({ _id: details.courseId })
              .select("_id name code")
              .lean()
          : [],
        details.batchId
          ? Batches.find({ _id: details.batchId }).select("_id code").lean()
          : [],
      ]);

      associations = { departments, courses, batches };
    }

    res.json(associations);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving associations",
      error: error.message,
    });
  }
};
