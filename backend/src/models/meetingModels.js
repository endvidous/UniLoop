import mongoose from "mongoose";
import { User } from "./userModels.js";
import { Reminders } from "./remindersModels.js";
const Schema = mongoose.Schema;

const meetingSchema = new Schema(
  {
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (userId) {
          const user = await User.findById(userId);
          return !!user;
        },
        message: "Invalid requester",
      },
    },
    requestedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (userId) {
          const user = await User.findById(userId);
          return !!user;
        },
        message: "Invalid recipient",
      },
    },
    purpose: {
      type: String,
      required: true,
      minlength: [20, "Purpose must be at least 20 characters"],
    },
    timing: {
      type: Date,
      required: function () {
        return this.requesterIsStaff();
      },
    },
    venue: {
      type: String,
      required: function () {
        return this.requesterIsStaff();
      },
    },
    rejectionReason: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
      validate: {
        validator: function (status) {
          if (status === "rejected" && !this.rejectionReason) {
            return false;
          }
          return true;
        },
        message: "Rejection reason is required when status is rejected",
      },
    },
  },
  { timestamps: true }
);

//Helper methods
meetingSchema.methods.requesterIsStaff = async function () {
  const requester = await User.findById(this.requestedBy);
  return requester?.isTeacher() || requester?.isAdmin();
};

// Add pre-save hook to handle async validation
meetingSchema.pre("save", async function (next) {
  // Verify user roles
  const requester = await User.findById(this.requestedBy);

  if (
    (requester.isTeacher() || requester.isAdmin()) &&
    (!this.timing || !this.venue)
  ) {
    return next(new Error("Timing and venue are required for staff requests"));
  }

  next();
});

//Deleting reminders associated with this meeting
meetingSchema.pre("save", async function (next) {
  if (this.isModified("status") && this.status === "rejected") {
    try {
      // Get user documents for both participants
      const [requester, recipient] = await Promise.all([
        User.findById(this.requestedBy),
        User.findById(this.requestedTo),
      ]);

      // Find student participant
      const studentId = requester?.isStudent()
        ? requester._id
        : recipient?.isStudent()
        ? recipient._id
        : null;

      if (studentId) {
        // Safe regex pattern for title matching
        const safePurpose = this.purpose.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        await Reminders.updateOne(
          { _id: studentId },
          {
            $pull: {
              reminders: {
                deadline: this.timing,
                title: { $regex: new RegExp(safePurpose, "i") },
              },
            },
          }
        );
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Update `updated_at` on save
meetingSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Delete hook that removes the associated reminders
meetingSchema.pre("remove", async function (next) {
  try {
    const student = await User.findOne({
      $or: [
        { _id: this.requestedBy, role: "student" },
        { _id: this.requestedTo, role: "student" },
      ],
    });

    if (student) {
      await Reminders.updateOne(
        { _id: student._id },
        {
          $pull: {
            reminders: {
              description: { $regex: `\\[Meeting ID: ${this._id}\\]` },
            },
          },
        }
      );
    }
    next();
  } catch (err) {
    next(err);
  }
});
export const Meetings = mongoose.model("Meetings", meetingSchema);
