import { Announcements } from "../../models/announcementsModels.js";
import {
  buildAnnouncementQuery,
  validateAnnouncementPosting,
} from "../../services/announcementService.js";
import { Batches } from "../../models/courseModels.js";
import mongoose from "mongoose";

//Announcement middleware to check creation permissions
export const canCreateAnnouncement = async (req, res, next) => {
  try {
    if (req.user.isAdmin() || req.user.isTeacher()) return next();

    if (req.user.isStudent() && req.user.classrep_of) {
      // Verify class rep has a valid batch
      const batch = await Batches.findOne({
        _id: req.user.classrep_of,
        students: req.user._id,
      });

      if (batch) return next();
    }

    res.status(403).json({ message: "Not authorized to create announcements" });
  } catch {
    res.status(500).json({ message: "Server error during authorization" });
  }
};

export const announcementFilterValidator = (req, res, next) => {
  const validFilters = [
    "department",
    "course",
    "batch",
    "search",
    "priority",
    "sort",
    "page",
    "limit",
    "visibilityType",
  ];
  const validSorts = ["newest", "priority", "urgent"];

  const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

  if (req.query.department && !validateObjectId(req.query.department)) {
    return res.status(400).json({ message: "Invalid department ID" });
  }

  if (req.query.batch && !validateObjectId(req.query.batch)) {
    return res.status(400).json({ message: "Invalid Batch ID" });
  }

  if (req.query.course && !validateObjectId(req.query.course)) {
    return res.status(400).json({ message: "Invalid Course ID" });
  }

  // Check for invalid parameters
  const invalidParams = Object.keys(req.query).filter(
    (param) => !validFilters.includes(param)
  );

  if (invalidParams.length > 0) {
    return res.status(400).json({
      message: `Invalid filter parameters: ${invalidParams.join(", ")}`,
    });
  }

  // Validate sort value
  if (req.query.sort && !validSorts.includes(req.query.sort)) {
    return res.status(400).json({
      message: `Invalid sort parameter. Valid options: ${validSorts.join(
        ", "
      )}`,
    });
  }

  next();
};

//Announcement controllers
export const getOneAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    // Find the announcement and populate necessary fields
    const announcement = await Announcements.findById(announcementId)
      .populate("postedBy", "name role")
      .populate("posted_to.id", "name code")
      .lean();

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json(announcement);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving announcement", error: err.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const sortOptions = {
      newest: "-createdAt",
      priority: { priority: -1 },
      urgent: { priority: -1, createdAt: -1 },
    };
    console.log(req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const baseQuery = await buildAnnouncementQuery(req.user);
    const filters = {
      priority: req.query.priority,
      department: req.query.department,
      course: req.query.course,
      batch: req.query.batch,
      search: req.query.search,
      visibilityType: req.query.visibilityType,
    };

    const finalQuery = {
      ...baseQuery,
      ...(filters.visibilityType && { visibilityType: filters.visibilityType }),
      ...(filters.priority && { priority: { $in: filters.priority } }),
      ...(filters.department && { "posted_to.id": filters.department }),
      ...(filters.batch && { "posted_to.id": filters.batch }),
      ...(filters.course && { "posted_to.id": filters.course }),
      ...(filters.search && { $text: { $search: filters.search } }),
    };

    const sortBy = filters.search
      ? { score: { $meta: "textScore" } }
      : sortOptions[req.query.sort] || "-createdAt";

    const projection = {
      title: 1,
      priority: 1,
      createdAt: 1,
    };

    const [announcements, total] = await Promise.all([
      Announcements.find(finalQuery, projection)
        .populate("postedBy", "name role") // Fixed collision issue
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcements.countDocuments(finalQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      announcements,
      total,
      page,
      totalPages,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving announcements", error: err.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { visibilityType, posted_to, attachments, ...rest } = req.body;
    const user = req.user;

    // Validate attachments if present
    if (attachments && !Array.isArray(attachments)) {
      return res.status(400).json({
        message: "Attachments must be an array",
      });
    }

    // Base announcement data
    const announcementData = {
      ...rest,
      postedBy: user._id,
      visibilityType,
      posted_to,
      attachments: attachments || [],
    };

    // For non-General announcements, explicitly cast posted_to.id to ObjectId
    if (visibilityType !== "General" && posted_to && posted_to.id) {
      announcementData.posted_to = {
        model: posted_to.model,
        id: new mongoose.Types.ObjectId(`${posted_to.id}`),
      };
    }

    if (!visibilityType) {
      return res.status(400).json({ message: "Visibility type is required" });
    }

    // Handle class rep restrictions
    if (user.isStudent()) {
      if (visibilityType !== "Batch") {
        return res
          .status(400)
          .json({ message: "Class reps can only create batch announcements" });
      }

      const batch = await Batches.findOne({
        _id: user.classrep_of,
        students: user._id,
      });

      if (!batch) {
        return res
          .status(403)
          .json({ message: "Class rep has no valid batch" });
      }

      announcementData.posted_to = {
        model: "Batches",
        id: batch._id,
      };
    }

    // Validate teacher permissions
    if (user.isTeacher()) {
      const isValid = await validateAnnouncementPosting(user, announcementData);
      if (!isValid) {
        return res
          .status(403)
          .json({ message: "Invalid target for announcement" });
      }
    }

    const announcement = await Announcements.create(announcementData);
    res.status(201).json(announcement);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  const { announcementId } = req.params;
  const updates = req.body;
  try {
    const announcement = await Announcements.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Authorization check
    const isCreator = announcement.postedBy.equals(req.user._id);
    if (!isCreator) {
      return res.status(403).json({
        message: "Only the creator can update this announcement",
      });
    }

    // Class rep specific validations
    if (req.user.isStudent()) {
      // Ensure classrep_of matches the announcement's batch
      if (!announcement.posted_to.id.equals(req.user.classrep_of)) {
        return res.status(403).json({
          message: "Can only update announcements for your own batch",
        });
      }

      // Prevent changing announcement type from Batch
      if (updates.visibilityType && updates.visibilityType !== "Batch") {
        return res.status(403).json({
          message: "Cannot change announcement type from Batch",
        });
      }
    }

    // Validate teacher permissions if modifying target
    if (req.user.isTeacher() && (updates.posted_to || updates.visibilityType)) {
      const updatedData = { ...announcement.toObject(), ...updates };
      const isValid = await validateAnnouncementPosting(req.user, updatedData);
      if (!isValid) {
        return res.status(403).json({
          message: "Invalid update for announcement target",
        });
      }
    }

    const updatedAnnouncement = await Announcements.findByIdAndUpdate(
      announcementId,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  const { announcementId } = req.params;
  try {
    const announcement = await Announcements.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Authorization check
    const isCreator = announcement.postedBy.equals(req.user._id);

    if (!isCreator && !req.user.isAdmin()) {
      return res.status(403).json({
        message: "Not authorized to delete this announcement",
      });
    }

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
