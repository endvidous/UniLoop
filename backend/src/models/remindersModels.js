import mongoose from "mongoose";
const Schema = mongoose.Schema;

const reminderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    deadline: { type: Date, index: true },
    completed: { type: Boolean, default: false },
    priority: {
      type: Number, // 0 = Low, 1 = Normal, 2 = High
      enum: [0, 1, 2],
      default: 1,
      index: true,
    },
    remindAt: [
      {
        date_time: { type: Date, required: true },
        notified: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    validate: {
      validator: function (value) {
        return value.remindAt.length <= 5; // Limit to 5 remindAt values
      },
      message: "You can specify up to 5 remindAt values.",
    },
  }
);

//Simple indexes
reminderSchema.index({ userId: 1 });
reminderSchema.index({ deadline: 1 });
reminderSchema.index({ priority: 1 });

// Compound indexes for common query patterns
reminderSchema.index({ userId: 1, deadline: 1 });
reminderSchema.index({ userId: 1, completed: 1 });

// Text index for full-text search on title and description
reminderSchema.index({ title: "text", description: "text" });

export const Reminder = mongoose.model("Reminder", reminderSchema);
