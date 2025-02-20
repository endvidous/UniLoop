import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useDeleteAnnouncement } from "@/src/hooks/api/useAnnouncements";

const AnnouncementCard = ({ announcement }: { announcement: any }) => {
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  const handleDelete = () => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to delete this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteAnnouncement(announcement._id) },
      ]
    );
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.description}>{announcement.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(announcement.createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1f2937", // Tailwind's gray-800
  },
  description: {
    fontSize: 14,
    color: "#4b5563", // Tailwind's gray-600
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  date: {
    fontSize: 12,
    color: "#6b7280", // Tailwind's gray-500
  },
  deleteButton: {
    color: "#ef4444", // Tailwind's red-500
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AnnouncementCard;
