// fileAPI.ts
import axios, { AxiosResponse } from "axios";
import axiosInstance from "./axiosConfig";
import { Platform } from "react-native";
import { SelectedFile } from "@/src/utils/filePicker";

interface PresignedPostResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
}

interface FileListResponse {
  files: Array<{
    Key: string;
    LastModified: string;
    Size: number;
  }>;
  nextToken?: string;
}

export const uploadFile = async (file: SelectedFile): Promise<string> => {
  try {
    // Get presigned URL from backend
    const { data } = await axiosInstance.post<PresignedPostResponse>(
      "/files/upload-url",
      { fileType: file.type }
    );

    const formData = new FormData();
    Object.entries(data.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Handle file differently for web vs native
    if (Platform.OS === "web") {
      const blob = await fetch(file.uri).then((r) => r.blob());
      // Explicitly set Content-Type for web
      formData.append("file", blob, file.name);
    } else {
      // For native platforms
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
        size: file.size,
      } as any);
    }

    // Upload to S3
    await axios.post(data.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data.key;
  } catch (error: any) {
    throw new Error("File upload failed");
  }
};

export const deleteFile = async (fileKey: string): Promise<void> => {
  await axiosInstance.delete(`/files`, { params: fileKey });
};

export const bulkDeleteFiles = async (keys: string[]): Promise<void> => {
  await axiosInstance.delete("/files", { data: { keys } });
};

export const getDownloadUrl = async (fileKey: string): Promise<string> => {
  console.log(fileKey);
  const { data } = await axiosInstance.get<{ url: string }>(
    `/files/download-url`,
    { params: { fileKey } }
  );
  return data.url;
};

export const listFiles = async (): Promise<FileListResponse> => {
  const { data } = await axiosInstance.get<FileListResponse>("/files");
  return data;
};
