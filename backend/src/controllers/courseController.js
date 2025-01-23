import {
  Departments,
  Papers,
  Courses,
  Batches,
  Semesters,
} from "../models/courseModels.js";
import { createStudent } from "./userController.js";

const checkIfEmpty = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error("Dataset cannot be empty");
  }
};

export const createDepartments = async (req, res) => {
  // const { departments } = req.body;
  try {
    res.send("Auth middleware working, departments created");
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating Departments", error: err.message });
  }
};

export const createTeachers = async (req, res) => {
  // const { teachers } = req.body;
  try {
    res.send("Auth middleware working, teachers created");
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating Teachers", error: err.message });
  }
};

export const createCourses = async (req, res) => {
  const { courses } = req.body;
  try {
    // Validate batch details
    checkIfEmpty(courses);

    // Validate fields
    const invalidCourse = courses.find(
      (course) => !course.name || !course.type
    );
    if (invalidCourse) {
      throw new Error("Each course must have a name and type");
    }

    const createdCourses = await Courses.insertMany(formattedCourses);

    res.status(201).json({
      message: "Courses created sucessfully",
      data: createdCourses,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating courses ", error: err.message });
  }
};

export const createBatches = async (req, res) => {
  const { courseID } = req.params;
  const { batches } = req.body;
  try {
    // Validate courseID
    const course = await Courses.findById(courseID);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Validate batch details
    checkIfEmpty(batches);
    const invalidBatch = batches.find(
      (batch) => !batch.startYear || !batch.currentSemester
    );
    if (invalidBatch) {
      throw new Error("Each batch must have startYear and currentSemester");
    }

    // Adding courseID to each batch
    const formattedBatches = batches.map((batch) => ({
      ...batch,
      course: courseID,
    }));

    // Use insertMany to create all batches at once
    const createdBatches = await Batches.insertMany(formattedBatches);

    // Respond with the created batches
    res.status(201).json({
      message: "Batches created successfully",
      data: createdBatches,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating batches", error: err.message });
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
          const newStudent = await createStudent({
            name: student.name,
            email: student.email,
            password: student.password,
            role: "student",
            roll_no: student.roll_no,
          });
          return newStudent._id;
        } catch (err) {
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
