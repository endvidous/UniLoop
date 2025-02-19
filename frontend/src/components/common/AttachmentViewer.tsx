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

type Attachment = {
  key: string;
  name: string;
  type: "pdf" | "image" | "document" | "other";
};

const AttachmentViewer = ({ attachments }: { attachments: Attachment[] }) => {
  const { mutateAsync: getDownloadUrl } = useDownloadUrl();

  const handleDownload = async (key: string, name: string) => {
    try {
      // Get the download URL from your backend
      const downloadUrl = await getDownloadUrl(key);

      if (!downloadUrl) {
        throw new Error("No download URL available");
      }

      // Open the URL in the default handler
      await Linking.openURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        "Download Failed",
        "Could not download the file. Please try again."
      );
    }
  };

  return (
    <View style={styles.attachmentsContainer}>
      <Text style={styles.sectionTitle}>Attachments</Text>
      {attachments.map((attachment) => (
        <TouchableOpacity
          key={attachment.key}
          style={styles.attachmentItem}
          onPress={() => handleDownload(attachment.key, attachment.name)}
        >
          <MaterialIcons
            name={getIconForType(attachment.type)}
            size={24}
            color="#3b82f6"
          />
          <Text style={styles.attachmentName}>{attachment.name}</Text>
        </TouchableOpacity>
      ))}
      {attachments.length === 0 && (
        <Text style={styles.noAttach}>No attachments found</Text>
      )}
    </View>
  );
};

export default AttachmentViewer;

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
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  attachmentName: {
    marginLeft: 12,
    color: "#3b82f6",
    fontSize: 14,
  },
  noAttach: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1e296f",
  },
});
