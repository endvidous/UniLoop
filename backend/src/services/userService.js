import { User } from "../models/userModels.js";
import { checkEmailExists } from "../utils/helpers.js";
import bcrypt from "bcryptjs";

export const createStudentRecord = async (studentData) => {
  const { name, email, password, role, roll_no } = studentData;

  await checkEmailExists(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  const newStudent = new User({
    name,
    email,
    password: hashedPassword,
    role,
    roll_no,
  });

  await newStudent.save();
  return newStudent;
};

export const createTeacherRecord = async (teacherData) => {
  const { name, email, password, role } = teacherData;

  await checkEmailExists(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  const newTeacher = new User({
    name,
    email,
    password: hashedPassword,
    role,
  });

  await newTeacher.save();
  return newTeacher;
};
