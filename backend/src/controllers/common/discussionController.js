//FUNCTIONS TO BE ADDED: updateComments
import { Discussion } from "../../models/discussionModels.js";
import { PushToken } from "../../models/pushTokenModels.js";
import {
  buildDiscussionQuery,
  validateDiscussionPosting,
} from "../../services/discussionService.js";
import mongoose from "mongoose";
import { sendBulkNotifications } from "../../utils/Notifications.js";

//Middleware
export const discussionFilterValidator = (req, res, next) => {
  const validFilters = [
    "department",
    "course",
    "batch",
    "visibilityType",
    "search",
    "sort",
    "page",
    "limit",
  ];
  const validSorts = ["newest", "popular", "controversial"];

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

// Helpers
const getSortOption = (sort, hasSearch) => {
  if (hasSearch) return { score: { $meta: "textScore" } };

  const sortOptions = {
    newest: { createdAt: -1 },
    popular: { upvotesCount: -1 }, // sort by the count of upvotes
    controversial: { downvotesCount: -1 }, // sort by the count of downvotes
  };

  return sortOptions[sort] || { createdAt: -1 };
};

//Discussion Controllers
export const getOneDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId)
      .populate("postedBy", "name role")
      .populate("posted_to.id", "name code")
      .populate({
        path: "comments.postedBy",
        select: "name role",
      })
      .lean();

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.json(discussion);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving discussion", error: error.message });
  }
};

export const getDiscussions = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const baseQuery = await buildDiscussionQuery(req.user);
    const filters = {
      department: req.query.department,
      course: req.query.course,
      batch: req.query.batch,
      search: req.query.search,
      visibilityType: req.query.visibilityType,
    };

    const finalQuery = {
      ...baseQuery,
      ...(filters.visibilityType && { visibilityType: filters.visibilityType }),
      ...(filters.department && { "posted_to.id": filters.department }),
      ...(filters.batch && { "posted_to.id": filters.batch }),
      ...(filters.course && { "posted_to.id": filters.course }),
      ...(filters.search && { $text: { $search: filters.search } }),
    };

    // Only include the necessary fields for list view
    const projection = {
      title: 1,
      description: 1,
      postedBy: 1,
      visibilityType: 1,
      posted_to: 1,
      upvotes: 1,
      downvotes: 1,
      upvotesCount: 1,
      downvotesCount: 1,
      isClosed: 1,
    };

    const [discussions, total] = await Promise.all([
      Discussion.find(finalQuery, projection)
        .populate("postedBy", "name role")
        .populate("posted_to.id", "name code")
        .sort(getSortOption(sort, search))
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Discussion.countDocuments(finalQuery),
    ]);

    res.status(200).json({
      discussions,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const { visibilityType, posted_to } = req.body;
    const user = req.user;

    const isValid = await validateDiscussionPosting(user, req.body);

    if (!isValid) {
      return res.status(403).json({ message: "Invalid posting target" });
    }

    const discussionData = {
      ...req.body,
      postedBy: user._id,
      ...(visibilityType !== "General" && {
        posted_to: {
          model: posted_to.model,
          id: new mongoose.Types.ObjectId(`${posted_to.id}`),
        },
      }),
    };

    const discussion = await Discussion.create(discussionData);
    res
      .status(201)
      .json({ message: "Discussion created successfully", data: discussion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const user = req.user;

    // Only allow title and description to be updated
    const allowedUpdates = ["title", "description"];
    const updates = {};

    // Filter the incoming updates to only include allowed fields
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    if (!discussion.postedBy.equals(user._id)) {
      return res
        .status(403)
        .json({ message: "Only author can update discussions" });
    }

    // If a visibility change is requested, validate it accordingly.
    if (req.body.visibilityType && !user.isAdmin()) {
      const valid = await validateDiscussionPosting(user, {
        ...discussion.toObject(),
        ...updates,
      });
      if (!valid) {
        return res.status(403).json({ message: "Invalid visibility change" });
      }
    }

    // Prevent updating isClosed regardless of what is in req.body.
    if ("isClosed" in updates) {
      delete updates.isClosed;
    }

    // Perform the update with only the filtered fields
    const updatedDiscussion = await Discussion.findByIdAndUpdate(
      discussionId,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    if (!discussion.postedBy.equals(req.user._id) && !req.user.isAdmin()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await discussion.deleteOne();
    res.json({ message: "Discussion deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reportDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { reason } = req.body;

    const updated = await Discussion.findOneAndUpdate(
      {
        _id: discussionId,
        "reports.reportedBy": { $ne: req.user._id }, // Prevent duplicate
      },
      {
        $push: {
          reports: {
            reportedBy: req.user._id,
            reason,
            createdAt: Date.now(),
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ message: "Already reported" });
    }

    res.json({ message: "Report registered", discussion: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upvoteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    let updated;
    if (discussion.upvotes.includes(userId)) {
      // Toggle off: remove upvote and decrement count
      updated = await Discussion.findByIdAndUpdate(
        discussionId,
        {
          $pull: { upvotes: userId },
          $inc: { upvotesCount: -1 },
        },
        { new: true }
      );
    } else {
      // Toggle on: add upvote and increment count
      let updateQuery = {
        $addToSet: { upvotes: userId },
        $inc: { upvotesCount: 1 },
      };

      // If a downvote exists, remove it and decrement downvotesCount
      if (discussion.downvotes.includes(userId)) {
        updateQuery.$pull = { downvotes: userId };
        updateQuery.$inc.downvotesCount = -1;
      }

      updated = await Discussion.findByIdAndUpdate(discussionId, updateQuery, {
        new: true,
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const downvoteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    let updated;
    if (discussion.downvotes.includes(userId)) {
      // Toggle off: remove downvote and decrement count
      updated = await Discussion.findByIdAndUpdate(
        discussionId,
        {
          $pull: { downvotes: userId },
          $inc: { downvotesCount: -1 },
        },
        { new: true }
      );
    } else {
      // Toggle on: add downvote and increment count
      let updateQuery = {
        $addToSet: { downvotes: userId },
        $inc: { downvotesCount: 1 },
      };

      // If an upvote exists, remove it and decrement upvotesCount
      if (discussion.upvotes.includes(userId)) {
        updateQuery.$pull = { upvotes: userId };
        updateQuery.$inc.upvotesCount = -1;
      }

      updated = await Discussion.findByIdAndUpdate(discussionId, updateQuery, {
        new: true,
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Mark answer
export const markAnswer = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;

    // Fetch the discussion
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Check if user is an admin or teacher
    const isAuthorized = req.user.isAdmin || req.user.isTeacher;
    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update comment and close discussion
    const updated = await Discussion.findOneAndUpdate(
      { _id: discussionId, "comments._id": commentId },
      {
        $set: {
          "comments.$.isAnswer": true,
          isClosed: true,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Unmark answer controller
export const unmarkAnswer = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;

    // Fetch the discussion
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Check if user is an admin or teacher
    const isAuthorized = req.user.isAdmin || req.user.isTeacher;
    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update comment: unset answer flag and reopen discussion
    const updated = await Discussion.findOneAndUpdate(
      { _id: discussionId, "comments._id": commentId },
      {
        $set: {
          "comments.$.isAnswer": false,
          isClosed: false,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Comment controllers
export const addComment = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;

    // Check if discussion is closed
    const discussion = await Discussion.findById(discussionId);
    if (discussion.isClosed) {
      return res.status(400).json({ message: "Discussion is closed" });
    }

    // Check for existing comment from user
    const existingComment = discussion.comments.find((comment) =>
      comment.postedBy.equals(req.user._id)
    );

    if (existingComment) {
      return res.status(400).json({ message: "You already commented" });
    }

    const comment = {
      content,
      postedBy: req.user._id,
    };

    const updated = await Discussion.findByIdAndUpdate(
      discussionId,
      { $push: { comments: comment } },
      { new: true }
    );

    // Fire-and-forget notification logic
    (async () => {
      try {
        const pushTokens = await PushToken.find({
          user: { $eq: discussion.postedBy },
        })
          .select("token -_id")
          .lean();
        console.log(pushTokens);

        // if (pushTokens.length > 0) {
        //   await sendBulkNotifications(
        //     pushTokens.map((t) => t.token),
        //     {
        //       title: "New comment on your discussion",
        //       body: comment.content,
        //       payload: {
        //         type: "discussion",
        //         id: discussion._id.toString(),
        //       },
        //     }
        //   );
        // }
      } catch (error) {
        console.error("Notification Error: ", error.message);
      }
    })();

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateComment = async (req, res) => {
  const { discussionId, commentId } = req.params;
  const { content } = req.body;
  const user = req.user;
  try {
    // Find the discussion by its ID
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Check if the discussion is closed
    if (discussion.isClosed) {
      return res.status(400).json({ message: "Discussion is closed" });
    }

    // Find the comment within the discussion's comments array
    const comment = discussion.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!comment.postedBy.equals(user._id)) {
      return res
        .status(403)
        .json({ message: "Only the posted user can update a comment" });
    }

    // Update the comment's content
    comment.content = content;

    // Save the updated discussion document
    await discussion.save();

    res.status(200).json({
      message: "Comment updated successfully",
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error while updating comment", error: error.message });
  }
};

export const reportComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const { reason } = req.body;

    const updated = await Discussion.findOneAndUpdate(
      {
        _id: discussionId,
        "comments._id": commentId,
        "comments.reports.reportedBy": { $ne: req.user._id },
      },
      {
        $push: {
          "comments.$.reports": {
            reportedBy: req.user._id,
            reason,
            createdAt: Date.now(),
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ message: "Already reported" });
    }

    // Send a complete response with a body
    return res.status(200).json({ message: "Report registered" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const upvoteComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const comment = discussion.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    let updated;
    if (comment.upvotes.includes(userId)) {
      // Toggle off: remove upvote and decrement count
      updated = await Discussion.findOneAndUpdate(
        { _id: discussionId, "comments._id": commentId },
        {
          $pull: { "comments.$.upvotes": userId },
          $inc: { "comments.$.upvotesCount": -1 },
        },
        { new: true }
      );
    } else {
      // Toggle on: add upvote and increment count
      let updateQuery = {
        $addToSet: { "comments.$.upvotes": userId },
        $inc: { "comments.$.upvotesCount": 1 },
      };

      // Remove downvote if exists
      if (comment.downvotes.includes(userId)) {
        updateQuery.$pull = { "comments.$.downvotes": userId };
        updateQuery.$inc["comments.$.downvotesCount"] = -1;
      }

      updated = await Discussion.findOneAndUpdate(
        { _id: discussionId, "comments._id": commentId },
        updateQuery,
        { new: true }
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const downvoteComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const userId = req.user._id;

    // Retrieve the discussion
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Locate the comment using Mongoose subdocument helper
    const comment = discussion.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    let updated;
    if (comment.downvotes.includes(userId)) {
      // Toggle off: remove upvote and decrement count
      updated = await Discussion.findOneAndUpdate(
        { _id: discussionId, "comments._id": commentId },
        {
          $pull: { "comments.$.downvotes": userId },
          $inc: { "comments.$.downvotesCount": -1 },
        },
        { new: true }
      );
    } else {
      // Toggle on: add upvote and increment count
      let updateQuery = {
        $addToSet: { "comments.$.downvotes": userId },
        $inc: { "comments.$.downvotesCount": 1 },
      };

      // Remove downvote if exists
      if (comment.upvotes.includes(userId)) {
        updateQuery.$pull = { "comments.$.upvotes": userId };
        updateQuery.$inc["comments.$.upvotesCount"] = -1;
      }

      updated = await Discussion.findOneAndUpdate(
        { _id: discussionId, "comments._id": commentId },
        updateQuery,
        { new: true }
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const user = req.user;

    // Fetch the discussion
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Locate the comment
    const comment = discussion.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Allow deletion if the user is the comment owner, admin, or teacher
    if (!comment.postedBy.equals(user._id) && !user.isAdmin()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // If the comment is marked as answer, ensure discussion is reopened
    let updated;
    if (comment.isAnswer) {
      updated = await Discussion.findByIdAndUpdate(
        discussionId,
        {
          $pull: { comments: { _id: commentId } },
          $set: { isClosed: false },
        },
        { new: true }
      );
    } else {
      updated = await Discussion.findByIdAndUpdate(
        discussionId,
        { $pull: { comments: { _id: commentId } } },
        { new: true }
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
