import mongoose from "mongoose";
import { Batches } from "./courseModels.js";
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
      ref: "Courses",
    },
    classrep_of: {
      type: Schema.Types.ObjectId,
      ref: "Batches",
      validate: {
        validator: async function (v) {
          if (this.role !== "student") return true;
          const batch = await Batches.findOne({
            _id: v,
            students: this._id,
          });
          return !!batch;
        },
        message: "Student must be part of the batch they represent",
      },
    },
    roll_no: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        Object.keys(ret).forEach((key) => {
          if (ret[key] === null || ret[key] === undefined) {
            delete ret[key];
          }
        });
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        Object.keys(ret).forEach((key) => {
          if (ret[key] === null || ret[key] === undefined) {
            delete ret[key];
          }
        });
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  // Delete role-specific fields not applicable to the current role
  if (this.role === "admin") {
    delete this.mentor_of;
    delete this.classrep_of;
    delete this.roll_no;
  } else if (this.role === "teacher") {
    delete this.roll_no;
    delete this.classrep_of;
  } else if (this.role === "student") {
    delete this.mentor_of;
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
