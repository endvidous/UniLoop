import express from "express";
import {
  getOneMeeting,
  createMeetingRequest,
  getMeetingRequests,
  updateMeetingRequest,
  deleteMeetingRequest,
  approveMeeting,
  rejectMeeting,
} from "../../controllers/common/meetingController.js";

const router = express.Router();

router.get("/", getMeetingRequests);
router.post("/", createMeetingRequest);
router.get("/:meetingId",getOneMeeting)
router.patch("/:meetingId/approve-meeting", approveMeeting);
router.patch("/:meetingId/reject-meeting", rejectMeeting);
router.patch("/:meetingId", updateMeetingRequest);
router.delete("/:meetingId", deleteMeetingRequest);

export default router;
