import { User } from "../models/userModels.js";
import {
  Departments,
  Batches,
  Semesters,
  Papers,
} from "../models/courseModels.js";
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

    if (!batch) {
      return {
        batchId: batch?._id || null,
        courseId: [],
        departmentIds: [],
      };
    }

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

/* -------- Getting user ids for notification -------- */
//Function to find all the admin IDs
const getAdminIds = async () => {
  const admins = await User.find({ role: "admin" }).select("_id").lean();
  const adminIds = admins.map((a) => a._id);
  return adminIds;
};

// Helper function to find user IDs through department association
const getDepartmentUsers = async (departmentId) => {
  // Get teachers directly from department
  const department = await Departments.findById(departmentId)
    .select("teachers")
    .lean();
  const teacherIds = department?.teachers?.map((id) => id) || [];

  // Get students via course papers in this department
  const studentBatches = await Batches.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $lookup: {
        from: "semesters",
        localField: "course._id",
        foreignField: "course",
        as: "semesters",
      },
    },
    { $unwind: "$semesters" },
    {
      $lookup: {
        from: "papers",
        localField: "semesters.papers.paper",
        foreignField: "_id",
        as: "papers",
      },
    },
    {
      $match: {
        "papers.department": new mongoose.Types.ObjectId(`${departmentId}`),
      },
    },
    { $group: { _id: "$_id", students: { $first: "$students" } } },
  ]);

  const studentIds = studentBatches.flatMap((b) => b.students.map((id) => id));

  return [...new Set([...teacherIds, ...studentIds])];
};

// Helper function to find users through course association
const getCourseUsers = async (courseId) => {
  // Get students directly from course batches
  const batches = await Batches.find({ course: courseId })
    .select("students")
    .lean();
  const studentIds = batches.flatMap((b) => b.students.map((id) => id));

  // Get teachers via course papers' departments
  const papers = await Papers.find({
    _id: {
      $in: await Semesters.distinct("papers.paper", { course: courseId }),
    },
  }).select("department");

  const departmentIds = [...new Set(papers.map((p) => p.department))];
  const departments = await Departments.find({ _id: { $in: departmentIds } })
    .select("teachers")
    .lean();

  const teacherIds = departments.flatMap((d) => d.teachers.map((id) => id));

  return [...new Set([...teacherIds, ...studentIds])];
};

// Helper function to find users through batch association
const getBatchUsers = async (batchId) => {
  const batch = await Batches.findById(batchId)
    .populate({
      path: "course",
      populate: {
        path: "semesters",
        populate: {
          path: "papers.teacher",
          select: "_id",
        },
      },
    })
    .select("students mentors course currentSemester")
    .lean();

  if (!batch) return [];

  // Get direct batch participants
  const students = batch.students?.map((id) => id) || [];
  const mentors = batch.mentors?.map((id) => id) || [];

  // Filter semesters based on current semester
  const currentSemester = batch.currentSemester;
  const relevantSemesters =
    typeof currentSemester === "number"
      ? batch.course?.semesters?.filter((s) => s.number <= currentSemester)
      : [];

  // Get teachers from relevant semesters' papers
  const courseTeachers =
    relevantSemesters.flatMap(
      (semester) => semester.papers?.map((paper) => paper.teacher?._id) || []
    ) || [];

  // Combine and deduplicate
  const allUsers = [...students, ...mentors, ...courseTeachers];
  return [...new Set(allUsers.filter(Boolean))];
};

// Main intersection logic
const intersectArrays = (arrays) => {
  if (arrays.length === 0) return [];
  return arrays.reduce((a, b) => a.filter((c) => b.includes(c)));
};

export const getUsersByAssociations = async (filters) => {
  try {
    const { departmentId, courseId, batchId } = filters;
    const resultSets = [];

    if (!departmentId && !courseId && !batchId) {
      const allUsers = await User.find().select("_id").lean();
      return allUsers.map((u) => u._id);
    }

    if (departmentId) {
      resultSets.push(await getDepartmentUsers(departmentId));
    }

    if (courseId) {
      resultSets.push(await getCourseUsers(courseId));
    }

    if (batchId) {
      resultSets.push(await getBatchUsers(batchId));
    }

    const adminIds = await getAdminIds();
    resultSets.push(adminIds);

    // Handle no filters case
    if (resultSets.length === 0) {
      const allUsers = await User.find().select("_id").lean();
      return allUsers.map((u) => u._id);
    }

    // Find common IDs across all filters
    const intersected = intersectArrays(resultSets);
    return [...new Set(intersected)];
  } catch (error) {
    console.error("Association search error:", error);
    throw error;
  }
};
