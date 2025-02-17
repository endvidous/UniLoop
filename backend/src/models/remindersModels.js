import mongoose from "mongoose";
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
        type: Number, // 0=Low, 1=Normal, 2=High
        min: 0,
        max: 2,
        default: 1,
        index: true,
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

remindersSchema.index({ "reminders.deadline": 1 });
remindersSchema.index({ "reminders.title": 1 });

export const Reminders = mongoose.model("Reminders", remindersSchema);
