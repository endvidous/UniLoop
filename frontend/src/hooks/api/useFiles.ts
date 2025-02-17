import { useMutation } from "@tanstack/react-query";
import { uploadFile, deleteFile } from "@/src/services/api/fileAPI";
import { SelectedFile } from "@/src/utils/filePicker";

export const useFileUpload = () => {
  return useMutation({
    mutationFn: (file: SelectedFile) => uploadFile(file),
  });
};

export const useFileDelete = () => {
  return useMutation({
    mutationFn: (fileKey: string) => deleteFile(fileKey),
  });
};
