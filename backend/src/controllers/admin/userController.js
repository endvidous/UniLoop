import {
  createStudentRecord,
  createTeacherRecord,
} from "../../services/userService.js";
import { Batches, Departments } from "../../models/courseModels.js";
import { checkIfEmpty } from "../../utils/helpers.js";

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
