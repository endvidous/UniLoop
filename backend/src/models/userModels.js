import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },
    mentor_of: {
      type: Schema.Types.ObjectId,
      ref: "Course",
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

userSchema.pre("save", async function (next) {
  // Clear all role-specific fields first
  if (this.role === "admin") {
    this.mentor_of = null;
    this.classrep_of = null;
    this.roll_no = null;
  }
  // Validate teacher-specific fields
  else if (this.role === "teacher") {
    this.roll_no = null;
    this.classrep_of = null;
    this.mentor_of = null;
  }
  // Validate student-specific fields
  else if (this.role === "student") {
    this.mentor_of = null;
    this.classrep_of = null;

    if (!this.roll_no) {
      return next(new Error("Students must have a roll number."));
    }
  }

  next();
});

// Helper methods to check roles
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

userSchema.methods.isTeacher = function () {
  return this.role === "teacher";
};

userSchema.methods.isStudent = function () {
  return this.role === "student";
};

userSchema.methods.isMentorOf = function (courseName) {
  // return this.mentor_of !== "" && this.mentor_of !== null;
  return this.mentor_of === courseName;
};

userSchema.methods.isClassRepOf = function (courseName) {
  // return this.classrep_of !== "" && this.classrep_of !== null;
  return this.classrep_of === courseName;
};

// Helper method to check if user has sufficient privileges
userSchema.methods.hasPrivileges = function (requiredRole) {
  const roleHierarchy = {
    admin: 5,
    mentor: 4,
    teacher: 3,
    classrep: 2,
    student: 1,
  };

  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

export const User = mongoose.model("User", userSchema);
