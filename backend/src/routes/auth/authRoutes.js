import express from "express";
import {
  editPassword,
  login,
  logout,
  validateUser,
} from "../../controllers/auth/authController.js";
const router = express.Router();

// Login route
router.post("/login", login); //route for POST login
router.post("/logout", logout);
router.get("/validate", validateUser);
router.patch("/edit-password", editPassword);

export default router;
