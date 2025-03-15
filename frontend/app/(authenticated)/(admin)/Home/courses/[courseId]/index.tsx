import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  RelativePathString,
} from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

const CourseDetailScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { courseId, name } = useLocalSearchParams();

  const sections = [
    {
      id: "batches",
      title: "Batches",
      icon: "people-outline",
      color: "#4285F4",
      description: "Manage course batches",
    },
    {
      id: "semesters",
      title: "Semesters",
      icon: "calendar-outline",
      color: "#0F9D58",
      description: "Manage course semesters",
    },
  ];

  const navigateToIndexPage = (section: string) => {
    let indexPath = "";

    switch (section) {
      case "batches":
        indexPath = `/Home/courses/${courseId}/batches`;
        break;
      case "semesters":
        indexPath = `/Home/courses/${courseId}/semesters`;
        break;
      default:
        console.error("Invalid section for index");
        return;
    }

    console.log("Navigating to", indexPath);
    router.push({
      pathname: indexPath as RelativePathString,
      params: { courseId, courseName: name },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {sections.map((section) => (
        <TouchableOpacity
          key={section.id}
          style={[
            styles.card,
            styles.shadow,
            { shadowColor: colors.shadowcolor },
            { backgroundColor: colors.background },
          ]}
          onPress={() => navigateToIndexPage(section.id)}
        >
          <View style={styles.cardContent}>
            <Icon name={section.icon} size={30} color={section.color} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {section.title}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
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

export default CourseDetailScreen;
