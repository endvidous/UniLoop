const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Reminders schema
const remindersSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reminders: [
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
      created_at: { type: Date, default: Date.now },
      deadline: {
        type: Date,
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      priority: {
        type: String,
        enum: ["High", "Normal", "Low"],
      },
      remind_at: [
        {
          date_time: {
            type: Date,
            required: true,
          },
          notified: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
  ],
});

const Reminders = mongoose.model("Reminders", remindersSchema);

module.exports = Reminders;
