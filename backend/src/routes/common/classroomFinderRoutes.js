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
router.get("/:classroomId", getClassroomById);
router.post("/", isAdmin, createBulkClassrooms);

// Booking routes
router.get("/bookings", getAllBookings);
router.post(
  "/:classroomId/bookings",
  canCreateClassroomBookings,
  bookClassroom
);
router.patch("/bookings/:bookingId/approve", approveBooking);
router.patch("/bookings/:bookingId/reject", rejectBooking);
router.delete("/bookings/:bookingId", deleteBooking);

export default router;
