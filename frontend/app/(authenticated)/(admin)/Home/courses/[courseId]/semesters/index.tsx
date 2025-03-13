import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  RelativePathString,
} from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { useSemesters } from "@/src/hooks/api/useCourses";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

const SemestersScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { courseId, courseName } = useLocalSearchParams();
  const {
    data: semesters,
    isFetching,
    isError,
    refetch,
  } = useSemesters(courseId as string);

  const navigateToSemesterDetail = (semesterId: string) => {
    router.push({
      pathname:
        `/Home/courses/[courseId]/semesters/[semesterId]` as RelativePathString,
      params: {
        courseId,
        courseName,
        semesterId,
      },
    });
  };

  const navigateToPaperTeacherMapping = (semesterId: string) => {
    router.push({
      pathname:
        `/Home/courses/${courseId}/semesters/${semesterId}/addPapers` as RelativePathString,
      params: {
        courseId,
        [semesterId]: semesterId,
      },
    });
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading semesters. Please try again.
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{courseName}</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Semesters</Text>

      <FlatList
        data={semesters?.data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: colors.secondaryBackground },
              ]}
              onPress={() => navigateToSemesterDetail(item._id)}
            >
              <Text style={styles.cardText}>Semester {item.number}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paperTeacherButton,
                { backgroundColor: colors.background },
              ]}
              onPress={() => navigateToPaperTeacherMapping(item._id)}
            >
              <Icon name="school-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Assign Papers</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No semesters available</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 20,
  },
  cardContainer: {
    marginVertical: 8,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  paperTeacherButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginLeft: "auto",
    marginRight: "auto",
  },
  buttonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryText: {
    color: "#007BFF",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default SemestersScreen;
