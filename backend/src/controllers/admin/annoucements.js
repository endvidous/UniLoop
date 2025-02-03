import { Annoucements } from "../../models/annoucementsModels";

export const getAnnouncements = async (req, res) => {
  try {
    // Validation

    const allowedSortFields = ["created_at", "priority", "expiresAt", "title"];
    const sortBy = req.query.sortBy || "created_at";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        message: "Invalid sort field",
        allowedFields: allowedSortFields,
      });
    }

    // Query with sorting and population
    const announcements = await Annoucements.find({})
      .sort({ [sortBy]: sortOrder })
      .populate("postedBy", "-password -email -__v")
      .populate("posted_to.id","-teachers -students -")
      .exec();

    res.status(200).json(announcements);
  } catch (err) {
    res.status(500).json({
      message: "Error getting announcements",
      error: err.message,
    });
  }
};
