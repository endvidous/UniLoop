import User from "../models/userModels.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Validate User Function
export const validateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // Fetch user without password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if the token is about to expire (e.g., within the next 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const tokenExpirationTime = decoded.exp; // Expiration time from the token
// If the token is about to expire in the next 5 minutes (300 seconds)
if (tokenExpirationTime - currentTime < 300) {
  const newToken = generateToken(user._id); // Generate a new token
  res.json({
    success: true,
    user,
    token: newToken, // Return the new token
  });
} else {
  res.json({
    success: true,
    user,
  });
}
  
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};
