import {
  Departments,
  Papers,
  Courses,
  Batches,
  Semesters,
  AcademicTimeline,
} from "../models/courseModels.js";
import { createStudentRecord } from "../services/userService.js";
import mongoose from "mongoose";

//HELPER FUNCTIONS
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

export const createAcademicTimeline = async (req, res) => {
  const { academicYear, oddSemester, evenSemester } = req.body;

  try {
    // Validate input
    if (!academicYear || !oddSemester || !evenSemester) {
      throw new Error(
        "All fields (academicYear, oddSemester, evenSemester) are required"
      );
    }

    // Validate academicYear format
    const yearPattern = /^\d{4}-\d{4}$/;
    if (!yearPattern.test(academicYear)) {
      throw new Error("Invalid academicYear format. Use 'YYYY-YYYY'.");
    }

    // Check if academicYear already exists
    const existingTimeline = await AcademicTimeline.findOne({ academicYear });
    if (existingTimeline) {
      return res
        .status(409)
        .json({ message: "Academic timeline for this year already exists." });
    }

    // Valid dates check
    if (
      !oddSemester.start ||
      !oddSemester.end ||
      !evenSemester.start ||
      !evenSemester.end
    ) {
      throw new Error(
        "Both oddSemester and evenSemester must include 'start' and 'end' dates."
      );
    }

    // Validate start and end dates
    const oddStartDate = new Date(oddSemester.start);
    const oddEndDate = new Date(oddSemester.end);
    const evenStartDate = new Date(evenSemester.start);
    const evenEndDate = new Date(evenSemester.end);

    //  Invalid dates or incorrect logic check
    if (
      isNaN(oddStartDate.getTime()) ||
      isNaN(oddEndDate.getTime()) ||
      isNaN(evenStartDate.getTime()) ||
      isNaN(evenEndDate.getTime())
    ) {
      throw new Error("Invalid date format for semester start or end.");
    }

    if (oddStartDate >= oddEndDate || evenStartDate >= evenEndDate) {
      throw new Error("Semester start date must be earlier than its end date.");
    }

    // Save academic timeline
    const newTimeline = await AcademicTimeline.create({
      academicYear,
      oddSemester: { start: oddStartDate, end: oddEndDate },
      evenSemester: { start: evenStartDate, end: evenEndDate },
    });

    res.status(201).json({
      message: "Academic timeline created successfully",
      data: newTimeline,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating academic timeline",
      error: err.message,
    });
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

    const createdCourses = await Courses.insertMany(courses);

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
    const invalidBatch = batches.find((batch) => !batch.startYear);
    if (invalidBatch) {
      throw new Error("Each batch must have startYear and currentSemester");
    }

    // Adding courseID to each batch
    const formattedBatches = batches.map((batch) => ({
      ...batch,
      course: courseID,
    }));

    // Use insertMany to create all batches at once
    const createdBatches = await Batches.create(formattedBatches);

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
          const newStudent = await createStudentRecord({
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

export const createSemester = async (req, res) => {
  const { courseID, sem_no } = req.params;
  const { papers } = req.body;

  try {
    // Validate semester number
    const semesterNumber = parseInt(sem_no);
    if (isNaN(semesterNumber) || semesterNumber < 1 || semesterNumber > 6) {
      return res
        .status(400)
        .json({ message: "Invalid semester number (1-6 only)" });
    }

    // Validate course exists
    const course = await Courses.findById(courseID);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Validate papers array
    checkIfEmpty(papers);

    // Validate paper references and teacher assignments
    const paperValidation = await Promise.all(
      papers.map(async (p) => {
        // Validate ObjectID formats first
        if (!mongoose.Types.ObjectId.isValid(p.paper)) {
          throw new Error(`Invalid paper ID format: ${p.paper}`);
        }
        if (!mongoose.Types.ObjectId.isValid(p.teacher)) {
          throw new Error(`Invalid teacher ID format: ${p.teacher}`);
        }

        // Convert to ObjectIDs
        const paperId = new mongoose.Types.ObjectId(p.paper);
        const teacherId = new mongoose.Types.ObjectId(p.teacher);

        // Validate paper exists
        const paperExists = await Papers.findById(paperId);
        if (!paperExists) {
          throw new Error(`Paper not found: ${p.paper}`);
        }

        // Validate teacher exists and is a teacher
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== "teacher") {
          throw new Error(`Teacher not found or invalid role: ${p.teacher}`);
        }

        return { paper: paperId, teacher: teacherId };
      })
    );

    // Check for existing semester
    const existingSemester = await Semesters.findOne({
      course: courseID,
      number: semesterNumber,
    });

    if (existingSemester) {
      return res.status(409).json({
        message: `Semester ${semesterNumber} already exists for this course`,
      });
    }

    // Create new semester with properly formatted IDs
    const newSemester = await Semesters.create({
      course: new mongoose.Types.ObjectId(courseID),
      number: semesterNumber,
      papers: paperValidation,
    });

    res.status(201).json({
      message: "Semester created successfully",
      data: newSemester,
    });
  } catch (err) {
    const statusCode = err.name === "ValidationError" ? 400 : 500;
    res.status(statusCode).json({
      message: "Error creating semester",
      error: err.message,
    });
  }
};
