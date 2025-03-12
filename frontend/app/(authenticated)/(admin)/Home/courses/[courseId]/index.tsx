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

  console.log("CourseId", courseId);

  const navigateToUploadPage = (section: string) => {
    let uploadPath = "";

    switch (section) {
      case "batches":
        uploadPath=`/Home/courses/${courseId}/batches/batchesUpload`; 
        break;
      case "semesters":
        uploadPath=`/Home/courses/${courseId}/semesters/semesterUpload`; 
        break;
      default:
        console.error("Invalid section for upload");
        return;
    }

    router.push({
      pathname: uploadPath as RelativePathString,
      params: { courseId, courseName: name },
    });
  };

  const navigateToIndexPage = (section: string) => {
    let indexPath = "";

    switch (section) {
      case "batches":
        indexPath=`/Home/courses/${courseId}/batches`; 
        break;
      case "semesters":
        indexPath=`/Home/courses/${courseId}/semesters`; 
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Course Management
        </Text>
      </View>

      {sections.map((section) => (
        <View key={section.id} style={styles.sectionContainer}>
          <View
            style={[styles.sectionHeader, { backgroundColor: section.color }]}
          >
            <Icon name={section.icon} size={24} color="white" />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>

          <View
            style={[
              styles.sectionBody,
              { backgroundColor: colors.secondaryBackground },
            ]}
          >
            <Text style={[styles.sectionDescription, { color: colors.text }]}>
              {section.description}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: section.color }]}
                onPress={() => navigateToIndexPage(section.id)}
              >
                <Icon name="list-outline" size={20} color="white" />
                <Text style={styles.buttonText}>View {section.title}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: section.color }]}
                onPress={() => navigateToUploadPage(section.id)}
              >
                <Icon name="cloud-upload-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  sectionContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
  },
  sectionHeader: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  sectionBody: {
    padding: 15,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default CourseDetailScreen;
