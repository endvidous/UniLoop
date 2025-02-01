import {
  createStudentRecord,
  createTeacherRecord,
} from "../../services/userService.js";
import { Batches, Departments } from "../../models/courseModels.js";
import { checkIfEmpty } from "../../utils/helpers.js";
import { User } from "../../models/userModels.js";
import mongoose from "mongoose";

//Teacher controllers
export const getDepartmentTeachers = async (req, res) => {
  const { departmentId } = req.params;

  try {
    // Validate department ID format
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID format" });
    }

    // Find department with populated teachers
    const department = await Departments.findById(departmentId).populate({
      path: "teachers",
      select: "name email role mentor_of", // Select only necessary fields
      options: { sort: { name: 1 } }, // Sort teachers by name
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (!department.teachers || department.teachers.length === 0) {
      return res.status(404).json({
        message: "No teachers found in this department",
        data: [],
      });
    }

    res.status(200).json({
      message: "Teachers retrieved successfully",
      count: department.teachers.length,
      data: department.teachers,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving teachers",
      error: err.message,
    });
  }
};

export const createTeachers = async (req, res) => {
  const { departmentId } = req.params;
  const { teachers } = req.body;
  try {
    checkIfEmpty(teachers);

    const teacherIDs = await Promise.all(
      teachers.map(async (teacher) => {
        try {
          const newTeacher = await createTeacherRecord({
            name: teacher.name,
            email: teacher.email,
            password: teacher.password,
            role: "teacher",
          });
          return newTeacher._id;
        } catch {
          throw new Error(
            `Error creating student ${teacher.name}: ${teacher.email}`
          );
        }
      })
    );

    const updatedDepartment = await Departments.updateOne(
      { _id: departmentId },
      { $push: { teachers: { $each: teacherIDs } } },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found." });
    }

    res
      .status(201)
      .json({ message: "Teachers added successfully", data: teacherIDs });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating Teachers", error: err.message });
  }
};

export const updateTeacher = async (req, res) => {
  const { departmentId, teacherId } = req.params;
  const updates = req.body;

  try {
    // Validate department exists
    const department = await Departments.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Update teacher (assuming User model)
    const updatedTeacher = await User.findByIdAndUpdate(teacherId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -__v");

    if (!updatedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating teacher",
      error: err.message,
    });
  }
};

export const deleteTeacher = async (req, res) => {
  const { departmentId, teacherId } = req.params;

  try {
    // Remove teacher from department
    const department = await Departments.findByIdAndUpdate(
      departmentId,
      { $pull: { teachers: teacherId } },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Delete teacher
    const deletedTeacher = await User.findByIdAndDelete(teacherId).select(
      "-password -__v"
    );

    if (!deletedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({
      message: "Teacher deleted successfully",
      data: deletedTeacher,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting teacher",
      error: err.message,
    });
  }
};

//Student controllers
export const createStudents = async (req, res) => {
  const { batchID } = req.params;
  const { students } = req.body;
  try {
    //Validate if empty
    checkIfEmpty(students);

    //Format the students
    const studentIDs = await Promise.all(
      students.map(async (student) => {
        try {
          const newStudent = await createStudentRecord({
            name: student.name,
            email: student.email,
            password: student.password,
            role: "student",
            roll_no: student.roll_no,
          });
          return newStudent._id;
        } catch {
          throw new Error(
            `Error creating student ${student.name}: ${student.email}`
          );
        }
      })
    );

    const updatedBatch = await Batches.updateOne(
      { _id: batchID },
      { $push: { students: { $each: studentIDs } } },
      { new: true }
    );

    if (!updatedBatch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    res
      .status(201)
      .json({ message: "Students added successfully", data: studentIDs });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding students ", error: err.message });
  }
};
