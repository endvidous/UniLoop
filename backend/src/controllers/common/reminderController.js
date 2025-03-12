import { Reminder } from "../../models/remindersModels.js";
import mongoose from "mongoose";

// Create Reminder
export const createReminder = async (req, res) => {
  const { title, description, deadline, priority, remindAt } = req.body; // expect remindAt to be an array

  try {
    const reminder = new Reminder({
      userId: req.user._id,
      title,
      description,
      deadline,
      priority,
      remindAt, // ensure client sends an array of remindAt objects
    });

    await reminder.save();
    res
      .status(201)
      .json({ message: "Reminder created successfully", data: reminder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating reminder", error: error.message });
  }
};

// Update Reminder
export const updateReminder = async (req, res) => {
  const { reminderId } = req.params;

  try {
    const allowedFields = [
      "title",
      "description",
      "deadline",
      "priority",
      "remindAt", // using the field name as in the schema
    ];
    const update = {};

    // Populate update object with valid fields from request body
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
      // for backward compatibility, if client sends "remind_at" instead of "remindAt"
      if (field === "remindAt" && req.body.remind_at !== undefined) {
        update.remindAt = req.body.remind_at;
      }
    });

    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const updatedReminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, userId: req.user._id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedReminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.status(200).json({
      message: "Reminder updated successfully",
      data: updatedReminder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating reminder",
      error: error.message,
    });
  }
};

// Delete Reminder
export const deleteReminder = async (req, res) => {
  const { reminderId } = req.params;

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
      return res.status(400).json({
        message: "Invalid reminder ID format",
      });
    }

    const deletedReminder = await Reminder.findOneAndDelete({
      _id: reminderId,
      userId: req.user._id,
    });

    if (!deletedReminder) {
      return res.status(404).json({
        message: "Reminder not found or already deleted",
      });
    }

    res.status(200).json({
      message: "Reminder deleted successfully",
      deletedId: reminderId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting reminder",
      error: error.message,
    });
  }
};

// Get One Reminder
export const getOneReminder = async (req, res) => {
  const { reminderId } = req.params;

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
      return res.status(400).json({ message: "Invalid reminder ID format" });
    }

    const reminder = await Reminder.findOne({
      _id: reminderId,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.status(200).json({
      message: "Reminder retrieved successfully",
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reminder",
      error: error.message,
    });
  }
};

// Get all reminders with search and filter
export const getReminders = async (req, res) => {
  const user_id = req.user._id;
  const { sort, search, priority, completed, remind_at } = req.query;
  try {
    // Define available sort options.
    const sortOptions = {
      newest: { createdAt: -1 },
      priority: { priority: -1 },
      deadline: { deadline: 1 },
    };

    // Base filter: only include reminders for the logged-in user.
    const filters = { userId: user_id };

    // Apply optional filters from query parameters.
    if (search) {
      filters.title = { $regex: search, $options: "i" };
    }
    if (priority !== undefined) {
      filters.priority = Number(priority);
    }
    if (completed !== undefined) {
      filters.completed = completed === "true";
    }

    //Not sure if we should allow this need to check
    if (remind_at) {
      // Find reminders with at least one scheduled reminder time matching the provided date.
      filters.remindAt = {
        $elemMatch: { date_time: new Date(remind_at) },
      };
    }

    // Choose sort order based on query parameter or default to newest.
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    // Retrieve the reminders from the database.
    const reminders = await Reminder.find(filters).sort(sortBy).lean();

    // Return a 200 status with an empty array if no reminders are found.
    if (!reminders || reminders.length === 0) {
      return res
        .status(200)
        .json({ reminders: [], message: "No reminders found" });
    }

    // Return the retrieved reminders along with their total count.
    res.status(200).json({
      reminders,
      total: reminders.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reminders",
      error: error.message,
    });
  }
};

// Mark/Unmark Reminder as Completed
export const toggleReminderCompletion = async (req, res) => {
  const { reminderId } = req.params;

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
      return res.status(400).json({ message: "Invalid reminder ID format" });
    }

    const reminder = await Reminder.findOne({
      _id: reminderId,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminder.completed = !reminder.completed;
    await reminder.save();

    res.status(200).json({
      message: `Reminder ${
        reminder.completed ? "marked as completed" : "marked as pending"
      }`,
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error toggling reminder completion",
      error: error.message,
    });
  }
};
