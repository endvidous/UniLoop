import mongoose from "mongoose";
const Schema = mongoose.Schema;

//Annoucements schema
const announcementsSchema = new Schema(
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
    priority: {
      type: Number,
      enum: [1, 2, 3],
      default: 2,
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
      type: new Schema(
        {
          model: {
            type: String,
            enum: ["Departments", "Batches", "Courses"],
            required: function () {
              return this.visibilityType !== "General";
            },
          },
          id: {
            type: Schema.Types.ObjectId,
            required: function () {
              return this.visibilityType !== "General";
            },
            refPath: "posted_to.model",
          },
        },
        { _id: false } // Prevent Mongoose from creating an _id for this subdocument
      ),
    },
    expiresAt: Date,
    attachments: [
      {
        name: String,
        key: String,
        type: String,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Limit attachments to a maximum of 3
announcementsSchema.path('attachments').validate(function (value) {
  return !value || value.length <= 3;
}, 'A maximum of 3 attachments is allowed.');


announcementsSchema.index({ title: "text", description: "text" }); //For search performance
announcementsSchema.index({ visibilityType: 1, "posted_to.model": 1 });
announcementsSchema.index({ priority: -1, createdAt: -1 });

export const Announcements = mongoose.model(
  "Announcements",
  announcementsSchema
);
