import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Helper function: converts minutes since midnight to a 12-hour time string.
export function formatTime(minutes) {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const amPm = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${mins.toString().padStart(2, "0")}${amPm}`;
}

// Helper function: converts a time string to minutes since midnight.
// Accepts "5:30pm", "17:30", etc.
export function parseTime(time) {
  if (typeof time === "number") {
    return time;
  }
  if (typeof time !== "string") {
    throw new Error("Time must be a number or string");
  }
  time = time.toLowerCase().trim();
  let ampm = null;
  if (time.endsWith("am") || time.endsWith("pm")) {
    ampm = time.slice(-2);
    time = time.slice(0, -2).trim();
  }
  const parts = time.split(":"); // splits 14:30 to ["14","30"]
  let hour = parseInt(parts[0], 10); //extract "14", makes it int & base 10
  let minute = parts[1] ? parseInt(parts[1], 10) : 0; // checks if minutes is there, if it does, extracts, makes it int, if not assigns minutes as 0
  if (isNaN(hour) || isNaN(minute)) {
    throw new Error("Invalid time numbers");
  }
  if (ampm) {
    if (ampm === "pm" && hour < 12) {
      hour += 12;
    }
    if (ampm === "am" && hour === 12) {
      hour = 0;
    }
  }
  return hour * 60 + minute;
}

// Classroom schema
const classroomSchema = new Schema({
  block: {
    type: String,
    required: true,
  },
  room_num: {
    type: String,
    required: true,
  },
  availability: [
    {
      weekday: {
        type: Number,
        required: true,
        min: 0, // Sunday
        max: 6, // Saturday
      },
      slots: [
        {
          startTime: {
            type: Number, // minutes since midnight
            required: true,
            min: 0,
            max: 1440,
            set: parseTime,
          },
          endTime: {
            type: Number,
            required: true,
            min: 0,
            max: 1440,
            set: parseTime,
          },
          occupied: {
            type: Boolean,
            required: true,
          },
        },
      ],
    },
  ],
});

// Index for quick lookup by block and classroom number
classroomSchema.index({ block: 1, classroom_num: 1 }, { unique: true });

// Virtual for formatted availability (for frontend display)
classroomSchema.virtual("formattedAvailability").get(function () {
  return this.availability.map((day) => ({
    weekday: day.weekday,
    slots: day.slots.map((slot) => ({
      startTime: formatTime(slot.startTime),
      endTime: formatTime(slot.endTime),
    })),
  }));
});

// Include virtuals when converting to JSON
classroomSchema.set("toJSON", { virtuals: true });

// Classroom booking schema
// Now allows booking for one slot on a given date with startTime and endTime.
const classroomBookingSchema = new Schema({
  classroom: {
    type: Schema.Types.ObjectId,
    ref: "Classroom",
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
  // Booking date (the day for which the reservation is made)
  date: {
    type: Date,
    required: true,
  },
  // Single booking slot's start time (stored as minutes since midnight)
  startTime: {
    type: Number,
    required: true,
    min: 0,
    max: 1440,
    set: parseTime,
  },
  // Single booking slot's end time (stored as minutes since midnight)
  endTime: {
    type: Number,
    required: true,
    min: 0,
    max: 1440,
    set: parseTime,
  },
});

// Virtual for formatted booking slot (for frontend display)
classroomBookingSchema.virtual("formattedSlot").get(function () {
  return {
    startTime: formatTime(this.startTime),
    endTime: formatTime(this.endTime),
  };
});

// Include virtuals when converting to JSON
classroomBookingSchema.set("toJSON", { virtuals: true });

// Index for efficient conflict checking on bookings
classroomBookingSchema.index({
  classroom: 1,
  date: 1,
  startTime: 1,
  endTime: 1,
});

export const Classroom = mongoose.model("Classroom", classroomSchema);
export const ClassroomBooking = mongoose.model(
  "ClassroomBooking",
  classroomBookingSchema
);
