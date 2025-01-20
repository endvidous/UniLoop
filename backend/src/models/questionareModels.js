const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Questionaire Schema
const questionsSchema = new Schema({
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
  posted_to: {
    type: {
      model: {
        type: String,
        enum: ["Department", "Batch", "Course"],
        required: true,
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "posted_to.model",
      },
    },
    required: true,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  comments: [
    {
      postedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
      upvotes: {
        type: Number,
        default: 0,
      },
      reported: {
        type: Boolean,
        default: false,
      },
      created_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export const Questionaire = mongoose.model("Questionaire", questionsSchema);
