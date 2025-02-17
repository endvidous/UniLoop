import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "react-native-paper";

interface TimelineCardProps {
  academicYear: string;
  oddSemester: { start: string; end: string };
  evenSemester: { start: string; end: string };
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
});

export default TimelineCard;
