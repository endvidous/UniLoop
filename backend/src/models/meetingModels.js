import mongoose from "mongoose";
const Schema = mongoose.Schema;

//Meetings schema
const meetingSchema = new Schema({
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  scheduledFor: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const Meetings = mongoose.model("Meetings", meetingSchema);
