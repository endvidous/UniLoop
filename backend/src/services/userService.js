import { User } from "../models/userModels.js";
import { Departments, Batches, Semesters } from "../models/courseModels.js";
import { checkEmailExists } from "../utils/helpers.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const createStudentRecord = async (studentData) => {
  const { name, email, password, role, roll_no } = studentData;

  await checkEmailExists(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  const newStudent = new User({
    name,
    email,
    password: hashedPassword,
    role,
    roll_no,
  });

  await newStudent.save();
  return newStudent;
};

export const createTeacherRecord = async (teacherData) => {
  const { name, email, password, role } = teacherData;

  await checkEmailExists(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  const newTeacher = new User({
    name,
    email,
    password: hashedPassword,
    role,
  });

  await newTeacher.save();
  return newTeacher;
};

//Functions to find users associations like department, batches, courses etc
export const findTeacherDetails = async (teacherId) => {
  try {
    // Parallelize independent queries
    const [department, semesters] = await Promise.all([
      Departments.findOne({ teachers: teacherId }).select("_id").lean(),
      Semesters.find({ "papers.teacher": teacherId })
        .select("course number")
        .lean(),
    ]);

    //If no semesters found
    if (!semesters?.length) {
      return {
        departmentId: department?._id || null,
        courseIds: [],
        batchIds: [],
      };
    }

    // Create course-semester mapping
    const courseSemesterMap = semesters.reduce((acc, { course, number }) => {
      if (!course) return acc; // Skip invalid entries

      const courseId = course.toString();
      return acc.set(courseId, (acc.get(courseId) || new Set()).add(number));
    }, new Map());

    // Build optimized batch query
    const batchConditions = Array.from(courseSemesterMap).map(
      ([courseId, numbers]) => ({
        course: new mongoose.Types.ObjectId(`${courseId}`),
        currentSemester: { $in: Array.from(numbers) },
      })
    );

    // Single optimized batch query with lean and projection
    const batches = await Batches.find(
      { $or: batchConditions },
      { _id: 1 }
    ).lean();

    return {
      departmentId: department?._id || null,
      courseIds: Array.from(courseSemesterMap.keys()).map(
        (id) => new mongoose.Types.ObjectId(`${id}`)
      ),
      batchIds: batches.map((b) => b._id),
    };
  } catch (err) {
    throw new Error(`Failed to fetch teacher details: ${err.message}`);
  }
};

export const findStudentDetails = async (studentId) => {
  try {
    // 1. Find student's batch with lean and projection
    const batch = await Batches.findOne({ students: studentId })
      .select("course _id")
      .lean();
    if (!batch) return new Error("No batch found");

    // 2. Single optimized aggregation query
    const result = await Semesters.aggregate([
      { $match: { course: batch.course } }, // Find relevant semesters
      { $unwind: "$papers" }, // Break out papers array
      {
        // Get paper details
        $lookup: {
          from: "papers",
          localField: "papers.paper",
          foreignField: "_id",
          as: "paperDetails",
        },
      },
      { $unwind: "$paperDetails" }, // Flatten paper details
      {
        // Collect unique departments
        $group: {
          _id: null,
          departmentIds: { $addToSet: "$paperDetails.department" },
        },
      },
    ]);

    return {
      batchId: batch._id,
      courseId: batch.course,
      departmentIds: result[0]?.departmentIds || [],
    };
  } catch (err) {
    throw new Error(`Student detail lookup failed: ${err.message}`);
  }
};
