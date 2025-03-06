import express from "express";
import { SaveUserToken } from "../../controllers/notifications/notificationController.js";
const router = express.Router();

router.post("/save-pushtoken", SaveUserToken);

export default router;
