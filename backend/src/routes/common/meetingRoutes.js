import express from "express";
import {
    canCreateMeetingRequest,
    createMeetingRequest,
    getMeetingRequests,
    updateMeetingRequest,
    updateMeetingStatus,
    deleteMeetingRequest,

} from "../../controllers/common/meetingController.js";

const router = express.Router();

//Announcements routes
router.get("/:meetingId", getMeetingRequests);
router.post("/", canCreateMeetingRequest, createMeetingRequest);
router.patch("/:meetingId", updateMeetingRequest);
router.patch("/:meetingId", updateMeetingStatus);
router.delete("/:meetingId", deleteMeetingRequest);

export default router;
