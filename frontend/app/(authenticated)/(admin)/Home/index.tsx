import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { pickCSVDocument } from "@/src/utils/csvPicker";
import { classroomCSVCleaner } from "@/src/utils/classroomCSVcleaner";
// import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";
import { shadow } from "react-native-paper";
import { Colors } from "react-native/Libraries/NewAppScreen";

const AdminIndex = () => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <Link
        style={[
          styles.card,
          styles.shadow,
          { shadowColor: colors.shadowcolor },
          { backgroundColor: colors.background },
        ]}
        href="/Home/timelines"
        asChild
      >
        <TouchableOpacity style={styles.cardTouchable}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Academic Timeline
            </Text>
            {/* <Ionicons name="log-out-outline" size={30} color="#fff" /> */}
          </View>
        </TouchableOpacity>
      </Link>

      <Link
        style={[
          styles.card,
          styles.shadow,
          { shadowColor: colors.shadowcolor },
          { backgroundColor: colors.background },
        ]}
        href="/Home/departments"
        asChild
      >
        <TouchableOpacity style={styles.cardTouchable}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Departments
            </Text>
            {/* <Ionicons name="enter-outline" size={30} color="#fff" /> */}
          </View>
        </TouchableOpacity>
      </Link>

      <Link
        style={[
          styles.card,
          styles.shadow,
          { shadowColor: colors.shadowcolor },
          { backgroundColor: colors.background },
        ]}
        href="/Home/courses"
        asChild
      >
        <TouchableOpacity style={styles.cardTouchable}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Courses
            </Text>
            {/* <Ionicons name="book-outline" size={30} color="#fff" /> */}
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 12,
    padding: 40,
    width: "90%",
    marginBottom: 40,
    elevation: 5,
    shadowColor: Colors.shadowcolor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  cardTouchable: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 30,
    marginRight: 10,
  },
  shadow: {
    shadowColor: Colors.shadowcolor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default AdminIndex;
