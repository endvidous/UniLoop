import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  announcementFilterValidator,
  canCreateAnnouncement,
} from "../../controllers/common/announcementsController.js";

const router = express.Router();

//Announcements routes
router.get("/", announcementFilterValidator, getAnnouncements);
router.post("/", canCreateAnnouncement, createAnnouncement);
router.patch("/:announcementId", updateAnnouncement);
router.delete("/:announcementId", deleteAnnouncement);

export default router;
