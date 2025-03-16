import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDownloadUrl } from "@/src/hooks/api/useFiles";
import { toast } from "@backpackapp-io/react-native-toast";

export type Attachment = {
  key: string;
  name: string;
  type: "pdf" | "image" | "document" | "other";
};

type AttachmentViewerProps = {
  attachments: Attachment[];
  editable?: boolean;
  onDeleteAttachment?: (attachment: Attachment) => void;
};

const AttachmentViewer = ({
  attachments,
  editable = false,
  onDeleteAttachment,
}: AttachmentViewerProps) => {
  const { mutateAsync: getDownloadUrl } = useDownloadUrl();

  const handleDownload = async (key: string, name: string) => {
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

  return (
    <View style={styles.attachmentsContainer}>
      <Text style={styles.sectionTitle}>Attachments</Text>
      {attachments.map((attachment) => (
        <View key={attachment.key} style={styles.attachmentRow}>
          <TouchableOpacity
            style={styles.attachmentContent}
            onPress={() => handleDownload(attachment.key, attachment.name)}
          >
            <MaterialIcons
              name={getIconForType(attachment.type)}
              size={24}
              color="#3b82f6"
            />
            <Text style={styles.attachmentName}>{attachment.name}</Text>
          </TouchableOpacity>
          {editable && onDeleteAttachment && (
            <TouchableOpacity
              onPress={() => onDeleteAttachment(attachment)}
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
    marginLeft: 12,
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
  },
});

export default AttachmentViewer;
