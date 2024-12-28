const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Classroom schema
const classroomSchema = new Schema({
  block: {
    type: String,
    required: true,
  },
  classrooms: [
    {
      classroom_num: {
        type: String,
        required: true,
      },
      availability: [
        {
          weekday: {
            type: String,
            enum: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            required: true,
          },
          slots: [
            {
              startTime: {
                type: String,
                required: true,
              },
              endTime: {
                type: String,
                required: true,
              },
              occupied: {
                type: Boolean,
                default: false,
              },
              bookedBy: {
                type: Schema.Types.ObjectId,
                ref: "User",
                default: null,
              },
            },
          ],
        },
      ],
    },
  ],
});

//Classroom booking feature
const classroomBookingSchema = new Schema({
  classroom: {
    type: Schema.Types.ObjectId,
    ref: "Classrooms",
    required: true,
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedSlot: {
    date: Date,
    startTime: String,
    endTime: String,
  },
});

const Classrooms = mongoose.model("Classrooms", classroomSchema);
const Classroom_Booking = mongoose.model(
  "Classroom_Booking",
  classroomBookingSchema
);

module.exports = { Classrooms, Classroom_Booking };
