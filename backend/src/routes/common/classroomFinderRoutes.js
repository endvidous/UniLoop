import express from "express";
import {
  createBulkClassrooms,
  approveBooking,
  bookClassroom,
  canCreateClassroomBookings,
  getAllClassrooms,
  getClassroomById,
  rejectBooking,
  deleteBooking,
  getAllBookings,
} from "../../controllers/common/classfinderController.js";
import { isAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();
// Classroom routes
router.get("/", getAllClassrooms);
router.post("/", isAdmin, createBulkClassrooms);

router.get("/bookings", getAllBookings);
router.post("/bookings", canCreateClassroomBookings, bookClassroom);

router.get("/:classroomId", getClassroomById);

router.patch("/bookings/:bookingId/approve", approveBooking);
router.patch("/bookings/:bookingId/reject", rejectBooking);
router.delete("/bookings/:bookingId", deleteBooking);

export default router;
