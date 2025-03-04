import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
interface TimelineCardProps {
  academicYear: string;
  oddSemester: { start: string; end: string };
  evenSemester: { start: string; end: string };
  onDelete: () => void;
  onEdit: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const TimelineCard: React.FC<TimelineCardProps> = ({
  academicYear,
  oddSemester,
  evenSemester,
  onDelete,
  onEdit,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.text}>Academic Year: {academicYear}</Text>
      <Text style={styles.text}>
        Odd Semester: {formatDate(oddSemester.start)} -{" "}
        {formatDate(oddSemester.end)}
      </Text>
      <Text style={styles.text}>
        Even Semester: {formatDate(evenSemester.start)} -{" "}
        {formatDate(evenSemester.end)}
      </Text>

      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Ionicons name="pencil" size={24} color="blue" />
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash" size={24} color="red" />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#f8f9fa",
  },
  text: {
    fontSize: 16,
    marginVertical: 2,
    fontWeight: 400,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#89CFF0",
    borderRadius: 5,
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: 16,
    color: "blue",
    marginLeft: 5,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f8d7da",
    borderRadius: 5,
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "red",
    marginLeft: 5,
  },
});

export default TimelineCard;
