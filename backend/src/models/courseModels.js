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
  papers: [
    {
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
    },
  ],
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
    ref: "Course",
    required: true,
  },
  startYear: {
    type: Number,
    required: true,
  },
  currentSemester: {
    type: Number,
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
    ref: "Course",
    required: true,
  },
  number: {
    type: Number,
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
  startDate: Date,
  endDate: Date,
});

export const Department = mongoose.model("Department", departmentSchema);
export const Papers = mongoose.model("Papers", paperSchema);
export const Course = mongoose.model("Course", courseSchema);
export const Batch = mongoose.model("Batch", batchSchema);
export const Semester = mongoose.model("Semester", semesterSchema);
