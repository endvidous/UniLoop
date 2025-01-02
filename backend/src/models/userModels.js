import mongoose from "mongoose";
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  mentor_of: {
    type: String,
    default: null, // Only for teachers
  },
  classrep_of: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    default: null, // Only for students
  },
  roll_no: {
    type: String,
    default: null, // Only for students
  },
});

userSchema.pre("save", async function (next) {
  const role =
    this.role?.name ||
    (mongoose.isValidObjectId(this.role) &&
      (await mongoose.model("Role").findById(this.role))?.name);
  if (!role) return next(new Error("Invalid or missing role."));

  this.mentor_of = role === "teacher" ? this.mentor_of || "" : null;
  this.roll_no =
    role === "student"
      ? this.roll_no || next(new Error("Students must have a roll number."))
      : null;
  this.classrep_of =
    role === "student"
      ? this.classrep_of ||
        next(new Error("Students must have a classrep_of field."))
      : null;

  if (!["teacher", "student"].includes(role)) {
    this.mentor_of = this.roll_no = this.classrep_of = null;
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
