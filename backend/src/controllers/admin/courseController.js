import {
  Courses,
  Batches,
  Semesters,
  Papers,
} from "../../models/courseModels.js";
import { User } from "../../models/userModels.js";
import { checkIfEmpty } from "../../utils/helpers.js";
import mongoose from "mongoose";

/* ------------------------------COURSE FUNCTIONS------------------------------ */

//Get one course
export const getOneCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Courses.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      message: "Course retrieved successfully",
      data: course,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error finding the course", error: error.message });
  }
};

//Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Courses.find(); // Fetch all courses from the database

    if (courses.length === 0) {
      return res.status(200).json({
        message: "No courses found",
        data: [],
      });
    }

    res.status(200).json({
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error retrieving courses: ${err.message}` });
  }
};

//Create multiple courses
export const createCourses = async (req, res) => {
  const { courses } = req.body;
  try {
    // Validate batch details
    checkIfEmpty(courses);

    // Validate fields
    const invalidCourse = courses.find(
      (course) => !course.name || !course.type || !course.code
    );
    if (invalidCourse) {
      throw new Error("Each course must have a name, code and type");
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

//Edit a course
export const editCourse = async (req, res) => {
  const { courseId } = req.params; // Expecting a single course ID from the URL
  const { name, code } = req.body; // Expecting the new name in the request body

  try {
    // Validate input
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }
    if (!name && !code) {
      return res.status(400).json({
        message: "At least a name or a code must be provided to update",
      });
    }

    // Build the update object only with provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;

    // Update the course name or code or both
    const updatedCourse = await Courses.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res
      .status(200)
      .json({ message: "Course updated successfully", updatedCourse });
  } catch (err) {
    res.status(500).json({ message: `Error updating course: ${err.message}` });
  }
};

// Delete Course Function
export const deleteCourse = async (req, res) => {
  const { courseId } = req.params; // Expecting a single course ID from the URL

  try {
    // Validate input
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    // Delete the course
    const deletedCourse = await Courses.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res
      .status(200)
      .json({ message: "Course deleted successfully", deletedCourse });
  } catch (err) {
    res.status(500).json({ message: `Error deleting course: ${err.message}` });
  }
};

/* ------------------------------BATCH FUNCTIONS------------------------------ */

//Get one batch
export const getOneBatch = async (req, res) => {
  const { batchId } = req.params; // Expecting a single batch ID from the URL

  try {
    // Validate input
    if (!batchId) {
      return res.status(400).json({ message: "Batch ID is required" });
    }

    // Find the batch by ID
    const batch = await Batches.findById(batchId)
      .populate("course", "name code type") // populate course with selected fields
      .populate("students", "name email roll_no") // populate students with essential user details
      .populate("classRepresentatives", "name email roll_no") // populate class reps similarly
      .populate("mentors", "name email"); // populate mentors

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.status(200).json({
      message: "Batch retrieved successfully",
      data: batch,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving batch", error: err.message });
  }
};

//Get all batches related to a course
export const getBatches = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Courses.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: "Course not found" });
    }

    const batches = await Batches.find({ course: courseId });

    if (batches.length === 0) {
      return res.status(200).json({
        message: "No batches found",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Batches retrieved successfully",
      data: batches,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error getting the batches", error: error.message });
  }
};

//Create multiple batches
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
      throw new Error("Each batch must have startYear");
    }

    // Adding courseId to each batch
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

//Edit batch
export const editBatch = async (req, res) => {
  const { batchId } = req.params;
  const { code } = req.body;
  try {
    const batch = await Batches.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "No batch found" });
    }

    if (!code) {
      return res.status(400).json({ message: "No code provided for update" });
    }

    batch.code = code;

    await batch.save();

    return res.status(200).json({
      message: "Batch updated successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating the batch", error: error.message });
  }
};

// Delete Batch Function
export const deleteBatch = async (req, res) => {
  const { batchId } = req.params; // Expecting a single batch ID from the URL
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const batch = await Batches.findById(batchId).session(session);
    if (!batch) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Batch not found" });
    }

    //Delete all the students related to that batch
    await User.deleteMany({ _id: { $in: batch.students } }).session(session);

    // Delete the batch
    await Batches.findByIdAndDelete(batchId).session(session);

    await session.commitTransaction();

    res
      .status(200)
      .json({ message: "Batch and associated students deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    res
      .status(500)
      .json({ message: "Error deleting batch", error: err.message });
  } finally {
    session.endSession();
  }
};

/* ------------------------------SEMESTER FUNCTIONS------------------------------ */

//Get one semester details
export const getOneSemester = async (req, res) => {
  const { semesterId } = req.params; // Expecting a single semester ID from the URL

  try {
    // Validate input
    if (!semesterId) {
      return res.status(400).json({ message: "Semester ID is required" });
    }

    // Find the semester by ID
    const semester = await Semesters.findById(semesterId).populate({
      path: "papers",
      populate: [{ path: "paper" }, { path: "teacher" }],
    });
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    res.status(200).json({
      message: "Semester retrieved successfully",
      data: semester,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error retrieving semester: ${err.message}` });
  }
};

//Get all semesters
export const getSemesters = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Courses.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const semesters = await Semesters.find({ course: courseId }).select(
      "-papers"
    );

    if (semesters.length === 0) {
      return res.status(200).json({
        message: "No courses found",
        data: [],
      });
    }

    res.status(200).json({
      message: "Semesters retrieved successfully",
      data: semesters,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving semester", error: error.message });
  }
};

//Create a semester
export const createSemester = async (req, res) => {
  const { courseId, sem_no } = req.params;
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
    const course = await Courses.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Validate papers array
    checkIfEmpty(papers);

    // Validate paper references and teacher assignments
    const paperValidation = await validatePapers(papers);

    // Check for existing semester
    const existingSemester = await Semesters.findOne({
      course: courseId,
      number: semesterNumber,
    });

    if (existingSemester) {
      return res.status(409).json({
        message: `Semester ${semesterNumber} already exists for this course`,
      });
    }

    // Create new semester with properly formatted IDs
    const newSemester = await Semesters.create({
      course: new mongoose.Types.ObjectId(`${courseId}`),
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

// Update a semester
export const editSemester = async (req, res) => {
  const { semesterId } = req.params;
  const { papers } = req.body;

  try {
    // Ensure the papers array is provided and not empty
    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({
        message: "Papers array is required and cannot be empty",
      });
    }

    // Check if the semester exists
    const semester = await Semesters.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    // Validate each paper and teacher in the papers array
    const validatedPapers = await validatePapers(papers);

    // Update the semester's papers field with the validated array
    semester.papers = validatedPapers;
    const updatedSemester = await semester.save();

    return res.status(200).json({
      message: "Semester updated successfully",
      data: updatedSemester,
    });
  } catch (err) {
    const statusCode = err.name === "ValidationError" ? 400 : 500;
    return res.status(statusCode).json({
      message: "Error updating semester",
      error: err.message,
    });
  }
};

// Delete Semester Function with Validation
export const deleteSemester = async (req, res) => {
  const { semesterId } = req.params; // Expecting semester ID, semester number, and course ID from the URL

  try {
    // Validate input
    if (!semesterId) {
      return res.status(400).json({
        message: "Semester Id is required.",
      });
    }

    // Check if the semester exists in the database
    const semester = await Semesters.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found." });
    }

    // Proceed to delete the semester
    await Semesters.findByIdAndDelete(semesterId);
    return res.status(200).json({ message: "Semester deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while deleting the semester.",
      error: error.message,
    });
  }
};

//Helper Functions
export const validatePapers = async (papers) => {
  if (!papers || !Array.isArray(papers) || papers.length === 0) {
    throw new Error("Papers array is required and cannot be empty");
  }

  const validatedPapers = await Promise.all(
    papers.map(async (p) => {
      // Validate ObjectID formats
      if (!mongoose.Types.ObjectId.isValid(p.paper)) {
        throw new Error(`Invalid paper ID format: ${p.paper}`);
      }
      if (!mongoose.Types.ObjectId.isValid(p.teacher)) {
        throw new Error(`Invalid teacher ID format: ${p.teacher}`);
      }

      const paperId = new mongoose.Types.ObjectId(`${p.paper}`);
      const teacherId = new mongoose.Types.ObjectId(`${p.teacher}`);

      // Validate that the paper exists
      const paperExists = await Papers.findById(paperId);
      if (!paperExists) {
        throw new Error(`Paper not found: ${p.paper}`);
      }

      // Validate teacher exists and has the correct role
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        throw new Error(`Teacher not found or invalid role: ${p.teacher}`);
      }

      return { paper: paperId, teacher: teacherId };
    })
  );

  return validatedPapers;
};
