import mongoose from "mongoose";
import { Batches } from "./courseModels.js";
import { Departments } from "./courseModels.js";
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
      ref: "Batches",
      validate: {
        validator: async function (batchId) {
          if (this.role !== "teacher") return false;

          // 1. Find teacher's departments
          const teacherDepartments = await Departments.find({
            teachers: this._id,
          });
          if (teacherDepartments.length === 0) return false;

          // 2. Get batch's course structure
          const batch = await Batches.findById(batchId).populate({
            path: "course",
            populate: {
              path: "semesters",
              populate: {
                path: "papers.paper",
                select: "department",
              },
            },
          });

          // 3. Verify department papers in course
          return batch.course.semesters.some((semester) =>
            semester.papers.some((p) =>
              teacherDepartments.some((dept) =>
                p.paper.department.equals(dept._id)
              )
            )
          );
        },
        message: "Your departments have no papers in this batch's curriculum",
      },
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

userSchema.methods.isMentorOf = function (batchId) {
  return this.mentor_of === batchId;
};

userSchema.methods.isClassRepOf = function (batchId) {
  return this.classrep_of === batchId;
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
