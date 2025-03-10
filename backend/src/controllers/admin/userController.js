import {
  createStudentRecord,
  createTeacherRecord,
} from "../../services/userService.js";
import { Batches, Departments } from "../../models/courseModels.js";
import { checkIfEmpty } from "../../utils/helpers.js";
import { User } from "../../models/userModels.js";
import mongoose from "mongoose";

/*------------------------------Teacher Controllers------------------------------*/
export const getOneTeacher = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const teacher = await User.findById(teacherId).select(
      "name email role mentor_of"
    );
    if (!teacher) {
      return res.status(404).json({ message: "No teacher found" });
    }
    res
      .status(200)
      .json({ message: "Success retrieving the teacher", data: teacher });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error finding the teacher", error: error.message });
  }
};

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
      select: "_id name email role mentor_of", // Select only necessary fields
      options: { sort: { name: 1 } }, // Sort teachers by name
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (!department.teachers || department.teachers.length === 0) {
      return res.status(200).json({
        message: "No teachers found in this department",
        count: 0,
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
            `Error creating teacher ${teacher.name}: ${teacher.email}`
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
  if (Object.prototype.hasOwnProperty.call(updates, "role")) {
    delete updates.role;
  }
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

export const assignMentor = async (req, res) => {
  const { teacherId, batchId } = req.body;
  try {
    // Validate teacherId and batchId format
    if (
      !mongoose.Types.ObjectId.isValid(teacherId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid teacherId or batchId format" });
    }

    // Check if the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if the batch exists
    const batch = await Batches.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Update the teacher document: add the batchId to the mentor_of field.
    // $addToSet ensures that the batchId is added only if it is not already present.
    const updatedTeacher = await User.findByIdAndUpdate(
      teacherId,
      { $set: { mentor_of: batchId } },
      { new: true }
    ).select("name email role mentor_of");

    // Update batch: add the teacherId to the mentors field using $addToSet
    const updatedBatch = await Batches.findByIdAndUpdate(
      batchId,
      { $addToSet: { mentors: teacherId } },
      { new: true }
    );

    res.status(200).json({
      message: "Mentor assigned successfully",
      data: { teacher: updatedTeacher, batch: updatedBatch },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error assigning mentor",
      error: err.message,
    });
  }
};

/*------------------------------Student Controllers------------------------------*/

//Get one student
export const getOneStudent = async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await User.findById(studentId).select(
      "name email role classrep_of"
    );
    if (!student) {
      return res.status(404).json({ message: "No student found" });
    }
    res
      .status(200)
      .json({ message: "Success retrieving the student", data: student });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error finding the student", error: error.message });
  }
};

//Get all the students in a batch
export const getBatchStudents = async (req, res) => {
  const { batchId } = req.params; // Expecting a single batch ID from the URL

  try {
    // Validate batch ID format
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ message: "Invalid batch ID format" });
    }

    // Find the batch and populate the students
    const batch = await Batches.findById(batchId)
      .populate({
        path: "students",
        select: "name email roll_no", // Select only necessary fields
        options: { sort: { name: 1 } }, // Sort students by name
      })
      .lean();

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (!batch.students || batch.students.length === 0) {
      return res.status(404).json({
        message: "No students found in this batch",
        data: [],
      });
    }

    res.status(200).json({
      message: "Students retrieved successfully",
      count: batch.students.length,
      data: batch.students,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving students",
      error: err.message,
    });
  }
};

//Create students for a batch
export const createStudents = async (req, res) => {
  const { batchId } = req.params;
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
      { _id: batchId },
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

//Update a student in the batch
export const updateStudent = async (req, res) => {
  const { batchId, studentId } = req.params;
  const updates = req.body;
  if (Object.prototype.hasOwnProperty.call(updates, "role")) {
    delete updates.role;
  }
  try {
    // Validate batch exists
    const batch = await Batches.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Update student
    const updatedStudent = await User.findByIdAndUpdate(studentId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -__v");

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating student",
      error: err.message,
    });
  }
};

//Delete the student in the batch
export const deleteStudent = async (req, res) => {
  const { batchId, studentId } = req.params;

  try {
    // Remove student from batch
    const batch = await Batches.findByIdAndUpdate(
      batchId,
      { $pull: { students: studentId } },
      { new: true }
    );

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Delete student
    const deletedStudent = await User.findByIdAndDelete(studentId).select(
      "-password -__v"
    );

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      data: deletedStudent,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting Student",
      error: err.message,
    });
  }
};

export const assignClassRep = async (req, res) => {
  const { batchId, studentId } = req.params;
  try {
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid studentId or batchId format" });
    }

    // Check if the student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the batch exists
    const batch = await Batches.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Update the student document: add the batchId to the mentor_of field.
    // $addToSet ensures that the batchId is added only if it is not already present.
    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      { $set: { classrep_of: batchId } },
      { new: true }
    ).select("name email role classrep_of");

    // Update batch: add the studentId to the mentors field using $addToSet
    const updatedBatch = await Batches.findByIdAndUpdate(
      batchId,
      { $addToSet: { classReps: studentId } },
      { new: true }
    );

    res.status(200).json({
      message: "Mentor assigned successfully",
      data: { student: updatedStudent, batch: updatedBatch },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error assigning mentor",
      error: err.message,
    });
  }
};
