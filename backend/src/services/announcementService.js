import { buildVisibilityQuery, validatePosting } from "./visibilityService.js";

export const buildAnnouncementQuery = (user) =>
  buildVisibilityQuery(user, "announcement");

export const validateAnnouncementPosting = (user, announcementData) =>
  validatePosting(user, announcementData);
