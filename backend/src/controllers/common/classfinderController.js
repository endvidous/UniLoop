//FUNCTINS TO BE ADDED: Maybe update booking reason
import mongoose from "mongoose";
import {
  Classroom,
  ClassroomBooking,
  parseTime,
} from "../../models/classroomModels.js";
import { Batches } from "../../models/courseModels.js";

/*------------------------------Middleware------------------------------*/
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

/*------------------------------Controllers------------------------------*/

//Get a single classroom
export const getClassroomById = async (req, res) => {
  const { classroomId } = req.params;

  try {
    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found." });
    }

    // Convert document to a plain object
    const classroomObj = classroom.toObject();
    // Remove the availability field
    delete classroomObj.availability;

    res.status(200).json({ classroom: classroomObj });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving classroom", error: error.message });
  }
};

//Get all classrooms [Checks if it is booked and if it's occupied returns only unoccupied classes unless asked to return occupied classes]
export const getAllClassrooms = async (req, res) => {
  const { block, date, time, includeOccupied } = req.query;

  try {
    let parsedDate;
    let dayOfWeek;
    let startTimeInMinutes;
    let endTimeInMinutes;

    // Check if any query parameters are provided
    const hasQueries = block || date || time;

    if (time) {
      const [startTimeStr, endTimeStr] = time.split("-").map((t) => t.trim());
      startTimeInMinutes = parseTime(startTimeStr);
      endTimeInMinutes = parseTime(endTimeStr);
    } else {
      const now = new Date();
      startTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      endTimeInMinutes = startTimeInMinutes;
    }

    parsedDate = date ? new Date(date) : new Date();
    dayOfWeek = parsedDate.getDay();
    // Build the query
    const query = {};

    // Filter by block if provided
    if (block) {
      query.block = block;
    }

    // Prepare availability query conditions
    const availabilityConditions = {
      weekday: dayOfWeek,
    };

    // If time is provided or we're using current time, add time conditions
    if (time || !hasQueries) {
      const slotsQuery = {
        startTime: { $lt: endTimeInMinutes },
        endTime: { $gt: startTimeInMinutes },
      };

      // Exclude occupied slots unless includeOccupied is true
      if (includeOccupied !== "true") {
        slotsQuery.occupied = false;
      }

      availabilityConditions.slots = { $elemMatch: slotsQuery };
    }

    // Add availability conditions to the main query
    query.availability = { $elemMatch: availabilityConditions };
    // Step 1: Find classrooms based on availability
    const classrooms = await Classroom.find(query);

    // If no classrooms found, return empty array
    if (classrooms.length === 0) {
      return res.status(200).json({ classrooms: [] });
    }

    // Step 2: Check for conflicting approved bookings
    const classroomIds = classrooms.map((c) => c._id);

    // Find bookings that overlap with the queried time and date
    const conflictingBookings = await ClassroomBooking.find({
      classroom: { $in: classroomIds },
      date: parsedDate,
      startTime: { $lt: endTimeInMinutes },
      endTime: { $gt: startTimeInMinutes },
      status: "approved",
    });

    const conflictingClassroomIds = new Set(
      conflictingBookings.map((b) => b.classroom.toString())
    );

    // Filter classrooms to exclude those with conflicts unless includeOccupied is true
    const availableClassrooms = classrooms.filter((c) => {
      if (includeOccupied === "true") {
        return true;
      } else {
        return !conflictingClassroomIds.has(c._id.toString());
      }
    });

    // Transform each classroom so that only the availability for the specified weekday is returned
    const transformedClassrooms = availableClassrooms.map((classroom) => {
      // Convert the Mongoose document to a plain object
      const classroomObj = classroom.toObject();

      //Delete classroom availability
      delete classroomObj.availability;

      // Filter the raw availability array to only include the current day (or the provided filter day)
      const formattedAvailability = classroom.formattedAvailability.filter(
        (day) => day.weekday === dayOfWeek
      );

      // Overwrite the virtual field with the filtered data
      return { ...classroomObj, formattedAvailability };
    });

    res.status(200).json({ classrooms: transformedClassrooms });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving classrooms",
      error: error.message,
    });
  }
};

//Create classrooms(deletes existing classrooms each time)
export const createBulkClassrooms = async (req, res) => {
  try {
    // Delete all existing classrooms
    await Classroom.deleteMany({});

    // Create new classrooms from the request body
    const classroomsData = req.body; // Expecting an array of classroom objects
    await Classroom.insertMany(classroomsData);

    res.status(201).json({
      message: "Classrooms created successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating classrooms", error: error.message });
  }
};

// Function to book a classroom
export const bookClassroom = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { classroomId, date, startTime, endTime, purpose } = req.body;

    // Validate classroom existence and availability
    const classroom = await Classroom.findById(classroomId).session(session);
    if (!classroom) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Calculate booking weekday
    const bookingDate = new Date(date);
    const weekday = bookingDate.getDay();

    // Check permanent occupancy
    const hasOccupancyConflict = classroom.availability.some((day) => {
      if (day.weekday === weekday) {
        return day.slots.some((slot) => {
          const slotOverlap =
            slot.startTime < endTime && slot.endTime > startTime;
          return slotOverlap && slot.occupied;
        });
      }
      return false;
    });

    if (hasOccupancyConflict) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Classroom is permanently occupied during this time",
      });
    }

    // Check existing bookings
    const conflictingBooking = await ClassroomBooking.findOne({
      classroom: classroomId,
      date: bookingDate,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        { status: { $in: ["approved", "pending"] } },
      ],
    }).session(session);

    if (conflictingBooking) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Time slot conflicts with another existing booking" });
    }

    // Create new booking
    const newBooking = new ClassroomBooking({
      classroom: classroomId,
      requestedBy: req.user._id,
      date: bookingDate,
      startTime,
      endTime,
      purpose,
      status: "pending",
    });

    await newBooking.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Booking request submitted",
      booking: newBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: "Booking failed",
      error: error.message,
    });
  }
};

// Approval Controller
export const approveBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Authorization check
    if (!req.user.isAdmin() && !req.user.isTeacher()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const booking = await ClassroomBooking.findById(
      req.params.bookingId
    ).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update booking status
    booking.status = "approved";
    booking.approvedBy = req.user._id;
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Booking approved",
      booking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: "Approval failed",
      error: error.message,
    });
  }
};

// Rejection Controller
export const rejectBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Authorization check
    if (!req.user.isAdmin() && !req.user.isTeacher()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const booking = await ClassroomBooking.findById(
      req.params.bookingId
    ).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update booking status
    booking.status = "rejected";
    booking.approvedBy = req.user._id;
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Booking rejected",
      booking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: "Rejection failed",
      error: error.message,
    });
  }
};

export const deleteBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await ClassroomBooking.findById(
      req.params.bookingId
    ).session(session);

    // Validation checks
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.requestedBy.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "Unauthorized: Can only delete your own bookings" });
    }

    // Delete operation
    await ClassroomBooking.findByIdAndDelete(req.params.bookingId).session(
      session
    );
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: "Deletion failed",
      error: error.message,
    });
  }
};
