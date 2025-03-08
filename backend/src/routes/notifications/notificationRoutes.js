import express from "express";
import {
  SaveUserToken,
  deleteUserToken,
} from "../../controllers/notifications/notificationController.js";
const router = express.Router();

router.post("/save-pushtoken", SaveUserToken);
router.post("/remove-pushtoken", deleteUserToken);

export default router;
