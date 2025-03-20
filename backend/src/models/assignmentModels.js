import mongoose from "mongoose";
import { attachmentSchema } from "./announcementsModels.js";
const Schema = mongoose.Schema;

//status Const
export const SUBMISSION_STATUS = {
  SUBMITTED: 0,
  LATE: 1,
  NOT_SUBMITTED: 2,
};

//Assignments schema
const assignmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.late_deadline
            ? value < this.late_deadline
            : value > Date.now();
        },
        message: "Deadline must be before late deadline and in the future",
      },
    },
    late_deadline: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return value > this.deadline && value > Date.now();
        },
        message:
          "Late deadline must be after regular deadline and in the future",
      },
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posted_to: {
      type: Schema.Types.ObjectId,
      ref: "Batches",
      required: true,
    },
    attachments: {
      type: [attachmentSchema],
      validate: {
        validator: function (arr) {
          return arr.length <= 2;
        },
        message: "Maximum of 2 attachments allowed per assignment",
      },
    },
  },
  { timestamps: true }
);

//Assignments submission
const assignmentSubmissionSchema = new Schema(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Assignments",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submission: attachmentSchema,
    status: {
      type: Number,
      enum: {
        values: Object.values(SUBMISSION_STATUS),
        message: `Status must be one of: ${Object.values(
          SUBMISSION_STATUS
        ).join(", ")}`,
      },
      default: function () {
        return this.submission
          ? SUBMISSION_STATUS.SUBMITTED
          : SUBMISSION_STATUS.NOT_SUBMITTED;
      },
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ posted_to: 1, deadline: 1 });
assignmentSchema.index({ created_by: 1 });
assignmentSubmissionSchema.index(
  {
    assignment: 1,
    student: 1,
  },
  { unique: true }
); // Prevent duplicate submissions
assignmentSubmissionSchema.index({ status: 1 });

//Presave condition for assignment submission to set status
assignmentSubmissionSchema.pre("save", async function (next) {
  if (this.isModified("submission")) {
    try {
      const assignment = await mongoose
        .model("Assignments")
        .findById(this.assignment);

      if (!assignment) {
        return next(new Error("Associated assignment not found"));
      }

      const now = new Date();
      const finalDeadline = assignment.late_deadline || assignment.deadline;

      if (!this.submission) {
        this.status = SUBMISSION_STATUS.NOT_SUBMITTED;
        return next();
      }

      if (now > finalDeadline) {
        return next(new Error("Submission period has ended"));
      }

      this.status =
        now > assignment.deadline
          ? SUBMISSION_STATUS.LATE
          : SUBMISSION_STATUS.SUBMITTED;

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

assignmentSchema.set("toObject", { virtuals: true });
assignmentSchema.set("toJSON", { virtuals: true });

assignmentSchema.virtual("submissions", {
  ref: "Assignment_Submissions",
  localField: "_id",
  foreignField: "assignment",
});

export const Assignments = mongoose.model("Assignments", assignmentSchema);
export const Assignment_Submissions = mongoose.model(
  "Assignment_Submissions",
  assignmentSubmissionSchema
);
