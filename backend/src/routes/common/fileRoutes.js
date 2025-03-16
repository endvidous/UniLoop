import express from "express";
import rateLimit from "express-rate-limit";
import {
  generateUploadURL,
  deleteFile,
  generateDownloadURL,
  listFiles,
  bulkDeleteFiles,
  validateFileKeys,
} from "../../controllers/common/fileController.js";

const router = express.Router();

const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Basic protection
});
router.use(basicLimiter);

router.post("/upload-url", generateUploadURL);
router.get("/download-url", generateDownloadURL);
router.get("/", listFiles);
router.delete("/", deleteFile);
router.delete("/", validateFileKeys, bulkDeleteFiles);

export default router;
