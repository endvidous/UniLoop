import {
  Courses,
  Batches,
  Semesters,
  Papers,
} from "../../models/courseModels.js";
import { User } from "../../models/userModels.js";
import { checkIfEmpty } from "../../utils/helpers.js";
import mongoose from "mongoose";

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
  const { courseId } = req.params;
  const { batches } = req.body;
  try {
    // Validate courseId
    const course = await Courses.findById(courseId);
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
      course: courseId,
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
