import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDownloadUrl, useFileUpload } from "@/src/hooks/api/useFiles";
import { toast } from "@backpackapp-io/react-native-toast";
import { pickPdfDocument, SelectedFile } from "@/src/utils/filePicker";

export type Attachment = {
  key: string;
  name: string;
  type: string;
};

type AttachmentViewerProps = {
  attachments: Attachment[];
  setAttachments?: React.Dispatch<React.SetStateAction<Attachment[]>>;
  editable?: boolean;
  limit?: number;
};

const AttachmentViewer = ({
  attachments,
  setAttachments,
  editable = false,
  limit = 2,
}: AttachmentViewerProps) => {
  const { mutateAsync: getDownloadUrl } = useDownloadUrl();
  const { mutateAsync: uploadFile } = useFileUpload();

  const [loading, setLoading] = useState(false);

  const handleDownload = async (key: string) => {
    try {
      const downloadUrl = await getDownloadUrl(key);
      if (!downloadUrl) {
        throw new Error("No download URL available");
      }
      await Linking.openURL(downloadUrl);
    } catch (error) {
      toast.error("Could not download the file. Please try again.");
    }
  };

  const handleDelete = (attachment: Attachment) => {
    if (!setAttachments) return;
    setAttachments((prev) => prev.filter((a) => a.key !== attachment.key));
  };

  const handleAddAttachment = async (
    picker: () => Promise<SelectedFile | null>
  ) => {
    if (!setAttachments) return;
    if (attachments.length >= limit) {
      toast.error(`Maximum ${limit} attachments allowed`);
      return;
    }

    const file = await picker();
    if (!file) return;

    setLoading(true);
    try {
      const key = await uploadFile(file);
      setAttachments((prev) => [...prev, { ...file, key }]);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.attachmentsContainer}>
      <Text style={styles.sectionTitle}>Attachments</Text>
      {attachments.map((attachment) => (
        <View key={attachment.key} style={styles.attachmentRow}>
          <TouchableOpacity
            style={styles.attachmentContent}
            onPress={() => handleDownload(attachment.key)}
          >
            <MaterialIcons
              name={getIconForType(attachment.type)}
              size={24}
              color="#3b82f6"
            />
            <Text style={styles.attachmentName}>{attachment.name}</Text>
          </TouchableOpacity>
          {editable && setAttachments && (
            <TouchableOpacity
              onPress={() => handleDelete(attachment)}
              style={styles.deleteButton}
            >
              <MaterialIcons name="close" size={24} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {attachments.length === 0 && (
        <Text style={styles.noAttach}>No attachments found</Text>
      )}
      {editable &&
        setAttachments &&
        attachments.length < limit &&
        (loading ? (
          <ActivityIndicator
            size="small"
            color="#3b82f6"
            style={styles.addButton}
          />
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddAttachment(pickPdfDocument)}
          >
            <MaterialIcons name="add" size={24} color="#3b82f6" />
            <Text style={styles.addButtonText}>Add Attachment</Text>
          </TouchableOpacity>
        ))}
    </View>
  );
};

const getIconForType = (type: string) => {
  switch (type) {
    case "pdf":
      return "picture-as-pdf";
    case "image":
      return "image";
    case "document":
      return "description";
    default:
      return "attach-file";
  }
};

const styles = StyleSheet.create({
  attachmentsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1e293b",
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  attachmentContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  attachmentName: {
    marginLeft: 8,
    paddingRight: 8,
    color: "#3b82f6",
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  noAttach: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1e296f",
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#3b82f6",
  },
});

export default AttachmentViewer;
