//COMPLETED
import { Meetings } from "../../models/meetingModels.js";
import { User } from "../../models/userModels.js";
import { Reminders } from "../../models/remindersModels.js";

// Get Single Meeting
export const getMeeting = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const meeting = await Meetings.findOne({
      _id: meetingId,
      $or: [{ requestedBy: req.user._id }, { requestedTo: req.user._id }],
    })
      .populate("requestedBy", "name email role")
      .populate("requestedTo", "name email role");

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
      .populate("requestedBy", "name email role")
      .populate("requestedTo", "name email role");

    res.status(200).json(meetings);
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

    const meeting = await Meetings.create({
      requestedBy,
      requestedTo,
      purpose,
      ...(req.user.isTeacher() || req.user.isAdmin() ? { timing, venue } : {}),
      status: "pending",
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ message: `Creation failed: ${error.message}` });
  }
};

// Update Meeting
export const updateMeetingRequest = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const meeting = await Meetings.findOne({
      _id: meetingId,
      $or: [{ requestedBy: req.user._id }, { requestedTo: req.user._id }],
    });

    if (!meeting)
      return res
        .status(404)
        .json({ message: "Meeting not found or unauthorized" });

    const [requester, recipient] = await Promise.all([
      User.findById(meeting.requestedBy),
      User.findById(meeting.requestedTo),
    ]);

    if (!requester || !recipient)
      return res.status(404).json({ message: "Invalid participants" });

    const student = requester.isStudent()
      ? requester
      : recipient.isStudent()
      ? recipient
      : null;
    const isRequester = meeting.requestedBy.equals(req.user._id);
    const isRecipient = meeting.requestedTo.equals(req.user._id);

    // Handle role-based updates
    const handleStudentUpdates = () => {
      if (!isRequester && !isRecipient) return;
      if (isRequester && meeting.status !== "pending") {
        throw new Error("Can only update pending requests");
      }
      if (req.body.purpose) meeting.purpose = req.body.purpose;
      if (isRecipient && req.body.status === "rejected") {
        if (!req.body.rejectionReason)
          throw new Error("Rejection reason required");
        meeting.status = "rejected";
        meeting.rejectionReason = req.body.rejectionReason;
      }
    };

    const handleStaffUpdates = () => {
      if (isRequester) {
        if (req.body.purpose) meeting.purpose = req.body.purpose;
        if (req.body.timing) meeting.timing = req.body.timing;
        if (req.body.venue) meeting.venue = req.body.venue;
      }
      if (isRecipient && req.body.status) {
        if (req.body.status === "rejected" && !req.body.rejectionReason) {
          throw new Error("Rejection reason required");
        }
        meeting.status = req.body.status;
        meeting.rejectionReason = req.body.rejectionReason;
      }
    };

    req.user.isStudent() ? handleStudentUpdates() : handleStaffUpdates();

    // Handle reminders
    const updateExistingReminder = async () => {
      await Reminders.updateOne(
        {
          _id: student._id,
          "reminders.description": {
            $regex: `\\[Meeting ID: ${meeting._id}\\]`,
          },
        },
        { $set: { "reminders.$": createReminderData(meeting) } }
      );
    };

    const createNewReminder = async () => {
      await Reminders.findOneAndUpdate(
        { _id: student._id },
        { $push: { reminders: createReminderData(meeting) } },
        { upsert: true, new: true }
      );
    };

    if (student) {
      if (meeting.isModified(["timing", "venue"])) {
        await updateExistingReminder();
      }

      if (req.body.status === "approved") {
        const existingReminder = await Reminders.findOne({
          _id: student._id,
          "reminders.description": {
            $regex: `\\[Meeting ID: ${meeting._id}\\]`,
          },
        });
        existingReminder
          ? await updateExistingReminder()
          : await createNewReminder();
      }

      if (req.body.status === "rejected" && requester.isStudent()) {
        await Reminders.findOneAndUpdate(
          { _id: student._id },
          {
            $push: {
              reminders: createRejectionReminder(meeting),
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    await meeting.save();
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
