import express from "express";
import { getUserAssociations } from "../../controllers/common/associationsController.js";

const router = express.Router();

router.get("/", getUserAssociations);

export default router;
