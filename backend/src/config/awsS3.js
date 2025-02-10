import { S3Client } from "@aws-sdk/client-s3";

//S3 Client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Bucket configuration
export const bucketConfig = {
  bucketName: process.env.AWS_BUCKET_NAME || "uniloop-file-storage",
  maxFileSizeMB: 10, // Max file size allowed
  allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], // Allowed file types
};
