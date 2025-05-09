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

      <FlatList
        data={semesters?.data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={[
                styles.card,
              ]}
              onPress={() => navigateToSemesterDetail(item._id)}
            >
              <Text style={styles.cardText}>Semester {item.number}</Text>
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
    paddingBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 10,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#fffaf0",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
    borderLeftWidth: 0.8,
    borderRightWidth: 0.8,
    borderBottomWidth: 1.5,
    borderTopWidth: 0.8,
  },
  cardText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    alignItems: "center",
  },
  paperTeacherButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    width: "48%",
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
