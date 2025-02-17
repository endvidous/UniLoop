import { buildVisibilityQuery, validatePosting } from "./visibilityService.js";

export const buildDiscussionQuery = (user) =>
  buildVisibilityQuery(user, "discussion");

export const validateDiscussionPosting = (user, discussionData) =>
  validatePosting(user, discussionData);
