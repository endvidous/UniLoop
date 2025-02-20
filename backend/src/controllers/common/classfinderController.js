import mongoose from "mongoose";
import {
  Classroom,
  ClassroomBooking,
  formatTime,
  parseTime,
} from "../models/classroomModels.js";
import { Batches } from "../../models/courseModels.js";
//mini middleware
export const canCreateClassroomBookings = async (req, res, next) => {
  try {
    if (req.user.isAdmin() || req.user.isTeacher()) return next();

    if (req.user.isStudent() && req.user.classrep_of) {
      // Verify class rep has a valid batch
      const batch = await Batches.findOne({
        _id: req.user.classrep_of,
        students: req.user._id,
      });

      if (batch) return next();
    }

    res.status(403).json({ message: "Not authorized to create announcements" });
  } catch {
    res.status(500).json({ message: "Server error during authorization" });
  }
};

//1. create classrooms(deletes existing classrooms each time)
export const createMultipleClassrooms = async (req, res) => {
  try {
    // Delete all existing classrooms
    await Classroom.deleteMany({});

    // Create new classrooms from the request body
    const classroomsData = req.body; // Expecting an array of classroom objects
    const newClassrooms = await Classroom.insertMany(classroomsData);

    res.status(201).json({
      message: "Classrooms created successfully.",
      classrooms: newClassrooms,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating classrooms", error: error.message });
  }
};
//get single classroom
export const getClassroomById = async (req, res) => {
  const { id } = req.params;

  try {
    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found." });
    }

    res.status(200).json({ classroom });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving classroom", error: error.message });
  }
};
//get all classrooms
export const getAllClassrooms = async (req, res) => {
  const { block, time, date } = req.query; // Extract query parameters

  try {
    // Build the query object
    const query = {};

    // Filter by block if provided
    if (block) {
      query.block = block;
    }

    // Filter by date and time if provided
    if (date) {
      const dayOfWeek = new Date(date).getDay(); // Get the day of the week (0-6)
      query.availability = {
        $elemMatch: {
          weekday: dayOfWeek,
        },
      };
    }

    if (time) {
      // Split the time range into start and end times
      const [startTimeStr, endTimeStr] = time.split("-").map((t) => t.trim()); //split time& map it to startTime and endTime

      // Convert both times to minutes
      const startTimeInMinutes = parseTime(startTimeStr);
      const endTimeInMinutes = parseTime(endTimeStr);

      // Update the query to filter by the time range
      query.availability = {
        ...query.availability,
        $elemMatch: {
          ...query.availability.$elemMatch,
          slots: {
            $elemMatch: {
              startTime: { $lt: endTimeInMinutes }, // Start time must be less than the end time
              endTime: { $gt: startTimeInMinutes }, // End time must be greater than the start time
            },
          },
        },
      };
    }

    const classrooms = await Classroom.find(query);

    res.status(200).json({ classrooms });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving classrooms", error: error.message });
  }
};

// Function to book a classroom
export const bookClassroom = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { classroomId, date, startTime, endTime } = req.body;
    // Check if the classroom is already booked
    const existingBooking = await ClassroomBooking.findOne({
      classroom: classroomId,
      date,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    }).session(session); // Use the session for this query

    if (existingBooking) {
      await session.abortTransaction(); // Abort the transaction if the classroom is already booked
      session.endSession();
      return res.status(400).json({
        message: "Classroom is already booked for the selected time.",
      });
    }

    // Create a new booking request
    const newBooking = new ClassroomBooking({
      classroom: classroomId,
      requestedBy: req.user._id,
      date,
      startTime,
      endTime,
    });

    await newBooking.save({ session }); // Use the session to save the new booking

    await session.commitTransaction(); // Commit the transaction
    session.endSession();

    res.status(201).json({
      message: "Booking request created successfully.",
      booking: newBooking,
    });
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction on error
    session.endSession();
    res
      .status(500)
      .json({ message: "Error booking classroom", error: error.message });
  }
};
