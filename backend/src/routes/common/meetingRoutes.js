import express from "express";
import {
  createMeetingRequest,
  getMeetingRequests,
  updateMeetingRequest,
  deleteMeetingRequest,
} from "../../controllers/common/meetingController.js";

const router = express.Router();

router.get("/:", getMeetingRequests);
router.post("/", createMeetingRequest);
router.patch("/:meetingId", updateMeetingRequest);
router.delete("/:meetingId", deleteMeetingRequest);

export default router;
