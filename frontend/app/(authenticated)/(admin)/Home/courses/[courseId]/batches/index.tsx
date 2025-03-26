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
import { useBatches } from "@/src/hooks/api/useCourses";
import { useTheme } from "@/src/hooks/colors/useThemeColor";

const BatchesScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { courseId, courseName } = useLocalSearchParams();
  const {
    data: batches,
    isFetching,
    isError,
    refetch,
    } = useBatches(courseId as string);
    
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
          Error loading batches. Please try again.
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
      <Text style={[styles.subtitle, { color: colors.text }]}>Batches</Text>

      <FlatList
        data={batches?.data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: colors.secondaryBackground },
              ]}
              onPress={() =>
                router.push({
                  pathname:
                    `/Home/courses/${courseId}/batches/${item._id}/students` as RelativePathString,
                  params: {
                    courseId,
                    batchId: item._id,
                  },
                })
              }
            >
              <Text style={[styles.cardText, { color: colors.text }]}>
                Batch Code: {item.code}
              </Text>
              <Text style={[styles.cardSubtext, { color: colors.text }]}>
                Start Year: {item.startYear}
              </Text>
            </TouchableOpacity>
          )
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No batches available
          </Text>
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
  card: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtext: {
    fontSize: 14,
    opacity: 0.8,
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
    marginTop: 20,
  },
});

export default BatchesScreen;
