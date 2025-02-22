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
  unmarkAnswer,
  deleteComment,
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
router.post("/:discussionId/comments/:commentId/unmark-answer", unmarkAnswer);

// Comment routes and actions
router.post("/:discussionId/comments", addComment);
router.patch("/:discussionId/comments/:commentId/", updateComment);
router.delete("/:discussionId/comments/:commentId/", deleteComment);
router.post("/:discussionId/comments/:commentId/upvote", upvoteComment);
router.post("/:discussionId/comments/:commentId/downvote", downvoteComment);
router.post("/:discussionId/comments/:commentId/report", reportComment);

export default router;
