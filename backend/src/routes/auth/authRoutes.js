import express from "express";
import { login, validateUser } from "../../controllers/auth/authController.js";
const router = express.Router();

// Login route
router.post("/login", login); //route for POST login
router.get("/validate", validateUser);

export default router;
