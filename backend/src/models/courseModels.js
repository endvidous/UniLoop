import mongoose from "mongoose";
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
      return this.type === "UG" ? 6 : 4;
    },
  },
});

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
    required: true,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
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

export const Departments = mongoose.model("Departments", departmentSchema);
export const Papers = mongoose.model("Papers", paperSchema);
export const Courses = mongoose.model("Courses", courseSchema);
export const Batches = mongoose.model("Batches", batchSchema);
export const Semesters = mongoose.model("Semesters", semesterSchema);
