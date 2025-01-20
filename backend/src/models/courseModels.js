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

// Subject Schema
const subjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  credits: {
    type: Number,
    required: true,
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
    ref: "Course",
    required: true,
  },
  startYear: {
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
  batch: {
    type: Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  subjects: [
    {
      subject: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
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
export const Subject = mongoose.model("Subject", subjectSchema);
export const Course = mongoose.model("Course", courseSchema);
export const Batch = mongoose.model("Batch", batchSchema);
export const Semester = mongoose.model("Semester", semesterSchema);
