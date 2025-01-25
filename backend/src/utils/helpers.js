import { User } from "../models/userModels.js";

export const checkEmailExists = async (email) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }
};

export const checkIfEmpty = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error("Dataset cannot be empty");
  }
};
