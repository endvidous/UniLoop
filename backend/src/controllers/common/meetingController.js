//COMPLETED
import { Meetings } from "../../models/meetingModels.js";
import { User } from "../../models/userModels.js";
import { Reminder } from "../../models/remindersModels.js";

// Get Single Meeting
export const getOneMeeting = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const meeting = await Meetings.findOne({
      _id: meetingId,
      $or: [{ requestedBy: req.user._id }, { requestedTo: req.user._id }],
    })
      .populate("requestedBy", "_id name email role roll_no mentor_of")
      .populate("requestedTo", "_id name email role roll_no mentor_of");

    if (!meeting) {
      return res
        .status(404)
        .json({ message: "Meeting not found or unauthorized" });
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Meetings
export const getMeetingRequests = async (req, res) => {
  try {
    const meetings = await Meetings.find({
      $or: [{ requestedBy: req.user._id }, { requestedTo: req.user._id }],
    })
      .populate("requestedBy", "_id name email role roll_no mentor_of")
      .populate("requestedTo", "_id name email role roll_no mentor_of");

    res.status(200).json({
      message: "Successfully retrieved the meetings",
      meetings: meetings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Meeting Request
export const createMeetingRequest = async (req, res) => {
  const { requestedTo, purpose, timing, venue } = req.body;
  const requestedBy = req.user._id;

  try {
    // Validate required fields
    if (!purpose) {
      return res.status(400).json({ message: "Purpose is required" });
    }

    // Validate recipient existence
    const recipient = await User.findById(requestedTo);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Role-based validation
    if (req.user.isStudent()) {
      if (!recipient.isTeacher()) {
        return res
          .status(403)
          .json({ message: "Students can only request teachers" });
      }
      // Students should not provide timing and venue
      if (timing || venue) {
        return res
          .status(400)
          .json({ message: "Students cannot specify timing or venue" });
      }
    } else if (req.user.isTeacher() || req.user.isAdmin()) {
      if (!recipient.isStudent()) {
        return res
          .status(403)
          .json({ message: "Staff can only request students" });
      }
      if (!timing || !venue) {
        return res.status(400).json({ message: "Timing and venue required" });
      }
    }

    // Check for existing meeting
    const existingMeeting = await Meetings.findOne({
      requestedBy,
      requestedTo,
      purpose,
      ...(req.user.isTeacher() || req.user.isAdmin() ? { timing, venue } : {}), //Include timing and venue only if teacher or admin.
    });

    if (existingMeeting) {
      return res.status(400).json({
        message: "Meeting with these details already exists",
      });
    }

    const meeting = await Meetings.create({
      requestedBy,
      requestedTo,
      purpose,
      ...(req.user.isTeacher() || req.user.isAdmin() ? { timing, venue } : {}), //Include timing and venue only if teacher or admin.
      status: "pending",
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ message: `Creation failed: ${error.message}` });
  }
};

// Updated Update Meeting Request (no status handling)
export const updateMeetingRequest = async (req, res) => {
  const { meetingId } = req.params;

  try {
    console.log("Update meetins dat",req.body) //Does this exist for you?
    const meeting = await Meetings.findOne({
      _id: meetingId,
      $or: [{ requestedBy: req.user._id }, { requestedTo: req.user._id }],
    })
      .populate("requestedBy", "role")
      .populate("requestedTo", "role");

    if (!meeting) {
      return res
        .status(404)
        .json({ message: "Meeting not found or unauthorized" });
    }

    // Prevent updates on rejected meetings
    if (meeting.status === "rejected") {
      return res
        .status(400)
        .json({ message: "Cannot update rejected meeting" });
    }

    // Role-based updates
    if (req.user.isStudent()) {
      // Students can only update purpose of their pending requests
      if (!meeting.requestedBy.equals(req.user._id)) {
        return res.status(403).json({ message: "Cannot update this meeting" });
      }
      if (meeting.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Can only update pending requests" });
      }
      if (req.body.purpose) meeting.purpose = req.body.purpose;
    } else {
      // Staff can update their own requests (purpose, timing, venue)
      if (meeting.requestedBy.equals(req.user._id)) {
        if (req.body.purpose) meeting.purpose = req.body.purpose;
        if (req.body.timing) meeting.timing = req.body.timing;
        if (req.body.venue) meeting.venue = req.body.venue;
      }
    }

    // Update reminders if timing/venue changed
    if (meeting.isModified(["timing", "venue"])) {
      const student =
        meeting.requestedBy.role === "student"
          ? meeting.requestedBy
          : meeting.requestedTo.role === "student"
          ? meeting.requestedTo
          : null;

      if (student) {
        const reminderData = createReminderData(meeting);
        await updateOrCreateReminder(student._id, meeting._id, reminderData);
      }
    }

    await meeting.save();
    res.status(200).json({ success: true, meeting: meeting });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve Meeting
export const approveMeeting = async (req, res) => {
  const { meetingId } = req.params;
  const { timing, venue } = req.body;

  try {
    const meeting = await Meetings.findOne({
      _id: meetingId,
      requestedTo: req.user._id,
      status: "pending",
    })
      .populate("requestedBy", "role")
      .populate("requestedTo", "role");

    if (!meeting) {
      return res
        .status(404)
        .json({ message: "Meeting not found or unauthorized" });
    }

    // // Authorization: Only staff can approve
    // if (!req.user.isTeacher() && !req.user.isAdmin()) {
    //   return res
    //     .status(403)
    //     .json({ message: "Only staff can approve meetings" });
    // }

    // Validation: Require timing/venue for student requests
    if (meeting.requestedBy.role === "student") {
      if (!timing || !venue) {
        return res.status(400).json({ message: "Timing and venue required" });
      }
      meeting.timing = timing;
      meeting.venue = venue;
    }

    // Update meeting status
    meeting.status = "approved";
    await meeting.save();

    // Create/Update reminder
    const student =
      meeting.requestedBy.role === "student"
        ? meeting.requestedBy
        : meeting.requestedTo.role === "student"
        ? meeting.requestedTo
        : null;

    if (student) {
      const reminderData = createReminderData(meeting);
      await updateOrCreateReminder(student._id, meeting._id, reminderData);
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Reject Meeting
export const rejectMeeting = async (req, res) => {
  const { meetingId } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    return res.status(400).json({ message: "Rejection reason required" });
  }

  try {
    const meeting = await Meetings.findOne({
      _id: meetingId,
      requestedTo: req.user._id,
      status: "pending",
    })
      .populate("requestedBy", "role")
      .populate("requestedTo", "role");

    if (!meeting) {
      return res
        .status(404)
        .json({ message: "Meeting not found or unauthorized" });
    }

    // Update meeting status
    meeting.status = "rejected";
    meeting.rejectionReason = rejectionReason;
    await meeting.save();

    // Create rejection reminder for student requester
    if (meeting.requestedBy.role === "student") {
      const rejectionReminder = createRejectionReminder(meeting);

      await Reminder.create({
        userId: meeting.requestedBy._id,
        ...rejectionReminder,
      });
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Meeting
export const deleteMeetingRequest = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const meeting = await Meetings.findOne({
      _id: meetingId,
      requestedBy: req.user._id,
    });

    if (!meeting) {
      return res
        .status(404)
        .json({ message: "Meeting not found or unauthorized" });
    }

    await meeting.remove();
    res.status(200).json({ message: "Meeting deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//HELPER FUNCTIONS FOR REMINDERS
const updateOrCreateReminder = async (userId, meetingId, reminderData) => {
  const existing = await Reminder.findOne({
    userId,
    description: { $regex: `\\[Meeting ID: ${meetingId}\\]` },
  });

  if (existing) {
    // Update the existing reminder
    await Reminder.updateOne({ _id: existing._id }, { $set: reminderData });
  } else {
    // Create a new reminder
    await Reminder.create({ userId, ...reminderData });
  }
};

const createReminderData = (meeting) => ({
  title: `Upcoming Meeting: ${meeting.purpose}`,
  description: `[Meeting ID: ${meeting._id}] Venue: ${
    meeting.venue
  }\nTime: ${meeting.timing.toLocaleString()}`,
  deadline: meeting.timing,
  priority: 2,
  remind_at: [
    {
      date_time: new Date(meeting.timing.getTime() - 3600000),
      notified: false,
    },
  ],
});

const createRejectionReminder = (meeting) => ({
  title: `Meeting Request Rejected`,
  description: `[Meeting ID: ${meeting._id}] Your request for "${meeting.purpose}" was rejected. Reason: ${meeting.rejectionReason}`,
  deadline: new Date(),
  priority: 1,
  completed: true,
});
