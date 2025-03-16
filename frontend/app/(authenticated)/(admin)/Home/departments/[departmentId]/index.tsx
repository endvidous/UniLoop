import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  RelativePathString,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

const DepartmentScreen = () => {
  const { departmentId, name } = useLocalSearchParams<{ departmentId: string; name: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background}]}>
      <Text style={[styles.header, {color: colors.text}]}>{name} Department</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push({
              pathname:
                `/Home/departments/[departmentId]/papers` as RelativePathString,
              params: { name: name, departmentId: departmentId },
            });
            console.log("Deparment id after navigation", departmentId);
          }}
        >
          <Text style={styles.buttonText}>View Papers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push({
              pathname:
                `/Home/departments/[departmentId]/teachers` as RelativePathString,
              params: { name: name, departmentId: departmentId },
            });
          }}
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
    // backgroundColor: "#f5f5f5",
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
