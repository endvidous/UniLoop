// service/api/fileUpload.ts
import { AxiosResponse } from "axios";
import axiosInstance from "./axiosConfig";
import { Platform } from "react-native";
import { SelectedFile } from "@/src/utils/filePicker";

interface PresignedPostResponse {
  url: string;
  fields: {
    [key: string]: string;
  };
  key: string;
}

/**
 * Universal file upload function.
 * Accepts a file object that always has { uri, name, type }.
 * On web, converts the URI to a Blob before appending.
 */
export const uploadFile = async (
  file: SelectedFile
): Promise<string | undefined> => {
  try {
    // Request presigned URL and fields from backend
    const response: AxiosResponse<PresignedPostResponse> =
      await axiosInstance.post("/api/files/upload-url", {
        fileType: file.type,
      });
    const presignedData = response.data;

    const formData = new FormData();
    Object.entries(presignedData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (Platform.OS === "web") {
      //Fetch the file's binary data as a Blob if website
      const blob = await fetch(file.uri).then((r) => r.blob());
      // Option 1: Append the blob directly with a filename
      formData.append("file", blob, file.name);
    } else {
      // Simply pass the file object
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    }

    const s3Response = await axiosInstance.post(presignedData.url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (s3Response.status === 204) {
      return presignedData.key;
    } else {
      console.warn("Unexpected response from S3:", s3Response);
    }
  } catch (error) {
    console.error("Error during file upload:", error);
    throw error;
  }
};

// Delete a file from S3 by calling your backend's delete endpoint.

export const deleteFile = async (fileKey: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete("/api/files/delete", {
      data: { fileKey },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};
