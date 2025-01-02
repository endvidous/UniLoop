const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Assignments schema
const assignmentSchema = new Schema({
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  questionPDF: {
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
});

//Assignments submission
const assignmentSubmissionSchema = new Schema({
  assignment: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submissionPDF: {
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["submitted", "late", "not_submitted"],
    default: "not_submitted",
  },
});

const Assignments = mongoose.model("Assignments", assignmentSchema);
const Assignment_Submissions = mongoose.model(
  "Assignment_Submissions",
  assignmentSubmissionSchema
);

module.exports = { Assignment_Submissions, Assignments };
