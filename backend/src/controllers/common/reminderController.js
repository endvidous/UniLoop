//FUNCTIONS LEFT:
//get all
// search&filter refere announcements
import { Reminders } from "../../models/remindersModel.js";
import mongoose from "mongoose";

// 1. Create Reminder
export const createReminder = async (req, res) => {
  const { title, description, deadline, priority, remind_at } = req.body;

  try {
    const reminder = new Reminders({
      _id: new mongoose.Types.ObjectId(`${req.user._id}`),
      reminders: [
        {
          title,
          description,
          deadline,
          priority,
          remind_at,
        },
      ],
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
// 2. Update remainder
export const updateReminder = async (req, res) => {
  const { reminderId } = req.params;

  try {
    // Define allowed fields and create update object
    const allowedFields = [
      "title",
      "description",
      "deadline",
      "completed",
      "priority",
      "remind_at",
    ];
    const update = {};

    // Populate update object with valid fields from request body
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[`reminders.$.${field}`] = req.body[field];
      }
    });

    // Check if any valid fields were provided
    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    // Find and update in one operation using positional $ operator
    const updatedUser = await Reminders.findOneAndUpdate(
      {
        _id: req.user._id,
        "reminders._id": reminderId,
      },
      { $set: update },
      { new: true, runValidators: true } // Return updated doc and validate updates
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Find the specific updated reminder to return
    const updatedReminder = updatedUser.reminders.find(
      (reminder) => reminder._id.toString() === reminderId
    );

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
//3. Delete reminder
export const deleteReminder = async (req, res) => {
  const { reminderId } = req.params;

  try {
    // checks if reminderId is of valid format
    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
      return res.status(400).json({
        message: "Invalid reminder ID format",
      });
    }

    const result = await Reminders.findOneAndUpdate(
      {
        _id: req.user._id,
        "reminders._id": reminderId,
      },
      { $pull: { reminders: { _id: reminderId } } },
      { new: true }
    );

    if (!result) {
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
//4. Get one reminder
export const getOneReminder = async (req, res) => {
  const { reminderId } = req.params;

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
      return res.status(400).json({ message: "Invalid reminder ID format" });
    }

    // Use findOne to fetch the specific reminder
    const result = await Reminders.findOne(
      { _id: req.user._id, "reminders._id": reminderId },
      { "reminders.$": 1 }
    );

    if (!result || result.reminders.length === 0) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.status(200).json({
      message: "Reminder retrieved successfully",
      data: result.reminders[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reminder",
      error: error.message,
    });
  }
};
// i dont understand the code AI gave me for search&filter:( so i havent added that
