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
export const searchAndFilterReminders = async (req, res) => {
  try {
    const sortOptions = {
      newest: { "reminders.created_at": -1 }, // Sort by latest
      priority: { "reminders.priority": -1 }, // High priority first
      deadline: { "reminders.deadline": 1 }, // Closest deadline first
    };

    const filters = {
      search: req.query.search, // Search term for title
      priority: req.query.priority, // Priority level (0,1,2)
      completed: req.query.completed, // Completed status (true/false)
      remind_at: req.query.remind_at, // Specific reminder time
    };

    // Base query: Only search within the logged-in user’s reminders
    const matchQuery = { _id: req.user._id };

    // If any filters exist, apply them
    if (
      filters.search ||
      filters.priority ||
      filters.completed !== undefined ||
      filters.remind_at
    ) {
      matchQuery.reminders = { $elemMatch: {} };

      if (filters.search) {
        matchQuery.reminders.$elemMatch.title = {
          $regex: filters.search,
          $options: "i", // Case-insensitive search
        };
      }

      if (filters.priority !== undefined) {
        matchQuery.reminders.$elemMatch.priority = Number(filters.priority);
      }

      if (filters.completed !== undefined) {
        matchQuery.reminders.$elemMatch.completed =
          filters.completed === "true";
      }

      if (filters.remind_at) {
        matchQuery.reminders.$elemMatch.remind_at = new Date(filters.remind_at);
      }
    }

    const sortBy = sortOptions[req.query.sort] || {
      "reminders.created_at": -1,
    };

    // Fetch reminders matching filters
    const result = await Reminders.findOne(matchQuery, { "reminders.$": 1 })
      .sort(sortBy)
      .lean();

    if (!result || !result.reminders.length) {
      return res.status(404).json({ message: "No matching reminders found" });
    }

    res.json({
      reminders: result.reminders,
      total: result.reminders.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reminders",
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
export const getAllReminders = async (req, res) => {
  try {
    const userReminders = await Reminders.findOne({ _id: req.user._id })
      .select("reminders") // Only fetches the 'reminders' field
      .sort({ "reminders.created_at": -1 }) // Sort by newest reminder first
      .lean(); // Converts MongoDB document to a plain JavaScript object

    if (!userReminders || userReminders.reminders.length === 0) {
      return res.status(404).json({ message: "No reminders found" });
    }

    res.json({
      reminders: userReminders.reminders, // Returns all reminders
      total: userReminders.reminders.length, // Returns count
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reminders",
      error: error.message,
    });
  }
};
