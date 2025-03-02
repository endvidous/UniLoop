import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const DepartmentScreen = () => {
  const { _id, name } = useLocalSearchParams<{ _id: string; name: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{name} Department</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: `/Home/departments/[name]/papers`,
              params: { name: name, _id: _id },
            })
          }
        >
          <Text style={styles.buttonText}>View Papers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: `/Home/departments/[name]/teachers`,
              params: { name: name, _id: _id },
            })
          }
        >
          <Text style={styles.buttonText}>View Teachers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default DepartmentScreen;
