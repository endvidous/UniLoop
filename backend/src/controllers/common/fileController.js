import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { s3Client, bucketConfig } from "../../config/awsS3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

//Middleware
export const validateFileKeys = (req, res, next) => {
  const { keys } = req.body;

  if (!Array.isArray(keys)) {
    return res.status(400).json({ error: "Invalid keys format" });
  }

  const userId = req.user._id.toString();
  const invalidKeys = keys.some((key) => !key.startsWith(`uploads/${userId}/`));

  if (invalidKeys) {
    return res.status(403).json({ error: "Unauthorized file access" });
  }

  next();
};

/**
 * Generate a presigned URL for file upload
 */
export const generateUploadURL = async (req, res) => {
  try {
    const { fileType } = req.body;
    const userId = req.user._id.toString();

    // Validate file type
    const isValidFileType = (fileType) => {
      const [type, subtype] = fileType.split("/");
      return bucketConfig.allowedMimeTypes.some((t) => {
        const [allowedType, allowedSubtype] = t.split("/");
        return (
          (allowedType === type || allowedType === "*") &&
          (allowedSubtype === subtype || allowedSubtype === "*")
        );
      });
    };

    if (!isValidFileType(fileType)) {
      return res.status(400).json({
        error: "Invalid file type",
        allowedTypes: bucketConfig.allowedMimeTypes,
      });
    }

    // Generate unique file key with proper extension
    const extension = fileType.split("/").pop();
    const fileKey = `uploads/${userId}/${uuidv4()}.${extension}`;

    // Create presigned POST URL
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucketConfig.bucketName,
      Key: fileKey,
      Conditions: [
        ["content-length-range", 0, bucketConfig.maxFileSizeMB * 1024 * 1024],
        // ["starts-with", "$Content-Type", fileType],
      ],
      Expires: 300, // 5 minutes
    });

    res.status(200).json({
      url,
      fields,
      key: fileKey,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate upload URL",
      details: error.message,
    });
  }
};

// Generate presigned GET URL for secure file access
export const generateDownloadURL = async (req, res) => {
  try {
    const { fileKey } = req.query;
    const userId = req.user._id.toString();
    // Validate fileKey
    if (!fileKey) {
      return res.status(400).json({
        error: "File key is required",
      });
    }

    // Validate ownership pattern (uploads/:userId/*)
    if (!fileKey.startsWith(`uploads/${userId}/`)) {
      return res.status(403).json({
        error: "Unauthorized file access",
      });
    }

    const command = new GetObjectCommand({
      Bucket: bucketConfig.bucketName,
      Key: fileKey,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    console.log("Generated URL:", url);
    res.status(200).json({ url });
  } catch (error) {
    console.error("Error generating download URL:", error);
    res.status(500).json({
      error: "Failed to generate download URL",
      details: error.message,
    });
  }
};

/**
 * Delete a file from S3
 */
export const deleteFile = async (req, res) => {
  try {
    const { fileKey } = req.query;
    // Validate file key
    if (!fileKey || typeof fileKey !== "string") {
      return res.status(400).json({ error: "Invalid file key" });
    }

    // Validate file ownership before deletion
    if (!fileKey.startsWith(`uploads/${req.user._id}/`)) {
      return res.status(403).json({ error: "Unauthorized deletion attempt" });
    }

    // Delete file from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketConfig.bucketName,
        Key: fileKey,
      })
    );

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      error: "Failed to delete file",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// List files for a user with pagination
export const listFiles = async (req, res) => {
  try {
    const { prefix = `uploads/${req.user._id}/`, maxKeys = 100 } = req.query;

    const command = new ListObjectsV2Command({
      Bucket: bucketConfig.bucketName,
      Prefix: prefix,
      MaxKeys: Number(maxKeys),
    });

    const response = await s3Client.send(command);
    res.status(200).json(response.Contents || []);
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
};

// Bulk delete endpoint
export const bulkDeleteFiles = async (req, res) => {
  try {
    const { keys } = req.body;

    if (!Array.isArray(keys) || keys.length > 10) {
      return res
        .status(400)
        .json({ error: "Invalid keys array (max 10 items)" });
    }

    const command = new DeleteObjectsCommand({
      Bucket: bucketConfig.bucketName,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    });

    const response = await s3Client.send(command);
    res.status(200).json({ deleted: response.Deleted });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ error: "Failed to delete files" });
  }
};
