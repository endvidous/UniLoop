// useFiles.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  uploadFile,
  deleteFile,
  bulkDeleteFiles,
  getDownloadUrl,
  listFiles,
} from "@/src/services/api/fileAPI";

export const useFileUpload = () => {
  return useMutation({
    mutationFn: uploadFile,
  });
};

export const useFileDelete = () => {
  return useMutation({
    mutationFn: deleteFile,
  });
};

export const useBulkDeleteFiles = () => {
  return useMutation({
    mutationFn: bulkDeleteFiles,
  });
};

export const useFileList = () => {
  return useQuery({
    queryKey: ["files"],
    queryFn: listFiles,
  });
};

export const useDownloadUrl = () => {
  return useMutation({
    mutationFn: (fileKey: string) => getDownloadUrl(fileKey),
    onError: (error) => {
      console.error("Download URL error:", error);
    },
  });
};
