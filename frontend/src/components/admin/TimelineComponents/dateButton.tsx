import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DateButtonProps {
  label: string;
  value: string;
  onPress: () => void;
}

const DateButton: React.FC<DateButtonProps> = ({ label, value, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>{value || "Select Date"}</Text>
        <Ionicons name="calendar" size={24} color="#007BFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "48%",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});

export default DateButton;
