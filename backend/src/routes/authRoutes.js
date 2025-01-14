import express from "express"
import {register, login} from "../controllers/authControllers.js"
const router = express.Router();

// Register route
router.post('/register', register);//route for POST register

// Login route
router.post('/login', login);//route for POST login

export default router;