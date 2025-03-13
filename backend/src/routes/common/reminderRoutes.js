import express from "express";
import {
  createReminder,
  updateReminder,
  deleteReminder,
  getOneReminder,
  toggleReminderCompletion,
  getReminders,
} from "../../controllers/common/reminderController.js";

const reminderRoutes = express.Router();

// Reminder Operations
reminderRoutes.get("/", getReminders);
reminderRoutes.post("/", createReminder);
reminderRoutes.get("/:reminderId", getOneReminder);
reminderRoutes.patch("/:reminderId", updateReminder);
reminderRoutes.delete("/:reminderId", deleteReminder);
reminderRoutes.patch(
  "/:reminderId/toggle-completion",
  toggleReminderCompletion
);

export default reminderRoutes;
