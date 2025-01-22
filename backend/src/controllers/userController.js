import { User } from "../models/userModels.js";
import bcrypt from "bcryptjs";

//GET DATA FUNCTIONS
export const getAllUsers = async (_, res) => {
  const users = await User.find();
  res.json(users);
};

//CREATION FUNCTIONS
export const createStudent = async (req, res) => {
  const { name, email, password, role, classrep_of, roll_no } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newStudent = new User({
    name,
    email,
    password: hashedPassword,
    role,
    classrep_of,
    roll_no,
  });
  await newStudent.save();
  res.status(201).json({ message: "Student  registered" });
};

export const createTeacher = async (req, res) => {
  const { name, email, password, role, mentor_of } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newTeacher = new User({
    name,
    email,
    password: hashedPassword,
    role,
    mentor_of,
  });
  await newTeacher.save();
  res.status(201).json({ message: "Teacher  registered" });
};

export const createAdmin = async (req, res) => {
  try {
    if (req.body) {
      const { name, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new User({
        name,
        email,
        password: hashedPassword,
        role,
      });
      await newAdmin.save();
    }
    res.status(201).json({ message: "Admin  registered" });
  } catch (err) {
    res.status(500).json({ message: `Error route ${err}` });
  }
};
