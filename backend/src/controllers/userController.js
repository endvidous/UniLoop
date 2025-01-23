import { User } from "../models/userModels.js";
import bcrypt from "bcryptjs";

//HELPER FUNCTIONS
const checkEmailExists = async (email) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }
};

//GET DATA FUNCTIONS
export const getAllUsers = async (_, res) => {
  const users = await User.find();
  res.json(users);
};

//CREATE USER FUNCTIONS
export const createStudent = async (req, res) => {
  try {
    const { name, email, password, role, classrep_of, roll_no } = req.body;

    await checkEmailExists(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new User({
      name,
      email,
      password: hashedPassword,
      role: "student",
      classrep_of,
      roll_no,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    // Handle duplicate email (MongoDB error code 11000)
    if (err.message.includes("already exists") || err.code === 11000) {
      res.status(400).json({ message: "User with this email already exists." });
    } else {
      res.status(500).json({
        message: "Error creating student",
        error: err.message,
      });
    }
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { name, email, password, role, mentor_of } = req.body;

    // Check for existing email
    await checkEmailExists(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new User({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
      mentor_of,
    });

    await newTeacher.save();
    res.status(201).json({ message: "Teacher registered successfully" });
  } catch (err) {
    if (err.message.includes("already exists") || err.code === 11000) {
      res.status(400).json({ message: "User with this email already exists." });
    } else {
      res.status(500).json({
        message: "Error creating teacher",
        error: err.message,
      });
    }
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for existing email
    await checkEmailExists(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin", // Enforce role
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    if (err.message.includes("already exists") || err.code === 11000) {
      res.status(400).json({ message: "User with this email already exists." });
    } else {
      res.status(500).json({
        message: "Error creating admin",
        error: err.message,
      });
    }
  }
};
