import { PushToken } from "../../models/pushTokenModels.js";

//Helper function to get all tokens
export const getUserTokens = async (userId) => {
  return PushToken.find({ user: userId });
};

//Save the user push token for each device
export const SaveUserToken = async (req, res) => {
  const { token, platform } = req.body;
  const userId = req.user._id;
  try {
    // Allow multiple device tokens
    const newToken = await PushToken.create({
      user: userId,
      token,
      platform,
    });

    res.status(200).json({
      success: true,
      message: "Token saved",
      token: newToken,
    });
  } catch (error) {
    // Handle duplicate token error
    if (error.code === 11000) {
      return res.status(409).json({ message: "Token already exists" });
    }
    res.status(500).json({ message: `Error saving token: ${error.message}` });
  }
};

// Delete a token
export const deleteUserToken = async (req, res) => {
  try {
    await PushToken.deleteOne({
      user: req.user._id,
      token: req.body.token,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: `Error deleting token: ${error.message}` });
  }
};
