import mongoose from "mongoose";
const Schema = mongoose.Schema;

//Annoucements schema
const annoucementsSchema = new Schema({
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
    type: String,
    enum: ["High", "Normal", "Low"],
    default: "Normal",
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  posted_to: {
    type: {
      model: {
        type: String,
        enum: ["Departments", "Batches", "Courses"],
        required: true,
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: this.posted_to.model,
      },
    },
  },
  created_at: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
  },
  attachments: [
    {
      name: String,
      url: String,
      type: String,
    },
  ],
});

export const Annoucements = mongoose.model("Annoucements", annoucementsSchema);
