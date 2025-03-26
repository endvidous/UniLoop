import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  RelativePathString,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const DepartmentScreen = () => {
  const { departmentId, name } = useLocalSearchParams<{ departmentId: string; name: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <Text style={[styles.header, { color: colors.text }]}>
        {name} Department
      </Text>

      {/* Papers Card */}
      <TouchableOpacity
        style={[
          styles.card,
          styles.shadow,
          {
            shadowColor: colors.shadowcolor,
            backgroundColor: colors.background,
          },
        ]}
        onPress={() => {
          router.push({
            pathname:
              `/Home/departments/[departmentId]/papers` as RelativePathString,
            params: { name: name, departmentId: departmentId },
          });
        }}
      >
        <View style={styles.cardContent}>
          <Ionicons name="paper-plane" color="black" size={30}></Ionicons>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Papers
          </Text>
        </View>
      </TouchableOpacity>

      {/* Teachers Card */}
      <TouchableOpacity
        style={[
          styles.card,
          styles.shadow,
          {
            shadowColor: colors.shadowcolor,
            backgroundColor: colors.background,
          },
        ]}
        onPress={() => {
          router.push({
            pathname:
              `/Home/departments/[departmentId]/teachers` as RelativePathString,
            params: { name: name, departmentId: departmentId },
          });
        }}
      >
        <View style={styles.cardContent}>
          <Ionicons name="person" color="black" size={30}></Ionicons>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Teachers
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center"
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
  card: {
    borderRadius: 12,
    padding: 20,
    width: "90%",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 24,
    marginLeft: 10,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default DepartmentScreen;
