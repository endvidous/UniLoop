import User from "../models/userModels.js";

// Example: Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

// Example: Delete