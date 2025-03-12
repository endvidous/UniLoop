import React from "react";
import { View, Text, StyleSheet } from "react-native";

const StudentAssignmentDetailView = ({ id }: { id: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assignment Detail</Text>
      <Text style={styles.description}>
        This is the assignment detail component.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
  },
});

export default StudentAssignmentDetailView;
