import mongoose from "mongoose";
import { User } from "./userModels.js";
const Schema = mongoose.Schema;

// Department Schema
const departmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  teachers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
departmentSchema.index({ name: 1 });

//Paper schema
const paperSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6],
    required: true,
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Departments",
    required: true,
  },
});
paperSchema.index({ department: 1 }); // For finding papers by department
paperSchema.index({ code: 1 }); // Already unique but explicit is better
paperSchema.index({ semester: 1 }); // For finding papers by semester

//Academic Timeline Schema
const academicTimelineSchema = new Schema({
  academicYear: {
    type: String,
    required: true,
    unique: true,
    match: [/\d{4}-\d{4}/, "Use format YYYY-YYYY"],
  },
  oddSemester: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  evenSemester: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
});
academicTimelineSchema.index({ "oddSemester.start": 1, "oddSemester.end": 1 });
academicTimelineSchema.index({
  "evenSemester.start": 1,
  "evenSemester.end": 1,
});

// Course Schema
const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["UG", "PG"],
    required: true,
  },
  duration: {
    type: Number,
    default: function () {
      return this.type === "UG" ? 3 : 2; // Years UG | PG
    },
  },
});
courseSchema.index({ name: 1 }); // For course name searches
courseSchema.index({ type: 1 }); // For filtering UG/PG courses

// Batch Schema (represents a specific year's intake for a course)
const batchSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  startYear: {
    type: Number,
    required: true,
  },
  currentSemester: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6],
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  classRepresentatives: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async function (userId) {
          const user = await User.findById(userId).select("classrep_of").lean();
          return user?.classrep_of?.equals(this.parent()._id);
        },
        message: "User must be registered as classrep of this batch",
      },
    },
  ],
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
});
batchSchema.index({ course: 1, startYear: 1 }); // Common query pattern
batchSchema.index({ currentSemester: 1 }); // For semester-based queries
batchSchema.index({ status: 1 }); // For active/completed filtering
batchSchema.pre("save", async function (next) {
  try {
    const currentYear = new Date().getFullYear();

    // Validate startYear isn't in the future
    if (this.startYear > currentYear) {
      return next(new Error("Start year cannot be in the future"));
    }

    // Check if course exists
    const course = await Courses.findById(this.course);
    if (!course) return next(new Error("Course not found"));

    // Validate startYear isn't too old for course duration
    if (this.startYear < currentYear - course.duration) {
      return next(
        new Error(
          `Start year too old for ${course.duration}-year course. ` +
            `Max valid start year: ${currentYear - course.duration}`
        )
      );
    }

    // PG Semester Restriction
    if (course.type === "PG" && this.currentSemester > 4) {
      return next(new Error("PG batches cannot progress beyond semester 4"));
    }

    // Find current time and academic timeline
    if (this.isNew) {
      const currentDate = new Date();
      const timeline = await AcademicTimeline.findOne({
        $or: [
          {
            "oddSemester.start": { $lte: currentDate },
            "oddSemester.end": { $gte: currentDate },
          },
          {
            "evenSemester.start": { $lte: currentDate },
            "evenSemester.end": { $gte: currentDate },
          },
        ],
      });

      // Calculate basemester and semester offset and cap semesters
      const yearsSinceStart = Math.max(1, currentYear - this.startYear);
      const baseSemester = yearsSinceStart * 2;
      let semesterOffset = 0;

      if (timeline) {
        semesterOffset =
          currentDate >= timeline.oddSemester.start &&
          currentDate <= timeline.oddSemester.end
            ? 1
            : 0;
      }
      this.currentSemester = Math.min(
        baseSemester + semesterOffset,
        course.type === "UG" ? 6 : 4 // Explicit PG cap
      );
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Semester Schema (connects subjects, teachers, and batches)
const semesterSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  number: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6],
    required: true,
  },
  papers: [
    {
      paper: {
        type: Schema.Types.ObjectId,
        ref: "Papers",
        required: true,
      },
      teacher: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
});
semesterSchema.index({ course: 1, number: 1 }, { unique: true }); // Unique semesters per course
semesterSchema.index({ "papers.paper": 1 }); // For paper-based queries
semesterSchema.index({ "papers.teacher": 1 }); // For teacher-based queries

semesterSchema.pre("save", async function (next) {
  try {
    // Find the associated course
    const course = await Courses.findById(this.course);
    if (!course) {
      return next(new Error("Associated course not found"));
    }
    // Validate semester number for UG courses
    if (course.type === "UG" && this.number > 6) {
      return next(new Error("UG courses cannot have more than 6 semesters"));
    }
    // Validate semester number for PG courses
    if (course.type === "PG" && this.number > 4) {
      return next(new Error("PG courses cannot have more than 4 semesters"));
    }

    next();
  } catch (err) {
    next(err);
  }
});

export const Departments = mongoose.model("Departments", departmentSchema);
export const Papers = mongoose.model("Papers", paperSchema);
export const Courses = mongoose.model("Courses", courseSchema);
export const Batches = mongoose.model("Batches", batchSchema);
export const Semesters = mongoose.model("Semesters", semesterSchema);
export const AcademicTimeline = mongoose.model(
  "AcademicTimeline",
  academicTimelineSchema
);
