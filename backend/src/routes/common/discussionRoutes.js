import express from "express";
import {
  discussionFilterValidator,
  getDiscussions,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  upvoteDiscussion,
  markAnswer,
  reportDiscussion,
  addComment,
  upvoteComment,
  reportComment,
  getOneDiscussion,
  updateComment,
  downvoteDiscussion,
  downvoteComment,
} from "../../controllers/common/discussionController.js";

const router = express.Router();

// Main discussion routes
router.get("/", discussionFilterValidator, getDiscussions);
router.post("/", createDiscussion);
router.get("/:discussionId", getOneDiscussion);
router.patch("/:discussionId", updateDiscussion);
router.delete("/:discussionId", deleteDiscussion);

// Discussion actions
router.post("/:discussionId/report", reportDiscussion);
router.post("/:discussionId/upvote", upvoteDiscussion);
router.post("/:discussionId/downvote", downvoteDiscussion);
router.post("/:discussionId/comments/:commentId/mark-answer", markAnswer);

// Comment routes and actions
router.post("/:discussionId/comments", addComment);
router.patch("/:discussionId/comments/:commentId/", updateComment);
router.post("/:discussionId/comments/:commentId/report", reportComment);
router.post("/:discussionId/comments/:commentId/upvote", upvoteComment);
router.post("/:discussionId/comments/:commentId/downvote", downvoteComment);

export default router;
