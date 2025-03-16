import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  announcementFilterValidator,
  canCreateAnnouncement,
  getOneAnnouncement,
} from "../../controllers/common/announcementsController.js";

const router = express.Router();

//Announcements routes
router.get("/", announcementFilterValidator, getAnnouncements);
router.get("/:announcementId", getOneAnnouncement);
router.post("/", canCreateAnnouncement, createAnnouncement);
router.patch("/:announcementId", updateAnnouncement);
router.delete("/:announcementId", deleteAnnouncement);

export default router;
