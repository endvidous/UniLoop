import { AxiosResponse } from "axios";
import axios from "./axiosConfig";

interface PresignedPostResponse {
  url: string;
  fields: {
    [key: string]: string;
  };
  key: string;
}

export const uploadFile = async (file: File) => {
  try {
    // Step 1: Request presigned URL and fields from your backend
    const response: AxiosResponse<PresignedPostResponse> = await axios.post(
      "/api/files/upload-url",
      {
        fileType: file.type,
      }
    );
    const presignedData = response.data;

    // Step 2: Create FormData and append the fields from presignedData
    const formData = new FormData();
    Object.entries(presignedData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append the file to be uploaded. Note that S3 expects the field to be named "file".
    formData.append("file", file);

    // Step 3: Upload the file directly to S3 using the presigned URL
    const s3Response = await axios.post(presignedData.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Let axios set the correct boundary automatically
      },
    });

    // S3 typically returns a 204 No Content status code for a successful upload.
    if (s3Response.status === 204) {
      return presignedData.key; //Returning the key to store it in the mongoDB backend
    } else {
      console.warn("Unexpected response from S3:", s3Response);
    }
  } catch (error) {
    console.error("Error during file upload:", error);
  }
};
