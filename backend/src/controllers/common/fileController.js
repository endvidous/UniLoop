import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketConfig } from "../../config/awsS3.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a presigned URL for file upload
 */
export const generateUploadURL = async (req, res) => {
  try {
    const { fileType } = req.body;
    const userId = req.user._id.toString();

    // Validate file type
    if (!bucketConfig.allowedMimeTypes.includes(fileType)) {
      return res.status(400).json({ error: "Invalid file type" });
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
        ["starts-with", "$Content-Type", fileType],
      ],
      Expires: 300, // 5 minutes
    });

    res.status(200).json({
      url,
      fields,
      key: fileKey,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({
      error: "Failed to generate upload URL",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete a file from S3
 */
export const deleteFile = async (req, res) => {
  try {
    const { fileKey } = req.body;

    // Validate file key
    if (!fileKey || typeof fileKey !== "string") {
      return res.status(400).json({ error: "Invalid file key" });
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
