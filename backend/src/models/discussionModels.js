import mongoose from "mongoose";
const Schema = mongoose.Schema;

//Questionaire Schema
const discussionSchema = new Schema(
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
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibilityType: {
      type: String,
      enum: ["General", "Department", "Batch", "Course"],
      required: true,
      default: "General",
    },
    posted_to: {
      model: {
        type: String,
        enum: ["Departments", "Batches", "Courses"],
        required: function () {
          return this.visibilityType !== "General";
        },
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: function () {
          return this.visibilityType !== "General";
        },
        refPath: "posted_to.model",
      },
      _id: false,
    },
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reason: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isClosed: {
      type: Boolean,
      default: false,
    },
    comments: [
      {
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        postedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        isAnswer: {
          type: Boolean,
          default: false,
        },
        upvotes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        reports: [
          {
            reportedBy: mongoose.Schema.Types.ObjectId,
            reason: String,
            createdAt: Date,
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
// Add indexes for better performance
discussionSchema.index({ title: "text", description: "text" });
discussionSchema.index({ "comments.createdAt": -1 });
discussionSchema.index({ visibilityType: 1, "posted_to.id": 1 });

export const Discussion = mongoose.model("Discussion", discussionSchema);
