import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Announcement {
  _id: string;
  title: string;
  description: string;
  priority: number;
  createdAt: string;
  postedBy: { id: string; name: string; role: string };
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress: (id: string) => void;
}

const AnnouncementCard = ({ announcement, onPress }: AnnouncementCardProps) => {
  // Map numeric priority to a label and color
  const getPriorityData = (priority: number) => {
    switch (priority) {
      case 3:
        return { label: "High", color: "#dc2626" }; // red
      case 2:
        return { label: "Normal", color: "#16a34a" }; // green
      case 1:
        return { label: "Low", color: "#3b82f6" }; // blue
      default:
        return { label: "Normal", color: "#16a34a" };
    }
  };

  const { label, color } = getPriorityData(announcement.priority);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onPress(announcement._id)}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{announcement.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: color }]}>
          <Text style={styles.priorityText}>{label}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(announcement.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.postedBy}>
          Posted by: {announcement.postedBy.name}
        </Text>
      </View>
    </TouchableOpacity>
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
    elevation: 3, // Android shadow
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  priorityBadge: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  priorityText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  date: {
    fontSize: 12,
    color: "#6b7280",
  },
  postedBy: {
    fontSize: 12,
    color: "#6b7280",
  },
});

export default AnnouncementCard;
