import { Meetings } from "../models/meetingModel.js";
import { User } from "../models/userModel.js";
import {Batches} from "../models/courseModel.js";
//import { Reminders } from "../models/reminderModel.js"; for later 

 
  // 1. Create Meeting Request
  export const createMeetingRequest = async (req, res) => {
    const { requestedTo, reason, agenda, timing, venue } = req.body;
    const requestedBy = req.user._id; // Assuming req.user contains the authenticated user
  
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "User  is not authenticated." });
    }
  
    try {
      // Determine user roles
      const userRole = req.user.role; // Assuming req.user.role contains the user's role
      const requestedToRole = await User.findById(requestedTo).select('role'); // Fetch the role of the user being requested to
  
      // Validate required fields based on user role
      if (req.user.isStudent()) {
        if (!agenda) {
          return res.status(400).json({ message: "Meeting Agenda is required." });
        }
      }
  
      if (userRole === 'teacher' || (userRole === 'admin')) {

          return res.status(400).json({ message: "Timing and venue are required." });
      }
  
      // Create meeting data
      const meetingData = {
        requestedBy,
        requestedTo,
        reason,
        agenda: userRole == agenda,
        timing,
        venue,
      };
  
      // Create the meeting
      const meeting = await Meetings.create(meetingData);
      res.status(201).json(meeting);
    } catch (error) {
      res.status(400).json({ message: `Error creating meeting request: ${error.message}` });
    }
  };
  
  // 2. Get Meeting Requests
  export const getMeetingRequests = async (req, res) => {
    const userId = req.user._id;
  
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "User  is not authenticated." });
    }
  
    try {
      const meetings = await Meetings.find({
        $or: [
          { requestedBy: userId }, // Meetings requested by the user
          { requestedTo: userId }, // Meetings where the user is the requested person
        ],
      }).lean();
  
      res.status(200).json(meetings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };//add search&filter work with frontend
  
  // 3. Update Meeting Request
  export const updateMeetingRequest = async (req, res) => {
    const { meetingId } = req.params;
    const updates = req.body;
  
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "User  is not authenticated." });
    }
  
    try {
      const meeting = await Meetings.findById(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
  
      // Authorization check: Only the requester can update the meeting
      if (!meeting.requestedBy.equals(req.user._id)) {
        return res.status(403).json({ message: "Not authorized to update this meeting" });
      } 
  
      // Update the meeting
      const updatedMeeting = await Meetings.findByIdAndUpdate(meetingId, updates, { new: true, runValidators: true });
      res.status(200).json(updatedMeeting);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

// 4. Update Meeting Status
export const updateMeetingStatus = async (req, res) => {
  const { meetingId } = req.params;
  const { status, rejectionReason } = req.body;

  // Check if the user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: "User  is not authenticated." });
  }

  try {
    const meeting = await Meetings.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if the status is valid
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // If rejected by student or class rep, require a rejection reason
    if (status === 'rejected' && (req.user.role === 'student') && !rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required." });
    }

    // Update the meeting status
    meeting.status = status;
    if (status === 'rejected') {
      meeting.rejectionReason = rejectionReason;
    }

    // If the meeting is approved, add a reminder
    if (status === "approved") {
        await Reminders.create({
          userId: meeting.requestedBy,
          title: "Meeting Approved",
          //description: `Meeting with ${meeting.requestedToRole} on ${meeting.timing}`,
          dueDate: meeting.timing,
        });
      }
  

    // Save the updated meeting
    await meeting.save();

    // If the meeting is still pending, check for notifications
    if (status === 'pending') {
      const currentTime = new Date();
      const deadline = new Date(meeting.timing); // Assuming timing is the deadline

      // Check if the meeting is nearing its deadline (e.g., within 24 hours)
      const timeDifference = deadline - currentTime;
      if (timeDifference <= 24 * 60 * 60 * 1000) { // 24 hours
        //sendNotification(meeting.requestedBy, `You have a pending meeting request: ${meeting.reason}`);
      }
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 
  // 5. Delete Meeting Request
  export const deleteMeetingRequest = async (req, res) => {
    const { meetingId } = req.params;
  
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "User   is not authenticated." });
    }
  
    try {
      const meeting = await Meetings.findById(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
  
      // Authorization check: Only the requester can delete the meeting
      if (!meeting.requestedBy.equals(req.user._id)) {
        return res.status(403).json({ message: "Not authorized to delete this meeting" });
      }
  
      await Meetings.findByIdAndDelete(meetingId);
      res.status(200).json({ message: "Meeting deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  // 6.Function to send notifications
//const sendNotification = (userId, message) => {
  // Logic to send notification to the user