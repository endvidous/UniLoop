import mongoose from "mongoose";
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  agenda: {
    type: String,
    required: function () {
      return this.isStudent(); // Agenda required for students
    },
  },
  timing: {
    type: Date,
    required: function () {
      // Timing required for teachers/admins requesting to classReps/teachers
      return (
        this.isTeacher() || this.isAdmin()   
      );
    },
  },
  venue: {
    type: String,
    required: function () {
      // Venue required under same conditions as timing
      return (
        this.isTeacher() || this.isAdmin() 
      );
    },
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  rejectionReason: String, // Optional for admins/teachers, required for students/classReps
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Update `updated_at` on save
meetingSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

export const Meetings = mongoose.model("Meetings", meetingSchema);