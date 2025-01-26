import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "react-native-paper";

interface TimelineCardProps {
  academicYear: string;
  oddSemester: { start: string; end: string };
  evenSemester: { start: string; end: string };
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  academicYear,
  oddSemester,
  evenSemester,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.text}>Academic Year: {academicYear}</Text>
      <Text style={styles.text}>
        Odd Semester: {oddSemester.start} - {oddSemester.end}
      </Text>
      <Text style={styles.text}>
        Even Semester: {evenSemester.start} - {evenSemester.end}
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
