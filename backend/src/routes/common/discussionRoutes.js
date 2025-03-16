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

// Main discussion routes (proper ordering)
router.get("/", discussionFilterValidator, getDiscussions);
router.post("/", createDiscussion);
router.get("/:discussionId", getOneDiscussion);
router.patch("/:discussionId", updateDiscussion);
router.delete("/:discussionId", deleteDiscussion);

// Discussion actions (state changes)
router.patch("/:discussionId/upvote", upvoteDiscussion); 
router.patch("/:discussionId/downvote", downvoteDiscussion); 
router.post("/:discussionId/report", reportDiscussion); 

// Answer management (more RESTful approach)
router.patch("/:discussionId/comments/:commentId/mark-answer", markAnswer);
router.patch("/:discussionId/comments/:commentId/unmark-answer", unmarkAnswer);

// Comment routes (proper nesting and ordering)
router.post("/:discussionId/comments", addComment);
router.patch("/:discussionId/comments/:commentId", updateComment);
router.delete("/:discussionId/comments/:commentId", deleteComment);

// Comment actions (state changes)
router.patch("/:discussionId/comments/:commentId/upvote", upvoteComment);
router.patch("/:discussionId/comments/:commentId/downvote", downvoteComment);
router.post("/:discussionId/comments/:commentId/report", reportComment);

export default router;
