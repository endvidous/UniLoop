import { User } from "../../models/userModels.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

//Login function
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    if (user.classrep_of) {
      userResponse.classrep_of = user.classrep_of;
    }
    if (user.mentor_of) {
      userResponse.mentor_of = user.mentor_of;
    }
    res.json({
      user: userResponse,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Validate User Function
export const validateUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // Validate authorization header format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid authentication header" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate token payload structure
    if (!decoded?.id || !decoded?.exp) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid token structure" });
    }

    const user = await User.findById(decoded.id).select("-password -__v");

    // Check user existence and status
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Account does not exist" });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpirationTime = decoded.exp;
    const refreshThreshold = process.env.TOKEN_REFRESH_THRESHOLD || 300; // 5 minutes

    const responsePayload = {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: null,
    };

    // Add additional fields if they exist
    if (user.classrep_of) {
      responsePayload.user.classrep_of = user.classrep_of;
    }
    if (user.mentor_of) {
      responsePayload.user.mentor_of = user.mentor_of;
    }

    // Refresh logic
    if (tokenExpirationTime - currentTime < refreshThreshold) {
      const newToken = generateToken(user._id);
      responsePayload.token = newToken;

      // Set new token in headers
      res.setHeader("Authorization", `Bearer ${newToken}`);
    }

    // Add security headers
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    res.setHeader("Content-Security-Policy", "default-src 'self'");

    return res.json(responsePayload);
  } catch (err) {
    // Centralized error logging
    console.error(`Auth Error: ${err.message}`, {
      timestamp: new Date().toISOString(),
      endpoint: req.originalUrl,
    });

    const errorResponse = {
      success: false,
      error: "Authentication failed",
      details:
        err.name === "TokenExpiredError"
          ? "Session expired"
          : "Invalid credentials",
    };

    return res.status(401).json(errorResponse);
  }
};
