import express from "express";
import {
  generateUploadURL,
  deleteFile,
} from "../../controllers/common/fileController.js";

const router = express.Router();

// Generate presigned URL for upload
router.post("/upload-url", generateUploadURL);

// Delete a file
router.delete("/delete", deleteFile);

export default router;
